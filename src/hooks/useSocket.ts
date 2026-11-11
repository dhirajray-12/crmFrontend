import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import type { Attachment } from "@/types/ticket.types";
import { useAuthStore } from "@/Store/auth.store";
import {
  getClientRealtimeSocket,
  subscribeToClientRealtime,
  emitClientRealtimeEvent,
} from "@/lib/clientRealtimeSocket";

// Type definitions for socket events
interface SocketMessage {
  ticketId: string;
  message: {
    _id: string;
    ticketId: string;
    sender: {
      _id: string;
      firstname: string;
      lastname: string;
      email: string;
      role?: string;
    };
    content: string;
    createdAt: string;
    attachments?: Attachment[];
  };
  status?: string;
}

interface UseSocketProps {
  userId: string;
  serverUrl: string;
}

type SocketStatus = "connecting" | "connected" | "offline" | "error";

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  status: SocketStatus;
  error: string | null;
  agentOnline: boolean;

  joinTicket: (ticketId: string) => void;
  leaveTicket: (ticketId: string) => void;
  sendMessage: (ticketId: string, content: string) => void;
  uploadFile: (
    ticketId: string,
    file: File,
    callback?: (result: any) => void,
  ) => void;
  onMessageReceived: (
    callback: (data: SocketMessage) => void,
  ) => (() => void) | undefined;
  onNewTicketActivity: (
    callback: (data: any) => void,
  ) => (() => void) | undefined;
}

// Reuses the same shared connection as useRealtimeSync (src/lib/clientRealtimeSocket.ts)
// so the app opens a single websocket per browser tab instead of one per feature.
export const useSocket = ({
  userId,
  serverUrl,
}: UseSocketProps): UseSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<SocketStatus>("connecting");
  const [agentOnline, setAgentOnline] = useState(false);
  const errorTimerRef = useRef<number | null>(null);
  const activeRole = useAuthStore(
    (state) => state.activeRole ?? state.user?.role ?? undefined,
  );

  const identity = useMemo(
    () => (userId ? { userId, serverUrl, activeRole } : null),
    [userId, serverUrl, activeRole],
  );

  const socket = useMemo(() => {
    if (!identity) return null;
    return getClientRealtimeSocket(identity);
  }, [identity]);

  useEffect(() => {
    if (!identity) {
      setStatus("offline");
      setIsConnected(false);
      setError(null);
      return;
    }

    setStatus("connecting");
    setError(null);

    const handleConnect = () => {
      setStatus("connected");
      setIsConnected(true);
      setError(null);
    };

    const handleConnected = () => {
      setStatus("connected");
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnect = (reason: any) => {
      setStatus("offline");
      setIsConnected(false);

      if (reason === "io server disconnect") {
        getClientRealtimeSocket(identity).connect();
      }
    };

    const handleConnectError = (err: any) => {
      console.error("⚠️ Socket connection error:", err?.message);
      setStatus("error");
      setIsConnected(false);
      setError(err?.message || "Live chat unavailable");
    };

    const handleError = (err: any) => {
      console.error("⚠️ Socket error:", err);
      if (errorTimerRef.current) {
        window.clearTimeout(errorTimerRef.current);
      }
      setError(
        typeof err === "string" ? err : err?.message || "An error occurred",
      );

      errorTimerRef.current = window.setTimeout(() => {
        setError(null);
      }, 5000);
    };

    const handleAgentOnline = () => setAgentOnline(true);
    const handleAgentOffline = () => setAgentOnline(false);

    const unsubscribers = [
      subscribeToClientRealtime(identity, "connect", handleConnect),
      subscribeToClientRealtime(identity, "connected", handleConnected),
      subscribeToClientRealtime(identity, "disconnect", handleDisconnect),
      subscribeToClientRealtime(identity, "connect_error", handleConnectError),
      subscribeToClientRealtime(identity, "error", handleError),
      subscribeToClientRealtime(identity, "agentOnline", handleAgentOnline),
      subscribeToClientRealtime(identity, "agentOffline", handleAgentOffline),
    ];

    const currentSocket = getClientRealtimeSocket(identity);
    if (currentSocket.connected) {
      setStatus("connected");
      setIsConnected(true);
      setError(null);
    }

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());

      setAgentOnline(false);
      setStatus("offline");
      setIsConnected(false);
      if (errorTimerRef.current) {
        window.clearTimeout(errorTimerRef.current);
        errorTimerRef.current = null;
      }
    };
  }, [identity]);

  const joinTicket = useCallback(
    (ticketId: string) => {
      if (!ticketId) {
        console.error("Cannot join ticket: No ticket ID provided");
        return;
      }

      if (!identity || !socket?.connected) {
        console.warn("Cannot join ticket: Socket not connected");
        setError("Cannot join ticket: Not connected to server");
        return;
      }

      emitClientRealtimeEvent(identity, "joinTicket", { ticketId });
    },
    [identity, socket],
  );

  const leaveTicket = useCallback(
    (ticketId: string) => {
      if (!ticketId) return;
      if (!identity || !socket?.connected) return;

      emitClientRealtimeEvent(identity, "leaveTicket", { ticketId });
    },
    [identity, socket],
  );

  const sendMessage = useCallback(
    (ticketId: string, content: string) => {
      if (!ticketId || !content?.trim()) {
        console.error("Ticket ID and content are required");
        return;
      }

      if (!identity || !socket?.connected) {
        setError("Cannot send message: Not connected to server");
        return;
      }

      emitClientRealtimeEvent(identity, "sendMessage", {
        ticketId,
        content,
      });
    },
    [identity, socket],
  );

  const uploadFile = useCallback(
    (ticketId: string, file: File, callback?: (result: any) => void) => {
      if (!ticketId || !file) {
        callback?.({ success: false, message: "Ticket ID and file are required" });
        return;
      }

      if (!identity || !socket?.connected) {
        callback?.({ success: false, message: "Socket not connected" });
        return;
      }

      emitClientRealtimeEvent(identity, "uploadFile", { ticketId, file }, callback);
    },
    [identity, socket],
  );

  const onMessageReceived = useCallback(
    (callback: (data: SocketMessage) => void) => {
      if (!identity) return;

      const handler = (data: any) => {
        const messagePayload = data?.message ?? data;

        callback({
          ticketId: data?.ticketId || messagePayload?.ticketId,
          message: {
            ...messagePayload,
            sender: messagePayload?.sender
              ? {
                  ...messagePayload.sender,
                  firstname:
                    messagePayload.sender.firstname ||
                    messagePayload.sender.firstName ||
                    "",
                  lastname:
                    messagePayload.sender.lastname ||
                    messagePayload.sender.lastName ||
                    "",
                }
              : undefined,
            createdAt: messagePayload?.createdAt
              ? new Date(messagePayload.createdAt).toISOString()
              : new Date().toISOString(),
          },
          status: data?.status,
        });
      };

      return subscribeToClientRealtime(identity, "newMessage", handler);
    },
    [identity],
  );

  const onNewTicketActivity = useCallback(
    (callback: (data: any) => void) => {
      if (!identity) return;

      return subscribeToClientRealtime(identity, "ticketUpdated", (data) =>
        callback(data),
      );
    },
    [identity],
  );

  return {
    socket,
    isConnected,
    status,
    error,
    agentOnline,
    joinTicket,
    leaveTicket,
    sendMessage,
    uploadFile,
    onMessageReceived,
    onNewTicketActivity,
  };
};

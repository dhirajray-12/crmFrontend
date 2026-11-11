import { useSocket } from "@/hooks/useSocket";
import { useAuthStore } from "@/Store/auth.store";
import { useTicketStore } from "@/Store/ticket.store";
import type { TicketStatus } from "@/types/ticket.types";
import { getSocketServerUrl } from "@/utils/socketUrl";
import { useCallback, useEffect, useRef } from "react";

interface UseTicketSocketProps {
  userId?: string;
  subscribeToMessages?: boolean;
  manageActiveTicketRoom?: boolean;
}

export const useTicketSocket = ({
  userId: propUserId,
  subscribeToMessages = true,
  manageActiveTicketRoom = true,
}: UseTicketSocketProps = {}) => {
  const { user } = useAuthStore();
  const userId = propUserId || user?._id;

  const {
    isConnected,
    status,
    error: socketError,
    agentOnline,
    joinTicket,
    leaveTicket,
    sendMessage: sendSocketMessage,
    onMessageReceived,
    onNewTicketActivity,
    uploadFile,
  } = useSocket({
    userId: userId || "",
    serverUrl: getSocketServerUrl(),
  });

  const {
    setConnectionStatus,
    setAgentOnline: setStoreAgentOnline,
    addMessage,
    updateTicket,
    activeTicket,
  } = useTicketStore();

  const prevTicketIdRef = useRef<string | null>(null);

  useEffect(() => {
    setConnectionStatus(
      status === "connected"
        ? "connected"
        : status === "connecting"
          ? "connecting"
          : status === "error"
            ? "error"
            : "disconnected",
    );
  }, [status, setConnectionStatus]);

  useEffect(() => {
    setStoreAgentOnline(agentOnline);
  }, [agentOnline, setStoreAgentOnline]);

  useEffect(() => {
    if (!subscribeToMessages) return;
    if (!isConnected) return;

    const cleanup = onMessageReceived((data) => {
      addMessage(data.ticketId, data.message, data.status as TicketStatus);
    });

    return cleanup;
  }, [isConnected, onMessageReceived, addMessage, subscribeToMessages]);

  useEffect(() => {
    if (!isConnected) return;

    const cleanup = onNewTicketActivity((data) => {
      if (!data?.ticketId) return;

      updateTicket(data.ticketId, {
        ...(data.status ? { status: data.status } : {}),
        ...(data.updatedAt ? { updatedAt: data.updatedAt } : {}),
        ...(data.assignedTo ? { assignedTo: data.assignedTo } : {}),
      });
    });

    return cleanup;
  }, [isConnected, onNewTicketActivity, updateTicket]);

  useEffect(() => {
    if (!manageActiveTicketRoom) return;
    if (!isConnected || !activeTicket?._id) return;

    const currentTicketId = activeTicket._id;

    if (
      prevTicketIdRef.current &&
      prevTicketIdRef.current !== currentTicketId
    ) {
      leaveTicket(prevTicketIdRef.current);
    }

    joinTicket(currentTicketId);
    prevTicketIdRef.current = currentTicketId;

    return () => {
      if (prevTicketIdRef.current) {
        leaveTicket(prevTicketIdRef.current);
        prevTicketIdRef.current = null;
      }
    };
  }, [
    activeTicket?._id,
    isConnected,
    joinTicket,
    leaveTicket,
    manageActiveTicketRoom,
  ]);

  const sendMessage = useCallback(
    (ticketId: string, content: string) => {
      if (isConnected) {
        sendSocketMessage(ticketId, content);
      } else {
        console.error("Cannot send message: WebSocket not connected");
        throw new Error("WebSocket not connected");
      }
    },
    [isConnected, sendSocketMessage],
  );

  const handleUploadFile = useCallback(
    (ticketId: string, file: File, callback?: (result: any) => void) => {
      if (isConnected) {
        uploadFile(ticketId, file, callback);
      } else {
        console.error("Cannot upload file: WebSocket not connected");
        throw new Error("WebSocket not connected");
      }
    },
    [isConnected, uploadFile],
  );

  return {
    isConnected,
    connectionStatus: status,
    socketError,
    agentOnline,
    sendMessage,
    uploadFile: handleUploadFile,
  };
};

import { io, type Socket } from "socket.io-client";
import { getSocketAuthPayload, getSocketQueryPayload } from "@/utils/socketAuth";

interface ClientRealtimeIdentity {
  activeRole?: string;
  serverUrl: string;
  userId: string;
}

type SocketEventHandler = (payload: any, socket: Socket) => void;

interface ListenerEntry {
  handlers: Set<SocketEventHandler>;
  socketHandler: (payload: any) => void;
}

let sharedSocket: Socket | null = null;
let sharedIdentityKey: string | null = null;
let subscriberCount = 0;
const listenerRegistry = new Map<string, ListenerEntry>();

// Route changes and React Strict Mode briefly unmount/remount every subscriber
// (subscriberCount dips to 0 and back to 1 within the same tick). Tearing the
// socket down immediately on that dip causes a disconnect/reconnect race where
// the server can still have the old socket in `user_<id>` when it processes the
// event, so the client ends up joined twice and receives the broadcast twice.
// Delaying teardown lets same-identity remounts cancel it instead of churning.
const TEARDOWN_GRACE_MS = 3000;
let teardownTimer: ReturnType<typeof setTimeout> | null = null;

const cancelScheduledTeardown = () => {
  if (teardownTimer) {
    clearTimeout(teardownTimer);
    teardownTimer = null;
  }
};

const getIdentityKey = ({
  userId,
  serverUrl,
  activeRole,
}: ClientRealtimeIdentity) => `${serverUrl}::${userId}::${activeRole ?? ""}`;

const attachRegistryListeners = (socket: Socket) => {
  listenerRegistry.forEach((entry, event) => {
    socket.on(event, entry.socketHandler);
  });
};

const detachRegistryListeners = (socket: Socket) => {
  listenerRegistry.forEach((entry, event) => {
    socket.off(event, entry.socketHandler);
  });
};

export const getClientRealtimeSocket = (
  identity: ClientRealtimeIdentity,
): Socket => {
  const nextIdentityKey = getIdentityKey(identity);

  if (sharedSocket && sharedIdentityKey === nextIdentityKey) {
    cancelScheduledTeardown();
    return sharedSocket;
  }

  // Identity actually changed (different user/role/server) — tear down now,
  // no grace period. The grace period only exists to absorb same-identity churn.
  cancelScheduledTeardown();

  if (sharedSocket) {
    detachRegistryListeners(sharedSocket);
    sharedSocket.disconnect();
  }

  sharedSocket = io(identity.serverUrl, {
    auth: getSocketAuthPayload(),
    query: getSocketQueryPayload(identity.userId),
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    randomizationFactor: 0.3,
    timeout: 20000,
    withCredentials: true,
  });

  sharedIdentityKey = nextIdentityKey;
  attachRegistryListeners(sharedSocket);

  return sharedSocket;
};

export const subscribeToClientRealtime = (
  identity: ClientRealtimeIdentity,
  event: string,
  handler: SocketEventHandler,
) => {
  const socket = getClientRealtimeSocket(identity);
  let entry = listenerRegistry.get(event);

  if (!entry) {
    entry = {
      handlers: new Set(),
      socketHandler: (payload: any) => {
        const activeEntry = listenerRegistry.get(event);
        if (!activeEntry || !sharedSocket) return;

        activeEntry.handlers.forEach((registeredHandler) => {
          registeredHandler(payload, sharedSocket as Socket);
        });
      },
    };
    listenerRegistry.set(event, entry);
    socket.on(event, entry.socketHandler);
  }

  entry.handlers.add(handler);
  subscriberCount += 1;
  cancelScheduledTeardown();

  return () => {
    const activeEntry = listenerRegistry.get(event);
    if (activeEntry) {
      activeEntry.handlers.delete(handler);

      if (activeEntry.handlers.size === 0) {
        sharedSocket?.off(event, activeEntry.socketHandler);
        listenerRegistry.delete(event);
      }
    }

    subscriberCount = Math.max(0, subscriberCount - 1);

    if (subscriberCount === 0) {
      cancelScheduledTeardown();
      teardownTimer = setTimeout(() => {
        teardownTimer = null;
        if (subscriberCount !== 0 || !sharedSocket) return;

        detachRegistryListeners(sharedSocket);
        sharedSocket.disconnect();
        sharedSocket = null;
        sharedIdentityKey = null;
      }, TEARDOWN_GRACE_MS);
    }
  };
};

export const emitClientRealtimeEvent = (
  identity: ClientRealtimeIdentity,
  event: string,
  ...args: any[]
) => {
  const socket = getClientRealtimeSocket(identity);
  socket.emit(event, ...args);
};

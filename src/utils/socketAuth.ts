export interface SocketAuthPayload {
  token?: string;
  activeRole?: string;
}

export interface SocketQueryPayload {
  userId: string;
  activeRole?: string;
}

export const getSocketAuthPayload = (): SocketAuthPayload => {
  if (typeof window === "undefined") {
    return {};
  }

  // The socket connects with withCredentials: true, so the httpOnly
  // auth_token_<role> cookie is already sent on the handshake; the backend
  // (utils/socketServer.js extractSocketToken) falls back to it using
  // activeRole when no bearer token is present.
  const activeRole = sessionStorage.getItem("active_role") || undefined;

  return {
    activeRole,
  };
};

export const getSocketQueryPayload = (userId: string): SocketQueryPayload => {
  const activeRole =
    typeof window !== "undefined"
      ? sessionStorage.getItem("active_role") || undefined
      : undefined;

  return {
    userId,
    activeRole,
  };
};

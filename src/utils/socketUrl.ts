const DEFAULT_SOCKET_URL = "http://localhost:5000";

export const getSocketServerUrl = () =>
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_BACKEND_URL?.replace(/\/api\/?$/, "") ||
  DEFAULT_SOCKET_URL;

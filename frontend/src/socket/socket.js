import { io } from 'socket.io-client';
const SOCKET_URL =
  (typeof window !== 'undefined' && window.__ENV__?.VITE_SOCKET_URL) ||
  import.meta.env.VITE_SOCKET_URL ||
  'http://localhost:5000';

let socketInstance = null;

/**
 * Returns an existing socket instance or initializes a new one with the provided JWT token
 */
export function getSocket(token = null) {
  const authToken = token || localStorage.getItem('token');

  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      auth: {
        token: authToken,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('⚡ [Socket.IO] Connected to backend:', socketInstance.id);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('⚠️ [Socket.IO] Connection error:', err.message);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('🔌 [Socket.IO] Disconnected:', reason);
    });
  } else if (authToken && socketInstance.auth?.token !== authToken) {
    // Update auth token if it changed
    socketInstance.auth = { token: authToken };
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
  }

  return socketInstance;
}

/**
 * Disconnect and destroy the socket instance (e.g. upon user logout)
 */
export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    console.log('🔌 [Socket.IO] Socket destroyed');
  }
}

export default getSocket;

import { io, Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

let socketInstance: Socket | null = null;

export const initializeSocket = (): Socket => {
  if (socketInstance) {
    return socketInstance;
  }

  socketInstance = io(BACKEND_URL, {
    transports: ['websocket', 'polling'],
  });

  return socketInstance;
};

export const getSocket = (): Socket | null => {
  return socketInstance;
};

export const closeSocket = (): void => {
  if (socketInstance) {
    socketInstance.close();
    socketInstance = null;
  }
};

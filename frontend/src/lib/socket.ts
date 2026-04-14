import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initiateSocketConnection = (token: string) => {
  socket = io('http://localhost:5000', {
    auth: { token },
  });

  socket.on('connect', () => {
    console.log('Connected to socket server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from socket server');
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const subscribeToEvent = (eventName: string, cb: (data: any) => void) => {
  if (!socket) return;
  socket.on(eventName, cb);
};

export const unsubscribeFromEvent = (eventName: string, cb: (data: any) => void) => {
  if (!socket) return;
  socket.off(eventName, cb);
};

export const getSocket = () => socket;

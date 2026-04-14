import { create } from 'zustand';

interface SocketState {
  isConnected: boolean;
  setConnected: (status: boolean) => void;
  // We can add global socket specific logic here if needed
}

export const useSocketStore = create<SocketState>()((set) => ({
  isConnected: false,
  setConnected: (status) => set({ isConnected: status }),
}));

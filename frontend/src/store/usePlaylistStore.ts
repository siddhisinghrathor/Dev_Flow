import { create } from 'zustand';
import { api } from '../lib/api';
import type { Playlist } from '../types';

interface PlaylistState {
  playlists: Playlist[];
  activePlaylistId?: string;
  isLoading: boolean;

  // API Actions
  fetchPlaylists: () => Promise<void>;

  // Actions
  createPlaylist: (playlist: Omit<Playlist, 'id'>) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  setActivePlaylist: (id?: string) => Promise<void>;
}

export const usePlaylistStore = create<PlaylistState>()((set) => ({
  playlists: [],
  isLoading: false,

  fetchPlaylists: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/playlists');
      set({ playlists: response.data.data });
      const active = response.data.data.find((p: any) => p.isActive);
      if (active) set({ activePlaylistId: active.id });
    } finally {
      set({ isLoading: false });
    }
  },

  createPlaylist: async (data) => {
    const response = await api.post('/playlists', data);
    set((state) => ({ playlists: [...state.playlists, response.data.data] }));
  },

  deletePlaylist: async (id) => {
    await api.delete(`/playlists/${id}`);
    set((state) => ({
      playlists: state.playlists.filter((p) => p.id !== id),
      activePlaylistId: state.activePlaylistId === id ? undefined : state.activePlaylistId,
    }));
  },

  setActivePlaylist: async (id) => {
    await api.patch(`/playlists/${id}/active`);
    set({ activePlaylistId: id });
  },
}));

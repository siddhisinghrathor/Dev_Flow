import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Playlist } from '../types';

interface PlaylistState {
    playlists: Playlist[];
    activePlaylistId?: string;

    createPlaylist: (playlist: Omit<Playlist, 'id'>) => void;
    deletePlaylist: (id: string) => void;
    setActivePlaylist: (id?: string) => void;
}

export const usePlaylistStore = create<PlaylistState>()(
    persist(
        (set) => ({
            playlists: [
                {
                    id: 'frontend-sprint-id',
                    title: 'Frontend Sprint',
                    description: 'A 5-day deep dive into React and Tailwind.',
                    category: 'frontend',
                    tasks: [
                        { title: 'Learn React Hooks', category: 'frontend', priority: 'high', recurrence: 'none', duration: 60 },
                        { title: 'Tailwind Mastery', category: 'frontend', priority: 'medium', recurrence: 'none', duration: 45 },
                    ]
                }
            ],
            activePlaylistId: 'frontend-sprint-id',

            createPlaylist: (data) => set((state) => ({
                playlists: [...state.playlists, { ...data, id: crypto.randomUUID() }]
            })),

            deletePlaylist: (id) => set((state) => ({
                playlists: state.playlists.filter(p => p.id !== id)
            })),

            setActivePlaylist: (id) => set({ activePlaylistId: id }),
        }),
        { name: 'devflow-playlists' }
    )
);

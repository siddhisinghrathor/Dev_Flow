import { create } from 'zustand';
import { api } from '../lib/api';
import type { Goal, Achievement, UserPreferences, Notification as AppNotification } from '../types';

interface AppState {
  goals: Goal[];
  achievements: Achievement[];
  notifications: AppNotification[];
  preferences: UserPreferences;
  isLoading: boolean;

  // API Actions
  fetchGoals: () => Promise<void>;
  fetchAchievements: () => Promise<void>;
  fetchPreferences: () => Promise<void>;
  fetchNotifications: () => Promise<void>;

  // Goal Actions
  addGoal: (goal: Omit<Goal, 'id' | 'progress' | 'isCompleted'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // Achievement Actions
  addAchievement: (achievement: Omit<Achievement, 'id' | 'date'>) => Promise<void>;

  // Notification Actions
  pushNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;

  // Preference Actions
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
}

export const useAppStore = create<AppState>()((set, get) => ({
  goals: [],
  achievements: [],
  notifications: [],
  isLoading: false,
  preferences: {
    username: 'Developer',
    persona: 'fullstack',
    dailyTarget: 3,
    weeklyTarget: 15,
    theme: 'system',
    notificationsEnabled: true,
    autoCompleteOnTimerEnd: false,
    soundEnabled: true,
  },

  fetchGoals: async () => {
    const response = await api.get('/goals');
    set({ goals: response.data.data });
  },

  fetchAchievements: async () => {
    // Achievements can be fetched from user profile or specific endpoint
    const response = await api.get('/user/profile');
    if (response.data.data.achievements) {
      set({ achievements: response.data.data.achievements });
    }
  },

  fetchPreferences: async () => {
    const response = await api.get('/user/profile');
    const user = response.data.data;
    set({
      preferences: {
        username: user.username,
        persona: user.persona,
        dailyTarget: user.dailyTarget,
        weeklyTarget: user.weeklyTarget,
        theme: user.theme,
        notificationsEnabled: user.notificationsEnabled,
        autoCompleteOnTimerEnd: user.autoCompleteOnTimerEnd,
        soundEnabled: user.soundEnabled,
      },
    });
  },

  fetchNotifications: async () => {
    const response = await api.get('/notifications');
    set({ notifications: response.data.data });
  },

  addGoal: async (goalData) => {
    const response = await api.post('/goals', goalData);
    set((state) => ({ goals: [...state.goals, response.data.data] }));
  },

  updateGoal: async (id, updates) => {
    await api.patch(`/goals/${id}`, updates);
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  },

  deleteGoal: async (id) => {
    await api.delete(`/goals/${id}`);
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
    }));
  },

  addAchievement: async (achievementData) => {
    // Achievements are usually handled by backend logic, but we can have an endpoint
    const response = await api.post('/user/achievements', achievementData);
    set((state) => ({ achievements: [...state.achievements, response.data.data] }));
  },

  pushNotification: async (notif) => {
    // Notifications are also usually pushed by backend, but we can manual push
    const response = await api.post('/notifications', notif);
    const newNotif = response.data.data;
    set((state) => ({ notifications: [newNotif, ...state.notifications].slice(0, 50) }));

    if (get().preferences.notificationsEnabled && Notification.permission === 'granted') {
      new window.Notification(notif.title, { body: notif.message });
    }
  },

  markAsRead: async (id) => {
    await api.patch(`/notifications/${id}/read`);
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  },

  clearNotifications: async () => {
    await api.delete('/notifications');
    set({ notifications: [] });
  },

  updatePreferences: async (updates) => {
    await api.patch('/user/profile', updates);
    set((state) => ({
      preferences: { ...state.preferences, ...updates },
    }));
  },
}));

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Goal, Achievement, UserPreferences, Notification } from '../types';

interface AppState {
    goals: Goal[];
    achievements: Achievement[];
    notifications: Notification[];
    preferences: UserPreferences;

    // Goal Actions
    addGoal: (goal: Omit<Goal, 'id' | 'progress' | 'isCompleted'>) => void;
    updateGoal: (id: string, updates: Partial<Goal>) => void;
    deleteGoal: (id: string) => void;
    calculateGoalProgress: (goalId: string, completedTaskIds: string[]) => void;

    // Achievement Actions
    addAchievement: (achievement: Omit<Achievement, 'id' | 'date'>) => void;

    // Notification Actions
    pushNotification: (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    clearNotifications: () => void;

    // Preference Actions
    updatePreferences: (updates: Partial<UserPreferences>) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            goals: [],
            achievements: [],
            notifications: [],
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

            addGoal: (goalData) => {
                const newGoal: Goal = {
                    ...goalData,
                    id: crypto.randomUUID(),
                    progress: 0,
                    isCompleted: false,
                };
                set((state) => ({ goals: [...state.goals, newGoal] }));
            },

            updateGoal: (id, updates) => {
                set((state) => ({
                    goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
                }));
            },

            deleteGoal: (id) => {
                set((state) => ({
                    goals: state.goals.filter((g) => g.id !== id),
                }));
            },

            calculateGoalProgress: (goalId, completedTaskIds) => {
                const goal = get().goals.find(g => g.id === goalId);
                if (!goal) return;

                const goalTasks = goal.tasks;
                if (goalTasks.length === 0) return;

                const completedGoalTasks = goalTasks.filter(tid => completedTaskIds.includes(tid));
                const progress = Math.round((completedGoalTasks.length / goalTasks.length) * 100);

                get().updateGoal(goalId, {
                    progress,
                    isCompleted: progress === 100
                });
            },

            addAchievement: (achievementData) => {
                const newAchievement: Achievement = {
                    ...achievementData,
                    id: crypto.randomUUID(),
                    date: new Date().toISOString(),
                };
                set((state) => ({ achievements: [...state.achievements, newAchievement] }));
            },

            pushNotification: (notif) => {
                const newNotif: Notification = {
                    ...notif,
                    id: crypto.randomUUID(),
                    timestamp: new Date().toISOString(),
                    read: false,
                };
                set((state) => ({ notifications: [newNotif, ...state.notifications].slice(0, 50) })); // Keep last 50

                // Browser notification
                if (get().preferences.notificationsEnabled && Notification.permission !== 'denied') {
                    // If we already have permission, or it's default (which creates a request) - though request should be user-triggered.
                    if (Notification.permission === 'granted') {
                        new window.Notification(notif.title, { body: notif.message });
                    }
                }
            },

            markAsRead: (id) => {
                set((state) => ({
                    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
                }));
            },

            clearNotifications: () => set({ notifications: [] }),

            updatePreferences: (updates) => {
                set((state) => ({
                    preferences: { ...state.preferences, ...updates },
                }));
            },
        }),
        {
            name: 'devflow-app-store-v3',
        }
    )
);

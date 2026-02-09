import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Goal, Achievement, UserPreferences, Category } from '../types';

interface AppState {
    goals: Goal[];
    achievements: Achievement[];
    preferences: UserPreferences;

    // Goal Actions
    addGoal: (goal: Omit<Goal, 'id' | 'progress' | 'isCompleted'>) => void;
    updateGoal: (id: string, updates: Partial<Goal>) => void;
    deleteGoal: (id: string) => void;

    // Achievement Actions
    addAchievement: (achievement: Omit<Achievement, 'id' | 'date'>) => void;

    // Preference Actions
    updatePreferences: (updates: Partial<UserPreferences>) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            goals: [],
            achievements: [],
            preferences: {
                username: 'Developer',
                persona: 'fullstack',
                dailyTarget: 3,
                weeklyTarget: 15,
                theme: 'system',
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

            addAchievement: (achievementData) => {
                const newAchievement: Achievement = {
                    ...achievementData,
                    id: crypto.randomUUID(),
                    date: new Date().toISOString(),
                };
                set((state) => ({ achievements: [...state.achievements, newAchievement] }));
            },

            updatePreferences: (updates) => {
                set((state) => ({
                    preferences: { ...state.preferences, ...updates },
                }));
            },
        }),
        {
            name: 'devflow-app-store',
        }
    )
);

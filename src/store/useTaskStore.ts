import { create } from 'zustand';
import { api } from '../lib/api';
import type { Task, DailyLog, TaskStatus, TimerSession } from '../types';
import { isSameDay, startOfDay, differenceInSeconds } from 'date-fns';

interface TaskState {
  tasks: Task[];
  dailyLogs: DailyLog[];
  activeTimer: (TimerSession & { id?: string }) | null;
  isLoading: boolean;

  // API Actions
  fetchTasks: () => Promise<void>;
  fetchDailyLogs: () => Promise<void>;
  fetchActiveTimer: () => Promise<void>;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setTaskStatus: (id: string, status: TaskStatus) => Promise<void>;

  // Timer Actions
  startTimer: (taskId: string, durationMinutes?: number) => Promise<void>;
  pauseTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
  stopTimer: (completeTask?: boolean) => Promise<void>;
  getEffectiveElapsed: () => number;

  // Helpers
  getTasksByDate: (date: Date) => Task[];
}

export const useTaskStore = create<TaskState>()((set, get) => ({
  tasks: [],
  dailyLogs: [],
  activeTimer: null,
  isLoading: false,

  fetchTasks: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/tasks');
      set({ tasks: response.data.data.tasks || response.data.data });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDailyLogs: async () => {
    try {
      const response = await api.get('/analytics/heatmap');
      const heatmap: Record<string, number> = response.data.data;

      // Convert backend heatmap (Record<string, number>) to DailyLog[]
      const logs: DailyLog[] = Object.entries(heatmap).map(([date, count]) => ({
        date,
        completedTaskIds: Array(count).fill('task-placeholder'),
        failedTaskIds: [],
      }));

      set({ dailyLogs: logs });
    } catch (error) {
      console.error('Failed to fetch daily logs', error);
    }
  },

  fetchActiveTimer: async () => {
    try {
      const response = await api.get('/timer/active');
      if (response.data.data) {
        const timer = response.data.data;
        set({
          activeTimer: {
            id: timer.id,
            taskId: timer.taskId,
            startTime: timer.startTime,
            isRunning: timer.isRunning,
            elapsedAtPause: timer.elapsedAtPause,
            durationLimit: timer.durationLimit,
          },
        });
      } else {
        set({ activeTimer: null });
      }
    } catch (error) {
      console.error('Failed to fetch active timer', error);
    }
  },

  addTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    const newTask = response.data.data;
    set((state) => ({ tasks: [...state.tasks, newTask] }));
    return newTask.id;
  },

  updateTask: async (id, updates) => {
    await api.patch(`/tasks/${id}`, updates);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  deleteTask: async (id) => {
    await api.delete(`/tasks/${id}`);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      activeTimer: state.activeTimer?.taskId === id ? null : state.activeTimer,
    }));
  },

  setTaskStatus: async (id, status) => {
    await api.patch(`/tasks/${id}`, { status });
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? {
            ...t,
            status,
            completedAt: status === 'completed' ? new Date().toISOString() : undefined,
          }
          : t
      ),
    }));
  },

  startTimer: async (taskId, durationMinutes) => {
    const response = await api.post('/timer/start', { taskId, durationMinutes });
    const timer = response.data.data;
    set({
      activeTimer: {
        id: timer.id,
        taskId: timer.taskId,
        startTime: timer.startTime,
        isRunning: timer.isRunning,
        elapsedAtPause: timer.elapsedAtPause,
        durationLimit: timer.durationLimit,
      },
    });
  },

  pauseTimer: async () => {
    const { activeTimer } = get();
    if (!activeTimer?.id) return;
    const response = await api.post(`/timer/pause/${activeTimer.id}`);
    const timer = response.data.data;
    set({
      activeTimer: {
        ...activeTimer,
        isRunning: false,
        elapsedAtPause: timer.elapsedAtPause,
      },
    });
  },

  resumeTimer: async () => {
    const { activeTimer } = get();
    if (!activeTimer?.id) return;
    const response = await api.post(`/timer/resume/${activeTimer.id}`);
    const timer = response.data.data;
    set({
      activeTimer: {
        ...activeTimer,
        isRunning: true,
        startTime: timer.startTime, // Backend updates startTime on resume
      },
    });
  },

  stopTimer: async (completeTask = false) => {
    const { activeTimer } = get();
    if (!activeTimer?.id) return;
    await api.post(`/timer/stop/${activeTimer.id}`, { completeTask });

    // Refresh tasks to get updated timeSpent
    const taskResponse = await api.get('/tasks');
    set({ tasks: taskResponse.data.data.tasks || taskResponse.data.data, activeTimer: null });
  },

  getEffectiveElapsed: () => {
    const { activeTimer } = get();
    if (!activeTimer) return 0;
    if (!activeTimer.isRunning) return activeTimer.elapsedAtPause;

    return (
      activeTimer.elapsedAtPause + differenceInSeconds(new Date(), new Date(activeTimer.startTime))
    );
  },

  getTasksByDate: (date) => {
    const target = startOfDay(date);
    return get().tasks.filter((t) => {
      if (t.status === 'suggested') return false;
      const dateToCompare = t.dueDate ? new Date(t.dueDate) : new Date(t.createdAt);
      return isSameDay(startOfDay(dateToCompare), target);
    });
  },
}));

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, DailyLog, TaskStatus, TimerSession } from '../types';
import { format, isSameDay, startOfDay, differenceInSeconds, isBefore, addDays } from 'date-fns';

interface TaskState {
    tasks: Task[];
    dailyLogs: DailyLog[];
    activeTimer: TimerSession | null;

    // Task Actions
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => string;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    setTaskStatus: (id: string, status: TaskStatus) => void;

    // Timer Actions
    startTimer: (taskId: string, durationMinutes?: number) => void;
    pauseTimer: () => void;
    stopTimer: () => void;
    getEffectiveElapsed: () => number;

    // Smart Actions
    rescheduleMissedTasks: () => void;
    acceptSuggestedPlan: (taskIds: string[]) => void;

    // Helpers
    getTasksByDate: (date: Date) => Task[];
    getDailyLogByDate: (date: string) => DailyLog | undefined;
}

export const useTaskStore = create<TaskState>()(
    persist(
        (set, get) => ({
            tasks: [],
            dailyLogs: [],
            activeTimer: null,

            addTask: (taskData) => {
                const id = crypto.randomUUID();
                const newTask: Task = {
                    ...taskData,
                    id,
                    createdAt: new Date().toISOString(),
                    status: 'planned',
                    timeSpent: 0,
                };
                set((state) => ({ tasks: [...state.tasks, newTask] }));
                return id;
            },

            updateTask: (id, updates) => {
                set((state) => ({
                    tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
                }));
            },

            deleteTask: (id) => {
                set((state) => {
                    const isTimerActive = state.activeTimer?.taskId === id;
                    return {
                        tasks: state.tasks.filter((t) => t.id !== id),
                        activeTimer: isTimerActive ? null : state.activeTimer,
                    };
                });
            },

            setTaskStatus: (id, status) => {
                const todayStr = format(new Date(), 'yyyy-MM-dd');
                set((state) => {
                    const task = state.tasks.find((t) => t.id === id);
                    if (!task) return state;

                    let activeTimer = state.activeTimer;
                    let tasks = state.tasks;

                    // If completing, stop timer if active
                    if (status === 'completed' && activeTimer?.taskId === id) {
                        const effective = get().getEffectiveElapsed();
                        tasks = tasks.map(t => t.id === id ? { ...t, timeSpent: (t.timeSpent || 0) + effective } : t);
                        activeTimer = null;
                    }

                    const updatedTasks = tasks.map((t) =>
                        t.id === id
                            ? {
                                ...t,
                                status,
                                completedAt: status === 'completed' ? new Date().toISOString() : undefined
                            }
                            : t
                    );

                    // Update daily logs
                    const existingLogIndex = state.dailyLogs.findIndex((log) => log.date === todayStr);
                    let newDailyLogs = [...state.dailyLogs];

                    const logUpdate = (log: DailyLog) => {
                        const completed = status === 'completed'
                            ? Array.from(new Set([...log.completedTaskIds, id]))
                            : log.completedTaskIds.filter(tid => tid !== id);

                        const failed = status === 'failed'
                            ? Array.from(new Set([...log.failedTaskIds, id]))
                            : log.failedTaskIds.filter(tid => tid !== id);

                        return { ...log, completedTaskIds: completed, failedTaskIds: failed };
                    };

                    if (existingLogIndex >= 0) {
                        newDailyLogs[existingLogIndex] = logUpdate(newDailyLogs[existingLogIndex]);
                    } else {
                        newDailyLogs.push(logUpdate({
                            date: todayStr,
                            completedTaskIds: [],
                            failedTaskIds: [],
                        }));
                    }

                    return { tasks: updatedTasks, dailyLogs: newDailyLogs, activeTimer };
                });
            },

            startTimer: (taskId, durationMinutes) => {
                const state = get();
                if (state.activeTimer && state.activeTimer.taskId !== taskId) {
                    state.stopTimer();
                }

                const task = state.tasks.find(t => t.id === taskId);
                const limit = durationMinutes ? durationMinutes * 60 : (task?.duration ? task.duration * 60 : undefined);

                set((state) => ({
                    activeTimer: {
                        taskId,
                        startTime: new Date().toISOString(),
                        isRunning: true,
                        elapsedAtPause: state.activeTimer?.taskId === taskId ? state.activeTimer.elapsedAtPause : 0,
                        durationLimit: limit
                    }
                }));
            },

            pauseTimer: () => {
                const state = get();
                if (!state.activeTimer || !state.activeTimer.isRunning) return;

                const effective = state.getEffectiveElapsed();
                set((state) => ({
                    activeTimer: state.activeTimer ? {
                        ...state.activeTimer,
                        isRunning: false,
                        elapsedAtPause: effective
                    } : null
                }));
            },

            stopTimer: () => {
                const state = get();
                if (!state.activeTimer) return;

                const effective = state.getEffectiveElapsed();
                const taskId = state.activeTimer.taskId;

                set((state) => ({
                    tasks: state.tasks.map(t => t.id === taskId ? { ...t, timeSpent: (t.timeSpent || 0) + effective } : t),
                    activeTimer: null
                }));
            },

            getEffectiveElapsed: () => {
                const { activeTimer } = get();
                if (!activeTimer) return 0;
                if (!activeTimer.isRunning) return activeTimer.elapsedAtPause;

                return activeTimer.elapsedAtPause + differenceInSeconds(new Date(), new Date(activeTimer.startTime));
            },

            rescheduleMissedTasks: () => {
                const today = startOfDay(new Date());
                set((state) => ({
                    tasks: state.tasks.map(t => {
                        if (t.status === 'planned' && t.dueDate && isBefore(startOfDay(new Date(t.dueDate)), today)) {
                            return { ...t, dueDate: format(today, 'yyyy-MM-dd') };
                        }
                        return t;
                    })
                }));
            },

            acceptSuggestedPlan: (taskIds) => {
                set((state) => ({
                    tasks: state.tasks.map(t =>
                        taskIds.includes(t.id) && t.status === 'suggested'
                            ? { ...t, status: 'planned' as TaskStatus, dueDate: format(new Date(), 'yyyy-MM-dd') }
                            : t
                    )
                }));
            },

            getTasksByDate: (date) => {
                const target = startOfDay(date);
                return get().tasks.filter(t => {
                    if (t.status === 'suggested') return false;
                    const dateToCompare = t.dueDate ? new Date(t.dueDate) : new Date(t.createdAt);
                    return isSameDay(startOfDay(dateToCompare), target);
                });
            },

            getDailyLogByDate: (date) => {
                return get().dailyLogs.find((log) => log.date === date);
            },
        }),
        {
            name: 'devflow-task-store-v4',
        }
    )
);

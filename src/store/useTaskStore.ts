import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, DailyLog, TaskStatus, Category, Priority, Recurrence } from '../types';
import { format, isSameDay, startOfDay } from 'date-fns';

interface TaskState {
    tasks: Task[];
    dailyLogs: DailyLog[];

    // Task Actions
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => string;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    setTaskStatus: (id: string, status: TaskStatus) => void;

    // Helpers
    getTasksByDate: (date: Date) => Task[];
    getDailyLogByDate: (date: string) => DailyLog | undefined;
}

export const useTaskStore = create<TaskState>()(
    persist(
        (set, get) => ({
            tasks: [],
            dailyLogs: [],

            addTask: (taskData) => {
                const id = crypto.randomUUID();
                const newTask: Task = {
                    ...taskData,
                    id,
                    createdAt: new Date().toISOString(),
                    status: 'planned',
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
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== id),
                }));
            },

            setTaskStatus: (id, status) => {
                const today = format(new Date(), 'yyyy-MM-dd');
                set((state) => {
                    const task = state.tasks.find((t) => t.id === id);
                    if (!task) return state;

                    const updatedTasks = state.tasks.map((t) =>
                        t.id === id
                            ? {
                                ...t,
                                status,
                                completedAt: status === 'completed' ? new Date().toISOString() : undefined
                            }
                            : t
                    );

                    // Update daily logs
                    const existingLogIndex = state.dailyLogs.findIndex((log) => log.date === today);
                    let newDailyLogs = [...state.dailyLogs];

                    const logUpdate = (log: DailyLog) => {
                        const completed = status === 'completed'
                            ? [...new Set([...log.completedTaskIds, id])]
                            : log.completedTaskIds.filter(tid => tid !== id);

                        const failed = status === 'failed'
                            ? [...new Set([...log.failedTaskIds, id])]
                            : log.failedTaskIds.filter(tid => tid !== id);

                        return { ...log, completedTaskIds: completed, failedTaskIds: failed };
                    };

                    if (existingLogIndex >= 0) {
                        newDailyLogs[existingLogIndex] = logUpdate(newDailyLogs[existingLogIndex]);
                    } else {
                        newDailyLogs.push(logUpdate({
                            date: today,
                            completedTaskIds: [],
                            failedTaskIds: [],
                        }));
                    }

                    return { tasks: updatedTasks, dailyLogs: newDailyLogs };
                });
            },

            getTasksByDate: (date) => {
                const target = startOfDay(date);
                return get().tasks.filter(t => {
                    if (!t.dueDate) return isSameDay(new Date(t.createdAt), target);
                    return isSameDay(new Date(t.dueDate), target);
                });
            },

            getDailyLogByDate: (date) => {
                return get().dailyLogs.find((log) => log.date === date);
            },
        }),
        {
            name: 'productivity-tasks-v2',
        }
    )
);

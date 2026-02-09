export type Priority = 'low' | 'medium' | 'high';
export type Category = 'frontend' | 'backend' | 'dsa' | 'health' | 'career' | 'general';
export type TaskStatus = 'planned' | 'completed' | 'failed' | 'skipped';
export type Recurrence = 'none' | 'daily' | 'weekly' | 'custom';

export interface Task {
    id: string;
    title: string;
    description?: string;
    category: Category;
    priority: Priority;
    status: TaskStatus;
    createdAt: string;
    completedAt?: string;
    dueDate?: string;
    duration?: number; // in minutes
    recurrence: Recurrence;
    parentId?: string; // For tasks belonging to goals or playlists
}

export interface Goal {
    id: string;
    title: string;
    description?: string;
    targetDate: string;
    category: Category;
    progress: number; // 0-100
    tasks: string[]; // Task IDs
    isCompleted: boolean;
}

export interface Playlist {
    id: string;
    title: string;
    description?: string;
    category: Category;
    tasks: Omit<Task, 'id' | 'createdAt' | 'status'>[];
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    date: string;
    type: 'streak' | 'milestone' | 'skill';
    icon?: string;
}

export interface DailyLog {
    date: string; // ISO format
    completedTaskIds: string[];
    failedTaskIds: string[];
}

export interface UserPreferences {
    username: string;
    avatar?: string;
    persona: 'frontend' | 'backend' | 'fullstack' | 'other';
    dailyTarget: number;
    weeklyTarget: number;
    theme: 'light' | 'dark' | 'system';
}

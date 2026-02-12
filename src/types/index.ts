export type Priority = 'low' | 'medium' | 'high';
export type Category = 'frontend' | 'backend' | 'dsa' | 'health' | 'career' | 'general';
export type TaskStatus = 'planned' | 'completed' | 'failed' | 'skipped' | 'suggested';
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
    timeSpent?: number; // in seconds
    playlistId?: string;
    playlistDayIndex?: number;
}

export interface TimerSession {
    taskId: string;
    startTime: string; // ISO
    isRunning: boolean;
    elapsedAtPause: number; // in seconds
    durationLimit?: number; // in seconds
}

export interface Goal {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    targetDate: string;
    category: Category;
    progress: number; // 0-100
    tasks: string[]; // Task IDs (these should exist in the central Task store)
    isCompleted: boolean;
    type: '7-days' | '14-days' | '30-days' | 'custom';
}

export interface Playlist {
    id: string;
    title: string;
    description?: string;
    category: Category;
    durationDays: number;
    tasks: Task[];
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

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
    read: boolean;
}

export interface UserPreferences {
    username: string;
    avatar?: string;
    persona: 'frontend' | 'backend' | 'fullstack' | 'other';
    dailyTarget: number;
    weeklyTarget: number;
    theme: 'light' | 'dark' | 'system';
    notificationsEnabled: boolean;
    autoCompleteOnTimerEnd: boolean;
    soundEnabled: boolean;
}

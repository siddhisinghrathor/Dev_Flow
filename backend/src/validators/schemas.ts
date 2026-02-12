import { z } from 'zod';

// ============================================
// AUTH SCHEMAS
// ============================================

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    username: z.string().min(2, 'Username must be at least 2 characters'),
    persona: z.enum(['frontend', 'backend', 'fullstack', 'other']).optional(),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ============================================
// TASK SCHEMAS
// ============================================

export const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().optional(),
    category: z.enum(['frontend', 'backend', 'dsa', 'health', 'career', 'general']),
    priority: z.enum(['low', 'medium', 'high']),
    duration: z.number().int().positive().optional(),
    dueDate: z.string().datetime().optional(),
    scheduledFor: z.string().datetime().optional(),
    recurrence: z.enum(['none', 'daily', 'weekly', 'custom']).default('none'),
    goalId: z.string().uuid().optional(),
    playlistId: z.string().uuid().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
    status: z.enum(['planned', 'completed', 'failed', 'skipped', 'suggested']).optional(),
});

export const taskQuerySchema = z.object({
    status: z.enum(['planned', 'completed', 'failed', 'skipped', 'suggested']).optional(),
    category: z.enum(['frontend', 'backend', 'dsa', 'health', 'career', 'general']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    goalId: z.string().uuid().optional(),
    playlistId: z.string().uuid().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
});

// ============================================
// GOAL SCHEMAS
// ============================================

export const createGoalSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().optional(),
    category: z.enum(['frontend', 'backend', 'dsa', 'health', 'career', 'general']),
    type: z.enum(['7-days', '14-days', '30-days', 'custom']),
    startDate: z.string().datetime(),
    targetDate: z.string().datetime(),
});

export const updateGoalSchema = createGoalSchema.partial().extend({
    progress: z.number().int().min(0).max(100).optional(),
    isCompleted: z.boolean().optional(),
});

// ============================================
// PLAYLIST SCHEMAS
// ============================================

export const createPlaylistSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().optional(),
    category: z.enum(['frontend', 'backend', 'dsa', 'health', 'career', 'general']),
    durationDays: z.number().int().positive().default(7),
    tasks: z.array(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        category: z.enum(['frontend', 'backend', 'dsa', 'health', 'career', 'general']),
        priority: z.enum(['low', 'medium', 'high']),
        duration: z.number().int().positive().optional(),
        dayIndex: z.number().int().positive(),
    })).optional(),
});

export const updatePlaylistSchema = createPlaylistSchema.partial();

// ============================================
// TIMER SCHEMAS
// ============================================

export const startTimerSchema = z.object({
    taskId: z.string().uuid('Invalid task ID'),
    durationLimit: z.number().int().positive().optional(),
});

export const updateTimerSchema = z.object({
    elapsedAtPause: z.number().int().min(0).optional(),
});

// ============================================
// ACHIEVEMENT SCHEMAS
// ============================================

export const createAchievementSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().min(1, 'Description is required'),
    type: z.enum(['streak', 'milestone', 'skill']),
    icon: z.string().optional(),
});

// ============================================
// NOTIFICATION SCHEMAS
// ============================================

export const createNotificationSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    message: z.string().min(1, 'Message is required'),
    type: z.enum(['info', 'success', 'warning', 'error', 'reminder']),
    scheduledFor: z.string().datetime().optional(),
    relatedTaskId: z.string().uuid().optional(),
    relatedGoalId: z.string().uuid().optional(),
});

export const markNotificationReadSchema = z.object({
    notificationIds: z.array(z.string().uuid()),
});

// ============================================
// USER PREFERENCES SCHEMAS
// ============================================

export const updatePreferencesSchema = z.object({
    username: z.string().min(2).optional(),
    avatar: z.string().url().optional(),
    persona: z.enum(['frontend', 'backend', 'fullstack', 'other']).optional(),
    dailyTarget: z.number().int().positive().optional(),
    weeklyTarget: z.number().int().positive().optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
    notificationsEnabled: z.boolean().optional(),
    autoCompleteOnTimerEnd: z.boolean().optional(),
    soundEnabled: z.boolean().optional(),
    quietHoursStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    quietHoursEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type CreatePlaylistInput = z.infer<typeof createPlaylistSchema>;
export type UpdatePlaylistInput = z.infer<typeof updatePlaylistSchema>;
export type StartTimerInput = z.infer<typeof startTimerSchema>;
export type UpdateTimerInput = z.infer<typeof updateTimerSchema>;
export type CreateAchievementInput = z.infer<typeof createAchievementSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;

import type { Task, Goal, UserPreferences, DailyLog, Category } from '../types';
import { differenceInDays, startOfDay, isSameDay } from 'date-fns';

/**
 * Generates a list of suggested tasks based on current goals, recent activity, and user preferences.
 */
export const generateDailyPlan = (
    currentTasks: Task[],
    goals: Goal[],
    logs: DailyLog[],
    preferences: UserPreferences
): Omit<Task, 'id' | 'createdAt' | 'status'>[] => {

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Count tasks already scheduled for today
    const todayTasksCount = currentTasks.filter(t =>
        (t.dueDate && isSameDay(new Date(t.dueDate), today)) ||
        (t.recurrence === 'daily')
    ).length;

    const remainingSlots = Math.max(0, preferences.dailyTarget - todayTasksCount);

    if (remainingSlots <= 0) return [];

    const suggestions: Omit<Task, 'id' | 'createdAt' | 'status'>[] = [];

    // 1. Goal-driven suggestions
    const activeGoals = goals.filter(g => !g.isCompleted && g.progress < 100);

    // Sort goals by progress (prioritize starting new ones or finishing almost done ones?)
    // Let's prioritize least progress to get moving, or user preference.
    activeGoals.forEach(goal => {
        if (suggestions.length >= remainingSlots) return;

        // Check if we worked on this goal recently (last 2 days)
        // This requires expensive log check, let's keep it simple for now:
        // If goal has tasks, pick one not done.

        // Find a task in the goal that is NOT in currentTasks (or is 'suggested' state in store essentially)
        // But here we are generating *new* ideas.

        suggestions.push({
            title: `Advance on: ${goal.title}`,
            description: `Dedicate a focused block to move the needle on your "${goal.title}" goal.`,
            category: goal.category,
            priority: 'high',
            duration: 45,
            recurrence: 'none',
            parentId: goal.id
        });
    });

    // 2. Consistency / Persona suggestions
    if (suggestions.length < remainingSlots) {
        if (preferences.persona === 'frontend') {
            suggestions.push({
                title: 'Component Library Polish',
                category: 'frontend',
                priority: 'medium',
                duration: 30,
                recurrence: 'none',
                description: 'Review a UI component for accessibility and responsive design.'
            });
        } else if (preferences.persona === 'backend') {
            suggestions.push({
                title: 'Database & API Optimization',
                category: 'backend',
                priority: 'medium',
                duration: 45,
                recurrence: 'none',
                description: 'Analyze query performance or refactor an API endpoint.'
            });
        } else if (preferences.persona === 'fullstack') {
            suggestions.push({
                title: 'End-to-End Integration Test',
                category: 'career', // or general
                priority: 'medium',
                duration: 45,
                recurrence: 'none',
                description: 'Ensure frontend and backend are syncing correctly for a key feature.'
            });
        }
    }

    // 3. General "Deep Work" block if still empty
    while (suggestions.length < remainingSlots) {
        suggestions.push({
            title: 'Deep Work Session',
            category: 'general',
            priority: 'high',
            duration: 60,
            recurrence: 'none',
            description: 'Uninterrupted focus block for your most complex problem.'
        });
    }

    return suggestions.slice(0, remainingSlots);
};

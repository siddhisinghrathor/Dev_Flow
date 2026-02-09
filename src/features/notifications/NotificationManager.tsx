import { useEffect, useRef } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { useAppStore } from '../../store/useAppStore';
import { differenceInMinutes, parseISO, isPast } from 'date-fns';

export const NotificationManager = () => {
    const { activeTimer, tasks, stopTimer, setTaskStatus } = useTaskStore();
    const { preferences, pushNotification } = useAppStore();
    const intervalRef = useRef<NodeJS.Timeout>();

    // Request permissions on mount if enabled
    useEffect(() => {
        if (preferences.notificationsEnabled && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, [preferences.notificationsEnabled]);

    // Timer Logic & Notifications
    useEffect(() => {
        if (!activeTimer?.isRunning) return;

        const checkTimer = () => {
            const now = new Date();
            const start = parseISO(activeTimer.startTime);
            const elapsed = (activeTimer.elapsedAtPause || 0) + (now.getTime() - start.getTime()) / 1000;
            const task = tasks.find(t => t.id === activeTimer.taskId);

            if (!task) return;

            // Halfway Reminder
            if (task.duration) {
                const durationSec = task.duration * 60;
                const percent = (elapsed / durationSec) * 100;

                // Simple state check (would ideally need a 'reminded' flag in store to avoid spam, 
                // but simpler implementation: check specific second window)
                if (percent >= 50 && percent < 51 && !sessionStorage.getItem(`reminded_half_${activeTimer.taskId}`)) {
                    pushNotification({
                        title: 'Halfway There! 🚀',
                        message: `You've been focused on "${task.title}" for over ${Math.floor(task.duration / 2)} mins. keep it up!`,
                        type: 'info'
                    });
                    sessionStorage.setItem(`reminded_half_${activeTimer.taskId}`, 'true');
                }

                // Completion?
                if (elapsed >= durationSec && !sessionStorage.getItem(`reminded_done_${activeTimer.taskId}`)) {
                    pushNotification({
                        title: 'Time is Up! ⏰',
                        message: `Great work on "${task.title}". Take a break or continue if you're in the zone.`,
                        type: 'success'
                    });
                    sessionStorage.setItem(`reminded_done_${activeTimer.taskId}`, 'true');

                    if (preferences.autoCompleteOnTimerEnd) {
                        setTaskStatus(task.id, 'completed');
                        stopTimer();
                    }
                }
            }
        };

        const timerId = setInterval(checkTimer, 1000);
        return () => clearInterval(timerId);
    }, [activeTimer, tasks, preferences, pushNotification, setTaskStatus, stopTimer]);

    // Deadline Checker (every minute)
    useEffect(() => {
        const checkDeadlines = () => {
            // Only check if explicitly enabled/requested? For now check all pending tasks.
            const now = new Date();
            tasks.forEach(task => {
                if (task.status !== 'completed' && task.dueDate && !isPast(parseISO(task.dueDate))) {
                    const diff = differenceInMinutes(parseISO(task.dueDate), now);
                    if (diff > 0 && diff <= 15 && !sessionStorage.getItem(`warn_deadline_${task.id}`)) {
                        pushNotification({
                            title: 'Deadline Approaching ⚠️',
                            message: `Task "${task.title}" is due in ${diff} minutes.`,
                            type: 'warning'
                        });
                        sessionStorage.setItem(`warn_deadline_${task.id}`, 'true');
                    }
                }
            });
        };

        const interval = setInterval(checkDeadlines, 60000); // Check every min
        return () => clearInterval(interval);
    }, [tasks, pushNotification]);

    return null; // Headless component
};

import { useMemo } from 'react';
import { format, eachDayOfInterval, isSameDay, startOfYear, endOfYear } from 'date-fns';
import type { DailyLog } from '../../types';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

interface HeatmapProps {
    logs: DailyLog[];
    year?: number;
}

export const Heatmap = ({ logs, year = new Date().getFullYear() }: HeatmapProps) => {
    const days = useMemo(() => {
        const start = startOfYear(new Date(year, 0, 1));
        const end = endOfYear(new Date(year, 11, 31));
        return eachDayOfInterval({ start, end });
    }, [year]);

    const getIntensity = (count: number) => {
        if (count === 0) return 'bg-secondary dark:bg-zinc-800';
        if (count <= 2) return 'bg-primary-200 dark:bg-primary-900/60';
        if (count <= 4) return 'bg-primary-400 dark:bg-primary-700/80';
        if (count <= 6) return 'bg-primary-600 dark:bg-primary-500';
        return 'bg-primary-800 dark:bg-primary-300';
    };

    const getLogForDay = (date: Date) => {
        return logs.find((log) => isSameDay(new Date(log.date), date));
    };

    return (
        <div className="flex flex-col space-y-2 overflow-x-auto pb-4">
            <div className="flex space-x-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="w-10 text-[10px] text-muted-foreground text-center">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-flow-col grid-rows-7 gap-1">
                {days.map((day, i) => {
                    const log = getLogForDay(day);
                    const count = log?.completedTaskIds.length || 0;
                    return (
                        <motion.div
                            key={day.toISOString()}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.001 }}
                            className={cn(
                                'h-3 w-3 rounded-[2px] cursor-pointer transition-colors hover:ring-2 hover:ring-primary-400 dark:hover:ring-primary-600',
                                getIntensity(count)
                            )}
                            title={`${format(day, 'MMM d, yyyy')}: ${count} tasks completed`}
                        />
                    );
                })}
            </div>
            <div className="flex items-center space-x-2 self-end text-[10px] text-muted-foreground mt-2">
                <span>Less</span>
                <div className="flex space-x-1">
                    <div className="h-3 w-3 rounded-[2px] bg-secondary dark:bg-zinc-800" />
                    <div className="h-3 w-3 rounded-[2px] bg-primary-200 dark:bg-primary-900/60" />
                    <div className="h-3 w-3 rounded-[2px] bg-primary-400 dark:bg-primary-700/80" />
                    <div className="h-3 w-3 rounded-[2px] bg-primary-600 dark:bg-primary-500" />
                    <div className="h-3 w-3 rounded-[2px] bg-primary-800 dark:bg-primary-300" />
                </div>
                <span>More</span>
            </div>
        </div>
    );
};

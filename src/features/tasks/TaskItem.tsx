import { useTaskStore } from '../../store/useTaskStore';
import { CheckCircle2, Circle, Trash2, Clock, AlertCircle, SkipForward } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';
import type { Task, TaskStatus } from '../../types';
import { motion } from 'framer-motion';

interface TaskItemProps {
    task: Task;
    onClick: (task: Task) => void;
}

export const TaskItem = ({ task, onClick }: TaskItemProps) => {
    const { setTaskStatus, deleteTask } = useTaskStore();

    const priorityColors = {
        low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };

    const statusIcons = {
        planned: <Circle className="h-6 w-6 text-muted-foreground" />,
        completed: <CheckCircle2 className="h-6 w-6 fill-primary-600 text-white" />,
        failed: <AlertCircle className="h-6 w-6 text-destructive" />,
        skipped: <SkipForward className="h-6 w-6 text-muted-foreground" />,
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        const nextStatus: TaskStatus = task.status === 'completed' ? 'planned' : 'completed';
        setTaskStatus(task.id, nextStatus);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -2 }}
            className="group relative cursor-pointer"
            onClick={() => onClick(task)}
        >
            <Card
                className={cn(
                    'transition-all duration-300 hover:shadow-lg hover:border-primary-500/30',
                    task.status === 'completed' && 'bg-muted/30 opacity-75',
                    task.status === 'failed' && 'border-destructive/30 bg-destructive/5'
                )}
            >
                <CardContent className="flex items-center p-4">
                    <button
                        onClick={handleToggle}
                        className="mr-4 transition-transform active:scale-90"
                    >
                        {statusIcons[task.status]}
                    </button>

                    <div className="flex-1 overflow-hidden">
                        <h4
                            className={cn(
                                'text-sm font-bold transition-all truncate',
                                task.status === 'completed' && 'text-muted-foreground line-through font-medium'
                            )}
                        >
                            {task.title}
                        </h4>
                        <div className="mt-1.5 flex items-center space-x-3">
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold uppercase">
                                <Clock size={10} /> {task.duration || 30}m
                            </div>
                            <Badge variant="outline" className="text-[10px] py-0 h-4 border-muted-foreground/20 capitalize">
                                {task.category}
                            </Badge>
                            <span className={cn('rounded-full px-2 py-0 text-[9px] uppercase font-black', priorityColors[task.priority])}>
                                {task.priority}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100 space-x-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:bg-accent"
                            onClick={(e) => { e.stopPropagation(); onClick(task); }}
                        >
                            <Clock size={14} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                        >
                            <Trash2 size={14} />
                        </Button>
                    </div>
                </CardContent>
            </Card>
            {task.status === 'failed' && (
                <div className="absolute top-2 right-2 flex gap-1">
                    <Badge variant="destructive" className="text-[8px] py-0 px-1 opacity-80">Missed</Badge>
                </div>
            )}
        </motion.div>
    );
};

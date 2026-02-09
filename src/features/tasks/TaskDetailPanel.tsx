import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, CheckCircle2, AlertCircle, Clock, Calendar, Pencil, Target, Play, Pause, Square } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useTaskStore } from '../../store/useTaskStore';
import type { Task, TaskStatus } from '../../types';

interface TaskDetailPanelProps {
    task: Task | null;
    onClose: () => void;
}

export const TaskDetailPanel = ({ task, onClose }: TaskDetailPanelProps) => {
    const { setTaskStatus, deleteTask, activeTimer, startTimer, pauseTimer, stopTimer, getEffectiveElapsed } = useTaskStore();
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        let interval: any;
        if (activeTimer?.taskId === task?.id && activeTimer?.isRunning) {
            interval = setInterval(() => {
                setElapsed(getEffectiveElapsed());
            }, 1000);
        } else if (activeTimer?.taskId === task?.id) {
            setElapsed(getEffectiveElapsed());
        }
        return () => clearInterval(interval);
    }, [activeTimer, task?.id, getEffectiveElapsed]);

    if (!task) return null;

    const handleStatusChange = (status: TaskStatus) => {
        setTaskStatus(task.id, status);
        onClose();
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            deleteTask(task.id);
            onClose();
        }
    };

    const isTimerRunning = activeTimer?.taskId === task.id && activeTimer?.isRunning;
    const isTimerActive = activeTimer?.taskId === task.id;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <AnimatePresence>
            {task && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l bg-card p-6 shadow-2xl"
                    >
                        <div className="flex h-full flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Task Workbench</h2>
                                <Button variant="ghost" size="icon" onClick={onClose}>
                                    <X size={20} />
                                </Button>
                            </div>

                            <div className="flex-1 space-y-8 overflow-y-auto pr-2">
                                <div>
                                    <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider underline decoration-primary-500/30">
                                        Title
                                    </label>
                                    <h3 className="text-2xl font-bold mt-1 leading-tight">{task.title}</h3>
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        <Badge variant="secondary" className="capitalize">{task.category}</Badge>
                                        <Badge variant="outline" className="capitalize">{task.priority} Priority</Badge>
                                        <Badge variant={task.status === 'completed' ? 'success' : 'default'} className="capitalize">
                                            {task.status}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Timer Section */}
                                <div className="p-6 rounded-2xl bg-accent/30 border space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase text-muted-foreground">Session Timer</span>
                                        <span className="text-2xl font-mono font-black">{isTimerActive ? formatTime(elapsed) : formatTime(task.timeSpent || 0)}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {!isTimerRunning ? (
                                            <Button className="flex-1" onClick={() => startTimer(task.id)}>
                                                <Play size={16} className="mr-2" /> {task.timeSpent ? 'Resume' : 'Start'}
                                            </Button>
                                        ) : (
                                            <Button className="flex-1" variant="outline" onClick={pauseTimer}>
                                                <Pause size={16} className="mr-2" /> Pause
                                            </Button>
                                        )}
                                        <Button variant="secondary" size="icon" onClick={stopTimer} disabled={!isTimerActive}>
                                            <Square size={16} />
                                        </Button>
                                    </div>
                                    {task.duration && (
                                        <p className="text-[10px] text-center text-muted-foreground font-medium italic">
                                            Target duration: {task.duration} minutes
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                            <Clock size={12} /> Total Focus
                                        </span>
                                        <p className="text-sm font-semibold">{Math.floor((task.timeSpent || 0) / 60)} mins</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                            <Calendar size={12} /> Recurrence
                                        </span>
                                        <p className="text-sm font-semibold capitalize">{task.recurrence || 'None'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold border-b pb-2">Status Actions</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            onClick={() => handleStatusChange('completed')}
                                            variant={task.status === 'completed' ? 'outline' : 'primary'}
                                            className="w-full justify-start gap-2"
                                        >
                                            <CheckCircle2 size={16} /> Complete
                                        </Button>
                                        <Button
                                            onClick={() => handleStatusChange('failed')}
                                            variant={task.status === 'failed' ? 'outline' : 'danger'}
                                            className="w-full justify-start gap-2"
                                        >
                                            <AlertCircle size={16} /> Mark Failed
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start gap-2 text-blue-500"
                                        >
                                            <Pencil size={16} /> Edit Details
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start gap-2 text-purple-500"
                                        >
                                            <Target size={16} /> Push to Goal
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t flex gap-3">
                                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={handleDelete}>
                                    <Trash2 size={16} className="mr-2" /> Delete Task
                                </Button>
                                <div className="flex-1" />
                                <Button variant="secondary" onClick={onClose}>Finish Session</Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

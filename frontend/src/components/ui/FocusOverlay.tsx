import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, CheckCircle2, Info, Square, Target } from 'lucide-react';
import { Button } from './Button';
import { useTaskStore } from '../../store/useTaskStore';

export const FocusOverlay = ({ taskId, onClose }: { taskId: string, onClose: () => void }) => {
    const { tasks, activeTimer, getEffectiveElapsed, stopTimer, setTaskStatus } = useTaskStore();
    const [elapsed, setElapsed] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const task = tasks.find(t => t.id === taskId);

    useEffect(() => {
        let interval: any;
        if (activeTimer?.isRunning) {
            // Update immediately
            setElapsed(getEffectiveElapsed());
            interval = setInterval(() => {
                setElapsed(getEffectiveElapsed());
            }, 1000);
        } else {
            setElapsed(getEffectiveElapsed());
        }
        return () => clearInterval(interval);
    }, [activeTimer?.isRunning, getEffectiveElapsed]);

    if (!task) return null;

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours > 0 ? hours + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((e) => {
                console.error("Fullscreen failed:", e);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen().catch((e) => {
                console.error("Exit fullscreen failed:", e);
            });
            setIsFullscreen(false);
        }
    };

    const handleComplete = () => {
        setTaskStatus(task.id, 'completed');
        if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
        onClose();
    };

    const handleQuit = () => {
        stopTimer();
        if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center p-8 text-white w-screen h-screen overflow-hidden"
            >
                <div className="absolute top-8 left-8 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center">
                        <Target size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-500">Deep Work Session</p>
                        <h2 className="text-lg font-bold">{task.title}</h2>
                    </div>
                </div>

                <div className="absolute top-8 right-8 flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-zinc-400 hover:text-white hover:bg-white/10">
                        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-white hover:bg-white/10">
                        <X size={24} />
                    </Button>
                </div>

                <div className="flex flex-col items-center space-y-12 relative z-10">
                    <motion.div
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="text-[12rem] font-black font-mono tracking-tighter leading-none select-none tabular-nums"
                    >
                        {formatTime(elapsed)}
                    </motion.div>

                    <div className="flex flex-col items-center space-y-6">
                        <div className="flex items-center gap-4">
                            <Button
                                size="lg"
                                onClick={handleComplete}
                                className="h-16 px-10 rounded-full bg-primary-600 hover:bg-primary-700 text-xl font-bold gap-3 shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all hover:scale-105 ring-offset-0 focus:ring-0"
                            >
                                <CheckCircle2 size={24} /> Complete Sprint
                            </Button>
                            <Button
                                size="lg"
                                variant="secondary"
                                onClick={handleQuit}
                                className="h-16 px-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xl font-bold gap-3 ring-offset-0 focus:ring-0"
                            >
                                <Square size={24} fill="currentColor" /> Quit
                            </Button>
                        </div>

                        <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium">
                            <Info size={14} />
                            <span>Focus is a muscle. Stay in the zone.</span>
                        </div>
                    </div>
                </div>

                {/* Ambient Glows */}
                <div className="fixed -bottom-48 -left-48 w-96 h-96 bg-primary-600/20 blur-[120px] rounded-full pointer-events-none" />
                <div className="fixed -top-48 -right-48 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
            </motion.div>
        </AnimatePresence>
    );
};

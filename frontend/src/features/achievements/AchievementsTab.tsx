
import { useTaskStore } from '../../store/useTaskStore';
import { Card, CardContent } from '../../components/ui/Card';
import { formatDistanceStrict, parseISO } from 'date-fns';
import { Award, Clock, CheckCircle2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export const AchievementsTab = () => {
    const { tasks } = useTaskStore();
    const completedTasks = tasks.filter(t => t.status === 'completed');

    return (
        <div className="space-y-8 animate-fade-in mb-12">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    <Award className="text-primary-600" size={32} />
                    Wall of Fame
                </h2>
                <p className="text-muted-foreground font-medium">Your collection of focus-powered victories.</p>
            </div>

            {completedTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-[32px] bg-accent/5">
                    <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mb-6 text-muted-foreground/30">
                        <Award size={40} />
                    </div>
                    <h3 className="text-xl font-bold">Your journey is starting</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-xs text-center">Complete your tasks to transform them into glorious achievements here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[200px]">
                    {completedTasks.map((task, index) => {
                        const timeTaken = task.completedAt
                            ? formatDistanceStrict(parseISO(task.createdAt), parseISO(task.completedAt))
                            : 'N/A';

                        // Varied sizes based on index or priority
                        const isBig = task.priority === 'high';
                        const isWide = index % 5 === 0 && !isBig;

                        return (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={cn(
                                    "relative group hover:z-10",
                                    isBig && "md:row-span-2 md:col-span-2",
                                    isWide && "md:col-span-2"
                                )}
                            >
                                <Card className={cn(
                                    "h-full overflow-hidden border-none shadow-xl transition-all duration-500 hover:shadow-primary-500/30 hover:-translate-y-2 cursor-pointer",
                                    task.priority === 'high' ? "bg-zinc-950 dark:bg-zinc-900 text-white" :
                                        task.priority === 'medium' ? "bg-gradient-to-br from-primary-600 to-indigo-700 text-white" :
                                            "bg-white border text-foreground"
                                )}>
                                    <div className="absolute -top-4 -right-4 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Award size={isBig ? 180 : 100} />
                                    </div>

                                    {isBig && (
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-primary-500 to-purple-600" />
                                    )}

                                    <CardContent className="p-8 flex flex-col h-full justify-between relative">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "p-2 rounded-xl",
                                                    task.priority === 'low' ? "bg-primary-50 text-primary-600" : "bg-white/10 text-white"
                                                )}>
                                                    <Zap size={18} fill="currentColor" />
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-[0.2em]",
                                                    task.priority === 'low' ? "text-muted-foreground" : "text-white/60"
                                                )}>
                                                    {task.category}
                                                </span>
                                            </div>
                                            <h3 className={cn(
                                                "font-black leading-tight tracking-tight",
                                                isBig ? "text-4xl" : "text-xl"
                                            )}>
                                                {task.title}
                                            </h3>
                                            {isBig && task.description && (
                                                <p className="text-white/60 text-sm line-clamp-3 font-medium">
                                                    {task.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-xs font-bold opacity-80">
                                                <Clock size={14} />
                                                <span>Mission Duration: {timeTaken}</span>
                                            </div>
                                            <div className={cn(
                                                "flex items-center gap-2 text-[10px] font-black w-fit px-3 py-1.5 rounded-full border-2",
                                                task.priority === 'low' ? "border-green-100 bg-green-50 text-green-700" : "border-white/20 bg-white/10 text-white"
                                            )}>
                                                <CheckCircle2 size={12} fill="currentColor" className={task.priority === 'low' ? "opacity-100" : "text-white"} />
                                                <span className="uppercase tracking-widest">Mastery Logic Applied</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

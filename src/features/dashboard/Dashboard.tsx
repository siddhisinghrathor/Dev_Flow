import { useMemo } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { useAppStore } from '../../store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Target, Zap, CheckCircle2, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import { format, startOfDay, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export const Dashboard = () => {
    const { tasks } = useTaskStore();
    const { preferences, goals } = useAppStore();

    const today = useMemo(() => startOfDay(new Date()), []);
    const weekStart = useMemo(() => startOfWeek(today), [today]);
    const weekEnd = useMemo(() => endOfWeek(today), [today]);

    const stats = useMemo(() => {
        const todayTasks = tasks.filter(t =>
            t.dueDate ? isWithinInterval(new Date(t.dueDate), { start: today, end: today }) :
                isWithinInterval(new Date(t.createdAt), { start: today, end: today })
        );

        const weekTasks = tasks.filter(t =>
            t.dueDate ? isWithinInterval(new Date(t.dueDate), { start: weekStart, end: weekEnd }) :
                isWithinInterval(new Date(t.createdAt), { start: weekStart, end: weekEnd })
        );

        const todayCompleted = todayTasks.filter(t => t.status === 'completed').length;
        const weekCompleted = weekTasks.filter(t => t.status === 'completed').length;

        const todayProgress = todayTasks.length > 0 ? (todayCompleted / todayTasks.length) * 100 : 0;
        const weekProgress = preferences.weeklyTarget > 0 ? (weekCompleted / preferences.weeklyTarget) * 100 : 0;

        const productivityScore = Math.min(100, (todayProgress * 0.4 + weekProgress * 0.6));

        return {
            todayCompleted,
            todayTotal: todayTasks.length,
            todayProgress,
            weekCompleted,
            weekProgress,
            productivityScore,
            pendingToday: todayTasks.filter(t => t.status === 'planned').length,
            failedToday: todayTasks.filter(t => t.status === 'failed').length,
        };
    }, [tasks, today, weekStart, weekEnd, preferences]);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* KPI Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <KPIItem
                    title="Daily Goal"
                    value={`${stats.todayCompleted} / ${preferences.dailyTarget}`}
                    icon={<CheckCircle2 className="text-primary-500" />}
                    progress={stats.todayProgress}
                    label="completed today"
                />
                <KPIItem
                    title="Weekly Target"
                    value={`${stats.weekCompleted} / ${preferences.weeklyTarget}`}
                    icon={<Calendar className="text-blue-500" />}
                    progress={stats.weekProgress}
                    label="tasks done this week"
                />
                <KPIItem
                    title="Productivity Score"
                    value={`${stats.productivityScore.toFixed(0)}%`}
                    icon={<TrendingUp className="text-purple-500" />}
                    progress={stats.productivityScore}
                    label="overall efficiency"
                />
                <KPIItem
                    title="Daily Streak"
                    value="7 Days"
                    icon={<Zap className="text-orange-500" />}
                    progress={70} // Placeholder for streak progress
                    label="current hot streak"
                />
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Progress & Goals */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-primary-600 to-primary-800 text-white">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold">Deep Work Progress</h3>
                                    <p className="text-primary-100 mt-1 opacity-90">Focusing on your Developer Persona: <span className="underline font-semibold capitalize">{preferences.persona}</span></p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                                    <Target size={24} />
                                </div>
                            </div>

                            <div className="mt-8 space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-medium">Daily Velocity</span>
                                    <span className="text-xl font-black">{stats.todayProgress.toFixed(0)}%</span>
                                </div>
                                <div className="h-3 w-full rounded-full bg-white/20 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.todayProgress}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                                    />
                                </div>
                                <div className="flex gap-4 text-xs font-medium text-primary-50 opacity-80">
                                    <div className="flex items-center gap-1">
                                        <span className="h-2 w-2 rounded-full bg-white" /> {stats.todayCompleted} Done
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="h-2 w-2 rounded-full bg-white/40" /> {stats.pendingToday} Pending
                                    </div>
                                    {stats.failedToday > 0 && (
                                        <div className="flex items-center gap-1">
                                            <span className="h-2 w-2 rounded-full bg-red-400" /> {stats.failedToday} Failed
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                                    <Target size={16} /> Active Long-Term Goal
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {goals.length > 0 ? (
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-lg">{goals[0].title}</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span>Progress</span>
                                                <span>{goals[0].progress}%</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-accent">
                                                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${goals[0].progress}%` }} />
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground italic">Target: {format(new Date(goals[0].targetDate), 'MMM d, yyyy')}</p>
                                    </div>
                                ) : (
                                    <div className="py-6 text-center text-muted-foreground">
                                        <p className="text-sm">No active goals. Start planning your future!</p>
                                        <Button variant="outline" size="sm" className="mt-3">Create Goal</Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                                    <TrendingUp size={16} /> Consistency Tip
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm">
                                    {stats.failedToday > 0
                                        ? "Don't let failures discourage you. Missed tasks can be rescheduled for tomorrow!"
                                        : "You're doing great! Keep the momentum going to unlock the 'Weekly Warrior' badge."}
                                </p>
                                <div className="rounded-lg bg-orange-50 dark:bg-orange-950/20 p-3 flex items-start gap-2 border border-orange-100 dark:border-orange-900/30">
                                    <AlertTriangle size={16} className="text-orange-500 mt-0.5" />
                                    <p className="text-[11px] text-orange-700 dark:text-orange-400 font-medium">
                                        Pro Tip: Tasks marked as 'Failed' will break your streak unless you complete a 'Recovery' task tonight.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Side Info */}
                <div className="space-y-6">
                    <Card className="glass">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">
                                Quick Launch
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-2">
                            <ActionButton icon={<Zap size={18} />} label="Sprint" color="text-orange-500" />
                            <ActionButton icon={<CheckCircle2 size={18} />} label="Tasks" color="text-green-500" />
                            <ActionButton icon={<TrendingUp size={18} />} label="Report" color="text-blue-500" />
                            <ActionButton icon={<Target size={18} />} label="Set Goal" color="text-purple-500" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase text-muted-foreground">
                                Activity Playlist
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-xl border bg-accent/30">
                                <div className="h-10 w-10 rounded-lg bg-primary-600 text-white flex items-center justify-center">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Frontend Sprint</p>
                                    <p className="text-xs text-muted-foreground">Active for 4 more days</p>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full text-xs h-9">View Weekly Plan</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const KPIItem = ({ title, value, icon, progress, label }: any) => (
    <Card className="relative overflow-hidden group hover:border-primary-500/50 transition-all duration-300">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
                    <h3 className="text-2xl font-black">{value}</h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                    {icon}
                </div>
            </div>
            <div className="mt-4 space-y-2">
                <div className="h-1.5 w-full rounded-full bg-accent overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-primary-500"
                    />
                </div>
                <p className="text-[10px] text-muted-foreground font-medium text-right lowercase">{label}</p>
            </div>
        </CardContent>
    </Card>
);

const ActionButton = ({ icon, label, color }: any) => (
    <button className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:bg-accent hover:shadow-inner transition-all group">
        <div className={cn("mb-2 group-hover:scale-110 transition-transform", color)}>
            {icon}
        </div>
        <span className="text-[10px] font-bold uppercase text-muted-foreground">{label}</span>
    </button>
);

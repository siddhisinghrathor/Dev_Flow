import { useTaskStore } from '../../store/useTaskStore';
import { Card, CardContent } from '../../components/ui/Card';
import { TrendingUp, Award, Zap, Target } from 'lucide-react';
import { differenceInDays, startOfDay } from 'date-fns';

export const Analytics = () => {
    const { tasks, dailyLogs } = useTaskStore();

    const totalCompleted = tasks.filter((t) => t.status === 'completed').length;
    const completionRate = tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0;

    const calculateStreak = () => {
        if (dailyLogs.length === 0) return 0;

        const sortedLogs = [...dailyLogs]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        let streak = 0;
        let currentDate = startOfDay(new Date());

        for (const log of sortedLogs) {
            const logDate = startOfDay(new Date(log.date));
            const diff = differenceInDays(currentDate, logDate);

            // If the log is for today or yesterday (to allow for the current day being in progress)
            if (diff === 0 || diff === 1) {
                if (log.completedTaskIds.length > 0) {
                    streak++;
                    currentDate = logDate;
                } else if (diff === 0) {
                    // If it's today and 0 tasks, don't break streak yet, check yesterday
                    continue;
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        return streak;
    };

    const streak = calculateStreak();

    const stats = [
        {
            title: 'Current Streak',
            value: `${streak} Days`,
            icon: <Zap className="text-orange-500" />,
            color: 'bg-orange-50 dark:bg-orange-950/20',
        },
        {
            title: 'Total Completed',
            value: totalCompleted,
            icon: <Award className="text-primary-600" />,
            color: 'bg-primary-50 dark:bg-primary-950/20',
        },
        {
            title: 'Completion Rate',
            value: `${completionRate}%`,
            icon: <TrendingUp className="text-blue-500" />,
            color: 'bg-blue-50 dark:bg-blue-950/20',
        },
        {
            title: 'Productivity Score',
            value: Math.min(100, streak * 10 + completionRate * 0.5).toFixed(0),
            icon: <Target className="text-purple-500" />,
            color: 'bg-purple-50 dark:bg-purple-950/20',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                    <h3 className="mt-1 text-2xl font-bold">{stat.value}</h3>
                                </div>
                                <div className={`rounded-full p-2 ${stat.color}`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <div className="p-6">
                    <h3 className="text-lg font-bold mb-6">Recent Achievements</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                        <AchievementCard
                            title="Weekly Warrior"
                            description="Completed 15 tasks in a single week."
                            date="Feb 5, 2026"
                            icon={<Zap size={18} className="text-orange-500" />}
                        />
                        <AchievementCard
                            title="Consistency King"
                            description="Maintained a 7-day streak."
                            date="Feb 8, 2026"
                            icon={<TrendingUp size={18} className="text-primary-500" />}
                        />
                        <AchievementCard
                            title="Bug Squasher"
                            description="Fixed 5 backend issues in one day."
                            date="Feb 9, 2026"
                            icon={<Award size={18} className="text-blue-500" />}
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
};

const AchievementCard = ({ title, description, date, icon }: any) => (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-accent/30 border">
        <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center border shadow-sm">
            {icon}
        </div>
        <div>
            <h4 className="text-sm font-bold">{title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            <p className="text-[10px] text-muted-foreground mt-2 font-medium opacity-60 uppercase">{date}</p>
        </div>
    </div>
);

import { useMemo, useState, useEffect } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { useAppStore } from '../../store/useAppStore';
import { usePlaylistStore } from '../../store/usePlaylistStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { FocusOverlay } from '../../components/ui/FocusOverlay';
import {
  Target,
  Zap,
  CheckCircle2,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Plus,
  Play,
  Pause,
  Clock,
  ArrowRight,
  ListMusic,
} from 'lucide-react';
import {
  format,
  startOfDay,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  addDays,
  differenceInDays,
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import type { Category, Priority } from '../../types';

export const Dashboard = () => {
  const {
    tasks,
    activeTimer,
    startTimer,
    pauseTimer,
    stopTimer,
    getEffectiveElapsed,
    dailyLogs,
  } = useTaskStore();
  const { preferences, goals } = useAppStore();
  const { playlists, activePlaylistId } = usePlaylistStore();

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isSetGoalOpen, setIsSetGoalOpen] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const today = useMemo(() => startOfDay(new Date()), []);
  const weekStart = useMemo(() => startOfWeek(today), [today]);
  const weekEnd = useMemo(() => endOfWeek(today), [today]);

  // Live Timer Update
  useEffect(() => {
    let interval: any;
    if (activeTimer?.isRunning) {
      interval = setInterval(() => {
        const current = getEffectiveElapsed();
        setElapsed(current);
      }, 1000);
    } else {
      setElapsed(getEffectiveElapsed());
    }
    return () => clearInterval(interval);
  }, [activeTimer, getEffectiveElapsed, tasks]);

  const activeTask = useMemo(
    () => tasks.find((t) => t.id === activeTimer?.taskId),
    [tasks, activeTimer]
  );

  const stats = useMemo(() => {
    const todayTasks = tasks.filter((t) =>
      t.dueDate
        ? isWithinInterval(new Date(t.dueDate), { start: today, end: today })
        : isWithinInterval(new Date(t.createdAt), { start: today, end: today })
    );

    const weekTasks = tasks.filter((t) =>
      t.dueDate
        ? isWithinInterval(new Date(t.dueDate), { start: weekStart, end: weekEnd })
        : isWithinInterval(new Date(t.createdAt), { start: weekStart, end: weekEnd })
    );

    const todayCompleted = todayTasks.filter((t) => t.status === 'completed').length;
    const weekCompleted = weekTasks.filter((t) => t.status === 'completed').length;

    const todayProgress = todayTasks.length > 0 ? (todayCompleted / todayTasks.length) * 100 : 0;
    const weekProgress =
      preferences.weeklyTarget > 0 ? (weekCompleted / preferences.weeklyTarget) * 100 : 0;

    // Dynamic Streak calculation
    let streak = 0;
    const sortedLogs = [...dailyLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    let checkDate = today;
    for (const log of sortedLogs) {
      if (differenceInDays(checkDate, new Date(log.date)) <= 1) {
        if (log.completedTaskIds.length > 0) {
          streak++;
          checkDate = new Date(log.date);
        } else if (
          !isWithinInterval(new Date(), { start: startOfDay(new Date()), end: new Date() })
        ) {
          break;
        }
      } else {
        break;
      }
    }

    const productivityScore = Math.min(
      100,
      todayProgress * 0.4 + weekProgress * 0.6 + (streak > 0 ? 10 : 0)
    );

    return {
      todayCompleted,
      todayTotal: todayTasks.length,
      todayProgress,
      weekCompleted,
      weekProgress,
      productivityScore,
      streak,
      pendingToday: todayTasks.filter((t) => t.status === 'planned' || t.status === 'suggested')
        .length,
      failedToday: todayTasks.filter((t) => t.status === 'failed').length,
      todayTasks,
    };
  }, [tasks, today, weekStart, weekEnd, preferences, dailyLogs]);

  const smartTip = useMemo(() => {
    if (stats.todayProgress >= 100)
      return 'Daily goal crushed! Time for some high-quality rest. 🏆';
    if (stats.streak >= 5)
      return `${stats.streak}-day streak! Keep the flame alive, don't break the chain. 🔥`;
    if (stats.pendingToday > 0)
      return `You have ${stats.pendingToday} tasks left for today. One step at a time! 💪`;
    if (stats.failedToday > 0)
      return 'A few bumps today? No worries, you can always recover tomorrow. 🚀';
    return 'Plan your day and start your first sprint. Consistency is key! ✨';
  }, [stats]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId);

  return (
    <div className="relative animate-fade-in space-y-8">
      {isFocusMode && activeTask && (
        <FocusOverlay taskId={activeTask.id} onClose={() => setIsFocusMode(false)} />
      )}

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
          value={`${stats.streak} Days`}
          icon={<Zap className="text-orange-500" />}
          progress={Math.min(100, (stats.streak / 7) * 100)}
          label="current consistency"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Active Task Timer */}
          <AnimatePresence>
            {activeTask && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <Card className="overflow-hidden border-primary-500/50 bg-primary-50/50 shadow-lg dark:bg-primary-950/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-primary-600 text-white">
                          <Clock size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
                            Active Sprint
                          </p>
                          <h3 className="text-xl font-bold">{activeTask.title}</h3>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="font-mono text-3xl font-black tabular-nums tracking-tighter">
                          {formatTime(elapsed)}
                        </div>
                        {activeTask.duration && (
                          <p className="text-[10px] font-bold uppercase text-muted-foreground">
                            Target: {activeTask.duration}m
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                      {activeTimer?.isRunning ? (
                        <Button onClick={pauseTimer} className="flex-1 gap-2" variant="outline">
                          <Pause size={18} /> Pause
                        </Button>
                      ) : (
                        <Button
                          onClick={() => startTimer(activeTask.id)}
                          className="flex-1 gap-2"
                          variant="primary"
                        >
                          <Play size={18} /> Resume
                        </Button>
                      )}
                      <Button
                        onClick={() => setIsFocusMode(true)}
                        className="flex-1 gap-2 bg-zinc-900 text-white hover:bg-zinc-800"
                      >
                        <Zap size={18} /> Focus Mode
                      </Button>
                      <Button
                        onClick={() => stopTimer(true)}
                        className="flex-1 gap-2 bg-green-600 text-white hover:bg-green-700"
                      >
                        <CheckCircle2 size={18} /> Complete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <Card className="overflow-hidden border-none bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Deep Work Progress</h3>
                  <p className="mt-1 text-primary-100 opacity-90">
                    Focusing on your Developer Persona:{' '}
                    <span className="font-semibold capitalize underline">
                      {preferences.persona}
                    </span>
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                  <Target size={24} />
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <span className="text-sm font-medium">Daily Velocity</span>
                    <span className="text-xl font-black">{stats.todayProgress.toFixed(0)}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.todayProgress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                    />
                  </div>
                </div>

                {goals[0] && (
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Goal Objectives</span>
                      <span className="text-[10px] font-black opacity-60">{goals[0].tasks.length} tasks</span>
                    </div>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                      {tasks.filter(t => t.parentId === goals[0].id).slice(0, 3).map(task => (
                        <div key={task.id} className="flex items-center gap-3 bg-white/10 p-2 rounded-lg border border-white/5 group hover:bg-white/20 transition-all">
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            task.status === 'completed' ? "bg-green-400" : "bg-white/40"
                          )} />
                          <span className={cn(
                            "text-xs font-bold",
                            task.status === 'completed' && "opacity-50 line-through"
                          )}>{task.title}</span>
                        </div>
                      ))}
                      {tasks.filter(t => t.parentId === goals[0].id).length === 0 && (
                        <p className="text-[10px] italic opacity-40">No tasks linked to this goal yet.</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 text-xs font-medium text-primary-50 opacity-80">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-white" /> {stats.todayCompleted} Done
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-white/40" /> {stats.pendingToday}{' '}
                    Pending
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase text-muted-foreground">
                  <Target size={16} /> Active Long-Term Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                {goals.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold">{goals[0].title}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{goals[0].progress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-accent">
                        <div
                          className="h-full rounded-full bg-primary-500"
                          style={{ width: `${goals[0].progress}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs italic text-muted-foreground">
                      Target: {format(new Date(goals[0].targetDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                ) : (
                  <div className="py-6 text-center text-muted-foreground">
                    <p className="text-sm">No active goals. Start planning your future!</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setIsSetGoalOpen(true)}
                    >
                      Create Goal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase text-muted-foreground">
                  <TrendingUp size={16} /> Consistency Tip
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-medium">{smartTip}</p>
                <div className="flex items-start gap-2 rounded-lg border border-orange-100 bg-orange-50 p-3 dark:border-orange-900/30 dark:bg-orange-950/20">
                  <AlertTriangle size={16} className="mt-0.5 text-orange-500" />
                  <p className="text-[11px] font-medium text-orange-700 dark:text-orange-400">
                    Pro Tip: Short sprints of 25 minutes are shown to increase developer
                    productivity by 30%. Try the timer!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">
                Quick Launch
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <ActionButton
                icon={<Plus size={18} />}
                label="Add Task"
                color="text-green-500"
                onClick={() => setIsAddTaskOpen(true)}
              />
              <ActionButton
                icon={<Zap size={18} />}
                label="Sprint"
                color="text-orange-500"
                onClick={() => {
                  const nextTask = stats.todayTasks.find((t) => t.status === 'planned');
                  if (nextTask) startTimer(nextTask.id);
                }}
              />
              <ActionButton
                icon={<Target size={18} />}
                label="Set Goal"
                color="text-purple-500"
                onClick={() => setIsSetGoalOpen(true)}
              />
              <ActionButton
                icon={<Calendar size={18} />}
                label="Playlist"
                color="text-blue-500"
                onClick={() => setIsPlaylistOpen(true)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold uppercase text-muted-foreground">
                Today's Focus
              </CardTitle>
              <span className="text-[10px] font-black bg-primary-50 text-primary-600 px-2 py-1 rounded-full uppercase tracking-tighter">
                {stats.pendingToday} Pending
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.todayTasks
                .filter((t) => t.status === 'planned' || t.status === 'suggested')
                .slice(0, 5)
                .map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center justify-between rounded-xl p-3 bg-accent/5 transition-all hover:bg-accent/20 border border-transparent hover:border-accent"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => stopTimer(true)}
                        className="h-5 w-5 rounded-full border-2 border-primary-200 transition-colors hover:border-primary-500 flex items-center justify-center group-hover:bg-primary-50"
                      >
                        <div className="h-2 w-2 rounded-full bg-primary-500 opacity-0 group-hover:opacity-20" />
                      </button>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tight">{task.title}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{task.category}</span>
                      </div>
                    </div>
                    {!activeTimer && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 bg-white"
                        onClick={() => startTimer(task.id)}
                      >
                        <Play size={12} fill="currentColor" />
                      </Button>
                    )}
                  </div>
                ))}
              {stats.pendingToday === 0 && (
                <div className="py-8 text-center flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                    <CheckCircle2 size={24} />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground italic">All clear! Today's mission accomplished.</p>
                </div>
              )}
              <Button
                variant="ghost"
                className="h-10 w-full gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-accent"
              >
                View full backlog <ArrowRight size={12} />
              </Button>
            </CardContent>
          </Card>

          {activePlaylist && (
            <Card className="border-primary-500/20 bg-primary-50/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-primary-600 flex items-center gap-2">
                  <ListMusic size={14} /> Playlist Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold truncate pr-4">{activePlaylist.title}</h4>
                    <span className="text-xs font-black">Day 1/{activePlaylist.durationDays}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-accent overflow-hidden">
                    <div
                      className="h-full bg-primary-500"
                      style={{ width: `${(1 / activePlaylist.durationDays) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-3 rounded-xl border flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase">Tasks Done</span>
                    <span className="text-lg font-black">{activePlaylist.tasks?.filter((t: any) => t.status === 'completed').length || 0}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase">Remaining</span>
                    <span className="text-lg font-black">{activePlaylist.tasks?.filter((t: any) => t.status === 'planned').length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <QuickAddTaskModal isOpen={isAddTaskOpen} onClose={() => setIsAddTaskOpen(false)} />
      <SetGoalModal isOpen={isSetGoalOpen} onClose={() => setIsSetGoalOpen(false)} />
      <PlaylistModal
        isOpen={isPlaylistOpen}
        onClose={() => setIsPlaylistOpen(false)}
        activePlaylist={activePlaylist}
      />
    </div>
  );
};

const QuickAddTaskModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { addTask } = useTaskStore();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('general');
  const [priority, setPriority] = useState<Priority>('medium');
  const [duration, setDuration] = useState(25);

  const handleAdd = () => {
    if (!title.trim()) return;
    addTask({ title, category, priority, recurrence: 'none', duration });
    setTitle('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Launch Task">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground">Task Title</label>
          <Input
            placeholder="What are we building?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="general">General</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="dsa">DSA</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Impact</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="low">Low Impact</option>
              <option value="medium">Medium Impact</option>
              <option value="high">High Impact</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="font-mono text-xs font-bold uppercase text-muted-foreground">
            Sprint Duration: {duration}m
          </label>
          <input
            type="range"
            min="5"
            max="120"
            step="5"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-accent accent-primary-600"
          />
        </div>
        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleAdd}>
            Launch Task
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const SetGoalModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { addGoal } = useAppStore();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'7-days' | '14-days' | '30-days' | 'custom'>('7-days');
  const [category, setCategory] = useState<Category>('general');

  const handleAdd = () => {
    if (!title.trim()) return;
    const days = type === '7-days' ? 7 : type === '14-days' ? 14 : 30;
    addGoal({
      title,
      type,
      category,
      startDate: new Date().toISOString(),
      targetDate: addDays(new Date(), days).toISOString(),
      tasks: [],
    });
    setTitle('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set Long-Term Goal">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground">Goal Title</label>
          <Input
            placeholder="e.g. Master Backend Engineering"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Duration</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="7-days">7 Days Blast</option>
              <option value="14-days">14 Days Sprint</option>
              <option value="30-days">30 Days Challenge</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="general">General</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="dsa">DSA</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleAdd}>
            Commit to Goal
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const PlaylistModal = ({
  isOpen,
  onClose,
  activePlaylist,
}: {
  isOpen: boolean;
  onClose: () => void;
  activePlaylist: any;
}) => {
  const { addTask } = useTaskStore();

  if (!activePlaylist)
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Weekly Playlists">
        <div className="py-10 text-center italic text-muted-foreground">
          No active playlists. Create one in Playlists tab!
        </div>
      </Modal>
    );

  const handleApplyTask = (taskData: any) => {
    addTask({ ...taskData, recurrence: 'none' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={activePlaylist.title}>
      <div className="space-y-6">
        <div className="rounded-xl border bg-accent/30 p-4">
          <p className="text-sm font-medium">{activePlaylist.description}</p>
        </div>
        <div className="space-y-3">
          <h4 className="px-1 text-xs font-bold uppercase text-muted-foreground">
            Planned Activities
          </h4>
          {activePlaylist.tasks.map((task: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border bg-card p-3 transition-all hover:bg-accent/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600/10 font-bold text-primary-600">
                  {idx + 1}
                </div>
                <div>
                  <p className="text-sm font-bold">{task.title}</p>
                  <p className="text-[10px] capitalize text-muted-foreground">
                    {task.category} • {task.duration} mins
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-[10px]"
                onClick={() => handleApplyTask(task)}
              >
                Track Today
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

const KPIItem = ({ title, value, icon, progress, label }: any) => (
  <Card className="group relative overflow-hidden transition-all duration-300 hover:border-primary-500/50">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <h3 className="text-2xl font-black">{value}</h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent transition-transform group-hover:scale-110">
          {icon}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-accent">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary-500"
          />
        </div>
        <p className="text-right text-[10px] font-medium lowercase text-muted-foreground">
          {label}
        </p>
      </div>
    </CardContent>
  </Card>
);

const ActionButton = ({ icon, label, color, onClick }: any) => (
  <button
    onClick={onClick}
    className="group pointer-events-auto flex flex-col items-center justify-center rounded-xl border bg-card p-4 transition-all hover:bg-accent hover:shadow-inner"
  >
    <div className={cn('mb-2 transition-transform group-hover:scale-110', color)}>{icon}</div>
    <span className="text-[10px] font-bold uppercase text-muted-foreground">{label}</span>
  </button>
);

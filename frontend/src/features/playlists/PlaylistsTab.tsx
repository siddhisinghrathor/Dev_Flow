import { useState } from 'react';
import { usePlaylistStore } from '../../store/usePlaylistStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Plus, Trash2, Calendar, Clock, ListMusic, Play, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export const PlaylistsTab = () => {
    const { playlists, createPlaylist, deletePlaylist, setActivePlaylist, activePlaylistId } = usePlaylistStore();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Create form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [durationDays, setDurationDays] = useState(7);
    const [dayTasks, setDayTasks] = useState<{ [day: number]: any[] }>({});
    const [currentDay, setCurrentDay] = useState(1);

    const handleAddTaskToDay = () => {
        const newTask = { title: 'Focus Sprint', duration: 25, category: 'general', priority: 'medium', dayIndex: currentDay };
        setDayTasks({
            ...dayTasks,
            [currentDay]: [...(dayTasks[currentDay] || []), newTask]
        });
    };

    const handleSaveTask = (day: number, taskIdx: number, updates: any) => {
        const updatedTasks = [...dayTasks[day]];
        updatedTasks[taskIdx] = { ...updatedTasks[taskIdx], ...updates };
        setDayTasks({ ...dayTasks, [day]: updatedTasks });
    };

    const handleRemoveTask = (day: number, taskIdx: number) => {
        const updatedTasks = dayTasks[day].filter((_, i) => i !== taskIdx);
        setDayTasks({ ...dayTasks, [day]: updatedTasks });
    };

    const handleCreate = async () => {
        const allTasks = Object.values(dayTasks).flat();
        await createPlaylist({
            title,
            description,
            category: 'general',
            durationDays,
            tasks: allTasks
        });
        setIsCreateModalOpen(false);
        // Reset
        setTitle('');
        setDescription('');
        setDayTasks({});
    };

    return (
        <div className="space-y-8 animate-fade-in mb-12">
            <div className="flex items-center justify-between bg-card p-8 rounded-[32px] border border-accent/50 shadow-sm">
                <div className="flex flex-col gap-2">
                    <h2 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        <ListMusic className="text-primary-600" size={36} />
                        Sprint Playlists
                    </h2>
                    <p className="text-muted-foreground font-medium text-lg italic">Engineer your consistency with multi-day task sequences.</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="gap-3 bg-zinc-950 text-white px-8 h-14 rounded-2xl hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-zinc-950/20">
                    <Plus size={20} /> Create Sequence
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {playlists.map(playlist => (
                    <Card key={playlist.id} className={cn(
                        "group relative overflow-hidden transition-all duration-500 rounded-[32px] border-none shadow-xl",
                        activePlaylistId === playlist.id ? "bg-zinc-950 text-white ring-4 ring-primary-500/20" : "bg-white text-foreground"
                    )}>
                        <CardHeader className="p-8 pb-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-[0.2em]",
                                        activePlaylistId === playlist.id ? "text-primary-400" : "text-primary-600"
                                    )}>
                                        {playlist.category}
                                    </span>
                                    <CardTitle className="text-2xl font-black leading-tight tracking-tight">{playlist.title}</CardTitle>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className={cn(
                                        "h-10 w-10 rounded-xl transition-colors",
                                        activePlaylistId === playlist.id ? "text-white/40 hover:text-red-400 hover:bg-white/10" : "text-muted-foreground hover:text-red-500"
                                    )}
                                    onClick={() => deletePlaylist(playlist.id)}
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-8">
                            <p className={cn(
                                "text-sm font-medium line-clamp-2 min-h-[40px]",
                                activePlaylistId === playlist.id ? "text-white/60" : "text-muted-foreground"
                            )}>
                                {playlist.description}
                            </p>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className={cn("p-2 rounded-lg", activePlaylistId === playlist.id ? "bg-white/10" : "bg-accent")}>
                                        <Calendar size={16} />
                                    </div>
                                    <span className="text-sm font-bold">{playlist.durationDays} Days</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={cn("p-2 rounded-lg", activePlaylistId === playlist.id ? "bg-white/10" : "bg-accent")}>
                                        <Zap size={16} />
                                    </div>
                                    <span className="text-sm font-bold">{playlist.tasks?.length || 0} Sprints</span>
                                </div>
                            </div>

                            <Button
                                variant={activePlaylistId === playlist.id ? "primary" : "outline"}
                                className={cn(
                                    "w-full h-12 rounded-2xl gap-2 font-black uppercase tracking-widest text-xs transition-all",
                                    activePlaylistId === playlist.id ? "bg-white text-zinc-950 hover:bg-white/90" : "border-2"
                                )}
                                onClick={() => setActivePlaylist(playlist.id)}
                            >
                                {activePlaylistId === playlist.id ? <><Clock size={16} /> Active Objective</> : <><Play size={16} /> Launch Protocol</>}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Protocol Construction"
                className="max-w-5xl rounded-[40px]"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-2 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-10">
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-600">Core Parameters</h3>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Protocol Title</label>
                                <Input
                                    className="h-14 rounded-2xl border-2 focus:ring-primary-500/20"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="e.g. Total Backend Mastery"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Strategic Overview</label>
                                <Input
                                    className="h-14 rounded-2xl border-2 focus:ring-primary-500/20"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="What will this protocol achieve?"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Temporal Range</label>
                                <div className="flex gap-3">
                                    {[7, 14, 21, 30].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setDurationDays(d)}
                                            className={cn(
                                                "flex-1 h-12 rounded-xl border-2 font-black text-xs transition-all",
                                                durationDays === d ? "bg-zinc-950 border-zinc-950 text-white" : "bg-transparent border-accent text-muted-foreground hover:border-primary-500/50"
                                            )}
                                        >
                                            {d}D
                                        </button>
                                    ))}
                                    <Input
                                        type="number"
                                        className="w-20 h-10 border-2 rounded-xl font-bold"
                                        placeholder="X"
                                        value={durationDays}
                                        onChange={e => setDurationDays(parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                        </div>
                        <Button className="w-full h-16 rounded-[20px] bg-primary-600 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 hover:scale-[1.02] active:scale-98 transition-all" onClick={handleCreate} disabled={!title}>
                            Commit Sequence
                        </Button>
                    </div>

                    <div className="space-y-8">
                        <div className="flex flex-col gap-4">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-600">Modular Scheduling</h3>
                            <div className="flex flex-wrap gap-2">
                                {Array.from({ length: durationDays }).slice(0, 14).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentDay(i + 1)}
                                        className={cn(
                                            "h-10 w-10 rounded-xl text-[10px] font-black transition-all border-2",
                                            currentDay === i + 1 ? "bg-primary-600 border-primary-600 text-white" : "bg-accent/50 border-transparent text-muted-foreground hover:bg-accent"
                                        )}
                                    >
                                        D{i + 1}
                                    </button>
                                ))}
                                {durationDays > 14 && <div className="h-10 flex items-center px-2 text-muted-foreground font-black">...</div>}
                            </div>
                        </div>

                        <div className="space-y-4 min-h-[400px] rounded-[32px] bg-accent/30 p-8 border-2 border-dashed border-accent">
                            <div className="flex items-center justify-between mb-2">
                                <div className="space-y-1">
                                    <h4 className="text-xl font-black italic">Day {currentDay} Logic</h4>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Assigned Task Clusters</p>
                                </div>
                                <Button size="sm" variant="ghost" className="h-10 rounded-xl bg-white text-[10px] uppercase font-black text-primary-600 shadow-sm hover:bg-primary-50 px-4" onClick={handleAddTaskToDay}>
                                    <Plus size={16} /> Cluster Task
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {(dayTasks[currentDay] || []).map((task, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={idx}
                                        className="bg-card p-5 rounded-2xl border-2 shadow-sm space-y-4 group transition-all hover:border-primary-200"
                                    >
                                        <div className="flex gap-4">
                                            <div className="flex-1 space-y-2">
                                                <label className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">Task Label</label>
                                                <Input
                                                    className="h-10 border-none bg-accent/50 rounded-lg text-sm font-bold focus:ring-0"
                                                    value={task.title}
                                                    onChange={e => handleSaveTask(currentDay, idx, { title: e.target.value })}
                                                />
                                            </div>
                                            <div className="pt-6">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-10 w-10 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                                    onClick={() => handleRemoveTask(currentDay, idx)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="flex-1 space-y-2">
                                                <label className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">Domain</label>
                                                <select
                                                    value={task.category}
                                                    onChange={e => handleSaveTask(currentDay, idx, { category: e.target.value })}
                                                    className="h-10 w-full bg-accent/50 border-none rounded-lg text-[10px] font-black uppercase px-3 focus:ring-0"
                                                >
                                                    <option value="general">General</option>
                                                    <option value="frontend">Frontend</option>
                                                    <option value="backend">Backend</option>
                                                    <option value="dsa">DSA</option>
                                                </select>
                                            </div>
                                            <div className="w-24 space-y-2">
                                                <label className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">Sprint (m)</label>
                                                <div className="flex items-center gap-2 bg-accent/50 rounded-lg px-3 h-10">
                                                    <Clock size={12} className="text-muted-foreground" />
                                                    <input
                                                        type="number"
                                                        className="w-full bg-transparent border-none text-xs font-black focus:outline-none"
                                                        value={task.duration}
                                                        onChange={e => handleSaveTask(currentDay, idx, { duration: parseInt(e.target.value) || 0 })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {(dayTasks[currentDay]?.length === 0 || !dayTasks[currentDay]) && (
                                    <div className="py-20 flex flex-col items-center justify-center text-muted-foreground/30">
                                        <Zap size={48} className="mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Add task clusters for Day {currentDay}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

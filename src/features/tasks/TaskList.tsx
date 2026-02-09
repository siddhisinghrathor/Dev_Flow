import React, { useState, useRef } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { TaskItem } from './TaskItem';
import { TaskDetailPanel } from './TaskDetailPanel';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Plus, Search, LayoutGrid, List, Sparkles } from 'lucide-react';
import type { Category, Priority, Task } from '../../types';
import { AnimatePresence, motion } from 'framer-motion';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { cn } from '../../utils/cn';

export const TaskList = () => {
    const { tasks, addTask, activeTimer } = useTaskStore();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<Category>('general');
    const [priority, setPriority] = useState<Priority>('medium');
    const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<'active' | 'completed' | 'all'>('active');
    const [search, setSearch] = useState('');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const inputRef = useRef<HTMLInputElement>(null);

    useKeyboardShortcut('/', () => {
        inputRef.current?.focus();
    });

    useKeyboardShortcut('n', () => {
        inputRef.current?.focus();
    });

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        addTask({
            title,
            category,
            priority,
            recurrence: 'none',
            duration: 30,
        });
        setTitle('');
    };

    const sortedTasks = [...tasks].sort((a, b) => {
        // Active timer task first
        if (activeTimer?.taskId === a.id) return -1;
        if (activeTimer?.taskId === b.id) return 1;

        // Then by status (planned > suggested > completed > failed)
        const statusOrder = { planned: 0, suggested: 1, completed: 2, failed: 3, skipped: 4 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
        }

        // Then by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const filteredTasks = sortedTasks.filter((t) => {
        const matchesCategory = filterCategory === 'all' ? true : t.category === filterCategory;
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());

        let matchesStatus = true;
        if (filterStatus === 'active') matchesStatus = t.status === 'planned' || t.status === 'suggested';
        if (filterStatus === 'completed') matchesStatus = t.status === 'completed' || t.status === 'failed';

        return matchesCategory && matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Focus Flow</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage your engineering backlog and daily sprints.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                            placeholder="Search tasks..."
                            className="pl-9 w-64 h-9 text-xs"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex border rounded-lg bg-card p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn("p-1.5 rounded-md transition-all", viewMode === 'list' ? "bg-accent text-primary-600" : "text-muted-foreground hover:bg-accent/50")}
                        >
                            <List size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? "bg-accent text-primary-600" : "text-muted-foreground hover:bg-accent/50")}
                        >
                            <LayoutGrid size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleAddTask} className="group relative z-10 flex flex-col space-y-3 rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md hover:border-primary-500/50 transition-all duration-300">
                <div className="flex items-center space-x-3">
                    <Input
                        ref={inputRef}
                        placeholder="Launch a new task... (Ctrl + /)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="flex-1 bg-accent/20 border-none h-11 text-base font-medium placeholder:font-normal focus-visible:ring-1 focus-visible:ring-primary-500"
                    />
                    <Button type="submit" size="icon" className="h-11 w-11 shadow-lg bg-primary-600 rounded-xl hover:scale-105 transition-transform">
                        <Plus size={24} />
                    </Button>
                </div>
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Stack:</span>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as Category)}
                                className="bg-transparent text-xs font-bold focus:outline-none capitalize text-primary-600 cursor-pointer outline-none"
                            >
                                <option value="general">General</option>
                                <option value="frontend">Frontend</option>
                                <option value="backend">Backend</option>
                                <option value="dsa">DSA</option>
                                <option value="career">Career</option>
                                <option value="health">Health</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Impact:</span>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as Priority)}
                                className="bg-transparent text-xs font-bold focus:outline-none capitalize text-primary-600 cursor-pointer outline-none"
                            >
                                <option value="low">Low Impact</option>
                                <option value="medium">Medium Impact</option>
                                <option value="high">High Impact</option>
                            </select>
                        </div>
                    </div>
                </div>
            </form>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between border-b pb-4 overflow-x-auto">
                <div className="flex items-center space-x-6 min-w-max">
                    <FilterTab active={filterCategory === 'all'} onClick={() => setFilterCategory('all')} label="All Flow" />
                    <FilterTab active={filterCategory === 'frontend'} onClick={() => setFilterCategory('frontend')} label="Frontend" />
                    <FilterTab active={filterCategory === 'backend'} onClick={() => setFilterCategory('backend')} label="Backend" />
                    <FilterTab active={filterCategory === 'dsa'} onClick={() => setFilterCategory('dsa')} label="DSA" />
                </div>
                <div className="flex bg-accent/30 p-1 rounded-lg ml-4">
                    <button
                        onClick={() => setFilterStatus('active')}
                        className={cn("px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all", filterStatus === 'active' ? "bg-background shadow text-primary-600" : "text-muted-foreground")}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setFilterStatus('completed')}
                        className={cn("px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all", filterStatus === 'completed' ? "bg-background shadow text-green-600" : "text-muted-foreground")}
                    >
                        Done
                    </button>
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={cn("px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all", filterStatus === 'all' ? "bg-background shadow text-foreground" : "text-muted-foreground")}
                    >
                        View All
                    </button>
                </div>
            </div>

            {/* Task Grid/List */}
            <div className={cn(
                "grid gap-4",
                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
                <AnimatePresence mode="popLayout">
                    {filteredTasks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20 text-center col-span-full border border-dashed rounded-3xl bg-accent/10"
                        >
                            <div className="mb-6 h-20 w-20 rounded-full bg-accent/20 flex items-center justify-center text-muted-foreground/30">
                                <Search size={40} />
                            </div>
                            <h3 className="text-lg font-bold">No tasks found</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">Adjust your filters or start fresh by adding a new task to your backlog.</p>
                            <Button variant="outline" size="sm" className="mt-6" onClick={() => { setFilterCategory('all'); setSearch(''); }}>Clear all filters</Button>
                        </motion.div>
                    ) : (
                        filteredTasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onClick={setSelectedTask}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>

            {selectedTask && (
                <TaskDetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} />
            )}
        </div>
    );
};

const FilterTab = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
    <button
        onClick={onClick}
        className={cn(
            "text-xs font-bold uppercase tracking-widest transition-all relative pb-2",
            active ? "text-primary-600" : "text-muted-foreground hover:text-foreground"
        )}
    >
        {label}
        {active && (
            <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
            />
        )}
    </button>
);

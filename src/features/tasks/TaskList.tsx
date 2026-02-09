import React, { useState, useRef } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { TaskItem } from './TaskItem';
import { TaskDetailPanel } from './TaskDetailPanel';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Plus, Search, LayoutGrid, List } from 'lucide-react';
import type { Category, Priority, Task } from '../../types';
import { AnimatePresence, motion } from 'framer-motion';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { cn } from '../../utils/cn';

export const TaskList = () => {
    const { tasks, addTask } = useTaskStore();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<Category>('general');
    const [priority, setPriority] = useState<Priority>('medium');
    const [filter, setFilter] = useState<Category | 'all'>('all');
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

    const filteredTasks = tasks.filter((t) => {
        const matchesFilter = filter === 'all' ? true : t.category === filter;
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
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

            <form onSubmit={handleAddTask} className="group flex flex-col space-y-3 rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md hover:border-primary-500/50 transition-all duration-300">
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
                    <p className="text-[10px] text-muted-foreground font-medium italic opacity-0 group-hover:opacity-100 transition-opacity">
                        Hit Enter to instantly track
                    </p>
                </div>
            </form>

            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-6">
                    <FilterTab active={filter === 'all'} onClick={() => setFilter('all')} label="All Flow" />
                    <FilterTab active={filter === 'frontend'} onClick={() => setFilter('frontend')} label="Frontend" />
                    <FilterTab active={filter === 'backend'} onClick={() => setFilter('backend')} label="Backend" />
                    <FilterTab active={filter === 'dsa'} onClick={() => setFilter('dsa')} label="DSA" />
                </div>
            </div>

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
                            <Button variant="outline" size="sm" className="mt-6" onClick={() => { setFilter('all'); setSearch(''); }}>Clear all filters</Button>
                        </motion.div>
                    ) : (
                        filteredTasks.map((task) => (
                            <TaskItem key={task.id} task={task} onClick={setSelectedTask} />
                        ))
                    )}
                </AnimatePresence>
            </div>

            <TaskDetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} />
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

import { useState, useMemo } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { useAppStore } from '../../store/useAppStore';
import { generateDailyPlan } from '../../lib/smartPlanner';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Sparkles, Plus, X, RefreshCw, CalendarCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Task } from '../../types';

export const DailyPlanGenerator = () => {
    const { tasks, dailyLogs, addTask } = useTaskStore();
    const { goals, preferences } = useAppStore();
    const [suggestions, setSuggestions] = useState<Omit<Task, 'id' | 'createdAt' | 'status'>[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    const handleGenerate = () => {
        const plan = generateDailyPlan(tasks, goals, dailyLogs, preferences);
        setSuggestions(plan);
        setIsVisible(true);
    };

    const handleAccept = (idx: number) => {
        const suggestion = suggestions[idx];
        addTask({ ...suggestion, status: 'planned' });
        setSuggestions(prev => prev.filter((_, i) => i !== idx));
    };

    const handleReject = (idx: number) => {
        setSuggestions(prev => prev.filter((_, i) => i !== idx));
    };

    const handleAcceptAll = () => {
        suggestions.forEach(s => addTask({ ...s, status: 'planned' }));
        setSuggestions([]);
        setIsVisible(false);
    };

    if (!isVisible && suggestions.length === 0) {
        return (
            <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-200 dark:border-indigo-900 border-dashed">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                            <Sparkles size={18} /> AI Daily Planner
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Generate a personalized focus plan based on your goals and habits.
                        </p>
                    </div>
                    <Button onClick={handleGenerate} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                        <RefreshCw size={16} /> Generate Plan
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                >
                    <Card className="border-indigo-500/20 shadow-lg">
                        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Sparkles className="text-indigo-500" size={20} />
                                Suggested Daily Focus
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => setIsVisible(false)}>
                                    <X size={16} />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {suggestions.length > 0 ? (
                                <div className="grid gap-3">
                                    {suggestions.map((suggestion, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm">{suggestion.title}</span>
                                                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-600">
                                                        {suggestion.duration}m
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">{suggestion.description}</p>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleReject(idx)}>
                                                    <X size={14} />
                                                </Button>
                                                <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleAccept(idx)}>
                                                    <Plus size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-2 flex justify-end">
                                        <Button onClick={handleAcceptAll} className="gap-2" size="sm">
                                            <CalendarCheck size={16} /> Accept Remaining
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    <p>All suggestions handled! You're ready to start.</p>
                                    <Button variant="link" onClick={() => setIsVisible(false)}>Close Planner</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

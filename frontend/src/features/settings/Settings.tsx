import { useAppStore } from '../../store/useAppStore';
import { useTaskStore } from '../../store/useTaskStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { User, Settings as SettingsIcon, Bell, Download, Trash2, Moon, Sun, Monitor, CalendarClock } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useThemeStore } from '../../store/useThemeStore';
import { useState } from 'react';

export const Settings = () => {
    const { preferences, updatePreferences } = useAppStore();
    const { rescheduleMissedTasks } = useTaskStore();
    const { theme, setTheme } = useThemeStore();
    const [activeSection, setActiveSection] = useState('profile');

    const handleUpdate = (field: string, value: any) => {
        updatePreferences({ [field]: value });
    };

    const handleReschedule = () => {
        if (confirm("This will move all past due tasks to today. Continue?")) {
            rescheduleMissedTasks();
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
            <div>
                <h2 className="text-2xl font-black tracking-tight">Project Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">Configure your developer cockpit and preferences.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-[200px_1fr]">
                {/* Sidebar Nav */}
                <div className="space-y-1">
                    <SettingsNavButton
                        icon={<User size={18} />}
                        label="Profile"
                        active={activeSection === 'profile'}
                        onClick={() => setActiveSection('profile')}
                    />
                    <SettingsNavButton
                        icon={<SettingsIcon size={18} />}
                        label="Preferences"
                        active={activeSection === 'preferences'}
                        onClick={() => setActiveSection('preferences')}
                    />
                    <SettingsNavButton
                        icon={<Bell size={18} />}
                        label="Notifications"
                        active={activeSection === 'notifications'}
                        onClick={() => setActiveSection('notifications')}
                    />
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {activeSection === 'profile' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Developer Profile</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-muted-foreground">Username</label>
                                        <Input
                                            value={preferences.username}
                                            onChange={(e) => handleUpdate('username', e.target.value)}
                                            placeholder="Enter username"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-muted-foreground">Developer Persona</label>
                                        <select
                                            value={preferences.persona}
                                            onChange={(e) => handleUpdate('persona', e.target.value)}
                                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        >
                                            <option value="frontend">Frontend Engineer</option>
                                            <option value="backend">Backend Engineer</option>
                                            <option value="fullstack">Fullstack Developer</option>
                                            <option value="other">General Tinkerer</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeSection === 'preferences' && (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold">Productivity Goals</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-muted-foreground">Daily Task Target</label>
                                            <Input
                                                type="number"
                                                value={preferences.dailyTarget}
                                                onChange={(e) => handleUpdate('dailyTarget', parseInt(e.target.value))}
                                            />
                                            <p className="text-[10px] text-muted-foreground">Recommended for your persona: 3-5 tasks</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-muted-foreground">Weekly Goal</label>
                                            <Input
                                                type="number"
                                                value={preferences.weeklyTarget}
                                                onChange={(e) => handleUpdate('weeklyTarget', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold">Interface Appearance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-accent/50 w-full md:w-fit">
                                        <ThemeButton
                                            active={theme === 'light'}
                                            onClick={() => setTheme('light')}
                                            icon={<Sun size={16} />}
                                            label="Light"
                                        />
                                        <ThemeButton
                                            active={theme === 'dark'}
                                            onClick={() => setTheme('dark')}
                                            icon={<Moon size={16} />}
                                            label="Dark"
                                        />
                                        <ThemeButton
                                            active={theme === 'system'}
                                            onClick={() => setTheme('system')}
                                            icon={<Monitor size={16} />}
                                            label="System"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/10">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                                        <CalendarClock size={20} /> Smart Maintenance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
                                        <div>
                                            <h4 className="text-sm font-bold">Reschedule Missed Tasks</h4>
                                            <p className="text-xs text-muted-foreground">Automatically move all past due tasks to today.</p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={handleReschedule}>
                                            Reschedule All
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {activeSection === 'notifications' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Alerts & Sounds</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <label className="text-sm font-bold">Enable Desktop Notifications</label>
                                        <p className="text-xs text-muted-foreground">Get reminded when tasks are halfway done or deadlines approach.</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.notificationsEnabled}
                                        onChange={(e) => handleUpdate('notificationsEnabled', e.target.checked)}
                                        className="h-5 w-5 accent-primary-600"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <label className="text-sm font-bold">Sound Effects</label>
                                        <p className="text-xs text-muted-foreground">Play sounds on timer start/stop.</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.soundEnabled}
                                        onChange={(e) => handleUpdate('soundEnabled', e.target.checked)}
                                        className="h-5 w-5 accent-primary-600"
                                    />
                                </div>
                                <div className="flex items-center justify-between border-t pt-4">
                                    <div className="space-y-0.5">
                                        <label className="text-sm font-bold">Auto-Complete Tasks</label>
                                        <p className="text-xs text-muted-foreground">Automatically mark task as done when timer hits 0.</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.autoCompleteOnTimerEnd}
                                        onChange={(e) => handleUpdate('autoCompleteOnTimerEnd', e.target.checked)}
                                        className="h-5 w-5 accent-primary-600"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="border-destructive/20 bg-destructive/5 mt-8">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-destructive">Advanced Controls</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
                                <div>
                                    <h4 className="text-sm font-bold">Export your workspace</h4>
                                    <p className="text-xs text-muted-foreground">Download all your tasks and analytics as JSON.</p>
                                </div>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Download size={14} /> Export
                                </Button>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-destructive/20">
                                <div>
                                    <h4 className="text-sm font-bold text-destructive">Factory Reset</h4>
                                    <p className="text-xs text-muted-foreground">Wipe all local data. This cannot be undone.</p>
                                </div>
                                <Button variant="danger" size="sm" className="gap-2">
                                    <Trash2 size={14} /> Reset All
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const SettingsNavButton = ({ icon, label, active, onClick }: any) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left",
            active ? "bg-primary-50 text-primary-600 dark:bg-primary-950/30" : "text-muted-foreground hover:bg-accent/50"
        )}>
        {icon} {label}
    </button>
);

const ThemeButton = ({ active, onClick, icon, label }: any) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
            active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
    >
        {icon} {label}
    </button>
);

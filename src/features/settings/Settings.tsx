import { useAppStore } from '../../store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { User, Settings as SettingsIcon, Bell, Shield, Download, Trash2, Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useThemeStore } from '../../store/useThemeStore';

export const Settings = () => {
    const { preferences, updatePreferences } = useAppStore();
    const { theme, setTheme } = useThemeStore();

    const handleUpdate = (field: string, value: any) => {
        updatePreferences({ [field]: value });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h2 className="text-2xl font-black tracking-tight">Project Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">Configure your developer cockpit and preferences.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Sidebar Nav */}
                <div className="space-y-1">
                    <SettingsNavButton icon={<User size={18} />} label="Profile" active />
                    <SettingsNavButton icon={<SettingsIcon size={18} />} label="Preferences" />
                    <SettingsNavButton icon={<Bell size={18} />} label="Notifications" />
                    <SettingsNavButton icon={<Shield size={18} />} label="Security" />
                </div>

                {/* Content */}
                <div className="md:col-span-2 space-y-6">
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
                            <div className="flex p-1 rounded-xl bg-accent/50 w-fit">
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

                    <Card className="border-destructive/20 bg-destructive/5">
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

const SettingsNavButton = ({ icon, label, active }: any) => (
    <button className={cn(
        "flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
        active ? "bg-primary-50 text-primary-600 dark:bg-primary-950/30" : "text-muted-foreground hover:bg-accent/50"
    )}>
        {icon} {label}
    </button>
);

const ThemeButton = ({ active, onClick, icon, label }: any) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
            active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
    >
        {icon} {label}
    </button>
);

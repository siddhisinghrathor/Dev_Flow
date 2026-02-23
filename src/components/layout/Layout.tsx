import { useEffect } from 'react';
import {  LayoutDashboard, CheckSquare, BarChart2, Settings, Sun, Moon, Award, ListMusic } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { useThemeStore } from '../../store/useThemeStore';
import { useAppStore } from '../../store/useAppStore';

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

const SidebarItem = ({ icon, label, active, onClick }: SidebarItemProps) => (
    <button
        onClick={onClick}
        className={cn(
            'flex w-full items-center space-x-3 rounded-xl px-4 py-3 transition-all duration-200',
            active
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
    >
        {icon}
        <span className="text-sm font-bold">{label}</span>
    </button>
);

export const Layout = ({ children, activeTab, onTabChange }: { children: React.ReactNode, activeTab: string, onTabChange: (tab: string) => void }) => {
    const { theme, setTheme, getResolvedTheme } = useThemeStore();
    const { preferences } = useAppStore();

    useEffect(() => {
        const resolved = getResolvedTheme();
        if (resolved === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme, getResolvedTheme]);

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card/50 backdrop-blur-xl">
                <div className="flex h-full flex-col p-4">
                    <div className="mb-8 flex items-center space-x-2 px-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
                            <CheckSquare size={20} />
                        </div>
                        <span className="text-xl font-bold tracking-tight">DevFlow</span>
                    </div>

                    <nav className="flex-1 space-y-2">
                        <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => onTabChange('dashboard')} />
                        <SidebarItem icon={<CheckSquare size={20} />} label="Tasks" active={activeTab === 'tasks'} onClick={() => onTabChange('tasks')} />
                        <SidebarItem icon={<BarChart2 size={20} />} label="Analytics" active={activeTab === 'analytics'} onClick={() => onTabChange('analytics')} />
                        <SidebarItem icon={<Award size={20} />} label="Achievements" active={activeTab === 'achievements'} onClick={() => onTabChange('achievements')} />
                        <SidebarItem icon={<ListMusic size={20} />} label="Playlists" active={activeTab === 'playlists'} onClick={() => onTabChange('playlists')} />
                        <SidebarItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => onTabChange('settings')} />
                    </nav>

                    <div className="mt-auto space-y-4 pt-4">
                        <div className="rounded-xl border bg-accent/50 p-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Pro Tip</p>
                            <p className="text-sm">Consistency is key. Try to complete at least 3 tasks today!</p>
                        </div>
                        <div className="flex items-center justify-between px-2">
                            <span className="text-sm text-muted-foreground">Appearance</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setTheme(getResolvedTheme() === 'dark' ? 'light' : 'dark')}
                            >
                                {getResolvedTheme() === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </Button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1">
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b bg-background/80 px-10 backdrop-blur-md">
                    <div>
                        <h2 className="text-xl font-black tracking-tight capitalize">Welcome back, {preferences.username}</h2>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{preferences.persona} cockpit</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" className="space-x-2">
                           
                            <span>Sync GitHub</span>
                        </Button>
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200">
                            JD
                        </div>
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

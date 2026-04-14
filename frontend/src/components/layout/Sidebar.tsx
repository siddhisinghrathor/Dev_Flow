import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  CheckSquare, 
  BarChart2, 
  Settings, 
  Award, 
  ListMusic, 
  Zap,
  LogOut,

} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/useAuthStore';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobileOpen: boolean;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'playlists', label: 'Sprints', icon: ListMusic },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'achievements', label: 'Wall of Fame', icon: Award },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar = ({ activeTab, onTabChange, isMobileOpen }: SidebarProps) => {
  const { user, logout } = useAuthStore();

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-zinc-950 text-white z-40 transition-all duration-500 ease-in-out border-r border-white/5",
      "w-64",
      isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      <div className="flex flex-col h-full p-6">
        {/* Branding */}
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Zap size={22} fill="white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black tracking-tighter text-2xl leading-none">DevFlow</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Protocol v1.0</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group",
                  isActive 
                    ? "bg-white/10 text-white shadow-xl shadow-black/20" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={cn("transition-transform duration-300 group-hover:scale-110", isActive && "text-primary-400")} />
                  <span className={cn("text-sm font-bold tracking-tight", isActive ? "opacity-100" : "opacity-80")}>
                    {item.label}
                  </span>
                </div>
                {isActive && (
                  <motion.div layoutId="active-pill" className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="mt-auto pt-8 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/10 flex items-center justify-center font-black text-xs">
              {user?.username?.substring(0, 2).toUpperCase() || 'DV'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black truncate tracking-tight">{user?.username || 'Developer'}</span>
              <span className="text-[10px] font-bold text-white/30 truncate uppercase tracking-widest">{user?.persona || 'Engineer'}</span>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
          >
            <LogOut size={20} />
            <span className="text-sm font-bold tracking-tight">System Termination</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Layout = ({ children, activeTab, onTabChange }: LayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Header */}
      {isAuthenticated && (
        <div className="md:hidden fixed top-0 w-full z-50 flex items-center justify-between p-4 bg-background border-b shadow-sm">
          <div className="flex items-center gap-2">
            <Zap className="text-primary-600" size={24} />
            <span className="font-black tracking-tighter text-xl">DevFlow</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2 text-muted-foreground hover:bg-accent rounded-lg">
            <Menu size={24} />
          </button>
        </div>
      )}

      {/* Sidebar */}
      {isAuthenticated && (
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={(tab: string) => {
            onTabChange(tab);
            setIsMobileMenuOpen(false);
          }} 
          isMobileOpen={isMobileMenuOpen}
        />
      )}

      {/* Main Content Area */}
      <main className={`flex-1 relative overflow-y-auto w-full custom-scrollbar transition-all duration-300 ${isAuthenticated ? 'md:ml-64 pt-20 md:pt-0' : ''}`}>
        {/* Background Decorative Elements */}
        {isAuthenticated && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary-600/5 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/5 blur-[150px]" />
          </div>
        )}
        
        <div className={`h-full w-full ${isAuthenticated ? 'p-4 md:p-8' : ''}`}>
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

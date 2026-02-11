import { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { TaskList } from './features/tasks/TaskList';
import { Heatmap } from './features/heatmap/Heatmap';
import { Analytics } from './features/analytics/Analytics';
import { Dashboard } from './features/dashboard/Dashboard';
import { Settings } from './features/settings/Settings';
import { useTaskStore } from './store/useTaskStore';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card';
import { DailyPlanGenerator } from './features/planner/DailyPlanGenerator';
import { NotificationManager } from './features/notifications/NotificationManager';
import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { AuthForm } from './features/auth/AuthForm';
import { useAppStore } from './store/useAppStore';
import { usePlaylistStore } from './store/usePlaylistStore';

function App() {
  const { fetchTasks, fetchActiveTimer } = useTaskStore();
  const { fetchGoals, fetchPreferences, fetchNotifications } = useAppStore();
  const { fetchPlaylists } = usePlaylistStore();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchGoals();
      fetchPreferences();
      fetchNotifications();
      fetchActiveTimer();
      fetchPlaylists();
    }
  }, [
    isAuthenticated,
    fetchTasks,
    fetchGoals,
    fetchPreferences,
    fetchNotifications,
    fetchActiveTimer,
    fetchPlaylists,
  ]);

  if (!isAuthenticated) {
    return (
      <Layout activeTab="dashboard" onTabChange={() => {}}>
        <AuthForm />
      </Layout>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <DailyPlanGenerator />
            <Dashboard />
          </div>
        );
      case 'tasks':
        return <TaskList />;
      case 'analytics':
        return (
          <div className="space-y-8">
            <Analytics />
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Activity Consistency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Heatmap logs={dailyLogs} />
              </CardContent>
            </Card>
          </div>
        );
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <NotificationManager />
      <div className="mx-auto max-w-6xl animate-fade-in">{renderContent()}</div>
    </Layout>
  );
}

export default App;

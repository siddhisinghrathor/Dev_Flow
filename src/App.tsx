import { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { TaskList } from './features/tasks/TaskList';
import { Heatmap } from './features/heatmap/Heatmap';
import { Analytics } from './features/analytics/Analytics';
import { Dashboard } from './features/dashboard/Dashboard';
import { Settings } from './features/settings/Settings';
import { useTaskStore } from './store/useTaskStore';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card';

function App() {
  const { dailyLogs } = useTaskStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
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
      <div className="mx-auto max-w-6xl">
        {renderContent()}
      </div>
    </Layout>
  );
}

export default App;

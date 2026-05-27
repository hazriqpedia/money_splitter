
import { ProjectProvider, useProject } from './store/ProjectContext';
import { Dashboard } from './components/Dashboard';
import { SplitView } from './components/SplitView';

const MainView = () => {
  const { activeProject } = useProject();
  return activeProject ? <SplitView /> : <Dashboard />;
};

function App() {
  return (
    <ProjectProvider>
      <div className="min-h-screen font-sans flex flex-col">
        <main className="flex-1 flex flex-col">
          <MainView />
        </main>
        <footer className="py-6 text-center text-zinc-600 text-xs font-medium shrink-0">
          Made with &lt;3 in KL by @Hazriq
        </footer>
      </div>
    </ProjectProvider>
  );
}

export default App;

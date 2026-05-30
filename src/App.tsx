
import { ProjectProvider } from './store/ProjectContext';
import { useProject } from './store/useProject';
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
        <header className="sticky top-0 z-20 h-14 flex items-center px-6 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800/60 shrink-0">
          <span className="text-base font-semibold tracking-tight text-zinc-100">bill-splitter</span>
        </header>
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

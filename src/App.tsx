
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { ProjectProvider } from './store/ProjectContext';
import { useProject } from './store/useProject';
import { Dashboard } from './components/Dashboard';
import { SplitView } from './components/SplitView';
import { About } from './components/About';
import { navigate } from './utils/navigate';

const AppLayout = () => {
  const { activeProject, setActiveProject } = useProject();
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const handler = () => setHash(window.location.hash);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const isAbout = hash === '#about';

  let content: React.ReactNode;
  if (isAbout) {
    content = <About />;
  } else if (activeProject) {
    content = <SplitView />;
  } else {
    content = <Dashboard />;
  }

  return (
    <div className="min-h-screen font-sans flex flex-col">
      <header className="sticky top-0 z-20 h-14 flex items-center px-6 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800/60 shrink-0">
        <button
          onClick={() => setActiveProject(null)}
          className="text-base font-semibold tracking-tight text-zinc-100 hover:text-white transition-colors"
        >
          bill-splitter
        </button>
        <nav className="ml-auto">
          <button
            onClick={() => navigate('#about')}
            className={clsx(
              'text-sm transition-colors',
              isAbout ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            About
          </button>
        </nav>
      </header>
      <main className="flex-1 flex flex-col">
        {content}
      </main>
      <footer className="py-6 text-center text-zinc-600 text-xs font-medium shrink-0">
        Made with &lt;3 in KL by @Hazriq
      </footer>
    </div>
  );
};

function App() {
  return (
    <ProjectProvider>
      <AppLayout />
    </ProjectProvider>
  );
}

export default App;

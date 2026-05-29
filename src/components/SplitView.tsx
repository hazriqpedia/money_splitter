import { useRef } from 'react';
import { toPng } from 'html-to-image';
import { useProject } from '../store/useProject';
import { ArrowLeft, Camera, Download } from 'lucide-react';
import { BreakdownTable } from './BreakdownTable';
import { ValidationTable } from './ValidationTable';
import { ExportView } from './ExportView';

// ─── Export config ────────────────────────────────────────────────────────────
const EXPORT_PNG = true;
const EXPORT_JSON_WITH_PNG = true;
// Safari blocks simultaneous programmatic downloads. A short delay between
// the PNG and JSON triggers lets Safari treat each as a separate user action.
const SAFARI_DOWNLOAD_DELAY_MS = 800;
// ─────────────────────────────────────────────────────────────────────────────

export const SplitView = () => {
  const { activeProject, setActiveProject, updateProject } = useProject();
  const exportRef = useRef<HTMLDivElement>(null);

  if (!activeProject) return null;

  const triggerDownload = (href: string, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = href;
    link.click();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeProject, null, 2));
    triggerDownload(dataStr, `${activeProject.name}.json`);
  };

  const handleExportPNG = async () => {
    if (!exportRef.current) return;
    try {
      if (EXPORT_PNG) {
        const dataUrl = await toPng(exportRef.current, {
          backgroundColor: '#09090b',
          pixelRatio: 2,
        });
        triggerDownload(dataUrl, `${activeProject.name}_split.png`);
      }
      if (EXPORT_JSON_WITH_PNG) {
        setTimeout(handleExportJSON, SAFARI_DOWNLOAD_DELAY_MS);
      }
    } catch (err) {
      console.error('Failed to export image', err);
      alert('Failed to export image.');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#09090b]">
      {/* Always-rendered off-screen export target */}
      <ExportView project={activeProject} exportRef={exportRef} />

      {/* Top Navbar */}
      <header className="border-b border-zinc-800/60 px-6 py-4 flex justify-between items-center sticky top-0 z-10 bg-[#09090b]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveProject(null)}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-zinc-100"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-medium text-zinc-100">{activeProject.name}</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportJSON}
            className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-zinc-100 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Export JSON
          </button>
          <button
            onClick={handleExportPNG}
            className="bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Camera size={16} />
            Split Project!
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-x-auto">
        <div className="flex justify-center gap-8 items-start min-w-max mx-auto max-w-[1600px]">
          <div className="bg-[#09090b] p-4 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
            <BreakdownTable project={activeProject} updateProject={updateProject} />
          </div>
          <div className="w-[28rem] sticky top-8">
            <ValidationTable project={activeProject} updateProject={updateProject} />
          </div>
        </div>
      </main>
    </div>
  );
};

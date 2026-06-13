import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { useProject } from '../store/useProject';
import { ArrowLeft, Camera, Download, Pencil } from 'lucide-react';
import { BreakdownTable } from './BreakdownTable';
import { ValidationTable } from './ValidationTable';
import { ExportView } from './ExportView';

// ─── Export config ────────────────────────────────────────────────────────────
const EXPORT_PNG = true;
const EXPORT_JSON_WITH_PNG = import.meta.env.VITE_EXPORT_JSON_WITH_PNG === 'true';
// Safari blocks simultaneous programmatic downloads. A short delay between
// the PNG and JSON triggers lets Safari treat each as a separate user action.
const SAFARI_DOWNLOAD_DELAY_MS = 800;
// ─────────────────────────────────────────────────────────────────────────────

export const SplitView = () => {
  const { activeProject, setActiveProject, updateProject } = useProject();
  const exportRef = useRef<HTMLDivElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');

  if (!activeProject) return null;

  const startEditingName = () => {
    setDraftName(activeProject.name);
    setIsEditingName(true);
  };

  const commitName = () => {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== activeProject.name) {
      updateProject({ ...activeProject, name: trimmed });
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitName();
    if (e.key === 'Escape') setIsEditingName(false);
  };

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
      <header className="border-b border-zinc-800/60 px-6 py-4 flex justify-between items-center sticky top-14 z-10 bg-[#09090b]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveProject(null)}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-zinc-100"
          >
            <ArrowLeft size={18} />
          </button>
          {isEditingName ? (
            <input
              autoFocus
              size={Math.max(draftName.length, 8)}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={commitName}
              onKeyDown={handleNameKeyDown}
              className="text-lg font-medium text-zinc-100 bg-transparent border-b border-zinc-600 focus:border-zinc-400 focus:outline-none transition-colors"
            />
          ) : (
            <button
              onClick={startEditingName}
              className="group flex items-center gap-2 text-lg font-medium text-zinc-100 hover:text-white transition-colors"
            >
              {activeProject.name}
              <Pencil size={13} className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
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
      <main className="flex-1 p-8 flex gap-8 items-start justify-center">
        <div className="overflow-x-auto">
          <div className="bg-[#09090b] p-4 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
            <BreakdownTable project={activeProject} updateProject={updateProject} />
          </div>
        </div>
        <div className="w-[28rem] flex-shrink-0 sticky top-36 self-start">
          <ValidationTable project={activeProject} updateProject={updateProject} />
        </div>
      </main>
    </div>
  );
};

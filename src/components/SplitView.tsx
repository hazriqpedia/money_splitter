import { useState, useRef } from 'react';
import { useProject } from '../store/ProjectContext';
import { ArrowLeft, Camera } from 'lucide-react';
import { BreakdownTable } from './BreakdownTable';
import { ValidationTable } from './ValidationTable';
// @ts-ignore
import domtoimage from 'dom-to-image-more';

export const SplitView = () => {
  const { activeProject, setActiveProject, updateProject } = useProject();
  const tableRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!activeProject) return null;

  const handleExportPNG = async () => {
    if (!tableRef.current) return;
    try {
      setIsExporting(true);
      // Wait for React to render the clean state
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // @ts-ignore
      const dataUrl = await domtoimage.toPng(tableRef.current, {
        bgcolor: '#09090b',
        style: { margin: '0' }
      });
      const link = document.createElement('a');
      link.download = `${activeProject.name}_split.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
      alert('Failed to export image.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#09090b]">
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
          {/* Left Table - We pass a ref so we can screenshot it */}
          <div ref={tableRef} className="bg-[#09090b] p-4 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
            <BreakdownTable project={activeProject} updateProject={updateProject} isExporting={isExporting} />
          </div>

          {/* Right Table */}
          <div className="w-[28rem] sticky top-8">
            <ValidationTable project={activeProject} updateProject={updateProject} />
          </div>
        </div>
      </main>
    </div>
  );
};

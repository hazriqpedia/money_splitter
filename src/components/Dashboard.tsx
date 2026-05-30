import React, { useState } from 'react';
import { useProject } from '../store/useProject';
import { Plus, Download, Upload, Trash2 } from 'lucide-react';
import type { Project } from '../types';

export const Dashboard = () => {
  const { projects, createProject, setActiveProject, deleteProject, importProject } = useProject();
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      createProject(newProjectName.trim());
      setNewProjectName('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        importProject(json as Project);
      } catch {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const exportProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${project.name}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="max-w-4xl mx-auto p-8 pt-10">
      <div className="text-center mb-16">
        <p className="text-zinc-500 text-sm">Split bills easily, no math degree required.</p>
      </div>

      <div className="rounded-2xl p-6 mb-12 border border-zinc-800/50">
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="New Project (e.g. Bali Trip 2026)"
            className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600"
          />
          <button
            type="submit"
            disabled={!newProjectName.trim()}
            className="bg-zinc-100 hover:bg-white text-zinc-900 px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
            Create
          </button>
        </form>
      </div>

      <div className="flex justify-between items-end mb-6 border-b border-zinc-800/50 pb-4">
        <h2 className="text-lg font-medium text-zinc-300">Your Projects</h2>
        <label className="cursor-pointer text-zinc-400 hover:text-zinc-200 text-sm flex items-center gap-2 transition-colors">
          <Upload size={16} />
          Import JSON
          <input type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.length === 0 ? (
          <div className="col-span-full text-center py-12 text-zinc-600 text-sm">
            No projects yet.
          </div>
        ) : (
          projects.map(project => (
            <div
              key={project.id}
              onClick={() => setActiveProject(project.id)}
              className="bg-zinc-900/50 hover:bg-zinc-900 rounded-xl p-5 cursor-pointer border border-zinc-800/50 hover:border-zinc-700 transition-all group flex flex-col justify-between min-h-[140px]"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-zinc-200 font-medium">{project.name}</h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => exportProject(project, e)}
                    className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors rounded-md hover:bg-zinc-800"
                    title="Export JSON"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                    className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors rounded-md hover:bg-zinc-800"
                    title="Delete Project"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-auto pt-4 flex flex-col gap-3">
                <div className="flex flex-wrap gap-1">
                  {Array.from(new Set([...project.friends.map(f => f.name), ...(project.tags || [])])).map((tag, i) => (
                    <span key={i} className="text-[10px] uppercase tracking-wider bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-end text-xs text-zinc-500">
                  <div className="flex gap-3">
                    <span>{project.friends.length} Friends</span>
                    <span>{project.receipts.length} Receipts</span>
                  </div>
                  <div>{new Date(project.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

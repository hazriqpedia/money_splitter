import React, { useState, useEffect } from "react";
import { useProject } from "../store/useProject";
import { Plus, Download, Upload, Trash2, Users, Receipt } from "lucide-react";
import type { Project } from "../types";
import { calculateGrandTotals } from "../utils/calculations";

const TAGLINES = [
  "Split bills easily, no math degree required.",
  "Who owes what? We handle the math.",
  "Dinner with friends, not the calculator.",
  "Fair splits, zero drama.",
  "Every meal settled, every trip squared.",
];

export const Dashboard = () => {
  const {
    projects,
    createProject,
    setActiveProject,
    deleteProject,
    importProject,
  } = useProject();
  const [newProjectName, setNewProjectName] = useState("");
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [taglineVisible, setTaglineVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setTaglineVisible(false);
      setTimeout(() => {
        setTaglineIdx((i) => (i + 1) % TAGLINES.length);
        setTaglineVisible(true);
      }, 350);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      createProject(newProjectName.trim());
      setNewProjectName("");
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
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${project.name}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="max-w-6xl mx-auto px-10 pt-10 pb-10">
      <div className="text-center mb-10">
        <p
          className="text-zinc-500 text-sm transition-opacity duration-300"
          style={{ opacity: taglineVisible ? 1 : 0 }}
        >
          {TAGLINES[taglineIdx]}
        </p>
      </div>

      <div className="rounded-2xl p-6 mb-8 border border-zinc-800/50">
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="New Project (e.g. Ipoh Trip 2026)"
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

      <div className="flex justify-between items-end mb-4 border-b border-zinc-800/50 pb-4">
        <h2 className="text-lg font-medium text-zinc-300">Your Projects</h2>
        <label className="cursor-pointer text-zinc-400 hover:text-zinc-200 text-sm flex items-center gap-2 transition-colors">
          <Upload size={16} />
          Import JSON
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {projects.length === 0 ? (
          <div className="col-span-full text-center py-12 text-zinc-600 text-sm">
            No projects yet.
          </div>
        ) : (
          projects.map((project) => {
            const grandTotals = calculateGrandTotals(
              project.receipts,
              project.friends,
            );
            const total = Object.values(grandTotals).reduce(
              (sum, v) => sum + v,
              0,
            );

            return (
              <div
                key={project.id}
                onClick={() => setActiveProject(project.id)}
                className="bg-zinc-900/50 hover:bg-zinc-900 rounded-xl p-4 cursor-pointer border border-zinc-800/50 hover:border-zinc-700 transition-all group"
              >
                <div className="flex justify-between items-start mb-2.5">
                  <h3 className="text-zinc-200 font-medium leading-tight">
                    {project.name}
                  </h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                    <button
                      onClick={(e) => exportProject(project, e)}
                      className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors rounded-md hover:bg-zinc-800"
                      title="Export JSON"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(project.id);
                      }}
                      className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors rounded-md hover:bg-zinc-800"
                      title="Delete Project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {Array.from(
                    new Set([
                      ...project.friends.map((f) => f.name),
                      ...(project.tags || []),
                    ]),
                  ).map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] uppercase tracking-wider bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-4 text-xs text-zinc-500">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex items-center gap-1">
                      <Users size={11} className="text-zinc-600" />
                      {project.friends.length}
                    </span>
                    <span className="text-zinc-700">·</span>
                    <span className="flex items-center gap-1">
                      <Receipt size={11} className="text-zinc-600" />
                      {project.receipts.length}
                    </span>
                    <span className="text-zinc-700">·</span>
                    <span>
                      {new Date(project.date).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  {total > 0 && (
                    <span className="text-zinc-300 font-medium tabular-nums shrink-0">
                      ${total.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

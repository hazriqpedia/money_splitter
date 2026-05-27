import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Project } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  createProject: (name: string) => void;
  setActiveProject: (id: string | null) => void;
  deleteProject: (id: string) => void;
  importProject: (project: Project) => void;
  updateProject: (project: Project) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('moneySplitter_projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    return localStorage.getItem('moneySplitter_activeProjectId');
  });

  useEffect(() => {
    localStorage.setItem('moneySplitter_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem('moneySplitter_activeProjectId', activeProjectId);
    } else {
      localStorage.removeItem('moneySplitter_activeProjectId');
    }
  }, [activeProjectId]);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  const createProject = (name: string) => {
    const newProject: Project = {
      id: uuidv4(),
      name,
      date: new Date().toISOString(),
      friends: [
        { id: uuidv4(), name: 'Hazriq' },
        { id: uuidv4(), name: 'Friend 2' }
      ],
      receipts: [],
      tags: []
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) setActiveProjectId(null);
  };

  const importProject = (project: Project) => {
    // Basic validation
    if (!project.id || !project.name || !project.friends || !project.receipts) {
      alert("Invalid project file.");
      return;
    }
    setProjects(prev => [...prev.filter(p => p.id !== project.id), project]);
    setActiveProjectId(project.id);
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      activeProject,
      createProject,
      setActiveProject: setActiveProjectId,
      deleteProject,
      importProject,
      updateProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

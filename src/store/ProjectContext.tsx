import React, { useState, useEffect } from 'react';
import type { Project } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { ProjectContext } from './context';
import { navigate } from '../utils/navigate';

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('moneySplitter_projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(() => {
    return window.location.hash.slice(1) || null;
  });

  useEffect(() => {
    localStorage.setItem('moneySplitter_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    const handlePopState = () => {
      setActiveProjectIdState(window.location.hash.slice(1) || null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setActiveProjectId = (id: string | null) => {
    navigate(id ? '#' + id : location.pathname);
    setActiveProjectIdState(id);
  };

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

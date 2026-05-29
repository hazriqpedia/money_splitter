import { createContext } from 'react';
import type { Project } from '../types';

export interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  createProject: (name: string) => void;
  setActiveProject: (id: string | null) => void;
  deleteProject: (id: string) => void;
  importProject: (project: Project) => void;
  updateProject: (project: Project) => void;
}

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

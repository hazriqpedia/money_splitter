import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { ProjectProvider } from './ProjectContext';
import { useProject } from './useProject';
import type { Project } from '../types';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ProjectProvider>{children}</ProjectProvider>
);

beforeEach(() => {
  localStorage.clear();
});

describe('createProject', () => {
  it('adds a project with the given name', () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    act(() => { result.current.createProject('Bali Trip'); });
    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0].name).toBe('Bali Trip');
  });

  it('activates the new project immediately', () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    act(() => { result.current.createProject('KL Dinner'); });
    expect(result.current.activeProject?.name).toBe('KL Dinner');
  });

  it('seeds two default friends', () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    act(() => { result.current.createProject('Test'); });
    expect(result.current.activeProject?.friends).toHaveLength(2);
  });

  it('starts with an empty receipts array', () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    act(() => { result.current.createProject('Test'); });
    expect(result.current.activeProject?.receipts).toEqual([]);
  });

  it('accumulates multiple projects', () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    act(() => { result.current.createProject('Trip 1'); });
    act(() => { result.current.createProject('Trip 2'); });
    expect(result.current.projects).toHaveLength(2);
  });
});

describe('deleteProject', () => {
  it('removes the project from the list', () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    act(() => { result.current.createProject('To Delete'); });
    const id = result.current.projects[0].id;
    act(() => { result.current.deleteProject(id); });
    expect(result.current.projects).toHaveLength(0);
  });

  it('clears activeProject when deleting the active one', () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    act(() => { result.current.createProject('Active'); });
    const id = result.current.projects[0].id;
    act(() => { result.current.deleteProject(id); });
    expect(result.current.activeProject).toBeNull();
  });

  it('does not clear activeProject when deleting a different project', () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    act(() => { result.current.createProject('Keep'); });
    act(() => { result.current.createProject('Remove'); });
    const keepId = result.current.projects[0].id;
    const removeId = result.current.projects[1].id;
    act(() => { result.current.setActiveProject(keepId); });
    act(() => { result.current.deleteProject(removeId); });
    expect(result.current.activeProject?.name).toBe('Keep');
  });
});

describe('updateProject', () => {
  it('updates the project name', () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    act(() => { result.current.createProject('Original'); });
    const project = result.current.projects[0];
    act(() => { result.current.updateProject({ ...project, name: 'Renamed' }); });
    expect(result.current.projects[0].name).toBe('Renamed');
  });

  it('does not affect other projects', () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    act(() => { result.current.createProject('One'); });
    act(() => { result.current.createProject('Two'); });
    const first = result.current.projects[0];
    act(() => { result.current.updateProject({ ...first, name: 'One Updated' }); });
    expect(result.current.projects[1].name).toBe('Two');
  });

  it('can add a receipt to a project', () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    act(() => { result.current.createProject('Dinner'); });
    const project = result.current.projects[0];
    const newReceipt = { id: 'r1', name: 'Cafe', expectedTotal: 50, taxPercentage: 0, items: [] };
    act(() => { result.current.updateProject({ ...project, receipts: [newReceipt] }); });
    expect(result.current.projects[0].receipts).toHaveLength(1);
  });
});

describe('importProject', () => {
  it('imports a valid project and activates it', () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    const imported: Project = {
      id: 'imported-1',
      name: 'Shared Trip',
      date: new Date().toISOString(),
      friends: [{ id: 'f1', name: 'Alice' }],
      receipts: [],
      tags: [],
    };
    act(() => { result.current.importProject(imported); });
    expect(result.current.projects).toHaveLength(1);
    expect(result.current.activeProject?.id).toBe('imported-1');
  });

  it('replaces an existing project with the same id', () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    act(() => { result.current.createProject('Original'); });
    const existingId = result.current.projects[0].id;
    const replacement: Project = {
      id: existingId,
      name: 'Replaced',
      date: new Date().toISOString(),
      friends: [],
      receipts: [],
    };
    act(() => { result.current.importProject(replacement); });
    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0].name).toBe('Replaced');
  });
});

describe('localStorage persistence', () => {
  it('persists projects on change', () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    act(() => { result.current.createProject('Persisted'); });
    const stored = JSON.parse(localStorage.getItem('moneySplitter_projects') ?? '[]');
    expect(stored[0].name).toBe('Persisted');
  });

  it('restores projects from localStorage on mount', () => {
    const saved: Project[] = [{
      id: 'saved-1', name: 'From Storage', date: new Date().toISOString(),
      friends: [], receipts: [], tags: [],
    }];
    localStorage.setItem('moneySplitter_projects', JSON.stringify(saved));
    const { result } = renderHook(() => useProject(), { wrapper });
    expect(result.current.projects[0].name).toBe('From Storage');
  });

  it('restores activeProjectId from localStorage on mount', () => {
    const saved: Project[] = [{
      id: 'active-id', name: 'Was Active', date: new Date().toISOString(),
      friends: [], receipts: [],
    }];
    localStorage.setItem('moneySplitter_projects', JSON.stringify(saved));
    localStorage.setItem('moneySplitter_activeProjectId', 'active-id');
    const { result } = renderHook(() => useProject(), { wrapper });
    expect(result.current.activeProject?.name).toBe('Was Active');
  });
});

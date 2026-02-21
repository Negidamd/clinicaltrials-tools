"use client";

// ---------------------------------------------------------------------------
// useProject – hook for project CRUD operations
// ---------------------------------------------------------------------------

import { useState, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Project {
  id: string;
  name: string;
  description?: string;
  indication?: string;
  phase?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count?: { calculations: number };
}

interface CreateProjectData {
  name: string;
  description?: string;
  indication?: string;
  phase?: string;
}

interface UpdateProjectData {
  name?: string;
  description?: string;
  indication?: string;
  phase?: string;
  status?: string;
}

interface UseProjectReturn {
  /** List of all projects (populated by fetchProjects). */
  projects: Project[];
  /** Single project (populated by fetchProject or when projectId is passed). */
  project: Project | null;
  /** Whether a request is in-flight. */
  isLoading: boolean;
  /** User-facing error message. */
  error: string | null;
  /** Fetch all projects for the current user. */
  fetchProjects: () => Promise<void>;
  /** Create a new project. Returns the created project or null on error. */
  createProject: (data: CreateProjectData) => Promise<Project | null>;
  /** Update an existing project by id. Returns the updated project or null on error. */
  updateProject: (id: string, data: UpdateProjectData) => Promise<Project | null>;
  /** Delete a project by id. Returns true on success. */
  deleteProject: (id: string) => Promise<boolean>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useProject(projectId?: string): UseProjectReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // -----------------------------------------------------------------------
  // Fetch all projects
  // -----------------------------------------------------------------------
  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/projects", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch projects (${response.status})`);
      }

      const body = await response.json();
      const data: Project[] = body.data ?? body;
      setProjects(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch projects";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // -----------------------------------------------------------------------
  // Fetch a single project by id
  // -----------------------------------------------------------------------
  const fetchProject = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects?id=${encodeURIComponent(id)}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch project (${response.status})`);
      }

      const body = await response.json();
      const data: Project = body.data ?? body;
      setProject(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch project";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // -----------------------------------------------------------------------
  // Create a new project
  // -----------------------------------------------------------------------
  const createProject = useCallback(
    async (data: CreateProjectData): Promise<Project | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          let message = `Failed to create project (${response.status})`;
          try {
            const errorBody = await response.json();
            if (errorBody?.error) {
              message = errorBody.error;
            }
          } catch {
            // response body was not JSON; use generic message
          }
          throw new Error(message);
        }

        const body = await response.json();
        const created: Project = body.data ?? body;

        // Append to local list
        setProjects((prev) => [created, ...prev]);
        setProject(created);
        return created;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to create project";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // -----------------------------------------------------------------------
  // Update an existing project
  // -----------------------------------------------------------------------
  const updateProject = useCallback(
    async (id: string, data: UpdateProjectData): Promise<Project | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/projects", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id, ...data }),
        });

        if (!response.ok) {
          let message = `Failed to update project (${response.status})`;
          try {
            const errorBody = await response.json();
            if (errorBody?.error) {
              message = errorBody.error;
            }
          } catch {
            // response body was not JSON; use generic message
          }
          throw new Error(message);
        }

        const body = await response.json();
        const updated: Project = body.data ?? body;

        // Update in local list
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? updated : p)),
        );
        setProject(updated);
        return updated;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to update project";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // -----------------------------------------------------------------------
  // Delete a project
  // -----------------------------------------------------------------------
  const deleteProject = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/projects", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id }),
        });

        if (!response.ok) {
          let message = `Failed to delete project (${response.status})`;
          try {
            const errorBody = await response.json();
            if (errorBody?.error) {
              message = errorBody.error;
            }
          } catch {
            // response body was not JSON; use generic message
          }
          throw new Error(message);
        }

        // Remove from local list
        setProjects((prev) => prev.filter((p) => p.id !== id));
        if (project?.id === id) {
          setProject(null);
        }
        return true;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to delete project";
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [project?.id],
  );

  // -----------------------------------------------------------------------
  // Auto-fetch when projectId is provided
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId, fetchProject]);

  return {
    projects,
    project,
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}

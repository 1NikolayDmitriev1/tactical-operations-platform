import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import type { Task } from "../types";

import { useAuth } from "./AuthContext";

interface TaskContextType {
  tasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;
  setSelectedTask: (task: Task | null) => void;
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, "id">) => Promise<void>;
  updateTask: (taskId: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { isAuth } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!isAuth) {
      setTasks([]);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiRequest("/tasks");
      setTasks(response);
    } catch (err) {
      console.error("Task fetch failed:", err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuth) {
      fetchTasks();
    } else {
      setTasks([]);
      setSelectedTask(null);
    }
  }, [isAuth]);

  const addTask = async (task: Omit<Task, "id">) => {
    try {
      const response = await apiRequest("/tasks", "POST", { body: task });
      const created = response.data || response;
      setTasks((prev) => [...prev, created]);
    } catch (err) {
      console.error("Failed to create task:", err);
      throw err;
    }
  };

  const updateTask = async (taskId: number, updates: Partial<Task>) => {
    try {
      await apiRequest(`/tasks/${taskId}`, "PATCH", {
        body: updates,
      });
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task,
        ),
      );
      if (selectedTask?.id === taskId) {
        setSelectedTask((prev) => (prev ? { ...prev, ...updates } : null));
      }
    } catch (err) {
      console.error("Failed to update task:", err);
      throw err;
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      await apiRequest(`/tasks/${taskId}`, "DELETE");
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
      throw err;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        selectedTask,
        tasks,
        isLoading,
        error,
        setSelectedTask,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTask(): TaskContextType {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTask must be used within an TaskProvider");
  }
  return context;
}

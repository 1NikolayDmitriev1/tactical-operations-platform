export interface Task {
  id: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  latitude: number;
  longitude: number;
}
export interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  onClick?: () => void;
}
export interface ApiOptions {
  body?: unknown;
  headers?: Record<string, string>;
  [key: string]: unknown;
}

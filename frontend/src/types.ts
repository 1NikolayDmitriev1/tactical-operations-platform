export interface Task {
  id: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  latitude?: number | null;
  longitude?: number | null;
  threat_radius?: number | null;
  image_url?: string | null;
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

export interface VisionDetection {
  label: string;
  confidence: number;
  normalized_box: [number, number, number, number];
  class_id?: number;
}

export interface VisionAnalysisResult {
  title: string;
  priority: "low" | "medium" | "high" | "critical";
  summary: string;
  detected_features: string[];
  recommendation: string;
  has_exif_coords: boolean;
  latitude?: number | null;
  longitude?: number | null;
  model_used: string;
  detections: VisionDetection[];
  image_size?: { width: number; height: number };
}


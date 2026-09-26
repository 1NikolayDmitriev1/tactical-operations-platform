import { useState } from "react";

export interface Detection {
  label: string;
  confidence: number;
  normalized_box: [number, number, number, number];
  class_id: number;
}

export interface ReconMetrics {
  detections: Detection[];
  inferenceTime: number | null;
  imageSize: { width: number; height: number } | null;
}

export interface DroneFeed {
  file: File;
  previewUrl: string;
}

export function useDroneRecon() {
  const [feed, setFeed] = useState<DroneFeed | null>(null);
  const [scanResult, setScanResult] = useState<ReconMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const selectFile = (file: File) => {
    if (feed?.previewUrl) {
      URL.revokeObjectURL(feed.previewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    setFeed({ file, previewUrl });
    setScanResult(null);
    setError(null);
  };

  const analyze = async (confidence: number) => {
    try {
      if (!feed?.file) {
        return;
      }
      setIsLoading(true);
      setError(null);
      const t0 = performance.now();
      const formData = new FormData();
      formData.append("file", feed.file);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(
        `${apiUrl}/ai/detect?confidence=${confidence}`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await response.json();

      setScanResult({
        detections: data.detections,
        imageSize: data.image_size,
        inferenceTime: Math.round(performance.now() - t0),
      });
    } catch (err) {
      console.error("Request error", err);
      setError(err instanceof Error ? err.message : "Inference error");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    if (feed?.previewUrl) {
      URL.revokeObjectURL(feed.previewUrl);
    }
    setFeed(null);
    setScanResult(null);
    setError(null);
  };

  return {
    feed,
    scanResult,
    isLoading,
    error,
    selectFile,
    analyze,
    reset,
  };
}

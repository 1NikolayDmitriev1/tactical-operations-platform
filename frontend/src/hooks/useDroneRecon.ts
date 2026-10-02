import { useState } from "react";
import { BASE_URL } from "../api/client";
import type { VisionAnalysisResult } from "../types";

export interface DroneFeed {
  file: File;
  previewUrl: string;
}

export function useDroneRecon() {
  const [feed, setFeed] = useState<DroneFeed | null>(null);
  const [result, setResult] = useState<VisionAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const selectFile = (file: File) => {
    if (feed?.previewUrl) {
      URL.revokeObjectURL(feed.previewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    setFeed({ file, previewUrl });
    setResult(null);
    setError(null);
  };

  const analyze = async (lang: string = "ua") => {
    try {
      if (!feed?.file) return;
      setIsLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append("file", feed.file);
      const response = await fetch(
        `${BASE_URL}/ai/vision-analyze?lang=${lang}`,
        {
          method: "POST",
          body: formData,
        },
      );
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || `Vision AI error: ${response.status}`);
      }
      const data: VisionAnalysisResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vision analysis failed");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    if (feed?.previewUrl) {
      URL.revokeObjectURL(feed.previewUrl);
    }
    setFeed(null);
    setResult(null);
    setError(null);
  };

  return {
    feed,
    result,
    isLoading,
    error,
    selectFile,
    analyze,
    reset,
  };
}

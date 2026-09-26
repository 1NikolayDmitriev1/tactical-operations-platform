import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { useTask } from "../../context/TaskContext";
export function MapCameraController() {
  const map = useMap();
  const { selectedTask } = useTask();
  useEffect(() => {
    if (selectedTask && selectedTask.latitude && selectedTask.longitude) {
      map.flyTo([selectedTask.latitude, selectedTask.longitude], 15, {
        duration: 1.5,
      });
    }
  }, [selectedTask]);

  return null;
}

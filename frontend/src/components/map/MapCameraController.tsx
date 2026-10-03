import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { useTask } from "../../context/TaskContext";
export function MapCameraController() {
  const map = useMap();
  const { selectedTask } = useTask();
  useEffect(() => {
    if (!selectedTask || selectedTask.latitude == null || selectedTask.longitude == null) {
      return;
    }

    const targetCoords: [number, number] = [selectedTask.latitude, selectedTask.longitude];
    const currentZoom = map.getZoom();

    map.stop();

    if (currentZoom < 13) {
      map.setView(targetCoords, 13, { animate: true });
    } else {
      map.panTo(targetCoords, {
        animate: true,
        duration: 0.35,
        easeLinearity: 0.25,
      });
    }
  }, [selectedTask, map]);

  return null;
}

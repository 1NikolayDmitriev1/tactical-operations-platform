import { useMapEvents } from "react-leaflet";
import { useAuth } from "../../context/AuthContext";
import { useModal } from "../../context/ModalContext";

export function MapClickController() {
  const { isAuth } = useAuth();
  const { openModal, pendingTarget, setPendingTarget } = useModal();

  useMapEvents({
    click: (e) => {
      if (!isAuth) return;
      const clickedCoords = {
        lat: Number(e.latlng.lat.toFixed(6)),
        lng: Number(e.latlng.lng.toFixed(6)),
      };

      if (pendingTarget) {
        openModal("CREATE_TASK", {
          task: {
            title: pendingTarget.title,
            description: pendingTarget.description,
            priority: pendingTarget.priority,
            threat_radius: pendingTarget.threat_radius,
            image_url: pendingTarget.image_url,
            latitude: clickedCoords.lat,
            longitude: clickedCoords.lng,
            id: pendingTarget.id,
          },
          coords: clickedCoords,
        });
        setPendingTarget(null);
      } else {
        openModal("CREATE_TASK", {
          coords: clickedCoords,
        });
      }
    },
  });

  return null;
}

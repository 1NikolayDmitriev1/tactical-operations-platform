import { useMapEvents } from "react-leaflet";
import { useAuth } from "../../context/AuthContext";
import { useModal } from "../../context/ModalContext";

export function MapClickController() {
  const { isAuth } = useAuth();
  const { openModal } = useModal();

  useMapEvents({
    click: (e) => {
      if (!isAuth) return;
      openModal("CREATE_TASK", {
        coords: {
          lat: Number(e.latlng.lat.toFixed(6)),
          lng: Number(e.latlng.lng.toFixed(6)),
        },
      });
    },
  });

  return null;
}

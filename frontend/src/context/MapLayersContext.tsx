import { createContext, useContext, useState, type ReactNode } from "react";

export type TileProviderType = "dark" | "satellite" | "topo";

export interface TileConfig {
  nameKey: "dark" | "satellite" | "topo";
  url: string;
  attribution: string;
}

export const TILE_CONFIGS: Record<TileProviderType, TileConfig> = {
  dark: {
    nameKey: "dark",
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a>',
  },
  satellite: {
    nameKey: "satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  },
  topo: {
    nameKey: "topo",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
  },
};

interface MapLayersContextType {
  activeTile: TileProviderType;
  setActiveTile: (tile: TileProviderType) => void;
  showThreatZones: boolean;
  setShowThreatZones: (show: boolean | ((prev: boolean) => boolean)) => void;
  showMarkers: boolean;
  setShowMarkers: (show: boolean | ((prev: boolean) => boolean)) => void;
  isLayersOpen: boolean;
  toggleLayers: () => void;
}

const MapLayersContext = createContext<MapLayersContextType | undefined>(undefined);

export function MapLayersProvider({ children }: { children: ReactNode }) {
  const [activeTile, setActiveTile] = useState<TileProviderType>("dark");
  const [showThreatZones, setShowThreatZones] = useState<boolean>(true);
  const [showMarkers, setShowMarkers] = useState<boolean>(true);
  const [isLayersOpen, setIsLayersOpen] = useState<boolean>(false);

  const toggleLayers = () => {
    setIsLayersOpen((prev) => !prev);
  };

  return (
    <MapLayersContext.Provider
      value={{
        activeTile,
        setActiveTile,
        showThreatZones,
        setShowThreatZones,
        showMarkers,
        setShowMarkers,
        isLayersOpen,
        toggleLayers,
      }}
    >
      {children}
    </MapLayersContext.Provider>
  );
}

export function useMapLayers(): MapLayersContextType {
  const context = useContext(MapLayersContext);
  if (!context) {
    throw new Error("useMapLayers must be used within a MapLayersProvider");
  }
  return context;
}

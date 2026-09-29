import { Header } from "./components/layout/Header";
import { NavRail } from "./components/layout/NavRail";
import { MapPanel } from "./components/layout/MapPanel";
import { TaskSidebar } from "./components/layout/TaskSidebar";
import { TaskModal } from "./components/tasks/TaskModal";
import { DroneReconModal } from "./components/recon/DroneReconModal";
import { AuthProvider } from "./context/AuthContext";
import { TaskProvider } from "./context/TaskContext";
import { ModalProvider } from "./context/ModalContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AccentProvider } from "./context/AccentContext";
import { MapLayersProvider } from "./context/MapLayersContext";

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AccentProvider>
        <AuthProvider>
          <TaskProvider>
            <ModalProvider>
              <MapLayersProvider>{children}</MapLayersProvider>
            </ModalProvider>
          </TaskProvider>
        </AuthProvider>
      </AccentProvider>
    </LanguageProvider>
  );
}

export function App() {
  return (
    <AppProviders>
      <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
        <Header />
        <main className="flex-1 flex overflow-hidden">
          <NavRail />
          <MapPanel />
          <TaskSidebar />
        </main>
        <TaskModal />
        <DroneReconModal />
      </div>
    </AppProviders>
  );
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import AddMemoryModal from "@/components/AddMemoryModal";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import AllMedia from "./pages/AllMedia";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { useState, useCallback } from "react";

const queryClient = new QueryClient();

const AppContent = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSaved = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout onAddMemory={() => setAddModalOpen(true)} />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard key={refreshKey} />} />
          <Route path="/all" element={<AllMedia key={refreshKey} />} />
          <Route path="/videos" element={<AllMedia typeFilter="video" key={refreshKey} />} />
          <Route path="/photos" element={<AllMedia typeFilter="photo" key={refreshKey} />} />
          <Route path="/poems" element={<AllMedia typeFilter="poem" key={refreshKey} />} />
          <Route path="/favorites" element={<AllMedia favoritesOnly key={refreshKey} />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <AddMemoryModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSaved={handleSaved} />
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

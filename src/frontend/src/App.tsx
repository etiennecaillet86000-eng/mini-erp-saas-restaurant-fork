import { Toaster } from "@/components/ui/sonner";
import BusinessPlanPage from "@/core/finance/BusinessPlanPage";
import FraisFixesPage from "@/core/finance/FraisFixesPage";
import SalariesPage from "@/core/hr/SalariesPage";
import Layout from "@/core/ui/Layout";
import { initializeFromBackend } from "@/lib/initBackend";
import AmortissementsPage from "@/modules/restaurant/pages/AmortissementsPage";
import AssociesPage from "@/modules/restaurant/pages/AssociesPage";
import BusinessPlanReelPage from "@/modules/restaurant/pages/BusinessPlanReelPage";
import ComptabilitePage from "@/modules/restaurant/pages/ComptabilitePage";
import EmpruntsPage from "@/modules/restaurant/pages/EmpruntsPage";
import IngredientsPage from "@/modules/restaurant/pages/IngredientsPage";
import OperationsPage from "@/modules/restaurant/pages/OperationsPage";
import RecettesPage from "@/modules/restaurant/pages/RecettesPage";
import SimulateurCartePage from "@/modules/restaurant/pages/SimulateurCartePage";
import StockPage from "@/modules/restaurant/pages/StockPage";
import LoginPage from "@/pages/LoginPage";
import Parametres from "@/pages/Parametres";
import { useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => localStorage.getItem("isAuthenticated") === "true",
  );
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || hasInitialized.current) return;
    hasInitialized.current = true;
    setIsInitializing(true);
    void initializeFromBackend().finally(() => setIsInitializing(false));
  }, [isAuthenticated]);

  function handleLogin() {
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
  }

  function handleLogout() {
    localStorage.removeItem("isAuthenticated");
    hasInitialized.current = false;
    setIsAuthenticated(false);
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm">Chargement des données…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/operations" replace />} />
          <Route path="/business-plan" element={<BusinessPlanPage />} />
          <Route
            path="/business-plan-reel"
            element={<BusinessPlanReelPage />}
          />
          <Route path="/laboratoire" element={<SimulateurCartePage />} />
          <Route path="/ingredients" element={<IngredientsPage />} />
          <Route path="/recettes" element={<RecettesPage />} />
          <Route path="/salaries" element={<SalariesPage />} />
          <Route path="/frais-fixes" element={<FraisFixesPage />} />
          <Route path="/operations" element={<OperationsPage />} />
          <Route path="/parametres" element={<Parametres />} />
          <Route path="/associes" element={<AssociesPage />} />
          <Route path="/emprunts" element={<EmpruntsPage />} />
          <Route path="/amortissements" element={<AmortissementsPage />} />
          <Route path="/comptabilite" element={<ComptabilitePage />} />
          <Route path="/stock" element={<StockPage />} />
        </Routes>
      </Layout>
    </>
  );
}

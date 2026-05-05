import { Toaster } from "@/components/ui/sonner";
import BusinessPlanPage from "@/core/finance/BusinessPlanPage";
import FraisFixesPage from "@/core/finance/FraisFixesPage";
import SalariesPage from "@/core/hr/SalariesPage";
import Layout from "@/core/ui/Layout";
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
import Parametres from "@/pages/Parametres";
import { Navigate, Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <Layout>
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

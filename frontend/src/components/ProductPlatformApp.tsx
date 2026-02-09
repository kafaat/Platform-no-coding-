import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import HeaderBar from "@/components/HeaderBar";
import DashboardScreen from "@/screens/DashboardScreen";
import CategoriesScreen from "@/screens/CategoriesScreen";
import ProductsScreen from "@/screens/ProductsScreen";
import ProductEditorScreen from "@/screens/ProductEditorScreen";
import ManufacturingScreen from "@/screens/ManufacturingScreen";
import TraceabilityScreen from "@/screens/TraceabilityScreen";
import PricingScreen from "@/screens/PricingScreen";
import NumberingScreen from "@/screens/NumberingScreen";
import ChannelsScreen from "@/screens/ChannelsScreen";
import ContractsScreen from "@/screens/Contracts";
import CustomersScreen from "@/screens/Customers";
import ReservationsScreen from "@/screens/ReservationsScreen";
import AuditScreen from "@/screens/AuditScreen";
import ReportsScreen from "@/screens/ReportsScreen";
import type { ScreenId } from "@/types";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export default function ProductPlatformApp() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleNavigate = (screen: ScreenId) => {
    setActiveScreen(screen);
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case "dashboard":
        return <DashboardScreen onNavigate={handleNavigate} />;
      case "categories":
        return <CategoriesScreen />;
      case "products":
        return <ProductsScreen onNavigate={handleNavigate} />;
      case "product-editor":
        return <ProductEditorScreen onBack={() => setActiveScreen("products")} />;
      case "manufacturing":
        return <ManufacturingScreen />;
      case "traceability":
        return <TraceabilityScreen />;
      case "pricing":
        return <PricingScreen />;
      case "numbering":
        return <NumberingScreen />;
      case "channels":
        return <ChannelsScreen />;
      case "contracts":
        return <ContractsScreen />;
      case "customers":
        return <CustomersScreen />;
      case "reservations":
        return <ReservationsScreen />;
      case "audit":
        return <AuditScreen />;
      case "reports":
        return <ReportsScreen />;
      default:
        return <DashboardScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans" dir="rtl">
      {/* Sidebar */}
      <Sidebar
        activeScreen={activeScreen}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Header */}
      <HeaderBar sidebarCollapsed={sidebarCollapsed} />

      {/* Main Content */}
      <main
        className="pt-16 transition-all duration-200 min-h-screen"
        style={{
          marginRight: sidebarCollapsed ? 64 : 260,
        }}
      >
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScreen}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

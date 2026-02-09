import { useState, Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
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

// ---- Error Boundary for screen-level rendering errors ----

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ScreenErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Screen render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-semibold text-destructive mb-2">
            حدث خطأ غير متوقع
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {this.state.error?.message ?? 'Unknown error'}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
          >
            إعادة المحاولة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
              <ScreenErrorBoundary>
                {renderScreen()}
              </ScreenErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

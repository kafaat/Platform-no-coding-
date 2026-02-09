import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FolderTree,
  Package,
  Factory,
  Scan,
  DollarSign,
  Hash,
  FileText,
  Users,
  CalendarRange,
  Radio,
  ClipboardList,
  BarChart3,
  Shield,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ScreenId } from "@/types";

interface SidebarProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  id: ScreenId;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  section?: string;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "لوحة التحكم", icon: <LayoutDashboard size={20} />, section: "main" },
  { id: "categories", label: "الفئات", icon: <FolderTree size={20} />, section: "products" },
  { id: "products", label: "المنتجات", icon: <Package size={20} />, section: "products" },
  { id: "product-editor", label: "محرر المنتج", icon: <ClipboardList size={20} />, section: "products" },
  { id: "manufacturing", label: "التصنيع وMRP", icon: <Factory size={20} />, section: "products" },
  { id: "traceability", label: "التتبع وSerial/Lot", icon: <Scan size={20} />, section: "products" },
  { id: "pricing", label: "التسعير", icon: <DollarSign size={20} />, section: "config" },
  { id: "numbering", label: "الترقيم", icon: <Hash size={20} />, section: "config" },
  { id: "channels", label: "قنوات التوزيع", icon: <Radio size={20} />, section: "config" },
  { id: "contracts", label: "العقود المالية", icon: <FileText size={20} />, section: "finance", badge: 3 },
  { id: "customers", label: "العملاء", icon: <Users size={20} />, section: "finance" },
  { id: "reservations", label: "الحجوزات", icon: <CalendarRange size={20} />, section: "operations", badge: 2 },
  { id: "audit", label: "سجل التدقيق", icon: <Shield size={20} />, section: "operations" },
  { id: "reports", label: "التقارير", icon: <BarChart3 size={20} />, section: "operations" },
];

const sectionLabels: Record<string, string> = {
  main: "الرئيسية",
  products: "المنتجات",
  config: "الإعدادات",
  finance: "المالية",
  operations: "العمليات",
};

export default function Sidebar({ activeScreen, onNavigate, collapsed, onToggle }: SidebarProps) {
  let currentSection = "";

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 260 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="fixed top-0 right-0 h-screen bg-card border-l border-border flex flex-col z-40 shadow-sm"
    >
      {/* Logo / Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Package className="text-primary-foreground" size={18} />
            </div>
            <span className="font-bold text-sm">نظام المنتجات</span>
          </motion.div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
        >
          {collapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {navItems.map((item) => {
          const showSection = item.section && item.section !== currentSection;
          if (item.section) currentSection = item.section;

          return (
            <div key={item.id}>
              {showSection && !collapsed && (
                <>
                  {item.section !== "main" && <Separator className="my-2" />}
                  <p className="text-[11px] font-medium text-muted-foreground px-3 py-1.5 uppercase tracking-wider">
                    {sectionLabels[item.section!]}
                  </p>
                </>
              )}
              <button
                onClick={() => onNavigate(item.id)}
                className={`
                  w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                  transition-colors duration-150
                  ${
                    activeScreen === item.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }
                  ${collapsed ? "justify-center px-2" : ""}
                `}
                title={collapsed ? item.label : undefined}
              >
                <span className="shrink-0">{item.icon}</span>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
                {!collapsed && item.badge && (
                  <span className="mr-auto bg-destructive text-destructive-foreground text-[10px] rounded-full px-1.5 py-0.5 font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center">
            DPS v0.1.0 — نظام المنتجات الديناميكي
          </p>
        </div>
      )}
    </motion.aside>
  );
}

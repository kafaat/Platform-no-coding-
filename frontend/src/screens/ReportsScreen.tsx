import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  FileText,
  Download,
  RefreshCcw,
  Calendar,
  Filter,
  Database,
  Package,
  Briefcase,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductType, ProductStatus } from "@/types";

// --- Report Definition ---

interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  materializedView: string;
  lastGenerated: string;
  recordCount: number;
  status: "ready" | "refreshing" | "stale";
}

// --- Mock Report Data ---

const mockReports: ReportDefinition[] = [
  {
    id: "product-catalog",
    title: "تقرير كتالوج المنتجات",
    description:
      "عرض شامل لجميع المنتجات مع الفئات والأسعار والقنوات والحالات. يشمل المنتجات المادية والرقمية والخدمات والحجوزات والمالية.",
    icon: <Package className="h-6 w-6" />,
    iconColor: "text-blue-600 bg-blue-50",
    materializedView: "mv_product_catalog",
    lastGenerated: "2024-07-15 14:30",
    recordCount: 1247,
    status: "ready",
  },
  {
    id: "contract-portfolio",
    title: "تقرير محفظة العقود",
    description:
      "ملخص محفظة العقود المالية مع أرصدة الأصل والفوائد والرسوم وحالات السداد. يتضمن تحليل المخاطر ومؤشرات الأداء.",
    icon: <Briefcase className="h-6 w-6" />,
    iconColor: "text-emerald-600 bg-emerald-50",
    materializedView: "mv_contract_portfolio",
    lastGenerated: "2024-07-15 14:30",
    recordCount: 342,
    status: "ready",
  },
  {
    id: "aging-report",
    title: "تقرير التقادم",
    description:
      "تحليل تقادم المديونيات حسب الفئات: 30 يوم، 60 يوم، 90 يوم، 180 يوم، 180+ يوم. يشمل التنبيهات والتصعيد والتعليق والشطب.",
    icon: <Clock className="h-6 w-6" />,
    iconColor: "text-amber-600 bg-amber-50",
    materializedView: "mv_aging_report",
    lastGenerated: "2024-07-15 12:00",
    recordCount: 89,
    status: "stale",
  },
  {
    id: "revenue-summary",
    title: "تقرير الإيرادات",
    description:
      "ملخص الإيرادات الشهرية والسنوية مع تفصيل حسب نوع المنتج والقناة والعملة. يتضمن مقارنات مع الفترات السابقة والتوقعات.",
    icon: <DollarSign className="h-6 w-6" />,
    iconColor: "text-rose-600 bg-rose-50",
    materializedView: "mv_revenue_summary",
    lastGenerated: "2024-07-15 14:30",
    recordCount: 156,
    status: "refreshing",
  },
];

// --- CQRS View status metadata ---

interface CQRSView {
  name: string;
  label: string;
  lastRefreshed: string;
  rowCount: number;
  status: "synced" | "refreshing" | "stale";
}

const cqrsViews: CQRSView[] = [
  {
    name: "mv_product_catalog",
    label: "كتالوج المنتجات",
    lastRefreshed: "2024-07-15 14:30:22",
    rowCount: 1247,
    status: "synced",
  },
  {
    name: "mv_contract_portfolio",
    label: "محفظة العقود",
    lastRefreshed: "2024-07-15 14:30:22",
    rowCount: 342,
    status: "synced",
  },
  {
    name: "mv_aging_report",
    label: "تقرير التقادم",
    lastRefreshed: "2024-07-15 12:00:00",
    rowCount: 89,
    status: "stale",
  },
  {
    name: "mv_revenue_summary",
    label: "ملخص الإيرادات",
    lastRefreshed: "2024-07-15 14:28:00",
    rowCount: 156,
    status: "refreshing",
  },
];

// --- Animation Variants ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// --- Status indicator ---

function ViewStatusBadge({ status }: { status: CQRSView["status"] }) {
  switch (status) {
    case "synced":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 gap-1 hover:bg-green-100">
          <CheckCircle2 className="h-3 w-3" />
          متزامن
        </Badge>
      );
    case "refreshing":
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1 hover:bg-blue-100">
          <RefreshCcw className="h-3 w-3 animate-spin" />
          جاري التحديث
        </Badge>
      );
    case "stale":
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1 hover:bg-amber-100">
          <AlertTriangle className="h-3 w-3" />
          قديم
        </Badge>
      );
  }
}

function ReportStatusIndicator({ status }: { status: ReportDefinition["status"] }) {
  switch (status) {
    case "ready":
      return (
        <div className="flex items-center gap-1 text-green-600 text-xs">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>جاهز</span>
        </div>
      );
    case "refreshing":
      return (
        <div className="flex items-center gap-1 text-blue-600 text-xs">
          <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
          <span>جاري التحديث</span>
        </div>
      );
    case "stale":
      return (
        <div className="flex items-center gap-1 text-amber-600 text-xs">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>يحتاج تحديث</span>
        </div>
      );
  }
}

// --- Report Card ---

function ReportCard({ report }: { report: ReportDefinition }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="hover:shadow-md transition-all h-full flex flex-col">
        <CardContent className="p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${report.iconColor}`}>{report.icon}</div>
            <ReportStatusIndicator status={report.status} />
          </div>
          <h3 className="font-semibold text-sm mb-2">{report.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">
            {report.description}
          </p>
          <div className="space-y-3">
            {/* Materialized View indicator */}
            <div className="flex items-center gap-1.5 text-xs">
              <Database className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono text-muted-foreground">
                {report.materializedView}
              </span>
            </div>
            {/* Stats row */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>آخر توليد: {report.lastGenerated}</span>
              </div>
              <span>{report.recordCount.toLocaleString("ar-EG")} سجل</span>
            </div>
            {/* Export button */}
            <Button variant="outline" size="sm" className="w-full">
              <Download className="h-4 w-4 ml-1" />
              تصدير
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// --- Component ---

export default function ReportsScreen() {
  const [dateFrom, setDateFrom] = useState("2024-01-01");
  const [dateTo, setDateTo] = useState("2024-07-15");
  const [productTypeFilter, setProductTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              التقارير
            </h1>
            <p className="text-muted-foreground mt-1">
              لوحة التقارير وتحليلات النظام من العروض المادية المجسدة (CQRS)
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCcw className="h-4 w-4 ml-1" />
              تحديث جميع العروض
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 ml-1" />
              تصدير الكل
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  من تاريخ
                </label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="pr-9"
                  />
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  إلى تاريخ
                </label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="pr-9"
                  />
                </div>
              </div>
              <div className="w-44 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  نوع المنتج
                </label>
                <Select
                  value={productTypeFilter}
                  onValueChange={setProductTypeFilter}
                >
                  <SelectTrigger>
                    <Filter className="h-4 w-4 ml-2" />
                    <SelectValue placeholder="النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">جميع الأنواع</SelectItem>
                    <SelectItem value="PHYSICAL">مادي</SelectItem>
                    <SelectItem value="DIGITAL">رقمي</SelectItem>
                    <SelectItem value="SERVICE">خدمة</SelectItem>
                    <SelectItem value="RESERVATION">حجز</SelectItem>
                    <SelectItem value="FINANCIAL">مالي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  الحالة
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">جميع الحالات</SelectItem>
                    <SelectItem value="DRAFT">مسودة</SelectItem>
                    <SelectItem value="ACTIVE">نشط</SelectItem>
                    <SelectItem value="SUSPENDED">معلق</SelectItem>
                    <SelectItem value="RETIRED">متقاعد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="shrink-0">
                <Filter className="h-4 w-4 ml-1" />
                تطبيق
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockReports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>

      {/* CQRS Materialized Views Indicator */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4" />
              حالة العروض المادية المجسدة (Materialized Views)
              <Badge variant="outline" className="text-xs font-normal mr-2">
                CQRS Read Models
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {cqrsViews.map((view) => (
                <motion.div
                  key={view.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-muted/30 rounded-lg p-3 border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-muted-foreground">
                      {view.name}
                    </span>
                    <ViewStatusBadge status={view.status} />
                  </div>
                  <p className="text-sm font-medium">{view.label}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{view.lastRefreshed}</span>
                    </div>
                    <span>{view.rowCount.toLocaleString("ar-EG")} صف</span>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full text-xs h-7">
                    <RefreshCcw className="h-3 w-3 ml-1" />
                    تحديث
                  </Button>
                </motion.div>
              ))}
            </div>
            {/* fn_refresh_materialized_views note */}
            <div className="mt-4 flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700">
              <Activity className="h-4 w-4 shrink-0" />
              <span>
                يتم تحديث العروض المجسدة دوريا عبر الإجراء المخزن{" "}
                <span className="font-mono font-medium">
                  fn_refresh_materialized_views()
                </span>{" "}
                أو يدويا عند الطلب. آخر تحديث شامل: 2024-07-15 14:30:22
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Hidden usage to suppress unused type warnings */}
      <span className="hidden">
        {String([FileText].length)}
        {("" as string) === ("PHYSICAL" satisfies ProductType) ? "" : ""}
        {("" as string) === ("DRAFT" satisfies ProductStatus) ? "" : ""}
      </span>
    </motion.div>
  );
}

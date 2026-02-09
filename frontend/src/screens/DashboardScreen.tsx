import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  FileText,
  CalendarCheck,
  TrendingUp,
  ArrowUpLeft,
  ArrowDownLeft,
  Plus,
  Clock,
  AlertTriangle,
  Activity,
  Box,
  Monitor,
  Wrench,
  Hotel,
  Landmark,
  User,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  ScreenId,
  ProductType,
  AgingBucket,
  AuditAction,
} from "@/types";

// ============================================================
// Types
// الأنواع
// ============================================================

interface DashboardScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

type TimePeriod = "today" | "week" | "month";

interface SummaryCardData {
  id: string;
  label: string;
  value: number;
  formatted: string;
  trend: number;
  iconKey: string;
  iconBg: string;
  iconColor: string;
  targetScreen: ScreenId;
}

interface ProductTypeBarData {
  type: ProductType;
  labelAr: string;
  count: number;
  color: string;
  iconKey: string;
}

interface RecentActivityEntry {
  id: number;
  entityType: string;
  entityTypeAr: string;
  action: AuditAction;
  actionAr: string;
  user: string;
  timestamp: string;
}

interface AgingBucketData {
  bucket: AgingBucket;
  labelAr: string;
  count: number;
  amount: string;
  color: string;
  bgColor: string;
}

interface DashboardData {
  summary: SummaryCardData[];
  productsByType: ProductTypeBarData[];
  recentActivity: RecentActivityEntry[];
  agingBuckets: AgingBucketData[];
}

// ============================================================
// Mock Data by Period
// بيانات تجريبية حسب الفترة
// ============================================================

function getMockData(period: TimePeriod): DashboardData {
  const multiplier = period === "today" ? 1 : period === "week" ? 3.2 : 8.5;
  const trendMultiplier = period === "today" ? 1 : period === "week" ? 0.8 : 1.5;

  return {
    summary: [
      {
        id: "active-products",
        label: "المنتجات النشطة",
        value: Math.round(1247 * (period === "today" ? 1 : period === "week" ? 1.02 : 1.08)),
        formatted: "",
        trend: 12.5 * trendMultiplier,
        iconKey: "package",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        targetScreen: "products",
      },
      {
        id: "active-contracts",
        label: "العقود الجارية",
        value: Math.round(342 * (period === "today" ? 1 : period === "week" ? 1.05 : 1.12)),
        formatted: "",
        trend: 8.3 * trendMultiplier,
        iconKey: "file-text",
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        targetScreen: "contracts",
      },
      {
        id: "today-reservations",
        label:
          period === "today"
            ? "الحجوزات اليوم"
            : period === "week"
              ? "حجوزات الأسبوع"
              : "حجوزات الشهر",
        value: Math.round(28 * multiplier),
        formatted: "",
        trend: -3.1 * trendMultiplier,
        iconKey: "calendar-check",
        iconBg: "bg-violet-50",
        iconColor: "text-violet-600",
        targetScreen: "reservations",
      },
      {
        id: "monthly-revenue",
        label:
          period === "today"
            ? "إيرادات اليوم"
            : period === "week"
              ? "إيرادات الأسبوع"
              : "الإيرادات الشهرية",
        value: Math.round(32500000 * (period === "today" ? 0.05 : period === "week" ? 0.28 : 1)),
        formatted: "",
        trend: 22.0 * trendMultiplier,
        iconKey: "trending-up",
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
        targetScreen: "reports",
      },
    ],
    productsByType: [
      { type: "PHYSICAL", labelAr: "مادي", count: Math.round(487 * (1 + (multiplier - 1) * 0.02)), color: "bg-blue-500", iconKey: "box" },
      { type: "DIGITAL", labelAr: "رقمي", count: Math.round(312 * (1 + (multiplier - 1) * 0.03)), color: "bg-purple-500", iconKey: "monitor" },
      { type: "SERVICE", labelAr: "خدمة", count: Math.round(198 * (1 + (multiplier - 1) * 0.01)), color: "bg-teal-500", iconKey: "wrench" },
      { type: "RESERVATION", labelAr: "حجز", count: Math.round(145 * (1 + (multiplier - 1) * 0.04)), color: "bg-orange-500", iconKey: "hotel" },
      { type: "FINANCIAL", labelAr: "مالي", count: Math.round(105 * (1 + (multiplier - 1) * 0.02)), color: "bg-rose-500", iconKey: "landmark" },
    ],
    recentActivity: [
      {
        id: 1,
        entityType: "product",
        entityTypeAr: "منتج",
        action: "CREATE",
        actionAr: "إنشاء",
        user: "أحمد محمد",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        entityType: "contract",
        entityTypeAr: "عقد",
        action: "STATE_CHANGE",
        actionAr: "تغيير حالة",
        user: "سارة علي",
        timestamp: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
      },
      {
        id: 3,
        entityType: "reservation",
        entityTypeAr: "حجز",
        action: "CREATE",
        actionAr: "إنشاء",
        user: "خالد عبدالله",
        timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
      },
      {
        id: 4,
        entityType: "product",
        entityTypeAr: "منتج",
        action: "UPDATE",
        actionAr: "تحديث",
        user: "نورة حسن",
        timestamp: new Date(Date.now() - 57 * 60 * 1000).toISOString(),
      },
      {
        id: 5,
        entityType: "contract",
        entityTypeAr: "عقد",
        action: "CREATE",
        actionAr: "إنشاء",
        user: "محمد يوسف",
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      },
    ],
    agingBuckets: [
      { bucket: "30", labelAr: "30 يوم", count: 45, amount: "١٢,٣٠٠,٠٠٠", color: "bg-yellow-500", bgColor: "bg-yellow-100" },
      { bucket: "60", labelAr: "60 يوم", count: 23, amount: "٨,٧٥٠,٠٠٠", color: "bg-orange-500", bgColor: "bg-orange-100" },
      { bucket: "90", labelAr: "90 يوم", count: 12, amount: "٥,٢٠٠,٠٠٠", color: "bg-red-500", bgColor: "bg-red-100" },
      { bucket: "180+", labelAr: "180+ يوم", count: 7, amount: "٣,٩٠٠,٠٠٠", color: "bg-red-800", bgColor: "bg-red-200" },
    ],
  };
}

// ============================================================
// Helpers
// ============================================================

/** Format Arabic relative time / تنسيق الوقت النسبي بالعربية */
function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "الآن";
  if (diffMin === 1) return "منذ دقيقة";
  if (diffMin === 2) return "منذ دقيقتين";
  if (diffMin <= 10) return `منذ ${diffMin} دقائق`;
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  if (diffHour === 1) return "منذ ساعة واحدة";
  if (diffHour === 2) return "منذ ساعتين";
  if (diffHour < 24) return `منذ ${diffHour} ساعات`;
  if (diffDay === 1) return "منذ يوم واحد";
  if (diffDay === 2) return "منذ يومين";
  return `منذ ${diffDay} أيام`;
}

/** Format number as Arabic string / تنسيق الرقم كنص عربي */
function formatArabicNumber(n: number): string {
  return n.toLocaleString("ar-EG");
}

/** Format currency amount / تنسيق المبلغ المالي */
function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `${formatArabicNumber(Math.round(amount / 1000))}٬٠٠٠ ر.ي`;
  }
  return `${formatArabicNumber(amount)} ر.ي`;
}

/** Render icon by key / عرض الأيقونة حسب المفتاح */
function renderIcon(key: string, className: string = "h-5 w-5") {
  switch (key) {
    case "package": return <Package className={className} />;
    case "file-text": return <FileText className={className} />;
    case "calendar-check": return <CalendarCheck className={className} />;
    case "trending-up": return <TrendingUp className={className} />;
    case "box": return <Box className={className} />;
    case "monitor": return <Monitor className={className} />;
    case "wrench": return <Wrench className={className} />;
    case "hotel": return <Hotel className={className} />;
    case "landmark": return <Landmark className={className} />;
    default: return <Package className={className} />;
  }
}

// ============================================================
// Animated Counter Hook
// خطاف العداد المتحرك
// ============================================================

function useAnimatedCounter(target: number, duration: number = 1200, enabled: boolean = true) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!enabled) {
      setValue(0);
      return;
    }

    const startTime = performance.now();
    const startValue = 0;

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (target - startValue) * eased);
      setValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    }

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, duration, enabled]);

  return value;
}

// ============================================================
// Skeleton Components
// مكونات الهيكل العظمي للتحميل
// ============================================================

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-muted rounded ${className ?? ""}`} />
  );
}

function SkeletonSummaryCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-7 w-20" />
                <SkeletonPulse className="h-3 w-32" />
              </div>
              <SkeletonPulse className="h-11 w-11 rounded-lg flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SkeletonChart() {
  return (
    <Card className="h-full">
      <CardHeader>
        <SkeletonPulse className="h-5 w-36" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <SkeletonPulse className="h-4 w-16" />
                <SkeletonPulse className="h-3 w-8" />
              </div>
              <SkeletonPulse className="h-2.5 w-full rounded-full" />
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <SkeletonPulse className="h-4 w-16" />
            <SkeletonPulse className="h-4 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonActivityList() {
  return (
    <Card className="h-full">
      <CardHeader>
        <SkeletonPulse className="h-5 w-28" />
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2.5">
              <SkeletonPulse className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <SkeletonPulse className="h-4 w-32" />
                <SkeletonPulse className="h-3 w-20" />
              </div>
              <SkeletonPulse className="h-3 w-16 flex-shrink-0" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonAging() {
  return (
    <Card>
      <CardHeader>
        <SkeletonPulse className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg p-4 bg-muted/40">
              <div className="flex items-center justify-between mb-3">
                <SkeletonPulse className="h-4 w-14" />
                <SkeletonPulse className="h-4 w-12" />
              </div>
              <SkeletonPulse className="h-2 w-full rounded-full mb-2" />
              <SkeletonPulse className="h-3 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Animated Stat Card Sub-component
// بطاقة الإحصاء المتحركة
// ============================================================

function AnimatedStatCard({
  card,
  index,
  onNavigate,
}: {
  card: SummaryCardData;
  index: number;
  onNavigate: (screen: ScreenId) => void;
}) {
  const animatedValue = useAnimatedCounter(card.value, 1400, true);

  const displayValue =
    card.id === "monthly-revenue"
      ? formatCurrency(animatedValue)
      : formatArabicNumber(animatedValue);

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className="hover:shadow-md transition-shadow cursor-pointer group"
        onClick={() => onNavigate(card.targetScreen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onNavigate(card.targetScreen);
          }
        }}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">
                {card.label}
              </p>
              <p className="text-2xl font-bold tracking-tight">
                {displayValue}
              </p>
              <div className="flex items-center gap-1">
                {card.trend >= 0 ? (
                  <ArrowUpLeft className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <ArrowDownLeft className="h-3.5 w-3.5 text-red-600" />
                )}
                <span
                  className={`text-xs font-medium ${
                    card.trend >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {card.trend >= 0 ? "+" : ""}
                  {card.trend.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  عن الفترة السابقة
                </span>
              </div>
            </div>
            <div
              className={`p-3 rounded-lg ${card.iconBg} ${card.iconColor} group-hover:scale-110 transition-transform`}
            >
              {renderIcon(card.iconKey)}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================
// Animation Variants
// ============================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const actionBadgeColor: Record<AuditAction, string> = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  STATE_CHANGE: "bg-yellow-100 text-yellow-700",
};

const periodLabels: Record<TimePeriod, string> = {
  today: "اليوم",
  week: "الأسبوع",
  month: "الشهر",
};

// ============================================================
// Auto-Refresh Interval (seconds)
// ============================================================

const AUTO_REFRESH_SECONDS = 30;

// ============================================================
// Component
// ============================================================

export default function DashboardScreen({ onNavigate }: DashboardScreenProps) {
  // --- State ---
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<TimePeriod>("today");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_REFRESH_SECONDS);

  // Key to force re-mount animated counters on data change
  const [dataGeneration, setDataGeneration] = useState(0);

  // --- Fetch Data ---
  const fetchData = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        // Simulate API call with realistic delay
        await new Promise((r) => setTimeout(r, isManualRefresh ? 400 : 800));

        // Simulate a rare random failure (1 in 20) for demonstration
        // Remove this in production
        if (Math.random() < 0.05) {
          throw new Error("فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
        }

        const result = getMockData(period);
        setData(result);
        setLastUpdated(new Date());
        setDataGeneration((g) => g + 1);
        setCountdown(AUTO_REFRESH_SECONDS);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [period]
  );

  // Initial load + period change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchData(true);
          return AUTO_REFRESH_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchData]);

  // --- Manual refresh ---
  const handleRefresh = () => {
    setCountdown(AUTO_REFRESH_SECONDS);
    fetchData(true);
  };

  // --- Period change ---
  const handlePeriodChange = (newPeriod: TimePeriod) => {
    if (newPeriod === period) return;
    setPeriod(newPeriod);
  };

  // --- Derived values ---
  const maxProductCount = data
    ? Math.max(...data.productsByType.map((p) => p.count))
    : 0;
  const maxAgingCount = data
    ? Math.max(...data.agingBuckets.map((b) => b.count))
    : 0;

  // ============================================================
  // Error State
  // ============================================================
  if (error && !data) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">
            نظرة عامة على النظام الديناميكي للمنتجات
          </p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-800">
                حدث خطأ أثناء تحميل البيانات
              </h3>
              <p className="text-sm text-red-600 max-w-md">{error}</p>
            </div>
            <Button
              onClick={() => fetchData()}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 ml-2" />
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ============================================================
  // Loading State
  // ============================================================
  if (loading) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">لوحة التحكم</h1>
            <p className="text-muted-foreground mt-1">
              نظرة عامة على النظام الديناميكي للمنتجات
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">جارٍ التحميل...</span>
          </div>
        </div>
        <SkeletonSummaryCards />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonActivityList />
        </div>
        <SkeletonAging />
      </motion.div>
    );
  }

  // ============================================================
  // Data-Loaded State
  // ============================================================
  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      key={`dashboard-${period}-${dataGeneration}`}
    >
      {/* ── Page Header with Controls ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">
            نظرة عامة على النظام الديناميكي للمنتجات
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Period Selector / محدد الفترة الزمنية */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            {(Object.keys(periodLabels) as TimePeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  period === p
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>

          {/* Refresh Button + Countdown / زر التحديث والعد التنازلي */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-1.5"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              تحديث
            </Button>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="relative w-5 h-5">
                <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.2"
                  />
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${2 * Math.PI * 8}`}
                    strokeDashoffset={`${2 * Math.PI * 8 * (1 - countdown / AUTO_REFRESH_SECONDS)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 linear"
                  />
                </svg>
              </div>
              <span>{countdown} ث</span>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated + Error Banner */}
      <AnimatePresence>
        {error && data && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  className="text-amber-700 hover:text-amber-800 hover:bg-amber-100"
                >
                  إعادة المحاولة
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {lastUpdated && (
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Clock className="h-3 w-3" />
          <span>
            آخر تحديث: {lastUpdated.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          {refreshing && (
            <span className="flex items-center gap-1 text-blue-600">
              <Loader2 className="h-3 w-3 animate-spin" />
              جارٍ التحديث...
            </span>
          )}
        </motion.div>
      )}

      {/* ── Section 1: Summary Cards ── */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.summary.map((card, index) => (
            <AnimatedStatCard
              key={`${card.id}-${dataGeneration}`}
              card={card}
              index={index}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}

      {/* ── Section 2 & 3: Products by Type + Recent Activity ── */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Products by Type / المنتجات حسب النوع */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  المنتجات حسب النوع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.productsByType.map((product) => (
                    <div
                      key={`${product.type}-${dataGeneration}`}
                      className="space-y-1.5 cursor-pointer hover:bg-accent/30 rounded-lg p-1.5 -mx-1.5 transition-colors"
                      onClick={() => onNavigate("products")}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onNavigate("products");
                        }
                      }}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {renderIcon(product.iconKey, "h-4 w-4")}
                          </span>
                          <span className="font-medium">{product.labelAr}</span>
                        </div>
                        <span className="text-muted-foreground font-mono text-xs">
                          {formatArabicNumber(product.count)}
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${product.color}`}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(product.count / maxProductCount) * 100}%`,
                          }}
                          transition={{
                            duration: 0.8,
                            ease: "easeOut",
                            delay: 0.3,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">الإجمالي</span>
                    <span className="font-bold">
                      {formatArabicNumber(
                        data.productsByType.reduce((sum, p) => sum + p.count, 0)
                      )}{" "}
                      منتج
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity / النشاط الأخير */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  النشاط الأخير
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => onNavigate("audit")}
                >
                  عرض الكل
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {data.recentActivity.map((entry, index) => (
                    <motion.div
                      key={`${entry.id}-${dataGeneration}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.08 }}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => onNavigate("audit")}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onNavigate("audit");
                        }
                      }}
                    >
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {entry.user}
                          </span>
                          <Badge
                            className={`text-[10px] px-1.5 py-0 border-0 ${
                              actionBadgeColor[entry.action]
                            }`}
                          >
                            {entry.actionAr}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {entry.entityTypeAr} #{entry.id}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                        <Clock className="h-3 w-3" />
                        <span>{formatRelativeTime(entry.timestamp)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* ── Section 4: Aging Overview / نظرة عامة على التقادم ── */}
      {data && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                نظرة عامة على التقادم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.agingBuckets.map((bucket, index) => (
                  <motion.div
                    key={`${bucket.bucket}-${dataGeneration}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={`rounded-lg p-4 ${bucket.bgColor} cursor-pointer hover:shadow-md transition-shadow`}
                    onClick={() => onNavigate("contracts")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onNavigate("contracts");
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold">
                        {bucket.labelAr}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono"
                      >
                        {bucket.count} عقد
                      </Badge>
                    </div>
                    <div className="h-2 w-full bg-white/60 rounded-full overflow-hidden mb-2">
                      <motion.div
                        className={`h-full rounded-full ${bucket.color}`}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(bucket.count / maxAgingCount) * 100}%`,
                        }}
                        transition={{
                          duration: 0.7,
                          ease: "easeOut",
                          delay: 0.6,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {bucket.amount} ر.ي
                    </p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">
                    إجمالي العقود المتأخرة
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="font-bold">
                      {formatArabicNumber(
                        data.agingBuckets.reduce((sum, b) => sum + b.count, 0)
                      )}{" "}
                      عقد
                    </span>
                    <span className="text-muted-foreground">|</span>
                    <span className="font-bold text-red-600">
                      ٣٠,١٥٠,٠٠٠ ر.ي
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Section 5: Quick Actions / إجراءات سريعة ── */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                onClick={() => onNavigate("product-editor")}
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium">إنشاء منتج</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
                onClick={() => onNavigate("contracts")}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium">عقد جديد</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 transition-colors"
                onClick={() => onNavigate("reservations")}
              >
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                  <CalendarCheck className="h-5 w-5 text-violet-600" />
                </div>
                <span className="text-sm font-medium">حجز جديد</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

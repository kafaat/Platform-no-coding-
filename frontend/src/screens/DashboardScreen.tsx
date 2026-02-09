import { motion } from "framer-motion";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  ProductType,
  AgingBucket,
  AuditAction,
} from "@/types";

// ============================================================
// Static / Mock Data
// البيانات التجريبية
// ============================================================

interface SummaryCard {
  id: string;
  label: string;
  value: string;
  trend: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

const summaryCards: SummaryCard[] = [
  {
    id: "active-products",
    label: "المنتجات النشطة",
    value: "1,247",
    trend: 12.5,
    icon: <Package className="h-5 w-5" />,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    id: "active-contracts",
    label: "العقود الجارية",
    value: "342",
    trend: 8.3,
    icon: <FileText className="h-5 w-5" />,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    id: "today-reservations",
    label: "الحجوزات اليوم",
    value: "28",
    trend: -3.1,
    icon: <CalendarCheck className="h-5 w-5" />,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    id: "monthly-revenue",
    label: "الإيرادات الشهرية",
    value: "٣٢,٥٠٠,٠٠٠ ر.ي",
    trend: 22.0,
    icon: <TrendingUp className="h-5 w-5" />,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];

// --- Products by Type ---

interface ProductTypeBar {
  type: ProductType;
  labelAr: string;
  count: number;
  color: string;
  icon: React.ReactNode;
}

const productsByType: ProductTypeBar[] = [
  {
    type: "PHYSICAL",
    labelAr: "مادي",
    count: 487,
    color: "bg-blue-500",
    icon: <Box className="h-4 w-4" />,
  },
  {
    type: "DIGITAL",
    labelAr: "رقمي",
    count: 312,
    color: "bg-purple-500",
    icon: <Monitor className="h-4 w-4" />,
  },
  {
    type: "SERVICE",
    labelAr: "خدمة",
    count: 198,
    color: "bg-teal-500",
    icon: <Wrench className="h-4 w-4" />,
  },
  {
    type: "RESERVATION",
    labelAr: "حجز",
    count: 145,
    color: "bg-orange-500",
    icon: <Hotel className="h-4 w-4" />,
  },
  {
    type: "FINANCIAL",
    labelAr: "مالي",
    count: 105,
    color: "bg-rose-500",
    icon: <Landmark className="h-4 w-4" />,
  },
];

const maxProductCount = Math.max(...productsByType.map((p) => p.count));

// --- Recent Activity ---

interface RecentActivityEntry {
  id: number;
  entityType: string;
  entityTypeAr: string;
  action: AuditAction;
  actionAr: string;
  user: string;
  timestamp: string;
  timeAgo: string;
}

const recentActivity: RecentActivityEntry[] = [
  {
    id: 1,
    entityType: "product",
    entityTypeAr: "منتج",
    action: "CREATE",
    actionAr: "إنشاء",
    user: "أحمد محمد",
    timestamp: "2026-02-09T14:32:00Z",
    timeAgo: "منذ 5 دقائق",
  },
  {
    id: 2,
    entityType: "contract",
    entityTypeAr: "عقد",
    action: "STATE_CHANGE",
    actionAr: "تغيير حالة",
    user: "سارة علي",
    timestamp: "2026-02-09T14:18:00Z",
    timeAgo: "منذ 19 دقيقة",
  },
  {
    id: 3,
    entityType: "reservation",
    entityTypeAr: "حجز",
    action: "CREATE",
    actionAr: "إنشاء",
    user: "خالد عبدالله",
    timestamp: "2026-02-09T13:55:00Z",
    timeAgo: "منذ 42 دقيقة",
  },
  {
    id: 4,
    entityType: "product",
    entityTypeAr: "منتج",
    action: "UPDATE",
    actionAr: "تحديث",
    user: "نورة حسن",
    timestamp: "2026-02-09T13:40:00Z",
    timeAgo: "منذ 57 دقيقة",
  },
  {
    id: 5,
    entityType: "contract",
    entityTypeAr: "عقد",
    action: "CREATE",
    actionAr: "إنشاء",
    user: "محمد يوسف",
    timestamp: "2026-02-09T13:10:00Z",
    timeAgo: "منذ ساعة واحدة",
  },
];

const actionBadgeColor: Record<AuditAction, string> = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  STATE_CHANGE: "bg-yellow-100 text-yellow-700",
};

// --- Aging Overview ---

interface AgingBucketData {
  bucket: AgingBucket;
  labelAr: string;
  count: number;
  amount: string;
  color: string;
  bgColor: string;
}

const agingBuckets: AgingBucketData[] = [
  {
    bucket: "30",
    labelAr: "30 يوم",
    count: 45,
    amount: "١٢,٣٠٠,٠٠٠",
    color: "bg-yellow-500",
    bgColor: "bg-yellow-100",
  },
  {
    bucket: "60",
    labelAr: "60 يوم",
    count: 23,
    amount: "٨,٧٥٠,٠٠٠",
    color: "bg-orange-500",
    bgColor: "bg-orange-100",
  },
  {
    bucket: "90",
    labelAr: "90 يوم",
    count: 12,
    amount: "٥,٢٠٠,٠٠٠",
    color: "bg-red-500",
    bgColor: "bg-red-100",
  },
  {
    bucket: "180+",
    labelAr: "180+ يوم",
    count: 7,
    amount: "٣,٩٠٠,٠٠٠",
    color: "bg-red-800",
    bgColor: "bg-red-200",
  },
];

const maxAgingCount = Math.max(...agingBuckets.map((b) => b.count));

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

const cardHover = {
  scale: 1.02,
  transition: { duration: 0.2 },
};

// ============================================================
// Component
// ============================================================

export default function DashboardScreen() {
  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground mt-1">
          نظرة عامة على النظام الديناميكي للمنتجات
        </p>
      </div>

      {/* ── Section 1: Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <motion.div key={card.id} variants={itemVariants} whileHover={cardHover}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">
                      {card.label}
                    </p>
                    <p className="text-2xl font-bold tracking-tight">
                      {card.value}
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
                        {card.trend}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        عن الشهر الماضي
                      </span>
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${card.iconBg} ${card.iconColor}`}
                  >
                    {card.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Section 2 & 3: Products by Type + Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products by Type */}
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
                {productsByType.map((product) => (
                  <div key={product.type} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {product.icon}
                        </span>
                        <span className="font-medium">{product.labelAr}</span>
                      </div>
                      <span className="text-muted-foreground font-mono text-xs">
                        {product.count.toLocaleString("ar-EG")}
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${product.color}`}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(product.count / maxProductCount) * 100}%`,
                        }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">الإجمالي</span>
                  <span className="font-bold">
                    {productsByType
                      .reduce((sum, p) => sum + p.count, 0)
                      .toLocaleString("ar-EG")}{" "}
                    منتج
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                النشاط الأخير
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {recentActivity.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.08 }}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors"
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
                      <span>{entry.timeAgo}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Section 4: Aging Overview ── */}
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
              {agingBuckets.map((bucket, index) => (
                <motion.div
                  key={bucket.bucket}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className={`rounded-lg p-4 ${bucket.bgColor}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold">{bucket.labelAr}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">
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
                      transition={{ duration: 0.7, ease: "easeOut", delay: 0.6 }}
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
                    {agingBuckets
                      .reduce((sum, b) => sum + b.count, 0)
                      .toLocaleString("ar-EG")}{" "}
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

      {/* ── Section 5: Quick Actions ── */}
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
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium">إنشاء منتج</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium">عقد جديد</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 transition-colors"
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

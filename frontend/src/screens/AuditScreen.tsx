import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Download,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  Activity,
  Eye,
  FileText,
  User,
  Globe,
  Clock,
  Plus,
  Pencil,
  Trash2,
  RefreshCcw,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AuditAction } from "@/types";

// ============================================================
// Animation Variants
// ============================================================

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

// ============================================================
// Action Badge Configuration
// اعدادات شارات الاجراءات
// ============================================================

const ACTION_CONFIG: Record<
  AuditAction,
  { label: string; icon: React.ReactNode; color: string }
> = {
  CREATE: {
    label: "انشاء",
    icon: <Plus className="h-3 w-3" />,
    color: "bg-green-100 text-green-800 border-green-200",
  },
  UPDATE: {
    label: "تحديث",
    icon: <Pencil className="h-3 w-3" />,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  DELETE: {
    label: "حذف",
    icon: <Trash2 className="h-3 w-3" />,
    color: "bg-red-100 text-red-800 border-red-200",
  },
  STATE_CHANGE: {
    label: "تغيير حالة",
    icon: <RefreshCcw className="h-3 w-3" />,
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
};

// ============================================================
// Entity Type Labels
// تسميات انواع الكيانات
// ============================================================

const ENTITY_TYPE_LABELS: Record<string, string> = {
  product: "منتج",
  contract: "عقد",
  reservation: "حجز",
  customer: "عميل",
  category: "فئة",
};

// ============================================================
// Mock Data: 8 Audit Entries
// بيانات تجريبية: 8 سجلات تدقيق
// ============================================================

interface AuditEntry {
  id: number;
  tenant_id: number;
  entity_type: string;
  entity_id: number;
  action: AuditAction;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  user_id: string;
  ip: string;
  created_at: string;
}

const mockAuditEntries: AuditEntry[] = [
  {
    id: 1,
    tenant_id: 1,
    entity_type: "product",
    entity_id: 101,
    action: "CREATE",
    old_data: null,
    new_data: {
      name_ar: "هاتف ذكي سامسونج A54",
      name_en: "Samsung A54",
      type: "PHYSICAL",
      status: "DRAFT",
    },
    user_id: "ahmed.ali",
    ip: "192.168.1.45",
    created_at: "2024-07-15T14:32:10Z",
  },
  {
    id: 2,
    tenant_id: 1,
    entity_type: "product",
    entity_id: 101,
    action: "UPDATE",
    old_data: { base_price: 85000, currency: "YER" },
    new_data: { base_price: 79500, currency: "YER" },
    user_id: "ahmed.ali",
    ip: "192.168.1.45",
    created_at: "2024-07-15T15:10:22Z",
  },
  {
    id: 3,
    tenant_id: 1,
    entity_type: "product",
    entity_id: 101,
    action: "STATE_CHANGE",
    old_data: { status: "DRAFT" },
    new_data: { status: "ACTIVE" },
    user_id: "manager.omar",
    ip: "192.168.1.20",
    created_at: "2024-07-15T16:45:00Z",
  },
  {
    id: 4,
    tenant_id: 1,
    entity_type: "contract",
    entity_id: 501,
    action: "CREATE",
    old_data: null,
    new_data: {
      customer_id: 201,
      product_id: 102,
      principal: 500000,
      currency: "YER",
      interest_type: "REDUCING",
      term_months: 12,
    },
    user_id: "finance.sara",
    ip: "10.0.0.15",
    created_at: "2024-07-14T09:20:15Z",
  },
  {
    id: 5,
    tenant_id: 1,
    entity_type: "reservation",
    entity_id: 301,
    action: "CREATE",
    old_data: null,
    new_data: {
      product_id: 103,
      customer_id: 205,
      start_date: "2024-08-01",
      end_date: "2024-08-05",
      status: "HOLD",
    },
    user_id: "reception.noor",
    ip: "172.16.0.55",
    created_at: "2024-07-14T11:05:30Z",
  },
  {
    id: 6,
    tenant_id: 1,
    entity_type: "reservation",
    entity_id: 301,
    action: "STATE_CHANGE",
    old_data: { status: "HOLD" },
    new_data: { status: "CONFIRMED" },
    user_id: "reception.noor",
    ip: "172.16.0.55",
    created_at: "2024-07-14T11:30:00Z",
  },
  {
    id: 7,
    tenant_id: 1,
    entity_type: "customer",
    entity_id: 205,
    action: "UPDATE",
    old_data: { phone: "+967771234567", kyc_level: "BASIC" },
    new_data: { phone: "+967777654321", kyc_level: "ENHANCED" },
    user_id: "ahmed.ali",
    ip: "192.168.1.45",
    created_at: "2024-07-13T08:15:45Z",
  },
  {
    id: 8,
    tenant_id: 1,
    entity_type: "category",
    entity_id: 10,
    action: "DELETE",
    old_data: {
      name_ar: "اكسسوارات قديمة",
      name_en: "Old Accessories",
      is_active: false,
    },
    new_data: null,
    user_id: "admin.root",
    ip: "192.168.1.1",
    created_at: "2024-07-12T17:00:00Z",
  },
];

// ============================================================
// Mock Data: 4 State Transitions
// بيانات تجريبية: 4 انتقالات حالة
// ============================================================

interface StateTransitionEntry {
  id: number;
  tenant_id: number;
  entity_type: string;
  entity_id: number;
  from_state: string;
  to_state: string;
  triggered_by: string;
  created_at: string;
}

const mockStateTransitions: StateTransitionEntry[] = [
  {
    id: 1,
    tenant_id: 1,
    entity_type: "product",
    entity_id: 101,
    from_state: "DRAFT",
    to_state: "ACTIVE",
    triggered_by: "manager.omar",
    created_at: "2024-07-15T16:45:00Z",
  },
  {
    id: 2,
    tenant_id: 1,
    entity_type: "contract",
    entity_id: 501,
    from_state: "DRAFT",
    to_state: "ACTIVE",
    triggered_by: "finance.sara",
    created_at: "2024-07-14T10:00:00Z",
  },
  {
    id: 3,
    tenant_id: 1,
    entity_type: "reservation",
    entity_id: 301,
    from_state: "HOLD",
    to_state: "CONFIRMED",
    triggered_by: "reception.noor",
    created_at: "2024-07-14T11:30:00Z",
  },
  {
    id: 4,
    tenant_id: 1,
    entity_type: "contract",
    entity_id: 502,
    from_state: "ACTIVE",
    to_state: "IN_ARREARS",
    triggered_by: "system.scheduler",
    created_at: "2024-07-13T00:05:00Z",
  },
];

// ============================================================
// Mock Data: 5 Domain Events
// بيانات تجريبية: 5 احداث نطاق
// ============================================================

interface DomainEventEntry {
  id: number;
  tenant_id: number;
  aggregate_type: string;
  aggregate_id: number;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

const mockDomainEvents: DomainEventEntry[] = [
  {
    id: 1,
    tenant_id: 1,
    aggregate_type: "contract",
    aggregate_id: 501,
    event_type: "ContractCreated",
    payload: {
      customer_id: 201,
      principal: 500000,
      currency: "YER",
      term_months: 12,
    },
    created_at: "2024-07-14T09:20:15Z",
  },
  {
    id: 2,
    tenant_id: 1,
    aggregate_type: "contract",
    aggregate_id: 501,
    event_type: "InstallmentsGenerated",
    payload: {
      count: 12,
      first_due: "2024-08-14",
      last_due: "2025-07-14",
      total_amount: 545000,
    },
    created_at: "2024-07-14T09:20:16Z",
  },
  {
    id: 3,
    tenant_id: 1,
    aggregate_type: "contract",
    aggregate_id: 501,
    event_type: "PaymentReceived",
    payload: {
      payment_id: 801,
      amount: 45416.67,
      currency: "YER",
      idempotency_key: "PAY-2024-0801",
    },
    created_at: "2024-07-15T10:30:00Z",
  },
  {
    id: 4,
    tenant_id: 1,
    aggregate_type: "product",
    aggregate_id: 101,
    event_type: "ProductActivated",
    payload: {
      approved_by: "manager.omar",
      version_id: 1,
      channels: ["WEB", "MOBILE"],
    },
    created_at: "2024-07-15T16:45:00Z",
  },
  {
    id: 5,
    tenant_id: 1,
    aggregate_type: "reservation",
    aggregate_id: 301,
    event_type: "ReservationConfirmed",
    payload: {
      customer_id: 205,
      product_id: 103,
      start_date: "2024-08-01",
      end_date: "2024-08-05",
      total_amount: 120000,
    },
    created_at: "2024-07-14T11:30:00Z",
  },
];

// ============================================================
// Helpers
// ============================================================

/** Format ISO date to Arabic locale string / تنسيق التاريخ بالعربية */
function formatArabicDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Format ISO date to short Arabic locale / تنسيق تاريخ مختصر */
function formatArabicDateShort(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("ar-EG", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Determine if a date is today / هل التاريخ اليوم */
function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

// ============================================================
// Domain Event Type Config
// اعدادات انواع احداث النطاق
// ============================================================

const EVENT_TYPE_CONFIG: Record<string, { color: string }> = {
  ContractCreated: { color: "bg-green-100 text-green-800 border-green-200" },
  InstallmentsGenerated: { color: "bg-blue-100 text-blue-800 border-blue-200" },
  PaymentReceived: { color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  ProductActivated: { color: "bg-purple-100 text-purple-800 border-purple-200" },
  ReservationConfirmed: { color: "bg-amber-100 text-amber-800 border-amber-200" },
};

// ============================================================
// State Color Helper
// ============================================================

const STATE_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  ACTIVE: "bg-green-100 text-green-700",
  SUSPENDED: "bg-yellow-100 text-yellow-700",
  RETIRED: "bg-red-100 text-red-700",
  IN_ARREARS: "bg-orange-100 text-orange-700",
  RESTRUCTURED: "bg-blue-100 text-blue-700",
  WRITTEN_OFF: "bg-red-100 text-red-700",
  CLOSED: "bg-slate-100 text-slate-700",
  HOLD: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-700",
  COMPLETED: "bg-blue-100 text-blue-700",
};

function getStateColor(state: string): string {
  return STATE_COLORS[state] || "bg-gray-100 text-gray-700";
}

// ============================================================
// JSON Diff Display Component
// عرض الفرق بين البيانات القديمة والجديدة
// ============================================================

function JsonDiffView({
  oldData,
  newData,
}: {
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      <div className="p-4 bg-muted/30 border-t">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Old Data */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-red-600">
              <Trash2 className="h-3.5 w-3.5" />
              البيانات السابقة
            </div>
            {oldData ? (
              <pre
                className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed"
                dir="ltr"
              >
                {JSON.stringify(oldData, null, 2)}
              </pre>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-muted-foreground text-center">
                لا توجد بيانات سابقة (سجل جديد)
              </div>
            )}
          </div>
          {/* New Data */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-green-600">
              <Plus className="h-3.5 w-3.5" />
              البيانات الجديدة
            </div>
            {newData ? (
              <pre
                className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed"
                dir="ltr"
              >
                {JSON.stringify(newData, null, 2)}
              </pre>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-muted-foreground text-center">
                لا توجد بيانات جديدة (تم الحذف)
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// Main Component
// المكون الرئيسي
// ============================================================

export default function AuditScreen() {
  // Filter state
  const [dateFrom, setDateFrom] = useState("2024-07-12");
  const [dateTo, setDateTo] = useState("2024-07-15");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("ALL");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [userSearch, setUserSearch] = useState("");

  // Expandable rows
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Toggle row expansion
  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filter audit entries
  const filteredEntries = mockAuditEntries.filter((entry) => {
    if (entityTypeFilter !== "ALL" && entry.entity_type !== entityTypeFilter)
      return false;
    if (actionFilter !== "ALL" && entry.action !== actionFilter) return false;
    if (
      userSearch &&
      !entry.user_id.toLowerCase().includes(userSearch.toLowerCase())
    )
      return false;
    // Date range filtering
    const entryDate = entry.created_at.slice(0, 10);
    if (dateFrom && entryDate < dateFrom) return false;
    if (dateTo && entryDate > dateTo) return false;
    return true;
  });

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize));
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Stats
  const totalEntries = mockAuditEntries.length;
  const todayEntries = mockAuditEntries.filter((e) => isToday(e.created_at)).length;

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ==================== Header ==================== */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-6 w-6" />
              سجل التدقيق
            </h1>
            <p className="text-muted-foreground mt-1">
              مراجعة جميع العمليات وتتبع التغييرات وانتقالات الحالة واحداث النطاق
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Stats badges */}
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="outline" className="gap-1 text-xs py-1 px-2.5">
                <FileText className="h-3 w-3" />
                الاجمالي: {totalEntries.toLocaleString("ar-EG")}
              </Badge>
              <Badge variant="outline" className="gap-1 text-xs py-1 px-2.5">
                <Clock className="h-3 w-3" />
                اليوم: {todayEntries.toLocaleString("ar-EG")}
              </Badge>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 ml-1" />
              تصدير
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ==================== Filter Bar ==================== */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              {/* Date From */}
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  من تاريخ
                </label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pr-9"
                  />
                </div>
              </div>
              {/* Date To */}
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  الى تاريخ
                </label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pr-9"
                  />
                </div>
              </div>
              {/* Entity Type */}
              <div className="w-44 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  نوع الكيان
                </label>
                <Select
                  value={entityTypeFilter}
                  onValueChange={(v) => {
                    setEntityTypeFilter(v);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <Filter className="h-4 w-4 ml-2" />
                    <SelectValue placeholder="الكيان" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">جميع الكيانات</SelectItem>
                    <SelectItem value="product">منتج</SelectItem>
                    <SelectItem value="contract">عقد</SelectItem>
                    <SelectItem value="reservation">حجز</SelectItem>
                    <SelectItem value="customer">عميل</SelectItem>
                    <SelectItem value="category">فئة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Action Type */}
              <div className="w-44 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  نوع الاجراء
                </label>
                <Select
                  value={actionFilter}
                  onValueChange={(v) => {
                    setActionFilter(v);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="الاجراء" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">جميع الاجراءات</SelectItem>
                    <SelectItem value="CREATE">انشاء</SelectItem>
                    <SelectItem value="UPDATE">تحديث</SelectItem>
                    <SelectItem value="DELETE">حذف</SelectItem>
                    <SelectItem value="STATE_CHANGE">تغيير حالة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* User Search */}
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  المستخدم
                </label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث بالمستخدم..."
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pr-9"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ==================== Audit Log Table ==================== */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                سجلات التدقيق ({filteredEntries.length.toLocaleString("ar-EG")})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-10"></TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الكيان</TableHead>
                  <TableHead>الاجراء</TableHead>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead className="text-center">تفاصيل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEntries.map((entry, idx) => {
                  const actionConf = ACTION_CONFIG[entry.action];
                  const isExpanded = expandedRows.has(entry.id);
                  const entityLabel =
                    ENTITY_TYPE_LABELS[entry.entity_type] || entry.entity_type;

                  return (
                    <motion.tbody
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <TableRow
                        className="cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => toggleRow(entry.id)}
                      >
                        <TableCell className="w-10 text-center">
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-xs">
                              {formatArabicDate(entry.created_at)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-xs gap-1 py-0.5"
                            >
                              {entityLabel}
                            </Badge>
                            <span className="font-mono text-xs text-muted-foreground">
                              #{entry.entity_id}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`gap-1 ${actionConf.color} hover:${actionConf.color}`}
                          >
                            {actionConf.icon}
                            {actionConf.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-sm font-mono">
                              {entry.user_id}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-xs font-mono text-muted-foreground">
                              {entry.ip}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow(entry.id);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {/* Expandable diff row */}
                      <tr>
                        <td colSpan={7} className="p-0">
                          <AnimatePresence>
                            {isExpanded && (
                              <JsonDiffView
                                oldData={entry.old_data}
                                newData={entry.new_data}
                              />
                            )}
                          </AnimatePresence>
                        </td>
                      </tr>
                    </motion.tbody>
                  );
                })}
                {paginatedEntries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-muted-foreground text-sm">
                        لا توجد سجلات تدقيق مطابقة لمعايير البحث
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                عرض {paginatedEntries.length.toLocaleString("ar-EG")} من{" "}
                {filteredEntries.length.toLocaleString("ar-EG")} سجل
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  صفحة {currentPage.toLocaleString("ar-EG")} من{" "}
                  {totalPages.toLocaleString("ar-EG")}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ==================== State Transitions Section ==================== */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              انتقالات الحالة الاخيرة
              <Badge variant="outline" className="text-xs font-normal mr-2">
                {mockStateTransitions.length.toLocaleString("ar-EG")} انتقال
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockStateTransitions.map((transition, idx) => {
              const entityLabel =
                ENTITY_TYPE_LABELS[transition.entity_type] ||
                transition.entity_type;
              return (
                <motion.div
                  key={transition.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  {/* Entity info */}
                  <div className="flex items-center gap-2 min-w-[140px]">
                    <Badge variant="outline" className="text-xs gap-1 py-0.5">
                      {entityLabel}
                    </Badge>
                    <span className="font-mono text-xs text-muted-foreground">
                      #{transition.entity_id}
                    </span>
                  </div>

                  {/* State transition arrow */}
                  <div className="flex items-center gap-2 flex-1">
                    <Badge
                      className={`text-xs ${getStateColor(transition.from_state)}`}
                    >
                      {transition.from_state}
                    </Badge>
                    <ArrowLeftRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Badge
                      className={`text-xs ${getStateColor(transition.to_state)}`}
                    >
                      {transition.to_state}
                    </Badge>
                  </div>

                  {/* Triggered by */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-[130px]">
                    <User className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-mono">{transition.triggered_by}</span>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-[120px]">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>{formatArabicDateShort(transition.created_at)}</span>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* ==================== Domain Events Section ==================== */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4" />
              احداث النطاق الاخيرة
              <Badge variant="outline" className="text-xs font-normal mr-2">
                Event Sourcing
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockDomainEvents.map((event, idx) => {
              const eventColor =
                EVENT_TYPE_CONFIG[event.event_type]?.color ||
                "bg-gray-100 text-gray-800 border-gray-200";
              const aggregateLabel =
                ENTITY_TYPE_LABELS[event.aggregate_type] ||
                event.aggregate_type;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors space-y-2"
                >
                  {/* Top row: aggregate, event type, timestamp */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs gap-1 py-0.5"
                      >
                        <Activity className="h-3 w-3" />
                        {aggregateLabel}
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">
                        #{event.aggregate_id}
                      </span>
                      <Badge className={`text-xs gap-1 ${eventColor}`}>
                        <Zap className="h-3 w-3" />
                        {event.event_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatArabicDateShort(event.created_at)}</span>
                    </div>
                  </div>

                  {/* Payload preview */}
                  <div className="bg-background rounded border p-2">
                    <pre
                      className="text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed text-muted-foreground"
                      dir="ltr"
                    >
                      {JSON.stringify(event.payload, null, 2)}
                    </pre>
                  </div>
                </motion.div>
              );
            })}

            {/* Event sourcing note */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700">
              <Activity className="h-4 w-4 shrink-0" />
              <span>
                يتم تسجيل جميع الاحداث في جدول{" "}
                <span className="font-mono font-medium">domain_event</span>{" "}
                كمصدر وحيد للحقيقة (Event Sourcing) ونشرها عبر Kafka للخدمات
                المشتركة.
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

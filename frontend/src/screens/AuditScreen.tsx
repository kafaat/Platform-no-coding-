import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Download,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Clock,
  User,
  Check,
  X,
  Activity,
  FileText,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================================
// Types
// ============================================================

interface MockAuditEntry {
  id: number;
  timestamp: string;
  user_id: string;
  user_name: string;
  entity_type: string;
  entity_id: number;
  action: string;
  ip_address: string;
  changes: { field: string; old_value: unknown; new_value: unknown }[];
  metadata: Record<string, unknown>;
}

// ============================================================
// Toast
// ============================================================

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${t.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
          >
            {t.type === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {t.message}
            <button onClick={() => onDismiss(t.id)} className="mr-2 hover:opacity-70"><X className="h-3 w-3" /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Action Config
// ============================================================

const ACTION_CONFIG: Record<string, { label: string; color: string }> = {
  CREATE: { label: "إنشاء", color: "bg-green-100 text-green-800 border-green-200" },
  UPDATE: { label: "تحديث", color: "bg-blue-100 text-blue-800 border-blue-200" },
  DELETE: { label: "حذف", color: "bg-red-100 text-red-800 border-red-200" },
  ACTIVATE: { label: "تفعيل", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  DEACTIVATE: { label: "تعطيل", color: "bg-amber-100 text-amber-800 border-amber-200" },
  LOGIN: { label: "تسجيل دخول", color: "bg-purple-100 text-purple-800 border-purple-200" },
  PAYMENT: { label: "دفعة", color: "bg-teal-100 text-teal-800 border-teal-200" },
  APPROVE: { label: "اعتماد", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
};

const ENTITY_TYPES = ["PRODUCT", "CONTRACT", "CUSTOMER", "PRICE_LIST", "CATEGORY", "RESERVATION", "PAYMENT", "USER"];
const ACTIONS = ["CREATE", "UPDATE", "DELETE", "ACTIVATE", "DEACTIVATE", "LOGIN", "PAYMENT", "APPROVE"];

const ENTITY_TYPE_LABELS: Record<string, string> = {
  PRODUCT: "منتج",
  CONTRACT: "عقد",
  CUSTOMER: "عميل",
  PRICE_LIST: "قائمة أسعار",
  CATEGORY: "فئة",
  RESERVATION: "حجز",
  PAYMENT: "دفعة",
  USER: "مستخدم",
};

// ============================================================
// Mock Data
// ============================================================

const generateMockEntries = (): MockAuditEntry[] => {
  const entries: MockAuditEntry[] = [
    { id: 1, timestamp: "2024-12-15T14:30:22Z", user_id: "U001", user_name: "أحمد محمد", entity_type: "PRODUCT", entity_id: 101, action: "CREATE", ip_address: "192.168.1.10", changes: [{ field: "name_ar", old_value: null, new_value: "هاتف ذكي سامسونج A54" }, { field: "type", old_value: null, new_value: "PHYSICAL" }, { field: "status", old_value: null, new_value: "DRAFT" }], metadata: { channel: "WEB", browser: "Chrome 120" } },
    { id: 2, timestamp: "2024-12-15T14:25:11Z", user_id: "U002", user_name: "سارة أحمد", entity_type: "PRICE_LIST", entity_id: 3, action: "UPDATE", ip_address: "10.0.0.45", changes: [{ field: "valid_to", old_value: "2024-12-31", new_value: "2025-06-30" }, { field: "currency", old_value: "YER", new_value: "SAR" }], metadata: { channel: "API" } },
    { id: 3, timestamp: "2024-12-15T13:45:33Z", user_id: "U001", user_name: "أحمد محمد", entity_type: "CONTRACT", entity_id: 567, action: "ACTIVATE", ip_address: "192.168.1.10", changes: [{ field: "status", old_value: "DRAFT", new_value: "ACTIVE" }], metadata: { approved_by: "U003", approval_date: "2024-12-15" } },
    { id: 4, timestamp: "2024-12-15T12:10:05Z", user_id: "U003", user_name: "خالد عبدالله", entity_type: "CUSTOMER", entity_id: 42, action: "UPDATE", ip_address: "172.16.0.88", changes: [{ field: "kyc_level", old_value: "BASIC", new_value: "FULL" }, { field: "risk_score", old_value: 450, new_value: 720 }], metadata: { verification_method: "manual" } },
    { id: 5, timestamp: "2024-12-15T11:30:00Z", user_id: "U004", user_name: "فاطمة علي", entity_type: "RESERVATION", entity_id: 89, action: "CREATE", ip_address: "10.0.0.22", changes: [{ field: "status", old_value: null, new_value: "HOLD" }, { field: "room_type", old_value: null, new_value: "SUITE" }], metadata: { channel: "MOBILE", ttl_minutes: 30 } },
    { id: 6, timestamp: "2024-12-15T10:15:44Z", user_id: "U002", user_name: "سارة أحمد", entity_type: "CATEGORY", entity_id: 5, action: "DEACTIVATE", ip_address: "10.0.0.45", changes: [{ field: "is_active", old_value: true, new_value: false }], metadata: { reason: "restructuring" } },
    { id: 7, timestamp: "2024-12-14T16:20:00Z", user_id: "U005", user_name: "محمد يوسف", entity_type: "PAYMENT", entity_id: 1234, action: "PAYMENT", ip_address: "192.168.2.5", changes: [{ field: "amount", old_value: 0, new_value: 150000 }, { field: "currency", old_value: null, new_value: "YER" }], metadata: { idempotency_key: "PAY-2024-1234", contract_id: 567 } },
    { id: 8, timestamp: "2024-12-14T15:00:00Z", user_id: "U003", user_name: "خالد عبدالله", entity_type: "PRODUCT", entity_id: 102, action: "APPROVE", ip_address: "172.16.0.88", changes: [{ field: "status", old_value: "DRAFT", new_value: "ACTIVE" }, { field: "approved_by", old_value: null, new_value: "U003" }], metadata: { maker: "U001", checker: "U003" } },
    { id: 9, timestamp: "2024-12-14T14:30:00Z", user_id: "U001", user_name: "أحمد محمد", entity_type: "USER", entity_id: 6, action: "LOGIN", ip_address: "192.168.1.10", changes: [], metadata: { session_id: "SES-abc123", browser: "Firefox 121" } },
    { id: 10, timestamp: "2024-12-14T11:00:00Z", user_id: "U004", user_name: "فاطمة علي", entity_type: "PRODUCT", entity_id: 103, action: "DELETE", ip_address: "10.0.0.22", changes: [{ field: "name_ar", old_value: "منتج تجريبي", new_value: null }], metadata: { reason: "duplicate entry" } },
    { id: 11, timestamp: "2024-12-13T09:00:00Z", user_id: "U002", user_name: "سارة أحمد", entity_type: "CONTRACT", entity_id: 568, action: "CREATE", ip_address: "10.0.0.45", changes: [{ field: "type", old_value: null, new_value: "PERSONAL_LOAN" }, { field: "amount", old_value: null, new_value: 500000 }], metadata: { channel: "POS" } },
    { id: 12, timestamp: "2024-12-13T08:30:00Z", user_id: "U005", user_name: "محمد يوسف", entity_type: "RESERVATION", entity_id: 90, action: "UPDATE", ip_address: "192.168.2.5", changes: [{ field: "status", old_value: "HOLD", new_value: "CONFIRMED" }], metadata: { payment_ref: "PAY-90-01" } },
  ];
  return entries;
};

// ============================================================
// Animation Variants
// ============================================================

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// ============================================================
// Helpers
// ============================================================

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />;
}

function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <Table>
      <TableHeader><TableRow className="bg-muted/50">{Array.from({ length: cols }).map((_, i) => <TableHead key={i}><Skeleton className="h-4 w-20" /></TableHead>)}</TableRow></TableHeader>
      <TableBody>{Array.from({ length: rows }).map((_, r) => <TableRow key={r}>{Array.from({ length: cols }).map((_, c) => <TableCell key={c}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>)}</TableBody>
    </Table>
  );
}

/** Simple JSON syntax coloring for diffs */
function JsonDiff({ changes }: { changes: MockAuditEntry["changes"] }) {
  if (changes.length === 0) return <span className="text-xs text-muted-foreground">بدون تغييرات</span>;
  return (
    <div className="space-y-1.5 text-xs font-mono">
      {changes.map((c, i) => (
        <div key={i} className="p-2 bg-muted/50 rounded border">
          <span className="text-blue-600 font-semibold">{c.field}</span>
          <div className="flex items-center gap-2 mt-1">
            {c.old_value !== null && (
              <span className="px-1.5 py-0.5 bg-red-50 text-red-700 rounded border border-red-200 line-through">
                {JSON.stringify(c.old_value)}
              </span>
            )}
            <span className="text-muted-foreground">{'-->'}</span>
            {c.new_value !== null ? (
              <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded border border-green-200">
                {JSON.stringify(c.new_value)}
              </span>
            ) : (
              <span className="px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded border border-gray-200 italic">null</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Constants
// ============================================================

const PAGE_SIZE = 5;

// ============================================================
// Main Component
// ============================================================

export default function AuditScreen() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<MockAuditEntry[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [entityFilter, setEntityFilter] = useState<string>("ALL");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Live polling
  const [polling, setPolling] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addToast = useCallback((message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  const dismissToast = useCallback((id: number) => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, []);

  // Initial load
  useEffect(() => {
    const timer = setTimeout(() => { setEntries(generateMockEntries()); setLoading(false); }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Live polling every 10 seconds
  useEffect(() => {
    if (polling) {
      pollingRef.current = setInterval(() => {
        setLastRefresh(new Date());
        // Simulate: occasionally add a new entry at the top
        if (Math.random() > 0.5) {
          setEntries((prev) => {
            const newId = Math.max(0, ...prev.map((e) => e.id)) + 1;
            const randomAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
            const randomEntity = ENTITY_TYPES[Math.floor(Math.random() * ENTITY_TYPES.length)];
            const newEntry: MockAuditEntry = {
              id: newId,
              timestamp: new Date().toISOString(),
              user_id: "U001",
              user_name: "نظام التحديث التلقائي",
              entity_type: randomEntity,
              entity_id: Math.floor(Math.random() * 1000),
              action: randomAction,
              ip_address: "10.0.0.1",
              changes: [{ field: "auto_refresh", old_value: null, new_value: "polled" }],
              metadata: { source: "auto_poll" },
            };
            return [newEntry, ...prev];
          });
        }
      }, 10000);
      return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    } else {
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
  }, [polling]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches = entry.user_name.includes(searchTerm) || entry.entity_type.toLowerCase().includes(term) || entry.action.toLowerCase().includes(term) || String(entry.entity_id).includes(searchTerm) || entry.ip_address.includes(searchTerm);
        if (!matches) return false;
      }
      // Entity type
      if (entityFilter !== "ALL" && entry.entity_type !== entityFilter) return false;
      // Action
      if (actionFilter !== "ALL" && entry.action !== actionFilter) return false;
      // Date range
      if (dateFrom) {
        const entryDate = new Date(entry.timestamp).toISOString().slice(0, 10);
        if (entryDate < dateFrom) return false;
      }
      if (dateTo) {
        const entryDate = new Date(entry.timestamp).toISOString().slice(0, 10);
        if (entryDate > dateTo) return false;
      }
      return true;
    });
  }, [entries, searchTerm, entityFilter, actionFilter, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  const paginatedEntries = filteredEntries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, entityFilter, actionFilter, dateFrom, dateTo]);

  // Stats
  const totalEntries = entries.length;
  const todayCount = entries.filter((e) => new Date(e.timestamp).toDateString() === new Date().toDateString()).length;
  const uniqueUsers = new Set(entries.map((e) => e.user_id)).size;

  // Export filtered entries
  function handleExport() {
    const data = JSON.stringify(filteredEntries, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(`تم تصدير ${filteredEntries.length} سجل بنجاح`, "success");
  }

  function handleManualRefresh() {
    setLastRefresh(new Date());
    addToast("تم تحديث السجلات", "success");
  }

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6" />سجل التدقيق</h1>
          <p className="text-muted-foreground mt-1">تتبع جميع العمليات والتغييرات في النظام</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredEntries.length === 0}>
            <Download className="h-4 w-4 ml-1" />تصدير ({filteredEntries.length.toLocaleString('ar-EG')})
          </Button>
          <Button variant="outline" size="sm" onClick={handleManualRefresh}>
            <RefreshCcw className="h-4 w-4 ml-1" />تحديث
          </Button>
        </div>
      </div>

      {/* Stats + Polling Indicator */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {loading ? [1, 2, 3, 4].map((i) => <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>) : (
          <>
            <Card className="hover:shadow-md transition-shadow"><CardContent className="p-5"><div className="flex items-start justify-between"><div className="space-y-1"><p className="text-sm text-muted-foreground font-medium">إجمالي السجلات</p><p className="text-2xl font-bold">{totalEntries.toLocaleString('ar-EG')}</p></div><div className="p-3 rounded-lg bg-blue-50 text-blue-600"><FileText className="h-5 w-5" /></div></div></CardContent></Card>
            <Card className="hover:shadow-md transition-shadow"><CardContent className="p-5"><div className="flex items-start justify-between"><div className="space-y-1"><p className="text-sm text-muted-foreground font-medium">سجلات اليوم</p><p className="text-2xl font-bold">{todayCount.toLocaleString('ar-EG')}</p></div><div className="p-3 rounded-lg bg-emerald-50 text-emerald-600"><Activity className="h-5 w-5" /></div></div></CardContent></Card>
            <Card className="hover:shadow-md transition-shadow"><CardContent className="p-5"><div className="flex items-start justify-between"><div className="space-y-1"><p className="text-sm text-muted-foreground font-medium">المستخدمون النشطون</p><p className="text-2xl font-bold">{uniqueUsers.toLocaleString('ar-EG')}</p></div><div className="p-3 rounded-lg bg-purple-50 text-purple-600"><User className="h-5 w-5" /></div></div></CardContent></Card>
            <Card className={`hover:shadow-md transition-shadow ${polling ? "border-green-200" : "border-gray-200"}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">التحديث التلقائي</p>
                    <div className="flex items-center gap-2">
                      {polling ? (
                        <span className="flex items-center gap-1.5 text-sm text-green-700"><span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" /></span>مباشر</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-sm text-gray-500"><WifiOff className="h-3.5 w-3.5" />متوقف</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{lastRefresh.toLocaleTimeString("ar-EG")}</p>
                  </div>
                  <Button variant={polling ? "default" : "outline"} size="sm" className="h-8 text-xs" onClick={() => setPolling(!polling)}>
                    {polling ? <><WifiOff className="h-3 w-3 ml-1" />إيقاف</> : <><Wifi className="h-3 w-3 ml-1" />تشغيل</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="بحث بالمستخدم، الكيان، IP..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-9" />
              </div>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="نوع الكيان" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">جميع الكيانات</SelectItem>
                  {ENTITY_TYPES.map((t) => <SelectItem key={t} value={t}>{ENTITY_TYPE_LABELS[t] ?? t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="الإجراء" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">جميع الإجراءات</SelectItem>
                  {ACTIONS.map((a) => <SelectItem key={a} value={a}>{ACTION_CONFIG[a]?.label ?? a}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36" placeholder="من" />
                <span className="text-xs text-muted-foreground">إلى</span>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36" placeholder="إلى" />
              </div>
              {(searchTerm || entityFilter !== "ALL" || actionFilter !== "ALL" || dateFrom || dateTo) && (
                <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(""); setEntityFilter("ALL"); setActionFilter("ALL"); setDateFrom(""); setDateTo(""); }}>
                  <X className="h-4 w-4 ml-1" />مسح الفلاتر
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Audit Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" />سجلات التدقيق ({filteredEntries.length.toLocaleString('ar-EG')})</span>
              {polling && <span className="flex items-center gap-1.5 text-xs text-green-600"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" /></span>تحديث مباشر كل 10 ثوانٍ</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? <TableSkeleton rows={5} cols={6} /> : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-10"></TableHead>
                    <TableHead>الوقت</TableHead>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>الكيان</TableHead>
                    <TableHead>الإجراء</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEntries.map((entry, idx) => {
                    const actionConfig = ACTION_CONFIG[entry.action] ?? { label: entry.action, color: "bg-gray-100 text-gray-800" };
                    const isExpanded = expandedId === entry.id;
                    return (
                      <motion.tr key={entry.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                        className="border-b transition-colors cursor-pointer hover:bg-muted/30"
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      >
                        <TableCell className="text-center" aria-label={isExpanded ? "طي التفاصيل" : "عرض التفاصيل"}>
                          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-mono">{new Date(entry.timestamp).toLocaleDateString("ar-EG")}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{new Date(entry.timestamp).toLocaleTimeString("ar-EG")}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{entry.user_name}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{entry.user_id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <Badge variant="outline" className="text-[10px]">{ENTITY_TYPE_LABELS[entry.entity_type] ?? entry.entity_type}</Badge>
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">#{entry.entity_id}</p>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className={actionConfig.color}>{actionConfig.label}</Badge></TableCell>
                        <TableCell><code className="text-xs font-mono text-muted-foreground">{entry.ip_address}</code></TableCell>
                      </motion.tr>
                    );
                  })}
                  {/* Expanded detail rows rendered separately */}
                  {paginatedEntries.map((entry) => {
                    if (expandedId !== entry.id) return null;
                    return (
                      <motion.tr key={`${entry.id}-detail`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <TableCell colSpan={6} className="bg-muted/20 p-0">
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground mb-2">التغييرات</h4>
                                <JsonDiff changes={entry.changes} />
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground mb-2">البيانات الوصفية</h4>
                                <pre className="text-xs font-mono bg-muted/50 p-3 rounded border overflow-auto max-h-40 whitespace-pre-wrap">
                                  {JSON.stringify(entry.metadata, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </motion.div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                  {paginatedEntries.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-30" /><p className="text-sm">لا توجد سجلات مطابقة للفلاتر</p>
                    </TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                عرض {Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredEntries.length).toLocaleString('ar-EG')}-{Math.min(currentPage * PAGE_SIZE, filteredEntries.length).toLocaleString('ar-EG')} من {filteredEntries.length.toLocaleString('ar-EG')} سجل
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                  <ChevronRight className="h-4 w-4" />السابق
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button key={page} variant={page === currentPage ? "default" : "outline"} size="sm" className="w-8 h-8 p-0" onClick={() => setCurrentPage(page)}>
                      {page.toLocaleString('ar-EG')}
                    </Button>
                  ))}
                </div>
                <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
                  التالي<ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

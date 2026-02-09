import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hash,
  Plus,
  Search,
  Eye,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Activity,
  RefreshCcw,
  Copy,
  AlertCircle,
  CheckCircle2,
  Check,
  X,
  AlertTriangle,
  Play,
  Timer,
  RotateCcw,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GapPolicy } from "@/types";

// ============================================================
// Types
// ============================================================

interface MockNumberingScheme {
  id: number;
  tenant_id: number;
  code: string;
  pattern: string;
  context: Record<string, string>;
  gap_policy: GapPolicy;
}

interface MockNumberingSequence {
  id: number;
  scheme_id: number;
  scheme_code: string;
  branch_code: string;
  channel_code: string | null;
  current_value: number;
  reserved_until: string | null;
  status: "ACTIVE" | "EXHAUSTED";
}

// ============================================================
// Toast
// ============================================================

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "warning";
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
              t.type === "success" ? "bg-green-600 text-white"
                : t.type === "warning" ? "bg-amber-500 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {t.type === "success" ? <Check className="h-4 w-4" /> : t.type === "warning" ? <AlertTriangle className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {t.message}
            <button onClick={() => onDismiss(t.id)} className="mr-2 hover:opacity-70"><X className="h-3 w-3" /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Gap Policy Config
// ============================================================

const GAP_POLICY_CONFIG: Record<GapPolicy, { label: string; color: string; icon: React.ReactNode }> = {
  ALLOW: { label: "مسموح", color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle2 className="h-3 w-3" /> },
  DENY: { label: "ممنوع", color: "bg-red-100 text-red-800 border-red-200", icon: <AlertCircle className="h-3 w-3" /> },
  REUSE: { label: "إعادة استخدام", color: "bg-amber-100 text-amber-800 border-amber-200", icon: <RefreshCcw className="h-3 w-3" /> },
};

// ============================================================
// Mock Data
// ============================================================

const initialSchemes: MockNumberingScheme[] = [
  { id: 1, tenant_id: 1, code: "PRODUCT_CODE", pattern: "PRD-{TYPE}-{SEQ:6}", context: { description: "Product identifier" }, gap_policy: "ALLOW" },
  { id: 2, tenant_id: 1, code: "CONTRACT_NUM", pattern: "FIN-{TYPE}-{YEAR}-{BRANCH}-{SEQ:6}", context: { description: "Financial contract number" }, gap_policy: "DENY" },
  { id: 3, tenant_id: 1, code: "INVOICE_NUM", pattern: "INV-{YEAR}-{SEQ:8}", context: { description: "Invoice number" }, gap_policy: "DENY" },
  { id: 4, tenant_id: 1, code: "RESERVATION_NUM", pattern: "RSV-{YEAR}-{SEQ:6}", context: { description: "Reservation number" }, gap_policy: "ALLOW" },
];

const initialSequences: MockNumberingSequence[] = [
  { id: 1, scheme_id: 1, scheme_code: "PRODUCT_CODE", branch_code: "HQ", channel_code: null, current_value: 142, reserved_until: null, status: "ACTIVE" },
  { id: 2, scheme_id: 1, scheme_code: "PRODUCT_CODE", branch_code: "ADEN", channel_code: "WEB", current_value: 38, reserved_until: null, status: "ACTIVE" },
  { id: 3, scheme_id: 2, scheme_code: "CONTRACT_NUM", branch_code: "HQ", channel_code: null, current_value: 567, reserved_until: "2024-12-31T23:59:59Z", status: "ACTIVE" },
  { id: 4, scheme_id: 2, scheme_code: "CONTRACT_NUM", branch_code: "SANAA", channel_code: "MOBILE", current_value: 89, reserved_until: null, status: "ACTIVE" },
  { id: 5, scheme_id: 3, scheme_code: "INVOICE_NUM", branch_code: "HQ", channel_code: null, current_value: 2340, reserved_until: null, status: "ACTIVE" },
  { id: 6, scheme_id: 4, scheme_code: "RESERVATION_NUM", branch_code: "HQ", channel_code: null, current_value: 95, reserved_until: null, status: "ACTIVE" },
  { id: 7, scheme_id: 4, scheme_code: "RESERVATION_NUM", branch_code: "ADEN", channel_code: "POS", current_value: 21, reserved_until: null, status: "ACTIVE" },
];

// ============================================================
// Animation Variants
// ============================================================

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// ============================================================
// Helpers
// ============================================================

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />;
}

function TableSkeleton({ rows = 3, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <Table>
      <TableHeader><TableRow className="bg-muted/50">{Array.from({ length: cols }).map((_, i) => <TableHead key={i}><Skeleton className="h-4 w-20" /></TableHead>)}</TableRow></TableHeader>
      <TableBody>{Array.from({ length: rows }).map((_, r) => <TableRow key={r}>{Array.from({ length: cols }).map((_, c) => <TableCell key={c}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>)}</TableBody>
    </Table>
  );
}

function simulateAsync<T>(result: T, delay = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(result), delay));
}

/** Generate a preview identifier from a pattern */
function generatePatternPreview(pattern: string, seqValue = 1): string {
  const year = new Date().getFullYear().toString();
  return pattern
    .replace("{YEAR}", year)
    .replace("{TYPE}", "LOAN")
    .replace("{BRANCH}", "HQ")
    .replace(/\{SEQ:(\d+)\}/g, (_, digits) => String(seqValue).padStart(Number(digits), "0"));
}

function GapPolicyBadge({ policy }: { policy: GapPolicy }) {
  const config = GAP_POLICY_CONFIG[policy];
  return <Badge variant="outline" className={`${config.color} gap-1`}>{config.icon}{config.label}</Badge>;
}

function SequenceStatusBadge({ status }: { status: "ACTIVE" | "EXHAUSTED" }) {
  return (
    <Badge variant="outline" className={status === "ACTIVE" ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}>
      {status === "ACTIVE" ? "نشط" : "مستنفد"}
    </Badge>
  );
}

// ============================================================
// Component
// ============================================================

export default function NumberingScreen() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSchemeId, setSelectedSchemeId] = useState<number | null>(1);
  const [schemes, setSchemes] = useState<MockNumberingScheme[]>([]);
  const [sequences, setSequences] = useState<MockNumberingSequence[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [saving, setSaving] = useState(false);

  // Create scheme dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newScheme, setNewScheme] = useState({ code: "", pattern: "", gap_policy: "ALLOW" as GapPolicy, description: "" });

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; name: string }>({ open: false, id: 0, name: "" });

  // Reset sequence confirmation
  const [resetDialog, setResetDialog] = useState<{ open: boolean; seqId: number; schemeName: string }>({ open: false, seqId: 0, schemeName: "" });

  // Gap policy change warning
  const [gapWarningDialog, setGapWarningDialog] = useState<{ open: boolean; schemeId: number; from: GapPolicy; to: GapPolicy }>({ open: false, schemeId: 0, from: "DENY", to: "ALLOW" });

  // Reserve number state
  const [reservingSchemeId, setReservingSchemeId] = useState<number | null>(null);
  const [reservedNumber, setReservedNumber] = useState<{ schemeId: number; identifier: string; countdown: number } | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Toast helpers
  const addToast = useCallback((message: string, type: "success" | "error" | "warning") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initial load
  useEffect(() => {
    const timer = setTimeout(() => { setSchemes(initialSchemes); setSequences(initialSequences); setLoading(false); }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Countdown timer for reserved number
  useEffect(() => {
    if (reservedNumber && reservedNumber.countdown > 0) {
      countdownRef.current = setInterval(() => {
        setReservedNumber((prev) => {
          if (!prev || prev.countdown <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return null;
          }
          return { ...prev, countdown: prev.countdown - 1 };
        });
      }, 1000);
      return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
    }
  }, [reservedNumber?.schemeId]);

  // Filtered
  const filteredSchemes = schemes.filter((s) => !search || s.code.toLowerCase().includes(search.toLowerCase()) || s.pattern.includes(search));
  const selectedSequences = selectedSchemeId ? sequences.filter((seq) => seq.scheme_id === selectedSchemeId) : [];
  const selectedScheme = schemes.find((s) => s.id === selectedSchemeId);

  // ---- CRUD ----

  async function handleCreateScheme() {
    if (!newScheme.code || !newScheme.pattern) { addToast("يرجى ملء جميع الحقول المطلوبة", "error"); return; }
    setSaving(true);
    try {
      const created = await simulateAsync<MockNumberingScheme>({
        id: Math.max(0, ...schemes.map((s) => s.id)) + 1,
        tenant_id: 1,
        code: newScheme.code.toUpperCase(),
        pattern: newScheme.pattern,
        context: { description: newScheme.description || newScheme.code },
        gap_policy: newScheme.gap_policy,
      });
      setSchemes((prev) => [...prev, created]);
      setCreateDialogOpen(false);
      setNewScheme({ code: "", pattern: "", gap_policy: "ALLOW", description: "" });
      addToast("تم إنشاء المخطط بنجاح", "success");
    } catch { addToast("فشل في إنشاء المخطط", "error"); } finally { setSaving(false); }
  }

  async function handleDeleteConfirm() {
    setSaving(true);
    try {
      await simulateAsync(null, 400);
      setSchemes((prev) => prev.filter((s) => s.id !== deleteDialog.id));
      setSequences((prev) => prev.filter((s) => s.scheme_id !== deleteDialog.id));
      if (selectedSchemeId === deleteDialog.id) setSelectedSchemeId(null);
      setDeleteDialog({ open: false, id: 0, name: "" });
      addToast("تم حذف المخطط بنجاح", "success");
    } catch { addToast("فشل في الحذف", "error"); } finally { setSaving(false); }
  }

  async function handleReserveNumber(schemeId: number) {
    const scheme = schemes.find((s) => s.id === schemeId);
    if (!scheme) return;
    setReservingSchemeId(schemeId);
    try {
      // Increment value in the first matching sequence
      const seq = sequences.find((s) => s.scheme_id === schemeId);
      const nextVal = seq ? seq.current_value + 1 : 1;
      const identifier = generatePatternPreview(scheme.pattern, nextVal);

      await simulateAsync(null, 800);

      setSequences((prev) =>
        prev.map((s) => s.scheme_id === schemeId && s.id === seq?.id ? { ...s, current_value: nextVal, reserved_until: new Date(Date.now() + 30000).toISOString() } : s)
      );
      setReservedNumber({ schemeId, identifier, countdown: 30 });
      addToast(`تم حجز الرقم: ${identifier}`, "success");
    } catch { addToast("فشل في حجز الرقم", "error"); } finally { setReservingSchemeId(null); }
  }

  async function handleResetSequence() {
    setSaving(true);
    try {
      await simulateAsync(null, 400);
      setSequences((prev) => prev.map((s) => s.id === resetDialog.seqId ? { ...s, current_value: 0, reserved_until: null } : s));
      setResetDialog({ open: false, seqId: 0, schemeName: "" });
      addToast("تم إعادة تعيين التسلسل بنجاح", "success");
    } catch { addToast("فشل في إعادة التعيين", "error"); } finally { setSaving(false); }
  }

  async function handleGapPolicyChange() {
    setSaving(true);
    try {
      await simulateAsync(null, 400);
      setSchemes((prev) => prev.map((s) => s.id === gapWarningDialog.schemeId ? { ...s, gap_policy: gapWarningDialog.to } : s));
      setGapWarningDialog({ open: false, schemeId: 0, from: "DENY", to: "ALLOW" });
      addToast("تم تغيير سياسة الفجوات بنجاح", "success");
    } catch { addToast("فشل في تغيير السياسة", "error"); } finally { setSaving(false); }
  }

  function requestGapPolicyChange(scheme: MockNumberingScheme, newPolicy: GapPolicy) {
    if (scheme.gap_policy === "DENY" && newPolicy === "ALLOW") {
      setGapWarningDialog({ open: true, schemeId: scheme.id, from: scheme.gap_policy, to: newPolicy });
    } else {
      setSchemes((prev) => prev.map((s) => s.id === scheme.id ? { ...s, gap_policy: newPolicy } : s));
      addToast("تم تغيير سياسة الفجوات", "success");
    }
  }

  // Pattern preview
  const patternPreview = newScheme.pattern ? generatePatternPreview(newScheme.pattern, 1) : "";

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Hash className="h-6 w-6" />الترقيم</h1>
          <p className="text-muted-foreground mt-1">إدارة مخططات الترقيم والتسلسلات لجميع أنواع المعرّفات</p>
        </div>
        <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-1" />إنشاء مخطط
        </Button>
      </div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? [1, 2, 3].map((i) => <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>) : (
          <>
            <Card className="hover:shadow-md transition-shadow"><CardContent className="p-5"><div className="flex items-start justify-between"><div className="space-y-1"><p className="text-sm text-muted-foreground font-medium">المخططات</p><p className="text-2xl font-bold">{schemes.length}</p></div><div className="p-3 rounded-lg bg-blue-50 text-blue-600"><Hash className="h-5 w-5" /></div></div></CardContent></Card>
            <Card className="hover:shadow-md transition-shadow"><CardContent className="p-5"><div className="flex items-start justify-between"><div className="space-y-1"><p className="text-sm text-muted-foreground font-medium">التسلسلات النشطة</p><p className="text-2xl font-bold">{sequences.filter((s) => s.status === "ACTIVE").length}</p></div><div className="p-3 rounded-lg bg-emerald-50 text-emerald-600"><Activity className="h-5 w-5" /></div></div></CardContent></Card>
            <Card className="hover:shadow-md transition-shadow"><CardContent className="p-5"><div className="flex items-start justify-between"><div className="space-y-1"><p className="text-sm text-muted-foreground font-medium">إجمالي الأرقام المولّدة</p><p className="text-2xl font-bold">{sequences.reduce((sum, s) => sum + s.current_value, 0).toLocaleString("ar-EG")}</p></div><div className="p-3 rounded-lg bg-purple-50 text-purple-600"><GitBranch className="h-5 w-5" /></div></div></CardContent></Card>
          </>
        )}
      </motion.div>

      {/* Reserved number countdown */}
      <AnimatePresence>
        {reservedNumber && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="border-green-300 bg-green-50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Timer className="h-5 w-5 text-green-700" />
                  <div>
                    <p className="text-sm font-medium text-green-800">رقم محجوز</p>
                    <code className="text-lg font-bold font-mono text-green-900">{reservedNumber.identifier}</code>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-center">
                    <p className="text-xs text-green-700">ينتهي خلال</p>
                    <p className="text-2xl font-bold font-mono text-green-900">{reservedNumber.countdown}s</p>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-green-300 flex items-center justify-center">
                    <svg className="w-10 h-10 -rotate-90">
                      <circle cx="20" cy="20" r="16" fill="none" stroke="#bbf7d0" strokeWidth="3" />
                      <circle cx="20" cy="20" r="16" fill="none" stroke="#16a34a" strokeWidth="3"
                        strokeDasharray={`${(reservedNumber.countdown / 30) * 100.5} 100.5`}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <motion.div variants={itemVariants}>
        <Card><CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث بالرمز أو النمط..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9" />
          </div>
        </CardContent></Card>
      </motion.div>

      {/* Schemes Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Hash className="h-4 w-4" />مخططات الترقيم ({filteredSchemes.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            {loading ? <TableSkeleton rows={4} cols={5} /> : (
              <Table>
                <TableHeader><TableRow className="bg-muted/50">
                  <TableHead>الرمز</TableHead>
                  <TableHead>النمط</TableHead>
                  <TableHead>سياسة الفجوات</TableHead>
                  <TableHead>السياق</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filteredSchemes.map((scheme, idx) => (
                    <motion.tr key={scheme.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                      className={`border-b transition-colors cursor-pointer ${selectedSchemeId === scheme.id ? "bg-primary/5 border-r-2 border-r-primary" : "hover:bg-muted/30"}`}
                      onClick={() => setSelectedSchemeId(scheme.id)}
                    >
                      <TableCell><code className="text-sm font-mono font-semibold bg-muted px-2 py-0.5 rounded">{scheme.code}</code></TableCell>
                      <TableCell>
                        <code className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded font-mono block">{scheme.pattern}</code>
                        <p className="text-[10px] text-muted-foreground mt-1 font-mono">{generatePatternPreview(scheme.pattern, sequences.find((s) => s.scheme_id === scheme.id)?.current_value ?? 1)}</p>
                      </TableCell>
                      <TableCell>
                        <Select value={scheme.gap_policy} onValueChange={(v) => { requestGapPolicyChange(scheme, v as GapPolicy); }}>
                          <SelectTrigger className="w-36 h-8 text-xs" onClick={(e) => e.stopPropagation()}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALLOW">مسموح</SelectItem>
                            <SelectItem value="DENY">ممنوع</SelectItem>
                            <SelectItem value="REUSE">إعادة استخدام</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell><p className="text-sm text-muted-foreground">{scheme.context.description}</p></TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="outline" size="sm" className="h-8 text-xs gap-1"
                            disabled={reservingSchemeId === scheme.id}
                            onClick={(e) => { e.stopPropagation(); handleReserveNumber(scheme.id); }}
                          >
                            {reservingSchemeId === scheme.id ? <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" /> : <Play className="h-3 w-3" />}
                            حجز رقم
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                            onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, id: scheme.id, name: scheme.code }); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                  {filteredSchemes.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      <Hash className="h-8 w-8 mx-auto mb-2 opacity-30" />لا توجد مخططات مطابقة للبحث
                    </TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">عرض {filteredSchemes.length} من {schemes.length} مخطط</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled><ChevronRight className="h-4 w-4" />السابق</Button>
                <span className="text-sm px-3">صفحة 1 من 1</span>
                <Button variant="outline" size="sm" disabled>التالي<ChevronLeft className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sequences Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4" />التسلسلات
                {selectedScheme && <Badge variant="outline" className="mr-2 font-normal">{selectedScheme.code}</Badge>}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? <TableSkeleton rows={3} cols={6} /> : selectedSchemeId ? (
              <Table>
                <TableHeader><TableRow className="bg-muted/50">
                  <TableHead>رمز الفرع</TableHead>
                  <TableHead>رمز القناة</TableHead>
                  <TableHead>القيمة الحالية</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الحجز حتى</TableHead>
                  <TableHead className="text-center w-24">إجراءات</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {selectedSequences.map((seq, idx) => (
                    <motion.tr key={seq.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <TableCell><Badge variant="outline" className="font-mono">{seq.branch_code}</Badge></TableCell>
                      <TableCell>{seq.channel_code ? <Badge variant="secondary" className="font-mono">{seq.channel_code}</Badge> : <span className="text-xs text-muted-foreground">--</span>}</TableCell>
                      <TableCell><span className="text-lg font-bold font-mono">{seq.current_value.toLocaleString("ar-EG")}</span></TableCell>
                      <TableCell><SequenceStatusBadge status={seq.status} /></TableCell>
                      <TableCell className="text-xs font-mono">
                        {seq.reserved_until ? <span className="text-amber-700">{new Date(seq.reserved_until).toLocaleDateString("ar-EG")}</span> : <span className="text-muted-foreground">--</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="إعادة تعيين"
                            onClick={() => setResetDialog({ open: true, seqId: seq.id, schemeName: seq.scheme_code })}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                  {selectedSequences.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />لا توجد تسلسلات لهذا المخطط
                    </TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <GitBranch className="h-10 w-10 mb-3 opacity-30" /><p className="text-sm">اختر مخطط ترقيم لعرض التسلسلات</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== Dialogs ===== */}

      {/* Create Scheme Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />إنشاء مخطط ترقيم جديد</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">رمز المخطط *</label>
              <Input placeholder="مثال: ORDER_NUM" value={newScheme.code} onChange={(e) => setNewScheme((p) => ({ ...p, code: e.target.value.toUpperCase() }))} className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">النمط *</label>
              <Input placeholder='مثال: ORD-{YEAR}-{SEQ:6}' value={newScheme.pattern} onChange={(e) => setNewScheme((p) => ({ ...p, pattern: e.target.value }))} className="font-mono" />
              {patternPreview && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200 mt-1">
                  <Eye className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs text-blue-700">معاينة: </span>
                  <code className="text-xs font-mono font-bold text-blue-900">{patternPreview}</code>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">سياسة الفجوات</label>
              <Select value={newScheme.gap_policy} onValueChange={(v) => setNewScheme((p) => ({ ...p, gap_policy: v as GapPolicy }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALLOW">مسموح (ALLOW)</SelectItem>
                  <SelectItem value="DENY">ممنوع (DENY)</SelectItem>
                  <SelectItem value="REUSE">إعادة استخدام (REUSE)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">الوصف</label>
              <Input placeholder="وصف المخطط..." value={newScheme.description} onChange={(e) => setNewScheme((p) => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
            <Button onClick={handleCreateScheme} disabled={saving}>
              {saving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : "إنشاء"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog((p) => ({ ...p, open }))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" />تأكيد الحذف</DialogTitle></DialogHeader>
          <p className="text-sm py-2">هل أنت متأكد من حذف مخطط <span className="font-bold font-mono">{deleteDialog.name}</span>؟ سيتم حذف جميع التسلسلات المرتبطة.</p>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={saving}>
              {saving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Sequence Confirmation */}
      <Dialog open={resetDialog.open} onOpenChange={(open) => setResetDialog((p) => ({ ...p, open }))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-amber-600"><RotateCcw className="h-5 w-5" />تأكيد إعادة التعيين</DialogTitle></DialogHeader>
          <p className="text-sm py-2">هل أنت متأكد من إعادة تعيين تسلسل <span className="font-bold">{resetDialog.schemeName}</span> إلى الصفر؟ هذا الإجراء لا يمكن التراجع عنه.</p>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleResetSequence} disabled={saving}>
              {saving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : "إعادة تعيين"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gap Policy Warning (DENY -> ALLOW) */}
      <Dialog open={gapWarningDialog.open} onOpenChange={(open) => setGapWarningDialog((p) => ({ ...p, open }))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-amber-600"><AlertTriangle className="h-5 w-5" />تحذير: تغيير سياسة الفجوات</DialogTitle></DialogHeader>
          <div className="py-2 space-y-2">
            <p className="text-sm">أنت على وشك تغيير السياسة من <Badge className="bg-red-100 text-red-800">ممنوع (DENY)</Badge> إلى <Badge className="bg-green-100 text-green-800">مسموح (ALLOW)</Badge>.</p>
            <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
              <AlertTriangle className="h-4 w-4 inline ml-1" />
              السماح بالفجوات قد يؤدي إلى أرقام غير متسلسلة، مما قد يخالف متطلبات التدقيق.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleGapPolicyChange} disabled={saving}>
              {saving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : "تأكيد التغيير"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

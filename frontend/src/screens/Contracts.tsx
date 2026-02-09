import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  Download,
  Eye,
  DollarSign,
  Calendar,
  AlertTriangle,
  CreditCard,
  BookOpen,
  Scale,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRight,
  Loader2,
  Check,
  Trash2,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { ContractStatus, InstallmentStatus } from "@/types";
import { CONTRACT_STATUS_LABELS, INSTALLMENT_STATUS_LABELS } from "@/types";

// ============================================================
// Loading Skeleton
// ============================================================

function SkeletonRow() {
  return (
    <tr className="border-b">
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="p-3">
          <div className="h-4 bg-muted rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="h-3 w-24 bg-muted rounded animate-pulse" />
        <div className="h-7 w-16 bg-muted rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

// ============================================================
// Status Badge
// ============================================================

function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const config = CONTRACT_STATUS_LABELS[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.ar}
    </span>
  );
}

function InstallmentStatusBadge({
  status,
  onClick,
}: {
  status: InstallmentStatus;
  onClick?: () => void;
}) {
  const config = INSTALLMENT_STATUS_LABELS[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-primary/30 transition-all ${config.color}`}
      onClick={onClick}
    >
      {config.ar}
    </span>
  );
}

// ============================================================
// Aging Badge + Bar
// ============================================================

function AgingBadge({ days }: { days: number }) {
  let color = "bg-green-100 text-green-700";
  let label = "سليم";
  if (days >= 180) { color = "bg-red-100 text-red-700"; label = "180+ يوم — شطب"; }
  else if (days >= 90) { color = "bg-orange-100 text-orange-700"; label = "90 يوم — تعليق"; }
  else if (days >= 60) { color = "bg-yellow-100 text-yellow-700"; label = "60 يوم — تصعيد"; }
  else if (days >= 30) { color = "bg-amber-100 text-amber-700"; label = "30 يوم — تنبيه"; }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {days > 0 && <Clock className="h-3 w-3" />}
      {label}
    </span>
  );
}

function AgingBar({ days }: { days: number }) {
  const maxDays = 200;
  const pct = Math.min((days / maxDays) * 100, 100);
  let barColor = "bg-green-500";
  if (days >= 180) barColor = "bg-red-500";
  else if (days >= 90) barColor = "bg-orange-500";
  else if (days >= 60) barColor = "bg-yellow-500";
  else if (days >= 30) barColor = "bg-amber-500";

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground">{days.toLocaleString('ar-EG')} يوم</span>
    </div>
  );
}

// ============================================================
// Data Types
// ============================================================

interface ContractRow {
  id: number;
  contract_number: string;
  customer_name: string;
  customer_id: number;
  product_name: string;
  product_id: number;
  principal: number;
  status: ContractStatus;
  interest_type: string;
  currency: string;
  day_count: string;
  next_due_date: string;
  aging_days: number;
}

interface InstallmentRow {
  seq: number;
  due_on: string;
  principal_due: number;
  interest_due: number;
  fee_due: number;
  paid_principal: number;
  paid_interest: number;
  status: InstallmentStatus;
}

// ============================================================
// Initial Mock Data
// ============================================================

const initialContracts: ContractRow[] = [
  { id: 1, contract_number: "CTR-2024-001", customer_name: "أحمد محمد علي", customer_id: 1, product_name: "قرض شخصي ميسر", product_id: 1, principal: 5000000, status: "ACTIVE", interest_type: "REDUCING", currency: "YER", day_count: "30E/360", next_due_date: "2024-09-15", aging_days: 0 },
  { id: 2, contract_number: "CTR-2024-002", customer_name: "خالد عبدالله سعيد", customer_id: 2, product_name: "تمويل عقاري", product_id: 2, principal: 25000000, status: "ACTIVE", interest_type: "FLAT", currency: "YER", day_count: "ACT/365", next_due_date: "2024-09-01", aging_days: 0 },
  { id: 3, contract_number: "CTR-2024-003", customer_name: "فاطمة حسن أحمد", customer_id: 3, product_name: "قرض شخصي ميسر", product_id: 1, principal: 3000000, status: "IN_ARREARS", interest_type: "REDUCING", currency: "YER", day_count: "30E/360", next_due_date: "2024-07-15", aging_days: 45 },
  { id: 4, contract_number: "CTR-2024-004", customer_name: "عمر يوسف ناصر", customer_id: 4, product_name: "خط ائتمان", product_id: 3, principal: 10000000, status: "DRAFT", interest_type: "FLAT", currency: "YER", day_count: "ACT/360", next_due_date: "-", aging_days: 0 },
  { id: 5, contract_number: "CTR-2023-015", customer_name: "سالم عبدالرحمن", customer_id: 5, product_name: "قرض شخصي ميسر", product_id: 1, principal: 2000000, status: "WRITTEN_OFF", interest_type: "REDUCING", currency: "YER", day_count: "30E/360", next_due_date: "-", aging_days: 200 },
  { id: 6, contract_number: "CTR-2024-005", customer_name: "نورا محمد", customer_id: 6, product_name: "تمويل عقاري", product_id: 2, principal: 15000000, status: "CLOSED", interest_type: "FLAT", currency: "YER", day_count: "ACT/365", next_due_date: "-", aging_days: 0 },
  { id: 7, contract_number: "CTR-2024-006", customer_name: "ياسر حمود", customer_id: 7, product_name: "قرض شخصي ميسر", product_id: 1, principal: 4000000, status: "IN_ARREARS", interest_type: "REDUCING", currency: "YER", day_count: "30E/360", next_due_date: "2024-06-01", aging_days: 75 },
  { id: 8, contract_number: "CTR-2024-007", customer_name: "مريم عبدالكريم", customer_id: 8, product_name: "خط ائتمان", product_id: 3, principal: 8000000, status: "RESTRUCTURED", interest_type: "FLAT", currency: "YER", day_count: "ACT/360", next_due_date: "2024-10-01", aging_days: 0 },
];

const initialInstallments: Record<number, InstallmentRow[]> = {
  1: [
    { seq: 1, due_on: "2024-02-15", principal_due: 416667, interest_due: 50000, fee_due: 5000, paid_principal: 416667, paid_interest: 50000, status: "PAID" },
    { seq: 2, due_on: "2024-03-15", principal_due: 416667, interest_due: 47917, fee_due: 0, paid_principal: 416667, paid_interest: 47917, status: "PAID" },
    { seq: 3, due_on: "2024-04-15", principal_due: 416667, interest_due: 45833, fee_due: 0, paid_principal: 416667, paid_interest: 45833, status: "PAID" },
    { seq: 4, due_on: "2024-05-15", principal_due: 416667, interest_due: 43750, fee_due: 0, paid_principal: 200000, paid_interest: 20000, status: "PARTIAL" },
    { seq: 5, due_on: "2024-06-15", principal_due: 416667, interest_due: 41667, fee_due: 0, paid_principal: 0, paid_interest: 0, status: "LATE" },
    { seq: 6, due_on: "2024-07-15", principal_due: 416667, interest_due: 39583, fee_due: 0, paid_principal: 0, paid_interest: 0, status: "DUE" },
    { seq: 7, due_on: "2024-08-15", principal_due: 416667, interest_due: 37500, fee_due: 0, paid_principal: 0, paid_interest: 0, status: "DUE" },
    { seq: 8, due_on: "2024-09-15", principal_due: 416667, interest_due: 35417, fee_due: 0, paid_principal: 0, paid_interest: 0, status: "DUE" },
  ],
};

const mockCustomerOptions = [
  { id: 1, name: "أحمد محمد علي" },
  { id: 2, name: "خالد عبدالله سعيد" },
  { id: 3, name: "فاطمة حسن أحمد" },
  { id: 4, name: "عمر يوسف ناصر" },
  { id: 5, name: "سالم عبدالرحمن" },
  { id: 6, name: "نورا محمد" },
  { id: 7, name: "ياسر حمود" },
  { id: 8, name: "مريم عبدالكريم" },
];

const mockProductOptions = [
  { id: 1, name: "قرض شخصي ميسر" },
  { id: 2, name: "تمويل عقاري" },
  { id: 3, name: "خط ائتمان" },
];

// ============================================================
// Status Filter Chips
// ============================================================

const allStatuses: { value: string; label: string }[] = [
  { value: "ALL", label: "الكل" },
  { value: "DRAFT", label: "مسودة" },
  { value: "ACTIVE", label: "نشط" },
  { value: "IN_ARREARS", label: "متأخر" },
  { value: "RESTRUCTURED", label: "مُعاد هيكلته" },
  { value: "WRITTEN_OFF", label: "مشطوب" },
  { value: "CLOSED", label: "مغلق" },
];

function StatusFilterChips({
  selected,
  onChange,
  contracts,
}: {
  selected: string;
  onChange: (v: string) => void;
  contracts: ContractRow[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {allStatuses.map((s) => {
        const count = s.value === "ALL"
          ? contracts.length
          : contracts.filter((c) => c.status === s.value).length;
        const isActive = selected === s.value;
        return (
          <motion.button
            key={s.value}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(s.value)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              isActive
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {s.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              isActive ? "bg-primary-foreground/20" : "bg-muted"
            }`}>
              {count}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

// ============================================================
// Generate Idempotency Key
// ============================================================

function generateIdempotencyKey(): string {
  return `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

// ============================================================
// Create Contract Dialog
// ============================================================

function CreateContractDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (c: ContractRow) => void;
}) {
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [principal, setPrincipal] = useState("");
  const [interestType, setInterestType] = useState("");
  const [currency, setCurrency] = useState("YER");
  const [dayCount, setDayCount] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!customerId || !productId || !principal || !interestType || !dayCount) return;
    setSaving(true);

    setTimeout(() => {
      const customer = mockCustomerOptions.find((c) => c.id === Number(customerId));
      const product = mockProductOptions.find((p) => p.id === Number(productId));
      const newId = Date.now();
      const num = String(Math.floor(Math.random() * 900) + 100);

      const newContract: ContractRow = {
        id: newId,
        contract_number: `CTR-2024-${num}`,
        customer_name: customer?.name || "",
        customer_id: Number(customerId),
        product_name: product?.name || "",
        product_id: Number(productId),
        principal: Number(principal),
        status: "DRAFT",
        interest_type: interestType,
        currency,
        day_count: dayCount,
        next_due_date: "-",
        aging_days: 0,
      };

      onSave(newContract);
      setSaving(false);
      setCustomerId("");
      setProductId("");
      setPrincipal("");
      setInterestType("");
      setCurrency("YER");
      setDayCount("");
      onClose();
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>عقد مالي جديد</DialogTitle>
          <DialogDescription>أدخل بيانات العقد المالي الجديد</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5">
            <Label>العميل <span className="text-destructive">*</span></Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger><SelectValue placeholder="اختر العميل" /></SelectTrigger>
              <SelectContent>
                {mockCustomerOptions.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>المنتج المالي <span className="text-destructive">*</span></Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger><SelectValue placeholder="اختر المنتج" /></SelectTrigger>
              <SelectContent>
                {mockProductOptions.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>المبلغ الأصلي <span className="text-destructive">*</span></Label>
            <Input
              type="number"
              placeholder="0"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>نوع الفائدة <span className="text-destructive">*</span></Label>
            <Select value={interestType} onValueChange={setInterestType}>
              <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="FLAT">ثابتة (Flat)</SelectItem>
                <SelectItem value="REDUCING">تنازلية (Reducing)</SelectItem>
                <SelectItem value="FIXED_AMOUNT">مبلغ ثابت</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>العملة</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="YER">ريال يمني (YER)</SelectItem>
                <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>نظام حساب الأيام <span className="text-destructive">*</span></Label>
            <Select value={dayCount} onValueChange={setDayCount}>
              <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30E/360">30E/360</SelectItem>
                <SelectItem value="ACT/365">ACT/365</SelectItem>
                <SelectItem value="ACT/360">ACT/360</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>إلغاء</Button>
          <Button
            onClick={handleSave}
            disabled={!customerId || !productId || !principal || !interestType || !dayCount || saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                جارِ الحفظ...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 ml-1" />
                إنشاء العقد
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Record Payment Dialog
// ============================================================

function RecordPaymentDialog({
  open,
  onClose,
  contract,
  installment,
  onPaymentRecorded,
}: {
  open: boolean;
  onClose: () => void;
  contract: ContractRow | null;
  installment: InstallmentRow | null;
  onPaymentRecorded: (contractId: number, seq: number, principalPaid: number, interestPaid: number, feePaid: number) => void;
}) {
  const [principalAmt, setPrincipalAmt] = useState("");
  const [interestAmt, setInterestAmt] = useState("");
  const [feeAmt, setFeeAmt] = useState("");
  const [channel, setChannel] = useState("");
  const [idempotencyKey] = useState(generateIdempotencyKey());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (installment) {
      setPrincipalAmt(String(installment.principal_due - installment.paid_principal));
      setInterestAmt(String(installment.interest_due - installment.paid_interest));
      setFeeAmt(String(installment.fee_due));
    }
  }, [installment]);

  const handleSave = () => {
    if (!contract || !installment || !channel) return;
    setSaving(true);
    setTimeout(() => {
      onPaymentRecorded(
        contract.id,
        installment.seq,
        Number(principalAmt) || 0,
        Number(interestAmt) || 0,
        Number(feeAmt) || 0
      );
      setSaving(false);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
        setPrincipalAmt("");
        setInterestAmt("");
        setFeeAmt("");
        setChannel("");
      }, 1000);
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>تسجيل دفعة</DialogTitle>
          <DialogDescription>
            {contract ? `${contract.contract_number} — ${contract.customer_name}` : ""}
            {installment ? ` — القسط #${installment.seq}` : ""}
          </DialogDescription>
        </DialogHeader>

        {saved ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center py-8 gap-3"
          >
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-7 w-7 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-700">تم تسجيل الدفعة بنجاح</p>
          </motion.div>
        ) : (
          <>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs">مبلغ الأصل</Label>
                <Input
                  type="number"
                  value={principalAmt}
                  onChange={(e) => setPrincipalAmt(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">مبلغ الفائدة</Label>
                <Input
                  type="number"
                  value={interestAmt}
                  onChange={(e) => setInterestAmt(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">مبلغ الرسوم</Label>
                <Input
                  type="number"
                  value={feeAmt}
                  onChange={(e) => setFeeAmt(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">قناة الدفع <span className="text-destructive">*</span></Label>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger><SelectValue placeholder="اختر القناة" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRANCH">فرع</SelectItem>
                    <SelectItem value="MOBILE">تطبيق جوال</SelectItem>
                    <SelectItem value="BANK">تحويل بنكي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-2 bg-muted/50 rounded text-xs">
                <span className="text-muted-foreground">مفتاح عدم التكرار: </span>
                <span className="font-mono text-[10px]">{idempotencyKey}</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={saving}>إلغاء</Button>
              <Button onClick={handleSave} disabled={!channel || saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                    جارِ التسجيل...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 ml-1" />
                    تسجيل الدفعة
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Contract Detail (Expanded View)
// ============================================================

function ContractDetail({
  contract,
  installments,
  onRecordPayment,
  onBack,
}: {
  contract: ContractRow;
  installments: InstallmentRow[];
  onRecordPayment: (inst: InstallmentRow) => void;
  onBack: () => void;
}) {
  const [detailTab, setDetailTab] = useState("overview");
  const [loadingTab, setLoadingTab] = useState(false);

  const handleTabChange = (val: string) => {
    setLoadingTab(true);
    setDetailTab(val);
    setTimeout(() => setLoadingTab(false), 300);
  };

  const remainingPrincipal = installments.reduce(
    (sum, i) => sum + (i.principal_due - i.paid_principal), 0
  );
  const accruedInterest = installments.reduce(
    (sum, i) => sum + (i.interest_due - i.paid_interest), 0
  );
  const totalSettlement = remainingPrincipal + accruedInterest;

  // Payment history from paid/partial installments
  const paymentHistory = installments
    .filter((i) => i.paid_principal > 0 || i.paid_interest > 0)
    .map((i, idx) => ({
      date: i.due_on,
      principal: i.paid_principal,
      interest: i.paid_interest,
      fee: i.fee_due > 0 ? i.fee_due : 0,
      channel: idx % 3 === 0 ? "فرع" : idx % 3 === 1 ? "تحويل بنكي" : "تطبيق جوال",
      ref: `PAY-${String(idx + 1).padStart(3, "0")}`,
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowRight className="h-4 w-4 ml-1" />
        العودة إلى القائمة
      </Button>

      {/* Contract Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {contract.contract_number}
            <ContractStatusBadge status={contract.status} />
          </h3>
          <p className="text-sm text-muted-foreground">{contract.customer_name} — {contract.product_name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled title="قريباً">
            <Download className="h-4 w-4 ml-1" />
            كشف حساب
          </Button>
          <Button size="sm" onClick={() => {
            const firstUnpaid = installments.find((i) => i.status === "DUE" || i.status === "LATE" || i.status === "PARTIAL");
            if (firstUnpaid) onRecordPayment(firstUnpaid);
          }}>
            <CreditCard className="h-4 w-4 ml-1" />
            تسجيل دفعة
          </Button>
        </div>
      </div>

      {/* Detail Tabs */}
      <Tabs value={detailTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="overview" className="text-xs gap-1">
            <Eye className="h-3.5 w-3.5" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="schedule" className="text-xs gap-1">
            <Calendar className="h-3.5 w-3.5" />
            جدول الأقساط
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-xs gap-1">
            <CreditCard className="h-3.5 w-3.5" />
            المدفوعات
          </TabsTrigger>
          <TabsTrigger value="statement" className="text-xs gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            كشف حساب
          </TabsTrigger>
          <TabsTrigger value="penalties" className="text-xs gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            الغرامات
          </TabsTrigger>
          <TabsTrigger value="subledger" className="text-xs gap-1">
            <Calculator className="h-3.5 w-3.5" />
            الدفتر الفرعي
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {loadingTab ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 space-y-3"
            >
              <div className="h-20 bg-muted rounded animate-pulse" />
              <div className="h-20 bg-muted rounded animate-pulse" />
            </motion.div>
          ) : (
            <motion.div
              key={detailTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">المبلغ الأصلي</p>
                    <p className="text-lg font-bold">{contract.principal.toLocaleString('ar-EG')} ر.ي</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">نوع الفائدة</p>
                    <p className="text-lg font-bold">{contract.interest_type === "REDUCING" ? "تنازلية" : contract.interest_type === "FLAT" ? "ثابتة" : "مبلغ ثابت"}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">القسط التالي</p>
                    <p className="text-lg font-bold">{contract.next_due_date}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">التقادم</p>
                    <AgingBadge days={contract.aging_days} />
                    {contract.aging_days > 0 && (
                      <div className="mt-2">
                        <AgingBar days={contract.aging_days} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Early Settlement Preview */}
                {contract.status !== "CLOSED" && contract.status !== "WRITTEN_OFF" && contract.status !== "DRAFT" && (
                  <div className="mt-4 p-4 rounded-lg border bg-blue-50/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Scale className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-medium text-blue-800">معاينة التسوية المبكرة</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-blue-600">الأصل المتبقي</p>
                        <p className="font-semibold">{remainingPrincipal.toLocaleString('ar-EG')} ر.ي</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600">الفوائد المستحقة</p>
                        <p className="font-semibold">{accruedInterest.toLocaleString('ar-EG')} ر.ي</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600">إجمالي التسوية</p>
                        <p className="font-bold text-blue-800">{totalSettlement.toLocaleString('ar-EG')} ر.ي</p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-right p-2 font-medium">#</th>
                        <th className="text-right p-2 font-medium">تاريخ الاستحقاق</th>
                        <th className="text-right p-2 font-medium">الأصل</th>
                        <th className="text-right p-2 font-medium">الفائدة</th>
                        <th className="text-right p-2 font-medium">الرسوم</th>
                        <th className="text-right p-2 font-medium">المدفوع</th>
                        <th className="text-right p-2 font-medium">الحالة</th>
                        <th className="text-center p-2 font-medium">دفع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {installments.map((inst) => (
                        <motion.tr
                          key={inst.seq}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: inst.seq * 0.04 }}
                          className="border-b hover:bg-muted/20"
                        >
                          <td className="p-2 font-mono">{inst.seq}</td>
                          <td className="p-2">{inst.due_on}</td>
                          <td className="p-2">{inst.principal_due.toLocaleString('ar-EG')}</td>
                          <td className="p-2">{inst.interest_due.toLocaleString('ar-EG')}</td>
                          <td className="p-2">{inst.fee_due.toLocaleString('ar-EG')}</td>
                          <td className="p-2">{(inst.paid_principal + inst.paid_interest).toLocaleString('ar-EG')}</td>
                          <td className="p-2">
                            <InstallmentStatusBadge
                              status={inst.status}
                              onClick={() => {
                                if (inst.status !== "PAID" && inst.status !== "WAIVED") {
                                  onRecordPayment(inst);
                                }
                              }}
                            />
                          </td>
                          <td className="p-2 text-center">
                            {(inst.status === "DUE" || inst.status === "LATE" || inst.status === "PARTIAL") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                aria-label="تسجيل دفعة للقسط"
                                onClick={() => onRecordPayment(inst)}
                              >
                                <DollarSign className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments" className="mt-4 space-y-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-right p-2 font-medium">التاريخ</th>
                      <th className="text-right p-2 font-medium">الأصل</th>
                      <th className="text-right p-2 font-medium">الفائدة</th>
                      <th className="text-right p-2 font-medium">الرسوم</th>
                      <th className="text-right p-2 font-medium">القناة</th>
                      <th className="text-right p-2 font-medium">المرجع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-muted-foreground">
                          لا توجد مدفوعات مسجلة
                        </td>
                      </tr>
                    ) : (
                      paymentHistory.map((pay) => (
                        <tr key={pay.ref} className="border-b">
                          <td className="p-2">{pay.date}</td>
                          <td className="p-2">{pay.principal.toLocaleString('ar-EG')}</td>
                          <td className="p-2">{pay.interest.toLocaleString('ar-EG')}</td>
                          <td className="p-2">{pay.fee.toLocaleString('ar-EG')}</td>
                          <td className="p-2">{pay.channel}</td>
                          <td className="p-2 font-mono text-xs">{pay.ref}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </TabsContent>

              {/* Statement Tab */}
              <TabsContent value="statement" className="mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-right p-2 font-medium">التاريخ</th>
                        <th className="text-right p-2 font-medium">الوصف</th>
                        <th className="text-right p-2 font-medium">مدين</th>
                        <th className="text-right p-2 font-medium">دائن</th>
                        <th className="text-right p-2 font-medium">الرصيد</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        let balance = contract.principal;
                        const entries = [
                          { date: "2024-01-15", desc: "صرف القرض", debit: contract.principal, credit: 0 },
                          ...paymentHistory.map((p) => ({
                            date: p.date,
                            desc: `دفعة - ${p.ref}`,
                            debit: 0,
                            credit: p.principal + p.interest + p.fee,
                          })),
                        ];
                        return entries.map((entry, i) => {
                          if (i > 0) balance -= entry.credit;
                          return (
                            <tr key={i} className="border-b">
                              <td className="p-2">{entry.date}</td>
                              <td className="p-2">{entry.desc}</td>
                              <td className="p-2 text-red-600">{entry.debit > 0 ? entry.debit.toLocaleString('ar-EG') : "-"}</td>
                              <td className="p-2 text-green-600">{entry.credit > 0 ? entry.credit.toLocaleString('ar-EG') : "-"}</td>
                              <td className="p-2 font-medium">{balance.toLocaleString('ar-EG')}</td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* Penalties Tab */}
              <TabsContent value="penalties" className="mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-right p-2 font-medium">التاريخ</th>
                        <th className="text-right p-2 font-medium">النوع</th>
                        <th className="text-right p-2 font-medium">المبلغ</th>
                        <th className="text-right p-2 font-medium">شريحة التقادم</th>
                        <th className="text-right p-2 font-medium">القسط</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contract.aging_days >= 30 ? (
                        <>
                          {contract.aging_days >= 30 && (
                            <tr className="border-b">
                              <td className="p-2">{contract.next_due_date}</td>
                              <td className="p-2">غرامة تأخير</td>
                              <td className="p-2 text-red-600">25,000</td>
                              <td className="p-2"><AgingBadge days={30} /></td>
                              <td className="p-2">#5</td>
                            </tr>
                          )}
                          {contract.aging_days >= 60 && (
                            <tr className="border-b">
                              <td className="p-2">{contract.next_due_date}</td>
                              <td className="p-2">غرامة تأخير</td>
                              <td className="p-2 text-red-600">50,000</td>
                              <td className="p-2"><AgingBadge days={60} /></td>
                              <td className="p-2">#5</td>
                            </tr>
                          )}
                        </>
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-muted-foreground">
                            <AlertTriangle className="h-6 w-6 mx-auto mb-2 opacity-30" />
                            لا توجد غرامات مسجلة
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* Sub-ledger Tab */}
              <TabsContent value="subledger" className="mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-right p-2 font-medium">التاريخ</th>
                        <th className="text-right p-2 font-medium">الحدث</th>
                        <th className="text-right p-2 font-medium">الحساب المدين</th>
                        <th className="text-right p-2 font-medium">الحساب الدائن</th>
                        <th className="text-right p-2 font-medium">المبلغ</th>
                        <th className="text-right p-2 font-medium">المرجع</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2">2024-01-15</td>
                        <td className="p-2"><span className="px-2 py-0.5 rounded bg-muted text-xs">DISBURSEMENT</span></td>
                        <td className="p-2 font-mono text-xs">1101</td>
                        <td className="p-2 font-mono text-xs">1001</td>
                        <td className="p-2">{contract.principal.toLocaleString('ar-EG')}</td>
                        <td className="p-2 font-mono text-xs">SL-001</td>
                      </tr>
                      {paymentHistory.map((p, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2">{p.date}</td>
                          <td className="p-2"><span className="px-2 py-0.5 rounded bg-muted text-xs">PAYMENT</span></td>
                          <td className="p-2 font-mono text-xs">1001</td>
                          <td className="p-2 font-mono text-xs">1101</td>
                          <td className="p-2">{p.principal.toLocaleString('ar-EG')}</td>
                          <td className="p-2 font-mono text-xs">SL-{String(idx + 2).padStart(3, "0")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function Contracts() {
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [installmentsMap, setInstallmentsMap] = useState<Record<number, InstallmentRow[]>>(initialInstallments);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedContract, setSelectedContract] = useState<ContractRow | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentInstallment, setPaymentInstallment] = useState<InstallmentRow | null>(null);
  const [paymentContract, setPaymentContract] = useState<ContractRow | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setContracts(initialContracts);
      setLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // Get installments for a contract (generate default if not found)
  const getInstallments = useCallback((contractId: number): InstallmentRow[] => {
    if (installmentsMap[contractId]) return installmentsMap[contractId];
    // Generate default installments for contracts without specific data
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) return [];
    const numInstallments = 12;
    const monthlyPrincipal = Math.round(contract.principal / numInstallments);
    const generated: InstallmentRow[] = Array.from({ length: numInstallments }, (_, i) => ({
      seq: i + 1,
      due_on: `2024-${String((i + 1) % 12 + 1).padStart(2, "0")}-15`,
      principal_due: monthlyPrincipal,
      interest_due: Math.round(monthlyPrincipal * 0.1),
      fee_due: i === 0 ? 5000 : 0,
      paid_principal: 0,
      paid_interest: 0,
      status: "DUE" as InstallmentStatus,
    }));
    setInstallmentsMap((prev) => ({ ...prev, [contractId]: generated }));
    return generated;
  }, [contracts, installmentsMap]);

  // CRUD: Add contract
  const handleCreateContract = (newContract: ContractRow) => {
    setContracts((prev) => [newContract, ...prev]);
  };

  // CRUD: Delete contract
  const handleDeleteContract = (id: number) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
    if (selectedContract?.id === id) setSelectedContract(null);
  };

  // Record payment
  const handlePaymentRecorded = (contractId: number, seq: number, principalPaid: number, interestPaid: number, _feePaid: number) => {
    setInstallmentsMap((prev) => {
      const updated = { ...prev };
      const installments = [...(updated[contractId] || [])];
      const idx = installments.findIndex((i) => i.seq === seq);
      if (idx >= 0) {
        const inst = { ...installments[idx] };
        inst.paid_principal += principalPaid;
        inst.paid_interest += interestPaid;
        if (inst.paid_principal >= inst.principal_due && inst.paid_interest >= inst.interest_due) {
          inst.status = "PAID";
        } else if (inst.paid_principal > 0 || inst.paid_interest > 0) {
          inst.status = "PARTIAL";
        }
        installments[idx] = inst;
      }
      updated[contractId] = installments;
      return updated;
    });
  };

  // Open payment dialog
  const openPaymentDialog = (contract: ContractRow, installment: InstallmentRow) => {
    setPaymentContract(contract);
    setPaymentInstallment(installment);
    setShowPaymentDialog(true);
  };

  // Filter + search
  const filtered = contracts.filter((c) => {
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
    if (search && !c.contract_number.toLowerCase().includes(search.toLowerCase()) && !c.customer_name.includes(search)) return false;
    return true;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedContracts = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [statusFilter, search]);

  // Stats
  const activeCount = contracts.filter((c) => c.status === "ACTIVE").length;
  const totalDisbursed = contracts
    .filter((c) => c.status !== "DRAFT")
    .reduce((sum, c) => sum + c.principal, 0);
  const arrearsCount = contracts.filter((c) => c.status === "IN_ARREARS").length;
  const paidInstallments = Object.values(installmentsMap).flat().filter((i) => i.status === "PAID").length;
  const totalInstallments = Object.values(installmentsMap).flat().length;
  const collectionRate = totalInstallments > 0 ? Math.round((paidInstallments / totalInstallments) * 100) : 0;

  // If viewing contract detail
  if (selectedContract) {
    return (
      <div className="space-y-4">
        <ContractDetail
          contract={selectedContract}
          installments={getInstallments(selectedContract.id)}
          onRecordPayment={(inst) => openPaymentDialog(selectedContract, inst)}
          onBack={() => setSelectedContract(null)}
        />
        <RecordPaymentDialog
          open={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          contract={paymentContract}
          installment={paymentInstallment}
          onPaymentRecorded={handlePaymentRecorded}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            العقود المالية
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة العقود المالية — القروض وخطوط الائتمان والتمويل
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled title="قريباً">
            <Download className="h-4 w-4 ml-1" />
            تصدير
          </Button>
          <Button size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 ml-1" />
            عقد جديد
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">إجمالي العقود النشطة</p>
                <motion.p
                  key={activeCount}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold"
                >
                  {activeCount.toLocaleString('ar-EG')}
                </motion.p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">إجمالي المبالغ المصروفة</p>
                <p className="text-2xl font-bold">
                  {totalDisbursed >= 1000000
                    ? `${Math.round(totalDisbursed / 1000000).toLocaleString('ar-EG')}M ر.ي`
                    : `${totalDisbursed.toLocaleString('ar-EG')} ر.ي`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">عقود متأخرة</p>
                <p className="text-2xl font-bold text-orange-600">{arrearsCount.toLocaleString('ar-EG')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">نسبة التحصيل</p>
                <p className="text-2xl font-bold text-green-600">{collectionRate.toLocaleString('ar-EG')}%</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Status Filter Chips */}
      {!loading && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
          <StatusFilterChips selected={statusFilter} onChange={setStatusFilter} contracts={contracts} />
        </motion.div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث برقم العقد أو اسم العميل..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9"
              />
            </div>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 لكل صفحة</SelectItem>
                <SelectItem value="10">10 لكل صفحة</SelectItem>
                <SelectItem value="20">20 لكل صفحة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-right p-3 font-medium">رقم العقد</th>
                  <th className="text-right p-3 font-medium">العميل</th>
                  <th className="text-right p-3 font-medium">المنتج</th>
                  <th className="text-right p-3 font-medium">المبلغ الأصلي</th>
                  <th className="text-right p-3 font-medium">الحالة</th>
                  <th className="text-right p-3 font-medium">نوع الفائدة</th>
                  <th className="text-right p-3 font-medium">القسط التالي</th>
                  <th className="text-right p-3 font-medium">التقادم</th>
                  <th className="text-center p-3 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : paginatedContracts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-muted-foreground">لا توجد عقود مطابقة للبحث</p>
                    </td>
                  </tr>
                ) : (
                  paginatedContracts.map((contract, idx) => (
                    <motion.tr
                      key={contract.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedContract(contract)}
                    >
                      <td className="p-3 font-mono text-xs">{contract.contract_number}</td>
                      <td className="p-3">{contract.customer_name}</td>
                      <td className="p-3 text-muted-foreground">{contract.product_name}</td>
                      <td className="p-3">{contract.principal.toLocaleString('ar-EG')} ر.ي</td>
                      <td className="p-3"><ContractStatusBadge status={contract.status} /></td>
                      <td className="p-3 text-xs">{contract.interest_type === "REDUCING" ? "تنازلية" : contract.interest_type === "FLAT" ? "ثابتة" : contract.interest_type}</td>
                      <td className="p-3 text-xs">{contract.next_due_date}</td>
                      <td className="p-3">
                        <AgingBadge days={contract.aging_days} />
                        {contract.aging_days > 0 && <AgingBar days={contract.aging_days} />}
                      </td>
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="عرض تفاصيل العقد"
                            onClick={() => setSelectedContract(contract)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {contract.status === "DRAFT" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              aria-label="حذف العقد"
                              onClick={() => handleDeleteContract(contract.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              عرض {paginatedContracts.length} من {filtered.length} عقد
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                aria-label="الصفحة السابقة"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="text-sm px-3">
                صفحة {page.toLocaleString('ar-EG')} من {totalPages.toLocaleString('ar-EG')}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                aria-label="الصفحة التالية"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Contract Dialog */}
      <CreateContractDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSave={handleCreateContract}
      />

      {/* Payment Dialog (from list view) */}
      <RecordPaymentDialog
        open={showPaymentDialog && !selectedContract}
        onClose={() => setShowPaymentDialog(false)}
        contract={paymentContract}
        installment={paymentInstallment}
        onPaymentRecorded={handlePaymentRecorded}
      />
    </div>
  );
}

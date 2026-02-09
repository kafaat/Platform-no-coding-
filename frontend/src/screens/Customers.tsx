import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit3,
  Phone,
  Mail,
  Shield,
  FileText,
  CalendarCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  Trash2,
  Loader2,
  Check,
  AlertTriangle,
  X,
  ArrowUpCircle,
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
// ============================================================
// Loading Skeletons
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
        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
        <div className="h-7 w-14 bg-muted rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

// ============================================================
// KYC Badge
// ============================================================

const KYC_LABELS: Record<string, { ar: string; color: string }> = {
  NONE: { ar: "بدون", color: "bg-gray-100 text-gray-700" },
  BASIC: { ar: "أساسي", color: "bg-yellow-100 text-yellow-700" },
  FULL: { ar: "كامل", color: "bg-green-100 text-green-700" },
};

function KycBadge({ level, onClick }: { level: string; onClick?: () => void }) {
  const config = KYC_LABELS[level] || KYC_LABELS.NONE;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-all ${config.color} ${
        onClick ? "cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-primary/30" : ""
      }`}
      onClick={onClick}
    >
      <Shield className="h-3 w-3" />
      {config.ar}
    </span>
  );
}

// ============================================================
// Score Badge + Bar
// ============================================================

function ScoreBadge({ score }: { score: number }) {
  let color = "text-gray-500";
  if (score >= 700) color = "text-green-600";
  else if (score >= 500) color = "text-yellow-600";
  else if (score > 0) color = "text-red-600";
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${color}`}>
      <Star className="h-3.5 w-3.5" />
      {score > 0 ? score : "-"}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const maxScore = 1000;
  const pct = Math.min((score / maxScore) * 100, 100);
  let barColor = "bg-gray-300";
  if (score >= 700) barColor = "bg-green-500";
  else if (score >= 500) barColor = "bg-yellow-500";
  else if (score > 0) barColor = "bg-red-500";

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-10 text-left" dir="ltr">{score}/1000</span>
    </div>
  );
}

// ============================================================
// Data Types
// ============================================================

interface CustomerRow {
  id: number;
  code: string;
  name_ar: string;
  name_en: string;
  kyc_level: string;
  score: number;
  phone: string;
  email: string;
  contracts_count: number;
  reservations_count: number;
}

// ============================================================
// Initial Mock Data
// ============================================================

const initialCustomers: CustomerRow[] = [
  { id: 1, code: "CUST-001", name_ar: "أحمد محمد علي", name_en: "Ahmed Mohammed Ali", kyc_level: "FULL", score: 750, phone: "+967771234567", email: "ahmed@example.com", contracts_count: 2, reservations_count: 1 },
  { id: 2, code: "CUST-002", name_ar: "خالد عبدالله سعيد", name_en: "Khaled Abdullah Saeed", kyc_level: "FULL", score: 680, phone: "+967772345678", email: "khaled@example.com", contracts_count: 1, reservations_count: 0 },
  { id: 3, code: "CUST-003", name_ar: "فاطمة حسن أحمد", name_en: "Fatima Hassan Ahmed", kyc_level: "BASIC", score: 520, phone: "+967773456789", email: "fatima@example.com", contracts_count: 1, reservations_count: 2 },
  { id: 4, code: "CUST-004", name_ar: "عمر يوسف ناصر", name_en: "Omar Youssef Nasser", kyc_level: "FULL", score: 810, phone: "+967774567890", email: "omar@example.com", contracts_count: 3, reservations_count: 0 },
  { id: 5, code: "CUST-005", name_ar: "سالم عبدالرحمن", name_en: "Salem Abdulrahman", kyc_level: "NONE", score: 0, phone: "+967775678901", email: "", contracts_count: 0, reservations_count: 1 },
  { id: 6, code: "CUST-006", name_ar: "نورا محمد العمري", name_en: "Noura Mohammed Al-Amri", kyc_level: "FULL", score: 720, phone: "+967776789012", email: "noura@example.com", contracts_count: 1, reservations_count: 3 },
  { id: 7, code: "CUST-007", name_ar: "ياسر حمود الهاشمي", name_en: "Yasser Hamoud Al-Hashmi", kyc_level: "BASIC", score: 480, phone: "+967777890123", email: "yasser@example.com", contracts_count: 1, reservations_count: 0 },
  { id: 8, code: "CUST-008", name_ar: "مريم عبدالكريم", name_en: "Mariam Abdulkareem", kyc_level: "FULL", score: 690, phone: "+967778901234", email: "mariam@example.com", contracts_count: 2, reservations_count: 1 },
];

// ============================================================
// Customer Form Dialog (Add / Edit)
// ============================================================

function CustomerFormDialog({
  open,
  onClose,
  onSave,
  editCustomer,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (c: CustomerRow) => void;
  editCustomer: CustomerRow | null;
}) {
  const [code, setCode] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [kycLevel, setKycLevel] = useState<string>("NONE");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [score, setScore] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editCustomer) {
      setCode(editCustomer.code);
      setNameAr(editCustomer.name_ar);
      setNameEn(editCustomer.name_en);
      setKycLevel(editCustomer.kyc_level);
      setPhone(editCustomer.phone);
      setEmail(editCustomer.email);
      setScore(String(editCustomer.score));
    } else {
      setCode("");
      setNameAr("");
      setNameEn("");
      setKycLevel("NONE");
      setPhone("");
      setEmail("");
      setScore("");
    }
  }, [editCustomer, open]);

  const handleSave = () => {
    if (!code || !nameAr) return;
    setSaving(true);
    setTimeout(() => {
      const customer: CustomerRow = {
        id: editCustomer?.id || Date.now(),
        code,
        name_ar: nameAr,
        name_en: nameEn,
        kyc_level: kycLevel,
        score: Number(score) || 0,
        phone,
        email,
        contracts_count: editCustomer?.contracts_count || 0,
        reservations_count: editCustomer?.reservations_count || 0,
      };
      onSave(customer);
      setSaving(false);
      onClose();
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editCustomer ? "تعديل العميل" : "عميل جديد"}</DialogTitle>
          <DialogDescription>
            {editCustomer ? `تعديل بيانات العميل ${editCustomer.name_ar}` : "أدخل بيانات العميل الجديد"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5">
            <Label>الرمز <span className="text-destructive">*</span></Label>
            <Input
              placeholder="CUST-XXX"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={!!editCustomer}
            />
          </div>
          <div className="space-y-1.5">
            <Label>مستوى KYC</Label>
            <Select value={kycLevel} onValueChange={setKycLevel}>
              <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">بدون</SelectItem>
                <SelectItem value="BASIC">أساسي</SelectItem>
                <SelectItem value="FULL">كامل</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>الاسم بالعربية <span className="text-destructive">*</span></Label>
            <Input
              placeholder="الاسم الكامل بالعربية"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>الاسم بالإنجليزية</Label>
            <Input
              placeholder="Full name in English"
              dir="ltr"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>رقم الهاتف</Label>
            <Input
              placeholder="+967..."
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>البريد الإلكتروني</Label>
            <Input
              placeholder="email@example.com"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>التقييم</Label>
            <Input
              type="number"
              placeholder="0-1000"
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
            {Number(score) > 0 && (
              <div className="mt-1">
                <ScoreBar score={Number(score)} />
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>إلغاء</Button>
          <Button onClick={handleSave} disabled={!code || !nameAr || saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                جارِ الحفظ...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 ml-1" />
                {editCustomer ? "حفظ التعديلات" : "حفظ العميل"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Delete Confirmation Dialog
// ============================================================

function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  customerName,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  customerName: string;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = () => {
    setDeleting(true);
    setTimeout(() => {
      onConfirm();
      setDeleting(false);
      onClose();
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            تأكيد الحذف
          </DialogTitle>
          <DialogDescription>
            هل أنت متأكد من حذف العميل <strong>{customerName}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleting}>إلغاء</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={deleting}>
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                جارِ الحذف...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 ml-1" />
                حذف العميل
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// KYC Upgrade Dialog
// ============================================================

function KycUpgradeDialog({
  open,
  onClose,
  customer,
  onUpgrade,
}: {
  open: boolean;
  onClose: () => void;
  customer: CustomerRow | null;
  onUpgrade: (id: number, newLevel: string) => void;
}) {
  const [newLevel, setNewLevel] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (customer) {
      if (customer.kyc_level === "NONE") setNewLevel("BASIC");
      else if (customer.kyc_level === "BASIC") setNewLevel("FULL");
      else setNewLevel("FULL");
    }
    setDone(false);
  }, [customer, open]);

  const handleUpgrade = () => {
    if (!customer) return;
    setUpgrading(true);
    setTimeout(() => {
      onUpgrade(customer.id, newLevel);
      setUpgrading(false);
      setDone(true);
      setTimeout(() => {
        setDone(false);
        onClose();
      }, 1000);
    }, 600);
  };

  const canUpgrade = customer && customer.kyc_level !== "FULL";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-primary" />
            ترقية مستوى KYC
          </DialogTitle>
          <DialogDescription>
            {customer?.name_ar} — المستوى الحالي: {KYC_LABELS[customer?.kyc_level || "NONE"]?.ar}
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center py-6 gap-3"
          >
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-700">تم ترقية المستوى بنجاح</p>
          </motion.div>
        ) : canUpgrade ? (
          <>
            <div className="py-4">
              <div className="flex items-center justify-center gap-4">
                <KycBadge level={customer?.kyc_level || "NONE"} />
                <ArrowRight className="h-5 w-5 text-primary rotate-180" />
                <KycBadge level={newLevel} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={upgrading}>إلغاء</Button>
              <Button onClick={handleUpgrade} disabled={upgrading}>
                {upgrading ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                    جارِ الترقية...
                  </>
                ) : (
                  <>
                    <ArrowUpCircle className="h-4 w-4 ml-1" />
                    ترقية إلى {KYC_LABELS[newLevel]?.ar}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">العميل في أعلى مستوى KYC بالفعل (كامل)</p>
            <Button variant="outline" className="mt-4" onClick={onClose}>حسناً</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Customer Detail (Expanded Row)
// ============================================================

function CustomerDetail({
  customer,
  onBack,
  onEdit,
  onKycUpgrade,
}: {
  customer: CustomerRow;
  onBack: () => void;
  onEdit: () => void;
  onKycUpgrade: () => void;
}) {
  const [tab, setTab] = useState("info");

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowRight className="h-4 w-4 ml-1" />
        العودة إلى القائمة
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{customer.name_ar}</h2>
          <p className="text-sm text-muted-foreground">{customer.name_en} — {customer.code}</p>
        </div>
        <div className="flex items-center gap-3">
          <KycBadge level={customer.kyc_level} onClick={onKycUpgrade} />
          <ScoreBadge score={customer.score} />
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit3 className="h-4 w-4 ml-1" />
            تعديل
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="info" className="text-xs gap-1">
            <Users className="h-3.5 w-3.5" />
            المعلومات
          </TabsTrigger>
          <TabsTrigger value="contracts" className="text-xs gap-1">
            <FileText className="h-3.5 w-3.5" />
            العقود ({customer.contracts_count})
          </TabsTrigger>
          <TabsTrigger value="reservations" className="text-xs gap-1">
            <CalendarCheck className="h-3.5 w-3.5" />
            الحجوزات ({customer.reservations_count})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">الرمز</Label>
                <p className="font-mono">{customer.code}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">مستوى KYC</Label>
                <div className="flex items-center gap-2">
                  <KycBadge level={customer.kyc_level} onClick={onKycUpgrade} />
                  {customer.kyc_level !== "FULL" && (
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-primary" onClick={onKycUpgrade}>
                      <ArrowUpCircle className="h-3 w-3 ml-1" />
                      ترقية
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">رقم الهاتف</Label>
                <p className="flex items-center gap-1" dir="ltr">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {customer.phone}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">البريد الإلكتروني</Label>
                <p className="flex items-center gap-1" dir="ltr">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {customer.email || "غير محدد"}
                </p>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs text-muted-foreground">التقييم الائتماني</Label>
                <div className="flex items-center gap-3">
                  <ScoreBadge score={customer.score} />
                  <div className="flex-1 max-w-xs">
                    <ScoreBar score={customer.score} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="contracts" className="mt-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {customer.contracts_count > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-right p-2 font-medium">رقم العقد</th>
                    <th className="text-right p-2 font-medium">المنتج</th>
                    <th className="text-right p-2 font-medium">المبلغ</th>
                    <th className="text-right p-2 font-medium">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: customer.contracts_count }).map((_, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/20">
                      <td className="p-2 font-mono text-xs">CTR-2024-{String(idx + 1).padStart(3, "0")}</td>
                      <td className="p-2">{idx % 2 === 0 ? "قرض شخصي ميسر" : "تمويل عقاري"}</td>
                      <td className="p-2">{((idx + 1) * 2500000).toLocaleString('ar-EG')} ر.ي</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${idx === 0 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                          {idx === 0 ? "نشط" : "مُعاد هيكلته"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد عقود مرتبطة</p>
              </div>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="reservations" className="mt-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {customer.reservations_count > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-right p-2 font-medium">المنتج</th>
                    <th className="text-right p-2 font-medium">من</th>
                    <th className="text-right p-2 font-medium">إلى</th>
                    <th className="text-right p-2 font-medium">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: customer.reservations_count }).map((_, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/20">
                      <td className="p-2">{idx % 2 === 0 ? "غرفة فندقية ديلوكس" : "قاعة مؤتمرات"}</td>
                      <td className="p-2">2024-09-{String(10 + idx).padStart(2, "0")}</td>
                      <td className="p-2">2024-09-{String(12 + idx).padStart(2, "0")}</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${idx === 0 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {idx === 0 ? "مؤكد" : "محجوز مؤقتاً"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد حجوزات مرتبطة</p>
              </div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function Customers() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [kycFilter, setKycFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRow | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomerRow | null>(null);
  const [showKycDialog, setShowKycDialog] = useState(false);
  const [kycTarget, setKycTarget] = useState<CustomerRow | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setCustomers(initialCustomers);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // Reset page on filter changes
  useEffect(() => { setPage(1); }, [kycFilter, debouncedSearch]);

  // CRUD: Add or update
  const handleSaveCustomer = useCallback((customer: CustomerRow) => {
    setCustomers((prev) => {
      const exists = prev.find((c) => c.id === customer.id);
      if (exists) {
        return prev.map((c) => (c.id === customer.id ? customer : c));
      }
      return [customer, ...prev];
    });
    // Update selected customer if editing
    if (selectedCustomer && selectedCustomer.id === customer.id) {
      setSelectedCustomer(customer);
    }
  }, [selectedCustomer]);

  // CRUD: Delete
  const handleDeleteCustomer = useCallback((id: number) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    if (selectedCustomer?.id === id) setSelectedCustomer(null);
  }, [selectedCustomer]);

  // KYC Upgrade
  const handleKycUpgrade = useCallback((id: number, newLevel: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, kyc_level: newLevel } : c))
    );
    if (selectedCustomer?.id === id) {
      setSelectedCustomer((prev) => prev ? { ...prev, kyc_level: newLevel } : prev);
    }
  }, [selectedCustomer]);

  // Open edit dialog
  const openEditDialog = (customer: CustomerRow) => {
    setEditingCustomer(customer);
    setShowFormDialog(true);
  };

  // Open create dialog
  const openCreateDialog = () => {
    setEditingCustomer(null);
    setShowFormDialog(true);
  };

  // Open delete dialog
  const openDeleteDialog = (customer: CustomerRow) => {
    setDeleteTarget(customer);
    setShowDeleteDialog(true);
  };

  // Open KYC dialog
  const openKycDialog = (customer: CustomerRow) => {
    setKycTarget(customer);
    setShowKycDialog(true);
  };

  // Filter + search
  const filtered = customers.filter((c) => {
    if (kycFilter !== "ALL" && c.kyc_level !== kycFilter) return false;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      if (
        !c.name_ar.includes(debouncedSearch) &&
        !c.name_en.toLowerCase().includes(q) &&
        !c.code.toLowerCase().includes(q) &&
        !c.phone.includes(debouncedSearch) &&
        !c.email.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedCustomers = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Stats
  const totalCount = customers.length;
  const fullKycCount = customers.filter((c) => c.kyc_level === "FULL").length;
  const basicKycCount = customers.filter((c) => c.kyc_level === "BASIC").length;
  const avgScore = customers.filter((c) => c.score > 0).length > 0
    ? Math.round(customers.filter((c) => c.score > 0).reduce((s, c) => s + c.score, 0) / customers.filter((c) => c.score > 0).length)
    : 0;

  // If viewing detail
  if (selectedCustomer) {
    return (
      <div className="space-y-4">
        <CustomerDetail
          customer={selectedCustomer}
          onBack={() => setSelectedCustomer(null)}
          onEdit={() => openEditDialog(selectedCustomer)}
          onKycUpgrade={() => openKycDialog(selectedCustomer)}
        />
        <CustomerFormDialog
          open={showFormDialog}
          onClose={() => { setShowFormDialog(false); setEditingCustomer(null); }}
          onSave={handleSaveCustomer}
          editCustomer={editingCustomer}
        />
        <KycUpgradeDialog
          open={showKycDialog}
          onClose={() => setShowKycDialog(false)}
          customer={kycTarget}
          onUpgrade={handleKycUpgrade}
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
            <Users className="h-6 w-6" />
            العملاء
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة بيانات العملاء ومستويات KYC
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled title="قريباً">
            <Download className="h-4 w-4 ml-1" />
            تصدير
          </Button>
          <Button size="sm" onClick={openCreateDialog}>
            <Plus className="h-4 w-4 ml-1" />
            عميل جديد
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
                <p className="text-xs text-muted-foreground">إجمالي العملاء</p>
                <motion.p key={totalCount} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-2xl font-bold">
                  {totalCount.toLocaleString('ar-EG')}
                </motion.p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">KYC كامل</p>
                <p className="text-2xl font-bold text-green-600">{fullKycCount.toLocaleString('ar-EG')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">KYC أساسي</p>
                <p className="text-2xl font-bold text-yellow-600">{basicKycCount.toLocaleString('ar-EG')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">متوسط التقييم</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{avgScore.toLocaleString('ar-EG')}</p>
                  <div className="flex-1 max-w-[80px]">
                    <ScoreBar score={avgScore} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو الرمز أو الهاتف أو البريد..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9"
              />
            </div>
            <Select value={kycFilter} onValueChange={setKycFilter}>
              <SelectTrigger className="w-44">
                <Filter className="h-4 w-4 ml-2" />
                <SelectValue placeholder="مستوى KYC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">جميع المستويات</SelectItem>
                <SelectItem value="NONE">بدون</SelectItem>
                <SelectItem value="BASIC">أساسي</SelectItem>
                <SelectItem value="FULL">كامل</SelectItem>
              </SelectContent>
            </Select>
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

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-right p-3 font-medium">الرمز</th>
                  <th className="text-right p-3 font-medium">الاسم</th>
                  <th className="text-right p-3 font-medium">KYC</th>
                  <th className="text-right p-3 font-medium">التقييم</th>
                  <th className="text-right p-3 font-medium">الهاتف</th>
                  <th className="text-right p-3 font-medium">البريد</th>
                  <th className="text-right p-3 font-medium">العقود</th>
                  <th className="text-right p-3 font-medium">الحجوزات</th>
                  <th className="text-center p-3 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : paginatedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-muted-foreground">لا يوجد عملاء مطابقون للبحث</p>
                    </td>
                  </tr>
                ) : (
                  paginatedCustomers.map((customer, idx) => (
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <td className="p-3 font-mono text-xs">{customer.code}</td>
                      <td className="p-3">
                        <p className="font-medium">{customer.name_ar}</p>
                        <p className="text-xs text-muted-foreground">{customer.name_en}</p>
                      </td>
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <KycBadge
                          level={customer.kyc_level}
                          onClick={() => openKycDialog(customer)}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <ScoreBadge score={customer.score} />
                          {customer.score > 0 && (
                            <div className="w-16">
                              <ScoreBar score={customer.score} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-xs font-mono" dir="ltr">{customer.phone}</td>
                      <td className="p-3 text-xs" dir="ltr">{customer.email || "-"}</td>
                      <td className="p-3 text-center">{customer.contracts_count}</td>
                      <td className="p-3 text-center">{customer.reservations_count}</td>
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="عرض تفاصيل العميل"
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="تعديل العميل"
                            onClick={() => openEditDialog(customer)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            aria-label="حذف العميل"
                            onClick={() => openDeleteDialog(customer)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
              عرض {paginatedCustomers.length} من {filtered.length} عميل
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

      {/* Dialogs */}
      <CustomerFormDialog
        open={showFormDialog}
        onClose={() => { setShowFormDialog(false); setEditingCustomer(null); }}
        onSave={handleSaveCustomer}
        editCustomer={editingCustomer}
      />

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => deleteTarget && handleDeleteCustomer(deleteTarget.id)}
        customerName={deleteTarget?.name_ar || ""}
      />

      <KycUpgradeDialog
        open={showKycDialog}
        onClose={() => setShowKycDialog(false)}
        customer={kycTarget}
        onUpgrade={handleKycUpgrade}
      />
    </div>
  );
}

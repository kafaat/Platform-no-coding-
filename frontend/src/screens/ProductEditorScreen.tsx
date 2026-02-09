import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Save,
  Package,
  Monitor,
  Wrench,
  CalendarRange,
  Landmark,
  Plus,
  Trash2,
  GripVertical,
  Calendar,
  Tag,
  DollarSign,
  Radio,
  Hash,
  BookOpen,
  CreditCard,
  Layers,
  ShieldCheck,
  FileText,
  ToggleRight,
  Check,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  CloudOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import type { ProductType } from "@/types";

// ============================================================
// Props
// ============================================================

interface ProductEditorScreenProps {
  onBack: () => void;
}

// ============================================================
// Simulated API
// ============================================================

function simulateApiCall<T>(data: T, delayMs = 600): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delayMs);
  });
}

// ============================================================
// Toast
// ============================================================

interface ToastMessage {
  id: number;
  type: "success" | "error";
  message: string;
}

function ToastNotification({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium ${
        toast.type === "success"
          ? "bg-green-50 text-green-800 border-green-200"
          : "bg-red-50 text-red-800 border-red-200"
      }`}
    >
      {toast.type === "success" ? (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0" />
      )}
      {toast.message}
    </motion.div>
  );
}

// ============================================================
// Type icons
// ============================================================

const typeIcons: Record<ProductType, React.ReactNode> = {
  PHYSICAL: <Package className="h-4 w-4" />,
  DIGITAL: <Monitor className="h-4 w-4" />,
  SERVICE: <Wrench className="h-4 w-4" />,
  RESERVATION: <CalendarRange className="h-4 w-4" />,
  FINANCIAL: <Landmark className="h-4 w-4" />,
};

// ============================================================
// Animation
// ============================================================

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// ============================================================
// Skeleton Component
// ============================================================

function EditorSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-24" />
          <div className="h-10 bg-muted rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-28" />
          <div className="h-10 bg-muted rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-20" />
          <div className="h-10 bg-muted rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-16" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-12" />
        <div className="h-24 bg-muted rounded" />
      </div>
      <div className="h-14 bg-muted rounded-lg" />
    </div>
  );
}

// ============================================================
// Form State Types
// ============================================================

interface FormState {
  nameAr: string;
  nameEn: string;
  type: string;
  category: string;
  divisible: boolean;
  description: string;
  lifecycleFrom: string;
  lifecycleTo: string;
}

interface AttrRow {
  id: number;
  code: string;
  label_ar: string;
  datatype: string;
  required: boolean;
  value: string;
}

interface PriceRow {
  id: number;
  list_name: string;
  currency: string;
  base_price: string;
  min_price: string;
  max_price: string;
}

interface ChannelRow {
  id: number;
  code: string;
  name_ar: string;
  enabled: boolean;
  feature_flags: Record<string, boolean>;
}

interface VersionRow {
  id: number;
  version_no: number;
  effective_from: string;
  effective_to: string;
  approved_by: string | null;
  status: "current" | "future" | "expired";
}

interface CompositionRow {
  id: number;
  child_name_ar: string;
  child_sku: string;
  qty: string;
  policy: string;
  price_ratio: string;
}

interface EligibilityRow {
  id: number;
  name: string;
  condition_cel: string;
}

interface DocumentReq {
  id: number;
  name_ar: string;
  mandatory: boolean;
}

interface AccountingMapRow {
  id: number;
  event: string;
  event_ar: string;
  template_name: string;
  dr_account: string;
  cr_account: string;
}

interface ChargeRow {
  id: number;
  code: string;
  name: string;
  kind: string;
  basis: string;
  value: string;
  when_event: string;
}

// ============================================================
// Validation types
// ============================================================

interface ValidationErrors {
  basic: Record<string, string>;
  attributes: Record<number, string>;
  pricing: Record<number, string>;
  versions: Record<number, string>;
  composition: Record<number, string>;
  eligibility: Record<number, string>;
}

// ============================================================
// Initial data
// ============================================================

const initialFormState: FormState = {
  nameAr: "قرض شخصي ميسر",
  nameEn: "Personal Loan",
  type: "FINANCIAL",
  category: "51",
  divisible: true,
  description: "قرض شخصي بمعدل فائدة تنافسي ومدة سداد مرنة تصل إلى 60 شهراً",
  lifecycleFrom: "2024-04-01",
  lifecycleTo: "",
};

const initialAttrs: AttrRow[] = [
  { id: 1, code: "interest_rate", label_ar: "معدل الفائدة السنوي", datatype: "NUMBER", required: true, value: "12" },
  { id: 2, code: "max_tenure", label_ar: "أقصى مدة (شهر)", datatype: "NUMBER", required: true, value: "60" },
  { id: 3, code: "grace_period", label_ar: "فترة السماح (يوم)", datatype: "NUMBER", required: false, value: "30" },
  { id: 4, code: "collateral_required", label_ar: "ضمان مطلوب", datatype: "BOOL", required: true, value: "نعم" },
];

const initialPricing: PriceRow[] = [
  { id: 1, list_name: "قائمة الأسعار الرئيسية", currency: "YER", base_price: "500000", min_price: "100000", max_price: "5000000" },
  { id: 2, list_name: "قائمة أسعار الدولار", currency: "USD", base_price: "1000", min_price: "200", max_price: "10000" },
];

const initialChannels: ChannelRow[] = [
  { id: 1, code: "WEB", name_ar: "الموقع الإلكتروني", enabled: true, feature_flags: { show_price: true, allow_apply: true, show_calculator: true } },
  { id: 2, code: "MOBILE", name_ar: "تطبيق الجوال", enabled: true, feature_flags: { show_price: true, allow_apply: true, show_calculator: false } },
  { id: 3, code: "POS", name_ar: "نقطة البيع", enabled: false, feature_flags: { show_price: false, allow_apply: false, show_calculator: false } },
  { id: 4, code: "API", name_ar: "واجهة برمجة التطبيقات", enabled: true, feature_flags: { show_price: true, allow_apply: true, show_calculator: true } },
  { id: 5, code: "USSD", name_ar: "خدمة USSD", enabled: false, feature_flags: { show_price: false, allow_apply: false, show_calculator: false } },
];

const initialVersions: VersionRow[] = [
  { id: 1, version_no: 1, effective_from: "2024-04-01", effective_to: "2024-09-30", approved_by: "أحمد محمد", status: "expired" },
  { id: 2, version_no: 2, effective_from: "2024-10-01", effective_to: "", approved_by: "سارة علي", status: "current" },
];

const initialComposition: CompositionRow[] = [
  { id: 1, child_name_ar: "تأمين على الحياة", child_sku: "INS-LIFE-001", qty: "1", policy: "NO_EXPLODE", price_ratio: "5" },
  { id: 2, child_name_ar: "خدمة توثيق", child_sku: "SRV-DOC-001", qty: "1", policy: "EXPLODE", price_ratio: "2" },
];

const initialEligibility: EligibilityRow[] = [
  { id: 1, name: "الحد الأدنى للراتب", condition_cel: 'customer.salary >= 100000' },
  { id: 2, name: "مستوى KYC", condition_cel: 'customer.kyc_level == "FULL"' },
  { id: 3, name: "العمر", condition_cel: "customer.age >= 21 && customer.age <= 60" },
];

const initialDocuments: DocumentReq[] = [
  { id: 1, name_ar: "بطاقة الهوية الوطنية", mandatory: true },
  { id: 2, name_ar: "كشف حساب بنكي (3 أشهر)", mandatory: true },
  { id: 3, name_ar: "إثبات الدخل", mandatory: true },
  { id: 4, name_ar: "عقد العمل", mandatory: false },
  { id: 5, name_ar: "كفيل", mandatory: false },
];

const initialAccountingMaps: AccountingMapRow[] = [
  { id: 1, event: "DISBURSEMENT", event_ar: "صرف القرض", template_name: "قالب صرف القروض", dr_account: "1301-LOANS-RCV", cr_account: "1101-CASH" },
  { id: 2, event: "PRINCIPAL_PAYMENT", event_ar: "سداد أصل الدين", template_name: "قالب سداد الأصل", dr_account: "1101-CASH", cr_account: "1301-LOANS-RCV" },
  { id: 3, event: "INTEREST_PAYMENT", event_ar: "سداد الفوائد", template_name: "قالب سداد الفوائد", dr_account: "1101-CASH", cr_account: "4101-INT-INCOME" },
];

const initialCharges: ChargeRow[] = [
  { id: 1, code: "PROC_FEE", name: "رسوم معالجة", kind: "FEE", basis: "PERCENT", value: "2.5", when_event: "OnDisburse" },
  { id: 2, code: "LATE_PEN", name: "غرامة تأخير", kind: "FINE", basis: "FIXED", value: "5000", when_event: "OnLate" },
  { id: 3, code: "INS_FEE", name: "رسوم تأمين", kind: "FEE", basis: "FIXED", value: "10000", when_event: "OnDisburse" },
];

const flagLabels: Record<string, string> = {
  show_price: "عرض السعر",
  allow_apply: "السماح بالتقديم",
  show_calculator: "إظهار الحاسبة",
};

const chargeKindLabels: Record<string, string> = {
  FEE: "رسوم",
  FINE: "غرامة",
  SUBSCRIPTION: "اشتراك",
  COMMISSION: "عمولة",
};

// ============================================================
// Tab config
// ============================================================

interface TabConfig {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabConfig[] = [
  { value: "basic", label: "أساسي", icon: <Package className="h-4 w-4" /> },
  { value: "versions", label: "الإصدارات", icon: <Calendar className="h-4 w-4" /> },
  { value: "attributes", label: "الخصائص", icon: <Tag className="h-4 w-4" /> },
  { value: "pricing", label: "التسعير", icon: <DollarSign className="h-4 w-4" /> },
  { value: "channels", label: "القنوات", icon: <Radio className="h-4 w-4" /> },
  { value: "numbering", label: "الترقيم", icon: <Hash className="h-4 w-4" /> },
  { value: "accounting", label: "المحاسبة", icon: <BookOpen className="h-4 w-4" /> },
  { value: "charges", label: "الرسوم", icon: <CreditCard className="h-4 w-4" /> },
  { value: "composition", label: "التكوين", icon: <Layers className="h-4 w-4" /> },
  { value: "eligibility", label: "الأهلية", icon: <ShieldCheck className="h-4 w-4" /> },
];

// ============================================================
// Main Component
// ============================================================

export default function ProductEditorScreen({ onBack }: ProductEditorScreenProps) {
  // ---- Loading state ----
  const [isPageLoading, setIsPageLoading] = useState(true);

  // ---- Form state ----
  const [form, setForm] = useState<FormState>(initialFormState);
  const [initialForm, setInitialForm] = useState<FormState>(initialFormState);

  // ---- Tab data states ----
  const [attrs, setAttrs] = useState<AttrRow[]>(initialAttrs);
  const [pricing, setPricing] = useState<PriceRow[]>(initialPricing);
  const [channels, setChannels] = useState<ChannelRow[]>(initialChannels);
  const [versions, setVersions] = useState<VersionRow[]>(initialVersions);
  const [composition, setComposition] = useState<CompositionRow[]>(initialComposition);
  const [eligibility, setEligibility] = useState<EligibilityRow[]>(initialEligibility);
  const [documents, setDocuments] = useState<DocumentReq[]>(initialDocuments);
  const [accountingMaps] = useState<AccountingMapRow[]>(initialAccountingMaps);
  const [charges, setCharges] = useState<ChargeRow[]>(initialCharges);
  const [scheme, setScheme] = useState("FIN-LOAN");

  // ---- Validation ----
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    basic: {},
    attributes: {},
    pricing: {},
    versions: {},
    composition: {},
    eligibility: {},
  });

  // ---- Saving ----
  const [isSaving, setIsSaving] = useState(false);

  // ---- Auto-save ----
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Toast ----
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastIdRef = useRef(0);

  // ---- New item dialog ----
  const [showAddVersionDialog, setShowAddVersionDialog] = useState(false);
  const [newVersionFrom, setNewVersionFrom] = useState("");
  const [newVersionTo, setNewVersionTo] = useState("");
  const [newVersionError, setNewVersionError] = useState("");

  // ---- ID counter for new items ----
  const nextIdRef = useRef(100);
  const getNextId = () => ++nextIdRef.current;

  // ---- Toast helpers ----
  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ---- Dirty tracking ----
  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(initialForm);
  }, [form, initialForm]);

  // ---- Initial load simulation ----
  useEffect(() => {
    setIsPageLoading(true);
    simulateApiCall(true, 700).then(() => {
      setIsPageLoading(false);
    });
  }, []);

  // ---- Auto-save draft (debounced 2s) ----
  useEffect(() => {
    if (!isDirty || isPageLoading) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      setAutoSaveStatus("saving");
      simulateApiCall(true, 500).then(() => {
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 2000);
      });
    }, 2000);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [form, isDirty, isPageLoading]);

  // ---- Form field updater ----
  const updateForm = useCallback((field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    setValidationErrors((prev) => ({
      ...prev,
      basic: { ...prev.basic, [field]: "" },
    }));
  }, []);

  // ---- Validation ----
  const validate = useCallback((): boolean => {
    const errors: ValidationErrors = {
      basic: {},
      attributes: {},
      pricing: {},
      versions: {},
      composition: {},
      eligibility: {},
    };
    let valid = true;

    // Basic tab validation
    if (!form.nameAr.trim()) {
      errors.basic.nameAr = "الاسم بالعربية مطلوب";
      valid = false;
    }
    if (!form.type) {
      errors.basic.type = "نوع المنتج مطلوب";
      valid = false;
    }
    if (!form.category) {
      errors.basic.category = "التصنيف مطلوب";
      valid = false;
    }

    // Attributes validation
    attrs.forEach((attr) => {
      if (attr.required && !attr.value.trim()) {
        errors.attributes[attr.id] = "هذا الحقل مطلوب";
        valid = false;
      }
      if (attr.datatype === "NUMBER" && attr.value.trim() && isNaN(Number(attr.value))) {
        errors.attributes[attr.id] = "يجب أن يكون رقماً";
        valid = false;
      }
    });

    // Pricing validation: min <= base <= max
    pricing.forEach((p) => {
      const base = Number(p.base_price);
      const min = p.min_price ? Number(p.min_price) : null;
      const max = p.max_price ? Number(p.max_price) : null;
      if (!p.base_price || isNaN(base) || base <= 0) {
        errors.pricing[p.id] = "السعر الأساسي مطلوب ويجب أن يكون أكبر من صفر";
        valid = false;
      } else if (min !== null && !isNaN(min) && min > base) {
        errors.pricing[p.id] = "الحد الأدنى يجب أن يكون أقل من أو يساوي السعر الأساسي";
        valid = false;
      } else if (max !== null && !isNaN(max) && max < base) {
        errors.pricing[p.id] = "الحد الأقصى يجب أن يكون أكبر من أو يساوي السعر الأساسي";
        valid = false;
      }
    });

    // Composition validation
    composition.forEach((c) => {
      if (!c.qty || isNaN(Number(c.qty)) || Number(c.qty) <= 0) {
        errors.composition[c.id] = "الكمية مطلوبة ويجب أن تكون أكبر من صفر";
        valid = false;
      }
    });

    setValidationErrors(errors);
    return valid;
  }, [form, attrs, pricing, composition]);

  // ---- Tab error indicators ----
  const tabHasErrors = useMemo(() => {
    const errs: Record<string, boolean> = {};
    errs.basic = Object.values(validationErrors.basic).some((e) => !!e);
    errs.attributes = Object.values(validationErrors.attributes).some((e) => !!e);
    errs.pricing = Object.values(validationErrors.pricing).some((e) => !!e);
    errs.versions = Object.values(validationErrors.versions).some((e) => !!e);
    errs.composition = Object.values(validationErrors.composition).some((e) => !!e);
    errs.eligibility = Object.values(validationErrors.eligibility).some((e) => !!e);
    return errs;
  }, [validationErrors]);

  // ---- Save handler ----
  const handleSave = async () => {
    if (!validate()) {
      addToast("error", "يرجى تصحيح الأخطاء قبل الحفظ");
      return;
    }
    setIsSaving(true);
    try {
      await simulateApiCall(true, 800);
      setInitialForm({ ...form });
      addToast("success", "تم حفظ المنتج بنجاح");
    } catch {
      addToast("error", "حدث خطأ أثناء حفظ المنتج");
    } finally {
      setIsSaving(false);
    }
  };

  // ---- Attribute handlers ----
  const updateAttrValue = (id: number, value: string) => {
    setAttrs((prev) => prev.map((a) => (a.id === id ? { ...a, value } : a)));
    setValidationErrors((prev) => ({
      ...prev,
      attributes: { ...prev.attributes, [id]: "" },
    }));
  };

  const removeAttr = (id: number) => {
    setAttrs((prev) => prev.filter((a) => a.id !== id));
  };

  const addAttr = () => {
    const id = getNextId();
    setAttrs((prev) => [
      ...prev,
      { id, code: `attr_${id}`, label_ar: "سمة جديدة", datatype: "TEXT", required: false, value: "" },
    ]);
  };

  // ---- Pricing handlers ----
  const updatePricingField = (id: number, field: keyof PriceRow, value: string) => {
    setPricing((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    setValidationErrors((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, [id]: "" },
    }));
  };

  const removePricing = (id: number) => {
    setPricing((prev) => prev.filter((p) => p.id !== id));
  };

  const addPricing = () => {
    const id = getNextId();
    setPricing((prev) => [
      ...prev,
      { id, list_name: "قائمة أسعار جديدة", currency: "YER", base_price: "", min_price: "", max_price: "" },
    ]);
  };

  // ---- Channel handlers ----
  const toggleChannel = (id: number) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, enabled: !ch.enabled } : ch))
    );
  };

  const toggleFlag = (channelId: number, flag: string) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === channelId
          ? { ...ch, feature_flags: { ...ch.feature_flags, [flag]: !ch.feature_flags[flag] } }
          : ch
      )
    );
  };

  // ---- Version handlers ----
  const checkDateOverlap = (from: string, to: string): boolean => {
    const newFrom = new Date(from).getTime();
    const newTo = to ? new Date(to).getTime() : Infinity;
    return versions.some((v) => {
      const vFrom = new Date(v.effective_from).getTime();
      const vTo = v.effective_to ? new Date(v.effective_to).getTime() : Infinity;
      return newFrom <= vTo && newTo >= vFrom;
    });
  };

  const addVersion = () => {
    if (!newVersionFrom) {
      setNewVersionError("تاريخ البداية مطلوب");
      return;
    }
    if (checkDateOverlap(newVersionFrom, newVersionTo)) {
      setNewVersionError("يوجد تداخل مع إصدار آخر (BR-01)");
      return;
    }
    const id = getNextId();
    const maxVersion = versions.reduce((max, v) => Math.max(max, v.version_no), 0);
    setVersions((prev) => [
      ...prev,
      {
        id,
        version_no: maxVersion + 1,
        effective_from: newVersionFrom,
        effective_to: newVersionTo,
        approved_by: null,
        status: "future",
      },
    ]);
    setShowAddVersionDialog(false);
    setNewVersionFrom("");
    setNewVersionTo("");
    setNewVersionError("");
    addToast("success", `تم إضافة الإصدار ${maxVersion + 1} بنجاح`);
  };

  const removeVersion = (id: number) => {
    setVersions((prev) => prev.filter((v) => v.id !== id));
  };

  // ---- Composition handlers ----
  const updateCompositionField = (id: number, field: keyof CompositionRow, value: string) => {
    setComposition((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
    setValidationErrors((prev) => ({
      ...prev,
      composition: { ...prev.composition, [id]: "" },
    }));
  };

  const removeComposition = (id: number) => {
    setComposition((prev) => prev.filter((c) => c.id !== id));
  };

  const addComposition = () => {
    const id = getNextId();
    setComposition((prev) => [
      ...prev,
      { id, child_name_ar: "منتج فرعي جديد", child_sku: `SUB-${id}`, qty: "1", policy: "NO_EXPLODE", price_ratio: "0" },
    ]);
  };

  // ---- Eligibility handlers ----
  const removeEligibility = (id: number) => {
    setEligibility((prev) => prev.filter((e) => e.id !== id));
  };

  const addEligibility = () => {
    const id = getNextId();
    setEligibility((prev) => [
      ...prev,
      { id, name: "قاعدة جديدة", condition_cel: "" },
    ]);
  };

  const updateEligibility = (id: number, field: keyof EligibilityRow, value: string) => {
    setEligibility((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  // ---- Document handlers ----
  const removeDocument = (id: number) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const addDocument = () => {
    const id = getNextId();
    setDocuments((prev) => [
      ...prev,
      { id, name_ar: "مستند جديد", mandatory: false },
    ]);
  };

  const toggleDocMandatory = (id: number) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, mandatory: !d.mandatory } : d))
    );
  };

  // ---- Charges handlers ----
  const removeCharge = (id: number) => {
    setCharges((prev) => prev.filter((c) => c.id !== id));
  };

  const addCharge = () => {
    const id = getNextId();
    setCharges((prev) => [
      ...prev,
      { id, code: `CHG_${id}`, name: "رسم جديد", kind: "FEE", basis: "FIXED", value: "0", when_event: "OnDisburse" },
    ]);
  };

  // ============================================================
  // Version status labels
  // ============================================================

  const versionStatusLabels: Record<string, { label: string; className: string }> = {
    current: { label: "حالي", className: "bg-green-100 text-green-700" },
    future: { label: "مستقبلي", className: "bg-blue-100 text-blue-700" },
    expired: { label: "منتهي", className: "bg-gray-100 text-gray-600" },
  };

  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Toast container */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastNotification key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>

      {/* ── Header ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">محرر المنتج</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {form.nameAr || "منتج جديد"} — <span className="font-mono">FIN-LN-001</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Dirty indicator */}
          {isDirty && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200 text-xs font-medium"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              لديك تغييرات غير محفوظة
            </motion.div>
          )}
          {/* Auto-save indicator */}
          {autoSaveStatus === "saving" && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              حفظ تلقائي...
            </span>
          )}
          {autoSaveStatus === "saved" && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <CloudOff className="h-3 w-3" />
              تم الحفظ
            </span>
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onBack}>
              إلغاء
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 ml-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 ml-1" />
              )}
              حفظ
            </Button>
          </div>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────── */}
      <Tabs defaultValue="basic" dir="rtl">
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex w-auto min-w-full lg:min-w-0 h-auto flex-wrap gap-1 p-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5 relative"
              >
                {tab.icon}
                {tab.label}
                {tabHasErrors[tab.value] && (
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ── أساسي ──────── */}
        <TabsContent value="basic">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                البيانات الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPageLoading ? (
                <EditorSkeleton />
              ) : (
                <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* الاسم بالعربية */}
                    <div className="space-y-2">
                      <Label htmlFor="name_ar">الاسم بالعربية *</Label>
                      <Input
                        id="name_ar"
                        value={form.nameAr}
                        onChange={(e) => updateForm("nameAr", e.target.value)}
                        placeholder="أدخل اسم المنتج بالعربية"
                        dir="rtl"
                        className={validationErrors.basic.nameAr ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                      {validationErrors.basic.nameAr && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {validationErrors.basic.nameAr}
                        </p>
                      )}
                    </div>
                    {/* الاسم بالإنجليزية */}
                    <div className="space-y-2">
                      <Label htmlFor="name_en">الاسم بالإنجليزية</Label>
                      <Input
                        id="name_en"
                        value={form.nameEn}
                        onChange={(e) => updateForm("nameEn", e.target.value)}
                        placeholder="Enter product name in English"
                        dir="ltr"
                      />
                    </div>
                    {/* نوع المنتج */}
                    <div className="space-y-2">
                      <Label>نوع المنتج *</Label>
                      <Select value={form.type} onValueChange={(v) => updateForm("type", v)}>
                        <SelectTrigger className={validationErrors.basic.type ? "border-red-500" : ""}>
                          <SelectValue placeholder="اختر النوع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PHYSICAL">
                            <span className="flex items-center gap-2">{typeIcons.PHYSICAL} مادي</span>
                          </SelectItem>
                          <SelectItem value="DIGITAL">
                            <span className="flex items-center gap-2">{typeIcons.DIGITAL} رقمي</span>
                          </SelectItem>
                          <SelectItem value="SERVICE">
                            <span className="flex items-center gap-2">{typeIcons.SERVICE} خدمة</span>
                          </SelectItem>
                          <SelectItem value="RESERVATION">
                            <span className="flex items-center gap-2">{typeIcons.RESERVATION} حجز</span>
                          </SelectItem>
                          <SelectItem value="FINANCIAL">
                            <span className="flex items-center gap-2">{typeIcons.FINANCIAL} مالي</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {validationErrors.basic.type && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {validationErrors.basic.type}
                        </p>
                      )}
                    </div>
                    {/* التصنيف */}
                    <div className="space-y-2">
                      <Label>التصنيف *</Label>
                      <Select value={form.category} onValueChange={(v) => updateForm("category", v)}>
                        <SelectTrigger className={validationErrors.basic.category ? "border-red-500" : ""}>
                          <SelectValue placeholder="اختر التصنيف" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="11">إلكترونيات</SelectItem>
                          <SelectItem value="12">أغذية ومشروبات</SelectItem>
                          <SelectItem value="21">برمجيات</SelectItem>
                          <SelectItem value="22">تراخيص</SelectItem>
                          <SelectItem value="31">استشارات</SelectItem>
                          <SelectItem value="32">صيانة</SelectItem>
                          <SelectItem value="41">فنادق</SelectItem>
                          <SelectItem value="42">قاعات</SelectItem>
                          <SelectItem value="51">قروض</SelectItem>
                          <SelectItem value="52">خطوط ائتمان</SelectItem>
                          <SelectItem value="53">تمويل</SelectItem>
                        </SelectContent>
                      </Select>
                      {validationErrors.basic.category && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {validationErrors.basic.category}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* الوصف */}
                  <div className="space-y-2">
                    <Label htmlFor="description">الوصف</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => updateForm("description", e.target.value)}
                      placeholder="وصف المنتج..."
                      rows={3}
                    />
                  </div>

                  {/* قابل للتجزئة */}
                  <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">قابل للتجزئة</p>
                      <p className="text-xs text-muted-foreground">هل يمكن بيع هذا المنتج بكميات جزئية؟</p>
                    </div>
                    <Switch checked={form.divisible} onCheckedChange={(v) => updateForm("divisible", v)} />
                  </div>

                  {/* دورة الحياة */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label>تاريخ بداية دورة الحياة</Label>
                      <Input
                        type="date"
                        value={form.lifecycleFrom}
                        onChange={(e) => updateForm("lifecycleFrom", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>تاريخ نهاية دورة الحياة</Label>
                      <Input
                        type="date"
                        value={form.lifecycleTo}
                        onChange={(e) => updateForm("lifecycleTo", e.target.value)}
                        placeholder="غير محدد"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── الإصدارات ──── */}
        <TabsContent value="versions">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                إصدارات المنتج
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPageLoading ? (
                <EditorSkeleton />
              ) : (
                <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      إدارة إصدارات المنتج مع تواريخ الفعالية (لا يسمح بالتداخل -- BR-01)
                    </p>
                    <Button size="sm" onClick={() => setShowAddVersionDialog(true)}>
                      <Plus className="h-4 w-4 ml-1" />
                      إصدار جديد
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {versions.map((v) => {
                      const st = versionStatusLabels[v.status];
                      return (
                        <Card key={v.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">الإصدار {v.version_no}</span>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${st.className}`}>
                                    {st.label}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    من: {v.effective_from}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    إلى: {v.effective_to || "مفتوح"}
                                  </span>
                                </div>
                                {v.approved_by && (
                                  <p className="text-xs text-muted-foreground">اعتمد بواسطة: {v.approved_by}</p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => removeVersion(v.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    {versions.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">لا توجد إصدارات -- أضف إصداراً جديداً</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── الخصائص ─────── */}
        <TabsContent value="attributes">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4" />
                الخصائص الديناميكية (EAV)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPageLoading ? (
                <EditorSkeleton />
              ) : (
                <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      الخصائص الديناميكية (EAV) -- يمكن إضافة وإزالة السمات حسب الحاجة
                    </p>
                    <Button size="sm" onClick={addAttr}>
                      <Plus className="h-4 w-4 ml-1" />
                      إضافة سمة
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <AnimatePresence>
                      {attrs.map((attr) => (
                        <motion.div
                          key={attr.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border"
                        >
                          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                            <div>
                              <p className="text-sm font-medium">{attr.label_ar}</p>
                              <p className="text-xs text-muted-foreground font-mono">{attr.code}</p>
                            </div>
                            <Select
                              value={attr.datatype}
                              onValueChange={(v) =>
                                setAttrs((prev) =>
                                  prev.map((a) => (a.id === attr.id ? { ...a, datatype: v } : a))
                                )
                              }
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="TEXT">TEXT</SelectItem>
                                <SelectItem value="NUMBER">NUMBER</SelectItem>
                                <SelectItem value="BOOL">BOOL</SelectItem>
                                <SelectItem value="DATE">DATE</SelectItem>
                                <SelectItem value="JSON">JSON</SelectItem>
                              </SelectContent>
                            </Select>
                            <div>
                              <Input
                                value={attr.value}
                                onChange={(e) => updateAttrValue(attr.id, e.target.value)}
                                className={`h-8 text-sm ${validationErrors.attributes[attr.id] ? "border-red-500" : ""}`}
                                placeholder={attr.datatype === "NUMBER" ? "أدخل رقماً" : attr.datatype === "BOOL" ? "نعم / لا" : "أدخل قيمة"}
                              />
                              {validationErrors.attributes[attr.id] && (
                                <p className="text-xs text-red-500 mt-1">{validationErrors.attributes[attr.id]}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {attr.required && (
                                <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">مطلوب</Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                            onClick={() => removeAttr(attr.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {attrs.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Tag className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">لا توجد سمات -- أضف سمة جديدة</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── التسعير ──────── */}
        <TabsContent value="pricing">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                التسعير
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPageLoading ? (
                <EditorSkeleton />
              ) : (
                <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      ربط المنتج بقوائم الأسعار مع تحديد الأسعار الأساسية والحدود
                    </p>
                    <Button size="sm" onClick={addPricing}>
                      <Plus className="h-4 w-4 ml-1" />
                      ربط قائمة أسعار
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <AnimatePresence>
                      {pricing.map((row) => (
                        <motion.div
                          key={row.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <Card className={validationErrors.pricing[row.id] ? "border-red-300" : ""}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium text-sm">{row.list_name}</span>
                                  <Badge variant="outline" className="text-xs">{row.currency}</Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => removePricing(row.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                  <Label className="text-xs">السعر الأساسي *</Label>
                                  <Input
                                    type="number"
                                    value={row.base_price}
                                    onChange={(e) => updatePricingField(row.id, "base_price", e.target.value)}
                                    className={`h-8 text-sm ${validationErrors.pricing[row.id] ? "border-red-500" : ""}`}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">الحد الأدنى</Label>
                                  <Input
                                    type="number"
                                    value={row.min_price}
                                    onChange={(e) => updatePricingField(row.id, "min_price", e.target.value)}
                                    className="h-8 text-sm"
                                    placeholder="--"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">الحد الأقصى</Label>
                                  <Input
                                    type="number"
                                    value={row.max_price}
                                    onChange={(e) => updatePricingField(row.id, "max_price", e.target.value)}
                                    className="h-8 text-sm"
                                    placeholder="--"
                                  />
                                </div>
                              </div>
                              {validationErrors.pricing[row.id] && (
                                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {validationErrors.pricing[row.id]}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {pricing.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">لا توجد قوائم أسعار -- أضف قائمة جديدة</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── القنوات ──────── */}
        <TabsContent value="channels">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Radio className="h-4 w-4" />
                القنوات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPageLoading ? (
                <EditorSkeleton />
              ) : (
                <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    تفعيل / تعطيل القنوات مع إعدادات علامات الميزات لكل قناة (BR-02: لا يمكن تفعيل قناة بدون تسعير نشط)
                  </p>

                  <div className="space-y-3">
                    {channels.map((ch) => (
                      <motion.div
                        key={ch.id}
                        layout
                        transition={{ duration: 0.2 }}
                      >
                        <Card className={`transition-opacity duration-300 ${ch.enabled ? "" : "opacity-60"}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Radio className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">{ch.name_ar}</p>
                                  <p className="text-xs text-muted-foreground font-mono">{ch.code}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {ch.enabled ? "مفعّل" : "معطّل"}
                                </span>
                                <Switch checked={ch.enabled} onCheckedChange={() => toggleChannel(ch.id)} />
                              </div>
                            </div>
                            <AnimatePresence>
                              {ch.enabled && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="flex flex-wrap gap-3 mt-2 pt-3 border-t"
                                >
                                  {Object.entries(ch.feature_flags).map(([flag, val]) => (
                                    <label key={flag} className="flex items-center gap-2 text-xs cursor-pointer">
                                      <Switch
                                        checked={val}
                                        onCheckedChange={() => toggleFlag(ch.id, flag)}
                                        className="scale-75"
                                      />
                                      <span>{flagLabels[flag] ?? flag}</span>
                                    </label>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── الترقيم ──────── */}
        <TabsContent value="numbering">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Hash className="h-4 w-4" />
                الترقيم
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPageLoading ? (
                <EditorSkeleton />
              ) : (
                <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-5">
                  <p className="text-sm text-muted-foreground">
                    اختيار مخطط الترقيم المستخدم لتوليد أرقام المنتجات والعقود
                  </p>

                  <div className="space-y-2">
                    <Label>مخطط الترقيم</Label>
                    <Select value={scheme} onValueChange={setScheme}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر مخطط الترقيم" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIN-LOAN">FIN-LOAN -- قروض مالية</SelectItem>
                        <SelectItem value="FIN-CREDIT">FIN-CREDIT -- خطوط ائتمان</SelectItem>
                        <SelectItem value="PHY-GEN">PHY-GEN -- منتجات مادية</SelectItem>
                        <SelectItem value="DIG-LIC">DIG-LIC -- تراخيص رقمية</SelectItem>
                        <SelectItem value="SRV-GEN">SRV-GEN -- خدمات عامة</SelectItem>
                        <SelectItem value="RSV-GEN">RSV-GEN -- حجوزات</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Card className="bg-muted/30">
                    <CardContent className="p-4 space-y-3">
                      <p className="text-sm font-medium">معاينة النمط</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">النمط</p>
                          <p className="font-mono text-xs mt-1">{scheme}-{"{YYYY}-{SEQ:6}"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">مثال</p>
                          <p className="font-mono text-xs mt-1">
                            {scheme === "FIN-LOAN" ? "FIN-LOAN-2024-000042" : `${scheme}-2024-000001`}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">سياسة الفجوات</p>
                          <Badge variant="outline" className="mt-1 text-xs">DENY</Badge>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">القيمة الحالية</p>
                          <p className="font-mono text-xs mt-1">42</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── المحاسبة ─────── */}
        <TabsContent value="accounting">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                القوالب المحاسبية
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPageLoading ? (
                <EditorSkeleton />
              ) : (
                <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      ربط قوالب المحاسبة بأحداث الأعمال لتوليد القيود تلقائياً
                    </p>
                    <Button size="sm">
                      <Plus className="h-4 w-4 ml-1" />
                      ربط قالب
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-right p-3 font-medium">الحدث</th>
                          <th className="text-right p-3 font-medium">القالب</th>
                          <th className="text-right p-3 font-medium">حساب مدين</th>
                          <th className="text-right p-3 font-medium">حساب دائن</th>
                          <th className="text-center p-3 font-medium">إجراء</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accountingMaps.map((row) => (
                          <tr key={row.id} className="border-b hover:bg-muted/30">
                            <td className="p-3">
                              <div>
                                <p className="font-medium">{row.event_ar}</p>
                                <p className="text-xs text-muted-foreground font-mono">{row.event}</p>
                              </div>
                            </td>
                            <td className="p-3 text-muted-foreground">{row.template_name}</td>
                            <td className="p-3 font-mono text-xs">{row.dr_account}</td>
                            <td className="p-3 font-mono text-xs">{row.cr_account}</td>
                            <td className="p-3 text-center">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── الرسوم ──────── */}
        <TabsContent value="charges">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                الرسوم والغرامات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPageLoading ? (
                <EditorSkeleton />
              ) : (
                <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">الرسوم والغرامات المرتبطة بهذا المنتج</p>
                    <Button size="sm" onClick={addCharge}>
                      <Plus className="h-4 w-4 ml-1" />
                      ربط رسم
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <AnimatePresence>
                      {charges.map((ch) => (
                        <motion.div
                          key={ch.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">{ch.name}</p>
                                    <p className="text-xs text-muted-foreground font-mono">{ch.code}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="text-xs">
                                    {chargeKindLabels[ch.kind] ?? ch.kind}
                                  </Badge>
                                  <span className="text-sm font-medium">
                                    {ch.basis === "PERCENT"
                                      ? `${ch.value}%`
                                      : `${Number(ch.value).toLocaleString()} ر.ي`}
                                  </span>
                                  <Badge variant="secondary" className="text-xs">{ch.when_event}</Badge>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() => removeCharge(ch.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {charges.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">لا توجد رسوم -- أضف رسماً جديداً</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── التكوين ──────── */}
        <TabsContent value="composition">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4" />
                التكوين (BOM/Bundle)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPageLoading ? (
                <EditorSkeleton />
              ) : (
                <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      المنتجات الفرعية (BOM/Bundle/KIT) المكونة لهذا المنتج
                    </p>
                    <Button size="sm" onClick={addComposition}>
                      <Plus className="h-4 w-4 ml-1" />
                      إضافة مكوّن
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-right p-3 font-medium">المنتج الفرعي</th>
                          <th className="text-right p-3 font-medium">الكمية</th>
                          <th className="text-right p-3 font-medium">السياسة</th>
                          <th className="text-right p-3 font-medium">نسبة السعر</th>
                          <th className="text-center p-3 font-medium">إجراء</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {composition.map((row) => (
                            <motion.tr
                              key={row.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="border-b hover:bg-muted/30"
                            >
                              <td className="p-3">
                                <div>
                                  <p className="font-medium">{row.child_name_ar}</p>
                                  <p className="text-xs text-muted-foreground font-mono">{row.child_sku}</p>
                                </div>
                              </td>
                              <td className="p-3">
                                <div>
                                  <Input
                                    type="number"
                                    value={row.qty}
                                    onChange={(e) => updateCompositionField(row.id, "qty", e.target.value)}
                                    className={`h-8 w-20 text-sm ${validationErrors.composition[row.id] ? "border-red-500" : ""}`}
                                  />
                                  {validationErrors.composition[row.id] && (
                                    <p className="text-xs text-red-500 mt-1">{validationErrors.composition[row.id]}</p>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                <Select
                                  value={row.policy}
                                  onValueChange={(v) => updateCompositionField(row.id, "policy", v)}
                                >
                                  <SelectTrigger className="h-8 w-28 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="EXPLODE">تفجير</SelectItem>
                                    <SelectItem value="NO_EXPLODE">بدون تفجير</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="p-3">
                                <Input
                                  type="number"
                                  value={row.price_ratio}
                                  onChange={(e) => updateCompositionField(row.id, "price_ratio", e.target.value)}
                                  className="h-8 w-20 text-sm"
                                  placeholder="%"
                                />
                              </td>
                              <td className="p-3 text-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => removeComposition(row.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                        {composition.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-muted-foreground">
                              <Layers className="h-8 w-8 mx-auto mb-2 opacity-30" />
                              <p className="text-sm">لا توجد مكونات فرعية</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── الأهلية ──────── */}
        <TabsContent value="eligibility">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                الأهلية والمتطلبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPageLoading ? (
                <EditorSkeleton />
              ) : (
                <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
                  {/* قواعد الأهلية */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        قواعد الأهلية
                      </h3>
                      <Button size="sm" variant="outline" onClick={addEligibility}>
                        <Plus className="h-4 w-4 ml-1" />
                        إضافة قاعدة
                      </Button>
                    </div>
                    <AnimatePresence>
                      {eligibility.map((rule) => (
                        <motion.div
                          key={rule.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                        >
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Input
                              value={rule.name}
                              onChange={(e) => updateEligibility(rule.id, "name", e.target.value)}
                              className="h-8 text-sm"
                              placeholder="اسم القاعدة"
                            />
                            <Input
                              value={rule.condition_cel}
                              onChange={(e) => updateEligibility(rule.id, "condition_cel", e.target.value)}
                              className="h-8 text-sm font-mono"
                              placeholder="CEL expression"
                              dir="ltr"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive mr-2"
                            onClick={() => removeEligibility(rule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {eligibility.length === 0 && (
                      <div className="text-center py-6 text-muted-foreground">
                        <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">لا توجد قواعد أهلية</p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* متطلبات المستندات */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        متطلبات المستندات
                      </h3>
                      <Button size="sm" variant="outline" onClick={addDocument}>
                        <Plus className="h-4 w-4 ml-1" />
                        إضافة مستند
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <AnimatePresence>
                        {documents.map((doc) => (
                          <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                          >
                            <div className="flex items-center gap-3">
                              {doc.mandatory ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <ToggleRight className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm">{doc.name_ar}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleDocMandatory(doc.id)}
                                className="cursor-pointer"
                              >
                                {doc.mandatory ? (
                                  <Badge className="bg-red-50 text-red-700 border-red-200 text-xs hover:bg-red-100">
                                    إلزامي
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs hover:bg-muted">
                                    اختياري
                                  </Badge>
                                )}
                              </button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => removeDocument(doc.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {documents.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">لا توجد متطلبات مستندات</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Add Version Dialog ────────────────── */}
      <Dialog open={showAddVersionDialog} onOpenChange={setShowAddVersionDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة إصدار جديد</DialogTitle>
            <DialogDescription className="text-right pt-2">
              أدخل تواريخ الفعالية للإصدار الجديد. لا يسمح بتداخل التواريخ مع الإصدارات الموجودة (BR-01).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>تاريخ البداية *</Label>
              <Input
                type="date"
                value={newVersionFrom}
                onChange={(e) => {
                  setNewVersionFrom(e.target.value);
                  setNewVersionError("");
                }}
                className={newVersionError ? "border-red-500" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label>تاريخ النهاية</Label>
              <Input
                type="date"
                value={newVersionTo}
                onChange={(e) => {
                  setNewVersionTo(e.target.value);
                  setNewVersionError("");
                }}
                placeholder="مفتوح"
              />
            </div>
            {newVersionError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {newVersionError}
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowAddVersionDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={addVersion}>
              <Plus className="h-4 w-4 ml-1" />
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

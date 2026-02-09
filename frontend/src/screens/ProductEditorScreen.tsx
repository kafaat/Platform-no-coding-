import { useState } from "react";
import { motion } from "framer-motion";
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
import type { ProductType } from "@/types";

// ============================================================
// Props
// ============================================================

interface ProductEditorScreenProps {
  onBack: () => void;
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
// Tab: أساسي (Basic)
// ============================================================

function BasicTab() {
  const [nameAr, setNameAr] = useState("قرض شخصي ميسر");
  const [nameEn, setNameEn] = useState("Personal Loan");
  const [type, setType] = useState<string>("FINANCIAL");
  const [category, setCategory] = useState<string>("51");
  const [divisible, setDivisible] = useState(true);
  const [description, setDescription] = useState(
    "قرض شخصي بمعدل فائدة تنافسي ومدة سداد مرنة تصل إلى 60 شهراً"
  );

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* الاسم بالعربية */}
        <div className="space-y-2">
          <Label htmlFor="name_ar">الاسم بالعربية *</Label>
          <Input
            id="name_ar"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            placeholder="أدخل اسم المنتج بالعربية"
            dir="rtl"
          />
        </div>
        {/* الاسم بالإنجليزية */}
        <div className="space-y-2">
          <Label htmlFor="name_en">الاسم بالإنجليزية</Label>
          <Input
            id="name_en"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="Enter product name in English"
            dir="ltr"
          />
        </div>
        {/* نوع المنتج */}
        <div className="space-y-2">
          <Label>نوع المنتج *</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="اختر النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PHYSICAL">
                <span className="flex items-center gap-2">
                  {typeIcons.PHYSICAL} مادي
                </span>
              </SelectItem>
              <SelectItem value="DIGITAL">
                <span className="flex items-center gap-2">
                  {typeIcons.DIGITAL} رقمي
                </span>
              </SelectItem>
              <SelectItem value="SERVICE">
                <span className="flex items-center gap-2">
                  {typeIcons.SERVICE} خدمة
                </span>
              </SelectItem>
              <SelectItem value="RESERVATION">
                <span className="flex items-center gap-2">
                  {typeIcons.RESERVATION} حجز
                </span>
              </SelectItem>
              <SelectItem value="FINANCIAL">
                <span className="flex items-center gap-2">
                  {typeIcons.FINANCIAL} مالي
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* التصنيف */}
        <div className="space-y-2">
          <Label>التصنيف *</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
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
        </div>
      </div>

      {/* الوصف */}
      <div className="space-y-2">
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="وصف المنتج..."
          rows={3}
        />
      </div>

      {/* قابل للتجزئة */}
      <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg">
        <div>
          <p className="text-sm font-medium">قابل للتجزئة</p>
          <p className="text-xs text-muted-foreground">
            هل يمكن بيع هذا المنتج بكميات جزئية؟
          </p>
        </div>
        <Switch checked={divisible} onCheckedChange={setDivisible} />
      </div>

      {/* دورة الحياة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>تاريخ بداية دورة الحياة</Label>
          <Input type="date" defaultValue="2024-04-01" />
        </div>
        <div className="space-y-2">
          <Label>تاريخ نهاية دورة الحياة</Label>
          <Input type="date" placeholder="غير محدد" />
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// Tab: الإصدارات (Versions)
// ============================================================

interface VersionRow {
  id: number;
  version_no: number;
  effective_from: string;
  effective_to: string | null;
  approved_by: string | null;
  status: "current" | "future" | "expired";
}

const mockVersions: VersionRow[] = [
  {
    id: 1,
    version_no: 1,
    effective_from: "2024-04-01",
    effective_to: "2024-09-30",
    approved_by: "أحمد محمد",
    status: "expired",
  },
  {
    id: 2,
    version_no: 2,
    effective_from: "2024-10-01",
    effective_to: null,
    approved_by: "سارة علي",
    status: "current",
  },
];

function VersionsTab() {
  const versionStatusLabels: Record<
    string,
    { label: string; className: string }
  > = {
    current: { label: "حالي", className: "bg-green-100 text-green-700" },
    future: { label: "مستقبلي", className: "bg-blue-100 text-blue-700" },
    expired: { label: "منتهي", className: "bg-gray-100 text-gray-600" },
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          إدارة إصدارات المنتج مع تواريخ الفعالية (لا يسمح بالتداخل — BR-01)
        </p>
        <Button size="sm">
          <Plus className="h-4 w-4 ml-1" />
          إصدار جديد
        </Button>
      </div>

      <div className="space-y-3">
        {mockVersions.map((v) => {
          const st = versionStatusLabels[v.status];
          return (
            <Card key={v.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        الإصدار {v.version_no}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${st.className}`}
                      >
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
                        إلى: {v.effective_to ?? "مفتوح"}
                      </span>
                    </div>
                    {v.approved_by && (
                      <p className="text-xs text-muted-foreground">
                        اعتمد بواسطة: {v.approved_by}
                      </p>
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
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}

// ============================================================
// Tab: الخصائص (Attributes — EAV)
// ============================================================

interface AttrRow {
  id: number;
  code: string;
  label_ar: string;
  datatype: string;
  required: boolean;
  value: string;
}

const mockAttrs: AttrRow[] = [
  {
    id: 1,
    code: "interest_rate",
    label_ar: "معدل الفائدة السنوي",
    datatype: "NUMBER",
    required: true,
    value: "12",
  },
  {
    id: 2,
    code: "max_tenure",
    label_ar: "أقصى مدة (شهر)",
    datatype: "NUMBER",
    required: true,
    value: "60",
  },
  {
    id: 3,
    code: "grace_period",
    label_ar: "فترة السماح (يوم)",
    datatype: "NUMBER",
    required: false,
    value: "30",
  },
  {
    id: 4,
    code: "collateral_required",
    label_ar: "ضمان مطلوب",
    datatype: "BOOL",
    required: true,
    value: "نعم",
  },
];

function AttributesTab() {
  const [attrs, setAttrs] = useState(mockAttrs);

  const removeAttr = (id: number) => {
    setAttrs((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          الخصائص الديناميكية (EAV) — يمكن إضافة وإزالة السمات حسب الحاجة
        </p>
        <Button size="sm">
          <Plus className="h-4 w-4 ml-1" />
          إضافة سمة
        </Button>
      </div>

      <div className="space-y-2">
        {attrs.map((attr) => (
          <div
            key={attr.id}
            className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              <div>
                <p className="text-sm font-medium">{attr.label_ar}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {attr.code}
                </p>
              </div>
              <Badge variant="outline" className="w-fit text-xs">
                {attr.datatype}
              </Badge>
              <Input
                value={attr.value}
                onChange={() => {}}
                className="h-8 text-sm"
              />
              <div className="flex items-center gap-2">
                {attr.required && (
                  <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">
                    مطلوب
                  </Badge>
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
          </div>
        ))}
        {attrs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Tag className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">لا توجد سمات — أضف سمة جديدة</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================
// Tab: التسعير (Pricing)
// ============================================================

interface PriceRow {
  id: number;
  list_name: string;
  currency: string;
  base_price: number;
  min_price: number | null;
  max_price: number | null;
}

const mockPricing: PriceRow[] = [
  {
    id: 1,
    list_name: "قائمة الأسعار الرئيسية",
    currency: "YER",
    base_price: 500000,
    min_price: 100000,
    max_price: 5000000,
  },
  {
    id: 2,
    list_name: "قائمة أسعار الدولار",
    currency: "USD",
    base_price: 1000,
    min_price: 200,
    max_price: 10000,
  },
];

function PricingTab() {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          ربط المنتج بقوائم الأسعار مع تحديد الأسعار الأساسية والحدود
        </p>
        <Button size="sm">
          <Plus className="h-4 w-4 ml-1" />
          ربط قائمة أسعار
        </Button>
      </div>

      <div className="space-y-3">
        {mockPricing.map((row) => (
          <Card key={row.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{row.list_name}</span>
                  <Badge variant="outline" className="text-xs">
                    {row.currency}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">السعر الأساسي</Label>
                  <Input
                    type="number"
                    value={row.base_price}
                    onChange={() => {}}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">الحد الأدنى</Label>
                  <Input
                    type="number"
                    value={row.min_price ?? ""}
                    onChange={() => {}}
                    className="h-8 text-sm"
                    placeholder="—"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">الحد الأقصى</Label>
                  <Input
                    type="number"
                    value={row.max_price ?? ""}
                    onChange={() => {}}
                    className="h-8 text-sm"
                    placeholder="—"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================================
// Tab: القنوات (Channels)
// ============================================================

interface ChannelRow {
  id: number;
  code: string;
  name_ar: string;
  enabled: boolean;
  feature_flags: Record<string, boolean>;
}

const mockChannels: ChannelRow[] = [
  {
    id: 1,
    code: "WEB",
    name_ar: "الموقع الإلكتروني",
    enabled: true,
    feature_flags: { show_price: true, allow_apply: true, show_calculator: true },
  },
  {
    id: 2,
    code: "MOBILE",
    name_ar: "تطبيق الجوال",
    enabled: true,
    feature_flags: { show_price: true, allow_apply: true, show_calculator: false },
  },
  {
    id: 3,
    code: "POS",
    name_ar: "نقطة البيع",
    enabled: false,
    feature_flags: { show_price: false, allow_apply: false, show_calculator: false },
  },
  {
    id: 4,
    code: "API",
    name_ar: "واجهة برمجة التطبيقات",
    enabled: true,
    feature_flags: { show_price: true, allow_apply: true, show_calculator: true },
  },
  {
    id: 5,
    code: "USSD",
    name_ar: "خدمة USSD",
    enabled: false,
    feature_flags: { show_price: false, allow_apply: false, show_calculator: false },
  },
];

const flagLabels: Record<string, string> = {
  show_price: "عرض السعر",
  allow_apply: "السماح بالتقديم",
  show_calculator: "إظهار الحاسبة",
};

function ChannelsTab() {
  const [channels, setChannels] = useState(mockChannels);

  const toggleChannel = (id: number) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === id ? { ...ch, enabled: !ch.enabled } : ch
      )
    );
  };

  const toggleFlag = (channelId: number, flag: string) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === channelId
          ? {
              ...ch,
              feature_flags: {
                ...ch.feature_flags,
                [flag]: !ch.feature_flags[flag],
              },
            }
          : ch
      )
    );
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <p className="text-sm text-muted-foreground">
        تفعيل / تعطيل القنوات مع إعدادات علامات الميزات لكل قناة (BR-02: لا
        يمكن تفعيل قناة بدون تسعير نشط)
      </p>

      <div className="space-y-3">
        {channels.map((ch) => (
          <Card
            key={ch.id}
            className={ch.enabled ? "" : "opacity-60"}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Radio className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{ch.name_ar}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {ch.code}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {ch.enabled ? "مفعّل" : "معطّل"}
                  </span>
                  <Switch
                    checked={ch.enabled}
                    onCheckedChange={() => toggleChannel(ch.id)}
                  />
                </div>
              </div>
              {ch.enabled && (
                <div className="flex flex-wrap gap-3 mt-2 pt-3 border-t">
                  {Object.entries(ch.feature_flags).map(([flag, val]) => (
                    <label
                      key={flag}
                      className="flex items-center gap-2 text-xs cursor-pointer"
                    >
                      <Switch
                        checked={val}
                        onCheckedChange={() => toggleFlag(ch.id, flag)}
                        className="scale-75"
                      />
                      <span>{flagLabels[flag] ?? flag}</span>
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================================
// Tab: الترقيم (Numbering)
// ============================================================

function NumberingTab() {
  const [scheme, setScheme] = useState("FIN-LOAN");

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
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
            <SelectItem value="FIN-LOAN">FIN-LOAN — قروض مالية</SelectItem>
            <SelectItem value="FIN-CREDIT">
              FIN-CREDIT — خطوط ائتمان
            </SelectItem>
            <SelectItem value="PHY-GEN">PHY-GEN — منتجات مادية</SelectItem>
            <SelectItem value="DIG-LIC">DIG-LIC — تراخيص رقمية</SelectItem>
            <SelectItem value="SRV-GEN">SRV-GEN — خدمات عامة</SelectItem>
            <SelectItem value="RSV-GEN">RSV-GEN — حجوزات</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-medium">معاينة النمط</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">النمط</p>
              <p className="font-mono text-xs mt-1">
                {scheme === "FIN-LOAN"
                  ? "FIN-LOAN-{YYYY}-{SEQ:6}"
                  : `${scheme}-{YYYY}-{SEQ:6}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">مثال</p>
              <p className="font-mono text-xs mt-1">
                {scheme === "FIN-LOAN"
                  ? "FIN-LOAN-2024-000042"
                  : `${scheme}-2024-000001`}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">سياسة الفجوات</p>
              <Badge variant="outline" className="mt-1 text-xs">
                DENY
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">القيمة الحالية</p>
              <p className="font-mono text-xs mt-1">42</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================
// Tab: المحاسبة (Accounting)
// ============================================================

interface AccountingMapRow {
  id: number;
  event: string;
  event_ar: string;
  template_name: string;
  dr_account: string;
  cr_account: string;
}

const mockAccountingMaps: AccountingMapRow[] = [
  {
    id: 1,
    event: "DISBURSEMENT",
    event_ar: "صرف القرض",
    template_name: "قالب صرف القروض",
    dr_account: "1301-LOANS-RCV",
    cr_account: "1101-CASH",
  },
  {
    id: 2,
    event: "PRINCIPAL_PAYMENT",
    event_ar: "سداد أصل الدين",
    template_name: "قالب سداد الأصل",
    dr_account: "1101-CASH",
    cr_account: "1301-LOANS-RCV",
  },
  {
    id: 3,
    event: "INTEREST_PAYMENT",
    event_ar: "سداد الفوائد",
    template_name: "قالب سداد الفوائد",
    dr_account: "1101-CASH",
    cr_account: "4101-INT-INCOME",
  },
];

function AccountingTab() {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
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
            {mockAccountingMaps.map((row) => (
              <tr key={row.id} className="border-b hover:bg-muted/30">
                <td className="p-3">
                  <div>
                    <p className="font-medium">{row.event_ar}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {row.event}
                    </p>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">
                  {row.template_name}
                </td>
                <td className="p-3 font-mono text-xs">{row.dr_account}</td>
                <td className="p-3 font-mono text-xs">{row.cr_account}</td>
                <td className="p-3 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ============================================================
// Tab: الرسوم (Charges)
// ============================================================

interface ChargeRow {
  id: number;
  code: string;
  name: string;
  kind: string;
  basis: string;
  value: number;
  when_event: string;
}

const mockCharges: ChargeRow[] = [
  {
    id: 1,
    code: "PROC_FEE",
    name: "رسوم معالجة",
    kind: "FEE",
    basis: "PERCENT",
    value: 2.5,
    when_event: "OnDisburse",
  },
  {
    id: 2,
    code: "LATE_PEN",
    name: "غرامة تأخير",
    kind: "FINE",
    basis: "FIXED",
    value: 5000,
    when_event: "OnLate",
  },
  {
    id: 3,
    code: "INS_FEE",
    name: "رسوم تأمين",
    kind: "FEE",
    basis: "FIXED",
    value: 10000,
    when_event: "OnDisburse",
  },
];

const chargeKindLabels: Record<string, string> = {
  FEE: "رسوم",
  FINE: "غرامة",
  SUBSCRIPTION: "اشتراك",
  COMMISSION: "عمولة",
};

function ChargesTab() {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          الرسوم والغرامات المرتبطة بهذا المنتج
        </p>
        <Button size="sm">
          <Plus className="h-4 w-4 ml-1" />
          ربط رسم
        </Button>
      </div>

      <div className="space-y-3">
        {mockCharges.map((ch) => (
          <Card key={ch.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{ch.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {ch.code}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    {chargeKindLabels[ch.kind] ?? ch.kind}
                  </Badge>
                  <span className="text-sm font-medium">
                    {ch.basis === "PERCENT" ? `${ch.value}%` : `${ch.value.toLocaleString()} ر.ي`}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {ch.when_event}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================================
// Tab: التكوين (Composition / BOM)
// ============================================================

interface CompositionRow {
  id: number;
  child_name_ar: string;
  child_sku: string;
  qty: number;
  policy: string;
  price_ratio: number;
}

const mockComposition: CompositionRow[] = [
  {
    id: 1,
    child_name_ar: "تأمين على الحياة",
    child_sku: "INS-LIFE-001",
    qty: 1,
    policy: "NO_EXPLODE",
    price_ratio: 0.05,
  },
  {
    id: 2,
    child_name_ar: "خدمة توثيق",
    child_sku: "SRV-DOC-001",
    qty: 1,
    policy: "EXPLODE",
    price_ratio: 0.02,
  },
];

function CompositionTab() {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          المنتجات الفرعية (BOM/Bundle/KIT) المكونة لهذا المنتج
        </p>
        <Button size="sm">
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
            {mockComposition.map((row) => (
              <tr key={row.id} className="border-b hover:bg-muted/30">
                <td className="p-3">
                  <div>
                    <p className="font-medium">{row.child_name_ar}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {row.child_sku}
                    </p>
                  </div>
                </td>
                <td className="p-3">
                  <Input
                    type="number"
                    value={row.qty}
                    onChange={() => {}}
                    className="h-8 w-20 text-sm"
                  />
                </td>
                <td className="p-3">
                  <Badge variant="outline" className="text-xs">
                    {row.policy === "EXPLODE" ? "تفجير" : "بدون تفجير"}
                  </Badge>
                </td>
                <td className="p-3 font-mono text-xs">
                  {(row.price_ratio * 100).toFixed(0)}%
                </td>
                <td className="p-3 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {mockComposition.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-muted-foreground"
                >
                  <Layers className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد مكونات فرعية</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ============================================================
// Tab: الأهلية (Eligibility)
// ============================================================

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

const mockEligibility: EligibilityRow[] = [
  {
    id: 1,
    name: "الحد الأدنى للراتب",
    condition_cel: 'customer.salary >= 100000',
  },
  {
    id: 2,
    name: "مستوى KYC",
    condition_cel: 'customer.kyc_level == "FULL"',
  },
  {
    id: 3,
    name: "العمر",
    condition_cel: "customer.age >= 21 && customer.age <= 60",
  },
];

const mockDocuments: DocumentReq[] = [
  { id: 1, name_ar: "بطاقة الهوية الوطنية", mandatory: true },
  { id: 2, name_ar: "كشف حساب بنكي (3 أشهر)", mandatory: true },
  { id: 3, name_ar: "إثبات الدخل", mandatory: true },
  { id: 4, name_ar: "عقد العمل", mandatory: false },
  { id: 5, name_ar: "كفيل", mandatory: false },
];

function EligibilityTab() {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* قواعد الأهلية */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            قواعد الأهلية
          </h3>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 ml-1" />
            إضافة قاعدة
          </Button>
        </div>
        {mockEligibility.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
          >
            <div>
              <p className="text-sm font-medium">{rule.name}</p>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                {rule.condition_cel}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Separator />

      {/* متطلبات المستندات */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            متطلبات المستندات
          </h3>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 ml-1" />
            إضافة مستند
          </Button>
        </div>
        <div className="space-y-2">
          {mockDocuments.map((doc) => (
            <div
              key={doc.id}
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
                {doc.mandatory && (
                  <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">
                    إلزامي
                  </Badge>
                )}
                {!doc.mandatory && (
                  <Badge variant="outline" className="text-xs">
                    اختياري
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// Tab config for the Tabs component
// ============================================================

interface TabConfig {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabConfig[] = [
  { value: "basic", label: "أساسي", icon: <Package className="h-4 w-4" /> },
  {
    value: "versions",
    label: "الإصدارات",
    icon: <Calendar className="h-4 w-4" />,
  },
  { value: "attributes", label: "الخصائص", icon: <Tag className="h-4 w-4" /> },
  {
    value: "pricing",
    label: "التسعير",
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    value: "channels",
    label: "القنوات",
    icon: <Radio className="h-4 w-4" />,
  },
  {
    value: "numbering",
    label: "الترقيم",
    icon: <Hash className="h-4 w-4" />,
  },
  {
    value: "accounting",
    label: "المحاسبة",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    value: "charges",
    label: "الرسوم",
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    value: "composition",
    label: "التكوين",
    icon: <Layers className="h-4 w-4" />,
  },
  {
    value: "eligibility",
    label: "الأهلية",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
];

// ============================================================
// Main Component
// ============================================================

export default function ProductEditorScreen({ onBack }: ProductEditorScreenProps) {
  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Header ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">محرر المنتج</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              قرض شخصي ميسر — <span className="font-mono">FIN-LN-001</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            إلغاء
          </Button>
          <Button size="sm">
            <Save className="h-4 w-4 ml-1" />
            حفظ
          </Button>
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
                className="flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5"
              >
                {tab.icon}
                {tab.label}
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
              <BasicTab />
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
              <VersionsTab />
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
              <AttributesTab />
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
              <PricingTab />
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
              <ChannelsTab />
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
              <NumberingTab />
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
              <AccountingTab />
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
              <ChargesTab />
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
              <CompositionTab />
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
              <EligibilityTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

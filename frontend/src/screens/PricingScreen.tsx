import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Plus,
  Search,
  Eye,
  Edit3,
  Trash2,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Copy,
  ArrowUpDown,
  Tag,
  Check,
  X,
  AlertTriangle,
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
import type { Currency } from "@/types";

// ============================================================
// Types
// ============================================================

interface MockPriceList {
  id: number;
  tenant_id: number;
  name: string;
  currency: Currency;
  valid_from: string;
  valid_to: string | null;
  product_count: number;
  created_at: string;
}

interface MockPriceRule {
  id: number;
  price_list_id: number;
  condition_cel: string;
  formula_cel: string;
  priority: number;
}

// ============================================================
// Toast Notification
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
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
              t.type === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {t.type === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {t.message}
            <button onClick={() => onDismiss(t.id)} className="mr-2 hover:opacity-70" aria-label="إغلاق الإشعار">
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Currency Config
// ============================================================

const CURRENCY_CONFIG: Record<Currency, { label: string; color: string }> = {
  YER: { label: "ر.ي", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  USD: { label: "USD", color: "bg-blue-100 text-blue-800 border-blue-200" },
  SAR: { label: "ر.س", color: "bg-amber-100 text-amber-800 border-amber-200" },
};

// ============================================================
// Mock Data
// ============================================================

const initialPriceLists: MockPriceList[] = [
  {
    id: 1,
    tenant_id: 1,
    name: "قائمة الأسعار الرئيسية",
    currency: "YER",
    valid_from: "2024-01-01",
    valid_to: "2024-12-31",
    product_count: 45,
    created_at: "2024-01-01",
  },
  {
    id: 2,
    tenant_id: 1,
    name: "أسعار التصدير بالدولار",
    currency: "USD",
    valid_from: "2024-03-01",
    valid_to: null,
    product_count: 18,
    created_at: "2024-03-01",
  },
  {
    id: 3,
    tenant_id: 1,
    name: "قائمة الأسعار السعودية",
    currency: "SAR",
    valid_from: "2024-06-01",
    valid_to: "2025-05-31",
    product_count: 32,
    created_at: "2024-06-01",
  },
];

const initialPriceRules: MockPriceRule[] = [
  { id: 1, price_list_id: 1, condition_cel: 'customer.score > 700 && qty >= 10', formula_cel: 'base_price * 0.9', priority: 1 },
  { id: 2, price_list_id: 1, condition_cel: 'customer.kyc_level == "FULL" && channel == "WEB"', formula_cel: 'base_price * 0.95', priority: 2 },
  { id: 3, price_list_id: 1, condition_cel: 'qty >= 100', formula_cel: 'base_price * 0.85', priority: 3 },
  { id: 4, price_list_id: 2, condition_cel: 'customer.score > 800', formula_cel: 'base_price * 0.88', priority: 1 },
  { id: 5, price_list_id: 3, condition_cel: 'channel == "POS" && qty >= 5', formula_cel: 'base_price * 0.92', priority: 1 },
  { id: 6, price_list_id: 3, condition_cel: 'product.type == "PHYSICAL"', formula_cel: 'base_price + (base_price * 0.05)', priority: 2 },
];

const MOCK_PRODUCTS = [
  { id: 101, name_ar: "هاتف ذكي سامسونج A54", base_price: 79500 },
  { id: 102, name_ar: "لابتوب ديل انسبيرون", base_price: 350000 },
  { id: 103, name_ar: "جهاز لوحي آيباد", base_price: 210000 },
  { id: 104, name_ar: "طابعة HP ليزر", base_price: 45000 },
];

// ============================================================
// Animation Variants
// ============================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ============================================================
// Loading Skeleton
// ============================================================

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />;
}

function TableSkeleton({ rows = 3, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          {Array.from({ length: cols }).map((_, i) => (
            <TableHead key={i}><Skeleton className="h-4 w-20" /></TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, r) => (
          <TableRow key={r}>
            {Array.from({ length: cols }).map((_, c) => (
              <TableCell key={c}><Skeleton className="h-4 w-full" /></TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ============================================================
// Sub-components
// ============================================================

function CurrencyBadge({ currency }: { currency: Currency }) {
  const config = CURRENCY_CONFIG[currency];
  return (
    <Badge variant="outline" className={config.color}>
      {config.label}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: number }) {
  const colors =
    priority === 1
      ? "bg-red-50 text-red-700 border-red-200"
      : priority === 2
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <Badge variant="outline" className={colors}>
      {priority}
    </Badge>
  );
}

// ============================================================
// Simulated Async Helper
// ============================================================

function simulateAsync<T>(result: T, delay = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(result), delay));
}

// ============================================================
// Component
// ============================================================

export default function PricingScreen() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState<Currency | "ALL">("ALL");
  const [selectedListId, setSelectedListId] = useState<number | null>(1);
  const [priceLists, setPriceLists] = useState<MockPriceList[]>([]);
  const [priceRules, setPriceRules] = useState<MockPriceRule[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [saving, setSaving] = useState(false);

  // Create price list dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newList, setNewList] = useState({ name: "", currency: "YER" as Currency, valid_from: "", valid_to: "" });

  // Edit rule dialog
  const [editRuleDialogOpen, setEditRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<MockPriceRule | null>(null);
  const [ruleForm, setRuleForm] = useState({ condition_cel: "", formula_cel: "", priority: 1 });

  // Add rule dialog
  const [addRuleDialogOpen, setAddRuleDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({ condition_cel: "", formula_cel: "", priority: 1 });

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: "list" | "rule"; id: number; name: string }>({ open: false, type: "list", id: 0, name: "" });

  // Price quote calculator
  const [quoteProduct, setQuoteProduct] = useState<number>(101);
  const [quoteQty, setQuoteQty] = useState<number>(1);
  const [quoteCurrency, setQuoteCurrency] = useState<Currency>("YER");
  const [quoteResult, setQuoteResult] = useState<{ base: number; discount: number; total: number; rules: string[] } | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Toast helpers
  const addToast = useCallback((message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Simulate initial data load
  useEffect(() => {
    const timer = setTimeout(() => {
      setPriceLists(initialPriceLists);
      setPriceRules(initialPriceRules);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Filtered lists
  const filteredLists = priceLists.filter((pl) => {
    const matchesSearch = !search || pl.name.includes(search) || pl.currency.toLowerCase().includes(search.toLowerCase());
    const matchesCurrency = currencyFilter === "ALL" || pl.currency === currencyFilter;
    return matchesSearch && matchesCurrency;
  });

  const selectedRules = selectedListId ? priceRules.filter((r) => r.price_list_id === selectedListId) : [];
  const selectedList = priceLists.find((pl) => pl.id === selectedListId);

  // ---- CRUD Operations ----

  async function handleCreatePriceList() {
    if (!newList.name || !newList.valid_from) {
      addToast("يرجى ملء جميع الحقول المطلوبة", "error");
      return;
    }
    setSaving(true);
    try {
      const created = await simulateAsync<MockPriceList>({
        id: Math.max(0, ...priceLists.map((p) => p.id)) + 1,
        tenant_id: 1,
        name: newList.name,
        currency: newList.currency,
        valid_from: newList.valid_from,
        valid_to: newList.valid_to || null,
        product_count: 0,
        created_at: new Date().toISOString().slice(0, 10),
      });
      setPriceLists((prev) => [...prev, created]);
      setCreateDialogOpen(false);
      setNewList({ name: "", currency: "YER", valid_from: "", valid_to: "" });
      addToast("تم إنشاء قائمة الأسعار بنجاح", "success");
    } catch {
      addToast("فشل في إنشاء قائمة الأسعار", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    setSaving(true);
    try {
      await simulateAsync(null, 400);
      if (deleteDialog.type === "list") {
        setPriceLists((prev) => prev.filter((p) => p.id !== deleteDialog.id));
        setPriceRules((prev) => prev.filter((r) => r.price_list_id !== deleteDialog.id));
        if (selectedListId === deleteDialog.id) setSelectedListId(null);
        addToast("تم حذف قائمة الأسعار بنجاح", "success");
      } else {
        setPriceRules((prev) => prev.filter((r) => r.id !== deleteDialog.id));
        addToast("تم حذف القاعدة بنجاح", "success");
      }
      setDeleteDialog({ open: false, type: "list", id: 0, name: "" });
    } catch {
      addToast("فشل في الحذف", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddRule() {
    if (!newRule.condition_cel || !newRule.formula_cel || !selectedListId) {
      addToast("يرجى ملء جميع الحقول", "error");
      return;
    }
    setSaving(true);
    try {
      const created = await simulateAsync<MockPriceRule>({
        id: Math.max(0, ...priceRules.map((r) => r.id)) + 1,
        price_list_id: selectedListId,
        condition_cel: newRule.condition_cel,
        formula_cel: newRule.formula_cel,
        priority: newRule.priority,
      });
      setPriceRules((prev) => [...prev, created]);
      setAddRuleDialogOpen(false);
      setNewRule({ condition_cel: "", formula_cel: "", priority: 1 });
      addToast("تم إضافة القاعدة بنجاح", "success");
    } catch {
      addToast("فشل في إضافة القاعدة", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEditRule() {
    if (!editingRule) return;
    setSaving(true);
    try {
      await simulateAsync(null, 400);
      setPriceRules((prev) =>
        prev.map((r) =>
          r.id === editingRule.id
            ? { ...r, condition_cel: ruleForm.condition_cel, formula_cel: ruleForm.formula_cel, priority: ruleForm.priority }
            : r
        )
      );
      setEditRuleDialogOpen(false);
      setEditingRule(null);
      addToast("تم تحديث القاعدة بنجاح", "success");
    } catch {
      addToast("فشل في تحديث القاعدة", "error");
    } finally {
      setSaving(false);
    }
  }

  function openEditRule(rule: MockPriceRule) {
    setEditingRule(rule);
    setRuleForm({ condition_cel: rule.condition_cel, formula_cel: rule.formula_cel, priority: rule.priority });
    setEditRuleDialogOpen(true);
  }

  // Price Quote Calculator
  async function handleCalculateQuote() {
    setQuoteLoading(true);
    try {
      const product = MOCK_PRODUCTS.find((p) => p.id === quoteProduct);
      if (!product) { addToast("المنتج غير موجود", "error"); return; }
      const base = product.base_price * quoteQty;
      // Simulate rule matching
      const applicableRules = selectedRules.filter((r) => {
        if (r.condition_cel.includes("qty >= 100") && quoteQty >= 100) return true;
        if (r.condition_cel.includes("qty >= 10") && quoteQty >= 10) return true;
        return false;
      });
      const discountPct = applicableRules.length > 0 ? 0.1 : 0;
      const discount = base * discountPct;
      const total = base - discount;

      const result = await simulateAsync({
        base,
        discount,
        total,
        rules: applicableRules.map((r) => r.formula_cel),
      }, 500);
      setQuoteResult(result);
    } catch {
      addToast("فشل في حساب عرض السعر", "error");
    } finally {
      setQuoteLoading(false);
    }
  }

  function handleDuplicateList(pl: MockPriceList) {
    const newId = Math.max(0, ...priceLists.map((p) => p.id)) + 1;
    const duplicated: MockPriceList = {
      ...pl,
      id: newId,
      name: `${pl.name} (نسخة)`,
      product_count: 0,
      created_at: new Date().toISOString().slice(0, 10),
    };
    setPriceLists((prev) => [...prev, duplicated]);
    // Also duplicate rules
    const sourceRules = priceRules.filter((r) => r.price_list_id === pl.id);
    let ruleIdCounter = Math.max(0, ...priceRules.map((r) => r.id)) + 1;
    const newRules = sourceRules.map((r) => ({ ...r, id: ruleIdCounter++, price_list_id: newId }));
    setPriceRules((prev) => [...prev, ...newRules]);
    addToast("تم نسخ قائمة الأسعار بنجاح", "success");
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            التسعير
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة قوائم الأسعار وقواعد التسعير الديناميكية
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-1" />
          إنشاء قائمة أسعار
        </Button>
      </div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))}
          </>
        ) : (
          <>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">قوائم الأسعار</p>
                    <p className="text-2xl font-bold">{priceLists.length.toLocaleString("ar-EG")}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-600"><Tag className="h-5 w-5" /></div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">قواعد التسعير</p>
                    <p className="text-2xl font-bold">{priceRules.length.toLocaleString("ar-EG")}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50 text-purple-600"><Calculator className="h-5 w-5" /></div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">إجمالي المنتجات المسعّرة</p>
                    <p className="text-2xl font-bold">{priceLists.reduce((sum, pl) => sum + pl.product_count, 0).toLocaleString("ar-EG")}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600"><DollarSign className="h-5 w-5" /></div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </motion.div>

      {/* Search & Filter */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث في قوائم الأسعار..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-9"
                />
              </div>
              <Select value={currencyFilter} onValueChange={(v) => setCurrencyFilter(v as Currency | "ALL")}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="العملة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">جميع العملات</SelectItem>
                  <SelectItem value="YER">ر.ي (YER)</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="SAR">ر.س (SAR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Price Lists Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                قوائم الأسعار ({filteredLists.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <TableSkeleton rows={3} cols={6} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>الاسم</TableHead>
                    <TableHead>العملة</TableHead>
                    <TableHead>من</TableHead>
                    <TableHead>إلى</TableHead>
                    <TableHead>عدد المنتجات</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLists.map((priceList, idx) => (
                    <motion.tr
                      key={priceList.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`border-b transition-colors cursor-pointer ${
                        selectedListId === priceList.id
                          ? "bg-primary/5 border-r-2 border-r-primary"
                          : "hover:bg-muted/30"
                      }`}
                      onClick={() => setSelectedListId(priceList.id)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{priceList.name}</p>
                          <p className="text-xs text-muted-foreground">
                            #{priceList.id} - أُنشئت {priceList.created_at}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell><CurrencyBadge currency={priceList.currency} /></TableCell>
                      <TableCell className="text-sm font-mono">{priceList.valid_from}</TableCell>
                      <TableCell className="text-sm font-mono">
                        {priceList.valid_to ?? <span className="text-muted-foreground text-xs">مفتوحة</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{priceList.product_count.toLocaleString("ar-EG")} منتج</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="عرض" aria-label="عرض قائمة الأسعار" onClick={(e) => { e.stopPropagation(); setSelectedListId(priceList.id); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="نسخ" aria-label="نسخ قائمة الأسعار" onClick={(e) => { e.stopPropagation(); handleDuplicateList(priceList); }}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            title="حذف"
                            aria-label="حذف قائمة الأسعار"
                            onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, type: "list", id: priceList.id, name: priceList.name }); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                  {filteredLists.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        لا توجد قوائم أسعار مطابقة للبحث
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                عرض {filteredLists.length.toLocaleString("ar-EG")} من {priceLists.length.toLocaleString("ar-EG")} قائمة
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  <ChevronRight className="h-4 w-4" />
                  السابق
                </Button>
                <span className="text-sm px-3">صفحة 1 من 1</span>
                <Button variant="outline" size="sm" disabled>
                  التالي
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Price Rules Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                قواعد التسعير (CEL)
                {selectedList && (
                  <Badge variant="outline" className="mr-2 font-normal">{selectedList.name}</Badge>
                )}
              </span>
              {selectedListId && (
                <Button variant="outline" size="sm" onClick={() => setAddRuleDialogOpen(true)}>
                  <Plus className="h-4 w-4 ml-1" />
                  إضافة قاعدة
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <TableSkeleton rows={3} cols={4} />
            ) : selectedListId ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">
                      <span className="flex items-center gap-1">
                        <ArrowUpDown className="h-3 w-3" />
                        الأولوية
                      </span>
                    </TableHead>
                    <TableHead>الشرط (condition_cel)</TableHead>
                    <TableHead>المعادلة (formula_cel)</TableHead>
                    <TableHead className="text-center w-24">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedRules.map((rule, idx) => (
                    <motion.tr
                      key={rule.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="text-center">
                        <PriorityBadge priority={rule.priority} />
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono block">
                          {rule.condition_cel}
                        </code>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-emerald-50 text-emerald-800 px-2 py-1 rounded font-mono block">
                          {rule.formula_cel}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="تعديل القاعدة" onClick={() => openEditRule(rule)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            aria-label="حذف القاعدة"
                            onClick={() => setDeleteDialog({ open: true, type: "rule", id: rule.id, name: `القاعدة #${rule.id}` })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                  {selectedRules.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        <Calculator className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        لا توجد قواعد تسعير لهذه القائمة
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Calculator className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">اختر قائمة أسعار لعرض قواعد التسعير</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Price Quote Calculator */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              حاسبة عرض السعر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">المنتج</label>
                <Select value={String(quoteProduct)} onValueChange={(v) => setQuoteProduct(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_PRODUCTS.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name_ar}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">الكمية</label>
                <Input
                  type="number"
                  min={1}
                  value={quoteQty}
                  onChange={(e) => setQuoteQty(Math.max(1, Number(e.target.value)))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">العملة</label>
                <Select value={quoteCurrency} onValueChange={(v) => setQuoteCurrency(v as Currency)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YER">ر.ي (YER)</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="SAR">ر.س (SAR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleCalculateQuote} disabled={quoteLoading} className="w-full">
                  {quoteLoading ? (
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 ml-1" />
                      احسب
                    </>
                  )}
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {quoteResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border mt-2">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">السعر الأساسي</p>
                      <p className="text-lg font-bold font-mono">{quoteResult.base.toLocaleString("ar-EG")}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">الخصم</p>
                      <p className="text-lg font-bold font-mono text-red-600">-{quoteResult.discount.toLocaleString("ar-EG")}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">الإجمالي</p>
                      <p className="text-lg font-bold font-mono text-green-700">{quoteResult.total.toLocaleString("ar-EG")}</p>
                    </div>
                  </div>
                  {quoteResult.rules.length > 0 && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-medium text-blue-700 mb-1">القواعد المطبقة:</p>
                      {quoteResult.rules.map((r, i) => (
                        <code key={i} className="block text-xs font-mono text-blue-800 bg-blue-100 px-2 py-0.5 rounded mt-1">{r}</code>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== Dialogs ===== */}

      {/* Create Price List Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              إنشاء قائمة أسعار جديدة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">اسم القائمة *</label>
              <Input
                placeholder="مثال: قائمة الأسعار الرئيسية"
                value={newList.name}
                onChange={(e) => setNewList((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">العملة *</label>
              <Select value={newList.currency} onValueChange={(v) => setNewList((p) => ({ ...p, currency: v as Currency }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YER">ر.ي (YER)</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="SAR">ر.س (SAR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">صالحة من *</label>
                <Input
                  type="date"
                  value={newList.valid_from}
                  onChange={(e) => setNewList((p) => ({ ...p, valid_from: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">صالحة إلى</label>
                <Input
                  type="date"
                  value={newList.valid_to}
                  onChange={(e) => setNewList((p) => ({ ...p, valid_to: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button onClick={handleCreatePriceList} disabled={saving}>
              {saving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : "إنشاء"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Rule Dialog */}
      <Dialog open={addRuleDialogOpen} onOpenChange={setAddRuleDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              إضافة قاعدة تسعير جديدة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">الشرط (CEL) *</label>
              <textarea
                className="w-full h-20 px-3 py-2 text-sm font-mono rounded-md border bg-emerald-50/50 text-emerald-900 focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder='مثال: customer.score > 700 && qty >= 10'
                value={newRule.condition_cel}
                onChange={(e) => setNewRule((p) => ({ ...p, condition_cel: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">المعادلة (CEL) *</label>
              <textarea
                className="w-full h-16 px-3 py-2 text-sm font-mono rounded-md border bg-emerald-50/50 text-emerald-900 focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder='مثال: base_price * 0.9'
                value={newRule.formula_cel}
                onChange={(e) => setNewRule((p) => ({ ...p, formula_cel: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">الأولوية</label>
              <Input
                type="number"
                min={1}
                value={newRule.priority}
                onChange={(e) => setNewRule((p) => ({ ...p, priority: Math.max(1, Number(e.target.value)) }))}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button onClick={handleAddRule} disabled={saving}>
              {saving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Rule Dialog */}
      <Dialog open={editRuleDialogOpen} onOpenChange={setEditRuleDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              تعديل قاعدة التسعير
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">الشرط (CEL)</label>
              <textarea
                className="w-full h-20 px-3 py-2 text-sm font-mono rounded-md border bg-emerald-50/50 text-emerald-900 focus:outline-none focus:ring-2 focus:ring-ring"
                value={ruleForm.condition_cel}
                onChange={(e) => setRuleForm((p) => ({ ...p, condition_cel: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">المعادلة (CEL)</label>
              <textarea
                className="w-full h-16 px-3 py-2 text-sm font-mono rounded-md border bg-emerald-50/50 text-emerald-900 focus:outline-none focus:ring-2 focus:ring-ring"
                value={ruleForm.formula_cel}
                onChange={(e) => setRuleForm((p) => ({ ...p, formula_cel: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">الأولوية</label>
              <Input
                type="number"
                min={1}
                value={ruleForm.priority}
                onChange={(e) => setRuleForm((p) => ({ ...p, priority: Math.max(1, Number(e.target.value)) }))}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button onClick={handleSaveEditRule} disabled={saving}>
              {saving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog((p) => ({ ...p, open }))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              تأكيد الحذف
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm py-2">
            هل أنت متأكد من حذف <span className="font-bold">{deleteDialog.name}</span>؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={saving}>
              {saving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

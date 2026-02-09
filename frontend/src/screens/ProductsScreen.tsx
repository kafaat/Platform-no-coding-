import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Wrench,
  CalendarRange,
  Landmark,
  BarChart3,
  FileCheck,
  FileEdit,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  PackageOpen,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Product, ProductType, ProductStatus, ScreenId } from "@/types";
import { PRODUCT_TYPE_LABELS, PRODUCT_STATUS_LABELS } from "@/types";

// ============================================================
// Props
// ============================================================

interface ProductsScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

// ============================================================
// ProductRow extends Product with display fields
// ============================================================

interface ProductRow extends Product {
  sku: string;
  category_name: string;
}

// ============================================================
// Initial Mock Data
// ============================================================

const initialMockProducts: ProductRow[] = [
  {
    id: 1,
    tenant_id: 1,
    category_id: 11,
    type: "PHYSICAL",
    name_ar: "هاتف ذكي سامسونج A54",
    name_en: "Samsung Galaxy A54",
    divisible: false,
    lifecycle_from: "2024-01-01",
    lifecycle_to: undefined,
    status: "ACTIVE",
    payload: {},
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-06-01T14:00:00Z",
    sku: "PHY-ELC-001",
    category_name: "إلكترونيات",
  },
  {
    id: 2,
    tenant_id: 1,
    category_id: 22,
    type: "DIGITAL",
    name_ar: "رخصة مايكروسوفت أوفيس 365",
    name_en: "Microsoft Office 365 License",
    divisible: false,
    lifecycle_from: "2024-02-01",
    lifecycle_to: undefined,
    status: "ACTIVE",
    payload: {},
    created_at: "2024-02-10T08:15:00Z",
    updated_at: "2024-05-15T09:20:00Z",
    sku: "DIG-LIC-001",
    category_name: "تراخيص",
  },
  {
    id: 3,
    tenant_id: 1,
    category_id: 31,
    type: "SERVICE",
    name_ar: "خدمة استشارة تقنية",
    name_en: "IT Consulting Service",
    divisible: true,
    lifecycle_from: "2024-03-01",
    lifecycle_to: undefined,
    status: "ACTIVE",
    payload: {},
    created_at: "2024-03-05T11:45:00Z",
    updated_at: "2024-04-20T16:30:00Z",
    sku: "SRV-CON-001",
    category_name: "استشارات",
  },
  {
    id: 4,
    tenant_id: 1,
    category_id: 41,
    type: "RESERVATION",
    name_ar: "غرفة فندقية ديلوكس",
    name_en: "Deluxe Hotel Room",
    divisible: false,
    lifecycle_from: "2024-01-01",
    lifecycle_to: undefined,
    status: "DRAFT",
    payload: {},
    created_at: "2024-04-20T09:00:00Z",
    updated_at: "2024-04-20T09:00:00Z",
    sku: "RSV-HTL-001",
    category_name: "فنادق",
  },
  {
    id: 5,
    tenant_id: 1,
    category_id: 51,
    type: "FINANCIAL",
    name_ar: "قرض شخصي ميسر",
    name_en: "Personal Loan",
    divisible: true,
    lifecycle_from: "2024-04-01",
    lifecycle_to: undefined,
    status: "ACTIVE",
    payload: {},
    created_at: "2024-04-01T07:00:00Z",
    updated_at: "2024-06-15T12:00:00Z",
    sku: "FIN-LN-001",
    category_name: "قروض",
  },
  {
    id: 6,
    tenant_id: 1,
    category_id: 11,
    type: "PHYSICAL",
    name_ar: "لابتوب لينوفو ThinkPad",
    name_en: "Lenovo ThinkPad Laptop",
    divisible: false,
    lifecycle_from: "2024-05-01",
    lifecycle_to: undefined,
    status: "SUSPENDED",
    payload: {},
    created_at: "2024-05-10T13:20:00Z",
    updated_at: "2024-08-01T10:00:00Z",
    sku: "PHY-ELC-002",
    category_name: "إلكترونيات",
  },
  {
    id: 7,
    tenant_id: 1,
    category_id: 12,
    type: "PHYSICAL",
    name_ar: "شاشة سامسونج 27 بوصة",
    name_en: "Samsung 27\" Monitor",
    divisible: false,
    lifecycle_from: "2024-06-01",
    lifecycle_to: undefined,
    status: "ACTIVE",
    payload: {},
    created_at: "2024-06-01T08:00:00Z",
    updated_at: "2024-06-15T10:00:00Z",
    sku: "PHY-ELC-003",
    category_name: "إلكترونيات",
  },
  {
    id: 8,
    tenant_id: 1,
    category_id: 21,
    type: "DIGITAL",
    name_ar: "اشتراك أدوبي كرييتف كلاود",
    name_en: "Adobe Creative Cloud Subscription",
    divisible: false,
    lifecycle_from: "2024-03-15",
    lifecycle_to: undefined,
    status: "RETIRED",
    payload: {},
    created_at: "2024-03-15T09:30:00Z",
    updated_at: "2024-09-01T11:00:00Z",
    sku: "DIG-SUB-001",
    category_name: "برمجيات",
  },
];

// ============================================================
// Type icon & color mapping
// ============================================================

const typeIcons: Record<ProductType, React.ReactNode> = {
  PHYSICAL: <Package className="h-3.5 w-3.5" />,
  DIGITAL: <Monitor className="h-3.5 w-3.5" />,
  SERVICE: <Wrench className="h-3.5 w-3.5" />,
  RESERVATION: <CalendarRange className="h-3.5 w-3.5" />,
  FINANCIAL: <Landmark className="h-3.5 w-3.5" />,
};

const typeColors: Record<ProductType, string> = {
  PHYSICAL: "bg-blue-50 text-blue-700 border-blue-200",
  DIGITAL: "bg-purple-50 text-purple-700 border-purple-200",
  SERVICE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  RESERVATION: "bg-amber-50 text-amber-700 border-amber-200",
  FINANCIAL: "bg-rose-50 text-rose-700 border-rose-200",
};

// ============================================================
// Status Badge with click-to-change
// ============================================================

function StatusBadge({
  status,
  onClick,
}: {
  status: ProductStatus;
  onClick?: () => void;
}) {
  const config = PRODUCT_STATUS_LABELS[status];
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-gray-300 transition-all ${config.color}`}
      title="انقر لتغيير الحالة"
      aria-label={`الحالة: ${config.ar} — انقر لتغيير الحالة`}
    >
      {config.ar}
    </button>
  );
}

// ============================================================
// Type Badge
// ============================================================

function TypeBadge({ type }: { type: ProductType }) {
  const config = PRODUCT_TYPE_LABELS[type];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${typeColors[type]}`}
    >
      {typeIcons[type]}
      {config.ar}
    </span>
  );
}

// ============================================================
// Toast Component
// ============================================================

interface ToastMessage {
  id: number;
  type: "success" | "error";
  message: string;
}

function Toast({
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
// Skeleton Row
// ============================================================

function SkeletonRow() {
  return (
    <tr className="border-b animate-pulse">
      <td className="p-3">
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-36" />
          <div className="h-3 bg-muted rounded w-20" />
        </div>
      </td>
      <td className="p-3">
        <div className="h-5 bg-muted rounded w-16" />
      </td>
      <td className="p-3">
        <div className="h-4 bg-muted rounded w-20" />
      </td>
      <td className="p-3">
        <div className="h-5 bg-muted rounded-full w-14" />
      </td>
      <td className="p-3">
        <div className="h-3 bg-muted rounded w-24" />
      </td>
      <td className="p-3">
        <div className="flex items-center justify-center gap-1">
          <div className="h-8 w-8 bg-muted rounded" />
          <div className="h-8 w-8 bg-muted rounded" />
          <div className="h-8 w-8 bg-muted rounded" />
        </div>
      </td>
    </tr>
  );
}

// ============================================================
// Sort configuration
// ============================================================

type SortField = "name_ar" | "type" | "category_name" | "status" | "created_at";
type SortDir = "asc" | "desc";

// ============================================================
// Animation variants
// ============================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// ============================================================
// Helper: format ISO date
// ============================================================

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

// ============================================================
// Simulated API service
// ============================================================

function simulateApiCall<T>(data: T, delayMs = 600): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delayMs);
  });
}

// ============================================================
// CSV Export helper
// ============================================================

function exportProductsCSV(products: ProductRow[]) {
  const headers = ["ID", "SKU", "Name (AR)", "Name (EN)", "Type", "Category", "Status", "Created At"];
  const rows = products.map((p) => [
    p.id,
    p.sku,
    p.name_ar,
    p.name_en ?? "",
    p.type,
    p.category_name,
    p.status,
    p.created_at,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `products_export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================
// Valid status transitions
// ============================================================

const validStatusTransitions: Record<ProductStatus, ProductStatus[]> = {
  DRAFT: ["ACTIVE"],
  ACTIVE: ["SUSPENDED", "RETIRED"],
  SUSPENDED: ["ACTIVE", "RETIRED"],
  RETIRED: [],
};

// ============================================================
// Component
// ============================================================

export default function ProductsScreen({ onNavigate }: ProductsScreenProps) {
  // -- Products state (simulated backend) --
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // -- Filters --
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // -- Pagination --
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // -- Sorting --
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // -- Delete dialog --
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // -- Status change dropdown --
  const [statusChangeTarget, setStatusChangeTarget] = useState<ProductRow | null>(null);

  // -- Toast --
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastIdRef = useRef(0);

  // -- Export loading --
  const [isExporting, setIsExporting] = useState(false);

  // ---- Toast helpers ----
  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ---- Initial data load ----
  useEffect(() => {
    setIsLoading(true);
    simulateApiCall(initialMockProducts, 800).then((data) => {
      setProducts(data);
      setIsLoading(false);
    });
  }, []);

  // ---- Debounced search ----
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ---- Filtering ----
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (typeFilter !== "ALL" && p.type !== typeFilter) return false;
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        if (
          !p.name_ar.includes(debouncedSearch) &&
          !(p.name_en ?? "").toLowerCase().includes(q) &&
          !p.sku.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [products, typeFilter, statusFilter, debouncedSearch]);

  // ---- Sorting ----
  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name_ar":
          cmp = a.name_ar.localeCompare(b.name_ar, "ar");
          break;
        case "type":
          cmp = a.type.localeCompare(b.type);
          break;
        case "category_name":
          cmp = a.category_name.localeCompare(b.category_name, "ar");
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "created_at":
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortField, sortDir]);

  // ---- Pagination ----
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  // ---- Stats ----
  const totalCount = products.length;
  const activeCount = products.filter((p) => p.status === "ACTIVE").length;
  const draftCount = products.filter((p) => p.status === "DRAFT").length;
  const suspendedCount = products.filter((p) => p.status === "SUSPENDED").length;

  const statCards = [
    {
      label: "إجمالي المنتجات",
      value: totalCount,
      icon: <BarChart3 className="h-5 w-5" />,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "نشط",
      value: activeCount,
      icon: <FileCheck className="h-5 w-5" />,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "مسودة",
      value: draftCount,
      icon: <FileEdit className="h-5 w-5" />,
      color: "text-gray-600 bg-gray-50",
    },
    {
      label: "معلق",
      value: suspendedCount,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "text-yellow-600 bg-yellow-50",
    },
  ];

  // ---- Sort handler ----
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  // ---- Delete handler ----
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await simulateApiCall(true, 500);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      addToast("success", `تم حذف المنتج "${deleteTarget.name_ar}" بنجاح`);
    } catch {
      addToast("error", "حدث خطأ أثناء حذف المنتج");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // ---- Status change handler ----
  const handleStatusChange = async (product: ProductRow, newStatus: ProductStatus) => {
    try {
      await simulateApiCall(true, 400);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, status: newStatus, updated_at: new Date().toISOString() }
            : p
        )
      );
      addToast(
        "success",
        `تم تغيير حالة "${product.name_ar}" إلى ${PRODUCT_STATUS_LABELS[newStatus].ar}`
      );
    } catch {
      addToast("error", "حدث خطأ أثناء تغيير الحالة");
    }
    setStatusChangeTarget(null);
  };

  // ---- Export handler ----
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await simulateApiCall(true, 700);
      exportProductsCSV(filtered);
      addToast("success", `تم تصدير ${filtered.length} منتج بنجاح`);
    } catch {
      addToast("error", "حدث خطأ أثناء التصدير");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      className="space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Toast container */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <Toast key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>

      {/* ── Header ────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6" />
              المنتجات
            </h1>
            <p className="text-muted-foreground mt-1">
              إدارة جميع أنواع المنتجات في النظام
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting || filtered.length === 0}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 ml-1 animate-spin" />
              ) : (
                <Download className="h-4 w-4 ml-1" />
              )}
              تصدير
            </Button>
            <Button size="sm" onClick={() => onNavigate("product-editor")}>
              <Plus className="h-4 w-4 ml-1" />
              إنشاء منتج
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Filter Bar ────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم أو SKU..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pr-9"
                  aria-label="بحث في المنتجات"
                />
              </div>
              <Select
                value={typeFilter}
                onValueChange={(v) => {
                  setTypeFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-44">
                  <Filter className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="نوع المنتج" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">جميع الأنواع</SelectItem>
                  <SelectItem value="PHYSICAL">مادي</SelectItem>
                  <SelectItem value="DIGITAL">رقمي</SelectItem>
                  <SelectItem value="SERVICE">خدمة</SelectItem>
                  <SelectItem value="RESERVATION">حجز</SelectItem>
                  <SelectItem value="FINANCIAL">مالي</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">جميع الحالات</SelectItem>
                  <SelectItem value="DRAFT">مسودة</SelectItem>
                  <SelectItem value="ACTIVE">نشط</SelectItem>
                  <SelectItem value="SUSPENDED">معلق</SelectItem>
                  <SelectItem value="RETIRED">متقاعد</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Stats Row ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold mt-1">{stat.value.toLocaleString("ar-EG")}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${stat.color}`}>
                  {stat.icon}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Product Table ─────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>قائمة المنتجات ({isLoading ? "..." : filtered.length.toLocaleString("ar-EG")})</span>
              <Badge variant="outline" className="font-normal text-xs">
                صفحة {safePage.toLocaleString("ar-EG")} من {totalPages.toLocaleString("ar-EG")}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th
                      className="text-right p-3 font-medium cursor-pointer hover:bg-muted/80 transition-colors select-none"
                      onClick={() => handleSort("name_ar")}
                    >
                      <span className="inline-flex items-center gap-1">
                        المنتج
                        <SortIcon field="name_ar" />
                      </span>
                    </th>
                    <th
                      className="text-right p-3 font-medium cursor-pointer hover:bg-muted/80 transition-colors select-none"
                      onClick={() => handleSort("type")}
                    >
                      <span className="inline-flex items-center gap-1">
                        النوع
                        <SortIcon field="type" />
                      </span>
                    </th>
                    <th
                      className="text-right p-3 font-medium cursor-pointer hover:bg-muted/80 transition-colors select-none"
                      onClick={() => handleSort("category_name")}
                    >
                      <span className="inline-flex items-center gap-1">
                        التصنيف
                        <SortIcon field="category_name" />
                      </span>
                    </th>
                    <th
                      className="text-right p-3 font-medium cursor-pointer hover:bg-muted/80 transition-colors select-none"
                      onClick={() => handleSort("status")}
                    >
                      <span className="inline-flex items-center gap-1">
                        الحالة
                        <SortIcon field="status" />
                      </span>
                    </th>
                    <th
                      className="text-right p-3 font-medium cursor-pointer hover:bg-muted/80 transition-colors select-none"
                      onClick={() => handleSort("created_at")}
                    >
                      <span className="inline-flex items-center gap-1">
                        تاريخ الإنشاء
                        <SortIcon field="created_at" />
                      </span>
                    </th>
                    <th className="text-center p-3 font-medium">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <>
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                    </>
                  ) : paged.length > 0 ? (
                    paged.map((product, idx) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        {/* المنتج */}
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{product.name_ar}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {product.sku}
                            </p>
                          </div>
                        </td>
                        {/* النوع */}
                        <td className="p-3">
                          <TypeBadge type={product.type} />
                        </td>
                        {/* التصنيف */}
                        <td className="p-3 text-muted-foreground">
                          {product.category_name}
                        </td>
                        {/* الحالة */}
                        <td className="p-3 relative">
                          <StatusBadge
                            status={product.status}
                            onClick={() => {
                              if (validStatusTransitions[product.status].length > 0) {
                                setStatusChangeTarget(product);
                              }
                            }}
                          />
                        </td>
                        {/* تاريخ الإنشاء */}
                        <td className="p-3 text-muted-foreground text-xs">
                          {formatDate(product.created_at)}
                        </td>
                        {/* إجراءات */}
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="عرض"
                              aria-label={`عرض ${product.name_ar}`}
                              onClick={() => onNavigate("product-editor")}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="تعديل"
                              aria-label={`تعديل ${product.name_ar}`}
                              onClick={() => onNavigate("product-editor")}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              title="حذف"
                              aria-label={`حذف ${product.name_ar}`}
                              onClick={() => setDeleteTarget(product)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 rounded-full bg-muted/50">
                            <PackageOpen className="h-12 w-12 text-muted-foreground/40" />
                          </div>
                          <div>
                            <p className="text-base font-medium text-muted-foreground">
                              لا توجد منتجات مطابقة
                            </p>
                            <p className="text-sm text-muted-foreground/70 mt-1">
                              جرّب تعديل معايير البحث أو الفلاتر للعثور على ما تبحث عنه
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              setSearchInput("");
                              setTypeFilter("ALL");
                              setStatusFilter("ALL");
                            }}
                          >
                            مسح الفلاتر
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination Row ───────────────────── */}
            {!isLoading && (
              <>
                <Separator />
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-3">
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-muted-foreground">
                      عرض{" "}
                      {sorted.length > 0
                        ? `${((safePage - 1) * pageSize + 1).toLocaleString("ar-EG")}-${Math.min(
                            safePage * pageSize,
                            sorted.length
                          ).toLocaleString("ar-EG")}`
                        : "٠"}{" "}
                      من {sorted.length.toLocaleString("ar-EG")} منتج
                    </p>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(v) => {
                        setPageSize(Number(v));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-20 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safePage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      aria-label="الصفحة السابقة"
                    >
                      <ChevronRight className="h-4 w-4" />
                      السابق
                    </Button>
                    {/* Page number buttons */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => {
                          if (totalPages <= 5) return true;
                          if (p === 1 || p === totalPages) return true;
                          if (Math.abs(p - safePage) <= 1) return true;
                          return false;
                        })
                        .reduce<(number | "ellipsis")[]>((acc, p, i, arr) => {
                          if (i > 0 && p - (arr[i - 1] as number) > 1) {
                            acc.push("ellipsis");
                          }
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((item, idx) =>
                          item === "ellipsis" ? (
                            <span
                              key={`ellipsis-${idx}`}
                              className="px-1 text-muted-foreground text-xs"
                            >
                              ...
                            </span>
                          ) : (
                            <Button
                              key={item}
                              variant={safePage === item ? "default" : "outline"}
                              size="sm"
                              className="h-8 w-8 p-0 text-xs"
                              onClick={() => setCurrentPage(item)}
                              aria-label={`صفحة ${item.toLocaleString("ar-EG")}`}
                              aria-current={safePage === item ? "page" : undefined}
                            >
                              {item.toLocaleString("ar-EG")}
                            </Button>
                          )
                        )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safePage >= totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      aria-label="الصفحة التالية"
                    >
                      التالي
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Delete Confirmation Dialog ─────────── */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              تأكيد الحذف
            </DialogTitle>
            <DialogDescription className="text-right pt-2">
              هل أنت متأكد من حذف هذا المنتج؟
            </DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="p-3 bg-muted/50 rounded-lg border my-2">
              <p className="font-medium text-sm">{deleteTarget.name_ar}</p>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                {deleteTarget.sku}
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المنتج وجميع بياناته
            المرتبطة نهائياً.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 ml-1 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 ml-1" />
              )}
              حذف المنتج
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Status Change Dialog ─────────────── */}
      <Dialog
        open={!!statusChangeTarget}
        onOpenChange={(open) => !open && setStatusChangeTarget(null)}
      >
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تغيير حالة المنتج</DialogTitle>
            <DialogDescription className="text-right pt-2">
              اختر الحالة الجديدة للمنتج: {statusChangeTarget?.name_ar}
            </DialogDescription>
          </DialogHeader>
          {statusChangeTarget && (
            <div className="space-y-3 py-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>الحالة الحالية:</span>
                <StatusBadge status={statusChangeTarget.status} />
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">الحالات المتاحة:</p>
                <div className="flex flex-wrap gap-2">
                  {validStatusTransitions[statusChangeTarget.status].map(
                    (newStatus) => (
                      <Button
                        key={newStatus}
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(statusChangeTarget, newStatus)
                        }
                        className="gap-1"
                      >
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            PRODUCT_STATUS_LABELS[newStatus].color
                              .replace("bg-", "bg-")
                              .split(" ")[0]
                          }`}
                        />
                        {PRODUCT_STATUS_LABELS[newStatus].ar}
                      </Button>
                    )
                  )}
                </div>
                {validStatusTransitions[statusChangeTarget.status].length ===
                  0 && (
                  <p className="text-sm text-muted-foreground">
                    لا توجد حالات متاحة للتغيير
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusChangeTarget(null)}
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

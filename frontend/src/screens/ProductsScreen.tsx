import { useState } from "react";
import { motion } from "framer-motion";
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
import type { Product, ProductType, ProductStatus } from "@/types";
import { PRODUCT_TYPE_LABELS, PRODUCT_STATUS_LABELS } from "@/types";

// ============================================================
// Mock Data — 6 products across different types
// ============================================================

interface ProductRow extends Product {
  sku: string;
  category_name: string;
}

const mockProducts: ProductRow[] = [
  {
    id: 1,
    tenant_id: 1,
    category_id: 11,
    type: "PHYSICAL",
    name_ar: "هاتف ذكي سامسونج A54",
    name_en: "Samsung Galaxy A54",
    divisible: false,
    lifecycle_from: "2024-01-01",
    lifecycle_to: null,
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
    lifecycle_to: null,
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
    lifecycle_to: null,
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
    lifecycle_to: null,
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
    lifecycle_to: null,
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
    lifecycle_to: null,
    status: "SUSPENDED",
    payload: {},
    created_at: "2024-05-10T13:20:00Z",
    updated_at: "2024-08-01T10:00:00Z",
    sku: "PHY-ELC-002",
    category_name: "إلكترونيات",
  },
];

// ============================================================
// Type icon mapping
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
// Status Badge
// ============================================================

function StatusBadge({ status }: { status: ProductStatus }) {
  const config = PRODUCT_STATUS_LABELS[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.ar}
    </span>
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
// Component
// ============================================================

export default function ProductsScreen() {
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // --- Filtering ---
  const filtered = mockProducts.filter((p) => {
    if (typeFilter !== "ALL" && p.type !== typeFilter) return false;
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    if (
      search &&
      !p.name_ar.includes(search) &&
      !p.name_en.toLowerCase().includes(search.toLowerCase()) &&
      !p.sku.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  // --- Pagination ---
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  // --- Stats ---
  const totalCount = mockProducts.length;
  const activeCount = mockProducts.filter((p) => p.status === "ACTIVE").length;
  const draftCount = mockProducts.filter((p) => p.status === "DRAFT").length;
  const suspendedCount = mockProducts.filter(
    (p) => p.status === "SUSPENDED"
  ).length;

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

  return (
    <motion.div
      className="space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
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
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 ml-1" />
              تصدير
            </Button>
            <Button size="sm">
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
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pr-9"
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
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
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
              <span>قائمة المنتجات ({filtered.length})</span>
              <Badge variant="outline" className="font-normal text-xs">
                صفحة {safePage} من {totalPages}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-right p-3 font-medium">المنتج</th>
                    <th className="text-right p-3 font-medium">النوع</th>
                    <th className="text-right p-3 font-medium">التصنيف</th>
                    <th className="text-right p-3 font-medium">الحالة</th>
                    <th className="text-right p-3 font-medium">
                      تاريخ الإنشاء
                    </th>
                    <th className="text-center p-3 font-medium">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((product, idx) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      {/* المنتج — name + SKU */}
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
                      <td className="p-3">
                        <StatusBadge status={product.status} />
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
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="تعديل"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {paged.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-12 text-center text-muted-foreground"
                      >
                        <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>لا توجد منتجات مطابقة للبحث</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination Row ───────────────────── */}
            <Separator />
            <div className="flex items-center justify-between p-4">
              <p className="text-sm text-muted-foreground">
                عرض{" "}
                {filtered.length > 0
                  ? `${(safePage - 1) * pageSize + 1}–${Math.min(
                      safePage * pageSize,
                      filtered.length
                    )}`
                  : "0"}{" "}
                من {filtered.length} منتج
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                  السابق
                </Button>
                <span className="text-sm px-3 font-medium">
                  {safePage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage >= totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  التالي
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

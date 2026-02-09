import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  FolderTree,
  Plus,
  Search,
  Package,
  Monitor,
  Wrench,
  CalendarRange,
  Landmark,
  Edit3,
  ToggleRight,
  ToggleLeft,
  List,
  GitBranchPlus,
  ChevronDown,
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
import type { ProductCategory, ProductType } from "@/types";

// ============================================================
// Constants & Labels
// ============================================================

const TYPE_LABELS: Record<ProductType, string> = {
  PHYSICAL: "مادي",
  DIGITAL: "رقمي",
  SERVICE: "خدمة",
  RESERVATION: "حجز",
  FINANCIAL: "مالي",
};

const TYPE_ICONS: Record<ProductType, React.ReactNode> = {
  PHYSICAL: <Package className="h-4 w-4" />,
  DIGITAL: <Monitor className="h-4 w-4" />,
  SERVICE: <Wrench className="h-4 w-4" />,
  RESERVATION: <CalendarRange className="h-4 w-4" />,
  FINANCIAL: <Landmark className="h-4 w-4" />,
};

const TYPE_COLORS: Record<ProductType, string> = {
  PHYSICAL: "bg-blue-50 text-blue-700 border-blue-200",
  DIGITAL: "bg-purple-50 text-purple-700 border-purple-200",
  SERVICE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  RESERVATION: "bg-amber-50 text-amber-700 border-amber-200",
  FINANCIAL: "bg-rose-50 text-rose-700 border-rose-200",
};

// ============================================================
// Mock Data — 8 root categories with children (tree structure)
// ============================================================

const MOCK_CATEGORIES: ProductCategory[] = [
  {
    id: 1,
    tenant_id: 1,
    parent_id: null,
    name_ar: "المنتجات المادية",
    name_en: "Physical Products",
    type: "PHYSICAL",
    is_active: true,
    default_policies: {},
    product_count: 45,
    children: [
      {
        id: 11,
        tenant_id: 1,
        parent_id: 1,
        name_ar: "إلكترونيات",
        name_en: "Electronics",
        type: "PHYSICAL",
        is_active: true,
        default_policies: {},
        product_count: 28,
        children: [],
      },
      {
        id: 12,
        tenant_id: 1,
        parent_id: 1,
        name_ar: "أغذية ومشروبات",
        name_en: "Food & Beverage",
        type: "PHYSICAL",
        is_active: true,
        default_policies: {},
        product_count: 17,
        children: [],
      },
    ],
  },
  {
    id: 2,
    tenant_id: 1,
    parent_id: null,
    name_ar: "المنتجات الرقمية",
    name_en: "Digital Products",
    type: "DIGITAL",
    is_active: true,
    default_policies: {},
    product_count: 32,
    children: [
      {
        id: 21,
        tenant_id: 1,
        parent_id: 2,
        name_ar: "برمجيات",
        name_en: "Software",
        type: "DIGITAL",
        is_active: true,
        default_policies: {},
        product_count: 18,
        children: [],
      },
      {
        id: 22,
        tenant_id: 1,
        parent_id: 2,
        name_ar: "تراخيص",
        name_en: "Licenses",
        type: "DIGITAL",
        is_active: false,
        default_policies: {},
        product_count: 14,
        children: [],
      },
    ],
  },
  {
    id: 3,
    tenant_id: 1,
    parent_id: null,
    name_ar: "الخدمات",
    name_en: "Services",
    type: "SERVICE",
    is_active: true,
    default_policies: {},
    product_count: 21,
    children: [
      {
        id: 31,
        tenant_id: 1,
        parent_id: 3,
        name_ar: "استشارات",
        name_en: "Consulting",
        type: "SERVICE",
        is_active: true,
        default_policies: {},
        product_count: 12,
        children: [],
      },
      {
        id: 32,
        tenant_id: 1,
        parent_id: 3,
        name_ar: "صيانة",
        name_en: "Maintenance",
        type: "SERVICE",
        is_active: true,
        default_policies: {},
        product_count: 9,
        children: [],
      },
    ],
  },
  {
    id: 4,
    tenant_id: 1,
    parent_id: null,
    name_ar: "الحجوزات",
    name_en: "Reservations",
    type: "RESERVATION",
    is_active: true,
    default_policies: {},
    product_count: 15,
    children: [
      {
        id: 41,
        tenant_id: 1,
        parent_id: 4,
        name_ar: "فنادق",
        name_en: "Hotels",
        type: "RESERVATION",
        is_active: true,
        default_policies: {},
        product_count: 6,
        children: [],
      },
      {
        id: 42,
        tenant_id: 1,
        parent_id: 4,
        name_ar: "قاعات مؤتمرات",
        name_en: "Conference Halls",
        type: "RESERVATION",
        is_active: true,
        default_policies: {},
        product_count: 5,
        children: [],
      },
      {
        id: 43,
        tenant_id: 1,
        parent_id: 4,
        name_ar: "مواعيد",
        name_en: "Appointments",
        type: "RESERVATION",
        is_active: false,
        default_policies: {},
        product_count: 4,
        children: [],
      },
    ],
  },
  {
    id: 5,
    tenant_id: 1,
    parent_id: null,
    name_ar: "المنتجات المالية",
    name_en: "Financial Products",
    type: "FINANCIAL",
    is_active: true,
    default_policies: {},
    product_count: 27,
    children: [
      {
        id: 51,
        tenant_id: 1,
        parent_id: 5,
        name_ar: "قروض شخصية",
        name_en: "Personal Loans",
        type: "FINANCIAL",
        is_active: true,
        default_policies: {},
        product_count: 10,
        children: [],
      },
      {
        id: 52,
        tenant_id: 1,
        parent_id: 5,
        name_ar: "خطوط ائتمان",
        name_en: "Credit Lines",
        type: "FINANCIAL",
        is_active: true,
        default_policies: {},
        product_count: 8,
        children: [],
      },
      {
        id: 53,
        tenant_id: 1,
        parent_id: 5,
        name_ar: "تمويل عقاري",
        name_en: "Mortgage Financing",
        type: "FINANCIAL",
        is_active: true,
        default_policies: {},
        product_count: 9,
        children: [],
      },
    ],
  },
  {
    id: 6,
    tenant_id: 1,
    parent_id: null,
    name_ar: "الاشتراكات",
    name_en: "Subscriptions",
    type: "DIGITAL",
    is_active: true,
    default_policies: {},
    product_count: 11,
    children: [
      {
        id: 61,
        tenant_id: 1,
        parent_id: 6,
        name_ar: "اشتراكات شهرية",
        name_en: "Monthly Subscriptions",
        type: "DIGITAL",
        is_active: true,
        default_policies: {},
        product_count: 7,
        children: [],
      },
      {
        id: 62,
        tenant_id: 1,
        parent_id: 6,
        name_ar: "اشتراكات سنوية",
        name_en: "Yearly Subscriptions",
        type: "DIGITAL",
        is_active: true,
        default_policies: {},
        product_count: 4,
        children: [],
      },
    ],
  },
  {
    id: 7,
    tenant_id: 1,
    parent_id: null,
    name_ar: "مواد البناء",
    name_en: "Construction Materials",
    type: "PHYSICAL",
    is_active: true,
    default_policies: {},
    product_count: 38,
    children: [],
  },
  {
    id: 8,
    tenant_id: 1,
    parent_id: null,
    name_ar: "التأمينات",
    name_en: "Insurance",
    type: "FINANCIAL",
    is_active: false,
    default_policies: {},
    product_count: 0,
    children: [],
  },
];

// ============================================================
// Animation Variants
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

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

// ============================================================
// Helpers
// ============================================================

/** Flatten a category tree into a list, including depth for indentation. */
function flattenCategories(
  categories: ProductCategory[],
  depth = 0
): Array<ProductCategory & { _depth: number }> {
  const result: Array<ProductCategory & { _depth: number }> = [];
  for (const cat of categories) {
    result.push({ ...cat, _depth: depth });
    if (cat.children && cat.children.length > 0) {
      result.push(...flattenCategories(cat.children, depth + 1));
    }
  }
  return result;
}

/** Filter categories by search term (matches name_ar or name_en). */
function filterTree(
  categories: ProductCategory[],
  term: string
): ProductCategory[] {
  if (!term.trim()) return categories;
  const lower = term.toLowerCase();
  return categories.reduce<ProductCategory[]>((acc, cat) => {
    const matchesSelf =
      cat.name_ar.includes(term) ||
      (cat.name_en ?? "").toLowerCase().includes(lower);
    const filteredChildren = cat.children
      ? filterTree(cat.children, term)
      : [];
    if (matchesSelf || filteredChildren.length > 0) {
      acc.push({
        ...cat,
        children: matchesSelf ? cat.children : filteredChildren,
      });
    }
    return acc;
  }, []);
}

// ============================================================
// Tree Node Sub-component
// ============================================================

function CategoryTreeNode({
  category,
  depth = 0,
  expandedIds,
  onToggleExpand,
}: {
  category: ProductCategory;
  depth?: number;
  expandedIds: Set<number>;
  onToggleExpand: (id: number) => void;
}) {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedIds.has(category.id);

  return (
    <div>
      <motion.button
        onClick={() => {
          if (hasChildren) onToggleExpand(category.id);
        }}
        className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-colors hover:bg-accent/60 group ${
          !category.is_active ? "opacity-60" : ""
        }`}
        style={{ paddingRight: `${depth * 20 + 12}px` }}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
      >
        {/* Expand/collapse chevron */}
        {hasChildren ? (
          <ChevronLeft
            className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ${
              isExpanded ? "-rotate-90" : ""
            }`}
          />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        {/* Type icon badge */}
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-md border ${
            TYPE_COLORS[category.type as ProductType]
          }`}
        >
          {TYPE_ICONS[category.type as ProductType]}
        </span>

        {/* Name */}
        <span className="truncate font-medium">{category.name_ar}</span>

        {/* Product count */}
        {(category.product_count ?? 0) > 0 && (
          <span className="mr-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {category.product_count}
          </span>
        )}

        {/* Inactive indicator */}
        {!category.is_active && (
          <span className="mr-1 text-[10px] text-red-500 font-medium">
            معطل
          </span>
        )}
      </motion.button>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {category.children!.map((child) => (
              <CategoryTreeNode
                key={child.id}
                category={child}
                depth={depth + 1}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Table Row Sub-component
// ============================================================

function CategoryTableRow({
  category,
  depth = 0,
  onEdit,
  onToggleActive,
}: {
  category: ProductCategory & { _depth: number };
  depth?: number;
  onEdit: (cat: ProductCategory) => void;
  onToggleActive: (cat: ProductCategory) => void;
}) {
  return (
    <motion.tr
      variants={rowVariants}
      className="border-b transition-colors hover:bg-muted/50"
    >
      {/* Name (ar / en) */}
      <TableCell>
        <div
          className="flex items-center gap-2"
          style={{ paddingRight: `${category._depth * 20}px` }}
        >
          {category._depth > 0 && (
            <ChevronDown className="h-3 w-3 text-muted-foreground/40 rotate-90" />
          )}
          <div>
            <p className="font-medium text-sm">{category.name_ar}</p>
            <p className="text-xs text-muted-foreground">
              {category.name_en ?? ""}
            </p>
          </div>
        </div>
      </TableCell>

      {/* Product type */}
      <TableCell>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
            TYPE_COLORS[category.type as ProductType]
          }`}
        >
          {TYPE_ICONS[category.type as ProductType]}
          {TYPE_LABELS[category.type as ProductType]}
        </span>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Badge
          className={
            category.is_active
              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
          }
          variant="outline"
        >
          {category.is_active ? "نشط" : "معطل"}
        </Badge>
      </TableCell>

      {/* Product count */}
      <TableCell>
        <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full text-xs font-semibold bg-muted">
          {category.product_count ?? 0}
        </span>
      </TableCell>

      {/* Actions */}
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="تعديل"
            onClick={() => onEdit(category)}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title={category.is_active ? "تعطيل" : "تفعيل"}
            onClick={() => onToggleActive(category)}
          >
            {category.is_active ? (
              <ToggleRight className="h-4 w-4 text-green-600" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </TableCell>
    </motion.tr>
  );
}

// ============================================================
// Main Component
// ============================================================

type ViewMode = "tree" | "table";

export default function CategoriesScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(
    () => new Set(MOCK_CATEGORIES.map((c) => c.id))
  );

  // Filter categories by search
  const filteredCategories = useMemo(
    () => filterTree(MOCK_CATEGORIES, searchTerm),
    [searchTerm]
  );

  // Flatten for table view
  const flatCategories = useMemo(
    () => flattenCategories(filteredCategories),
    [filteredCategories]
  );

  // Total counts
  const totalCategories = useMemo(
    () => flattenCategories(MOCK_CATEGORIES).length,
    []
  );
  const activeCount = useMemo(
    () => flattenCategories(MOCK_CATEGORIES).filter((c) => c.is_active).length,
    []
  );

  // Toggle expand handler
  function handleToggleExpand(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // Expand / Collapse all
  function handleExpandAll() {
    const allIds = flattenCategories(MOCK_CATEGORIES).map((c) => c.id);
    setExpandedIds(new Set(allIds));
  }

  function handleCollapseAll() {
    setExpandedIds(new Set());
  }

  // Stub handlers for actions
  function handleEdit(cat: ProductCategory) {
    // Placeholder for edit logic
    console.log("تعديل التصنيف:", cat.id, cat.name_ar);
  }

  function handleToggleActive(cat: ProductCategory) {
    // Placeholder for toggle logic
    console.log("تبديل الحالة:", cat.id, cat.name_ar, "->", !cat.is_active);
  }

  return (
    <motion.div
      className="space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ---- Header ---- */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderTree className="h-6 w-6" />
            التصنيفات
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            ادارة التصنيفات الهرمية للمنتجات &mdash;{" "}
            <span className="font-medium">{totalCategories}</span> تصنيف
            {" / "}
            <span className="font-medium text-green-600">{activeCount}</span>{" "}
            نشط
          </p>
        </div>
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          اضافة تصنيف
        </Button>
      </motion.div>

      {/* ---- Toolbar: search + view toggle ---- */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center gap-3"
      >
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث في التصنيفات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-9"
          />
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === "tree" ? "secondary" : "ghost"}
            size="sm"
            className="gap-1.5 h-8"
            onClick={() => setViewMode("tree")}
          >
            <GitBranchPlus className="h-4 w-4" />
            شجرة
          </Button>
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            className="gap-1.5 h-8"
            onClick={() => setViewMode("table")}
          >
            <List className="h-4 w-4" />
            جدول
          </Button>
        </div>

        {/* Expand / collapse (tree mode only) */}
        {viewMode === "tree" && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={handleExpandAll}
            >
              توسيع الكل
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={handleCollapseAll}
            >
              طي الكل
            </Button>
          </div>
        )}
      </motion.div>

      {/* ---- Content ---- */}
      <AnimatePresence mode="wait">
        {viewMode === "tree" ? (
          /* ===================== TREE VIEW ===================== */
          <motion.div
            key="tree-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderTree className="h-4 w-4" />
                  شجرة التصنيفات
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                {filteredCategories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Search className="h-10 w-10 mb-3 opacity-30" />
                    <p className="text-sm">لا توجد نتائج مطابقة للبحث</p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {filteredCategories.map((cat) => (
                      <CategoryTreeNode
                        key={cat.id}
                        category={cat}
                        expandedIds={expandedIds}
                        onToggleExpand={handleToggleExpand}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* ===================== TABLE VIEW ===================== */
          <motion.div
            key="table-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <List className="h-4 w-4" />
                  جدول التصنيفات
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {flatCategories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Search className="h-10 w-10 mb-3 opacity-30" />
                    <p className="text-sm">لا توجد نتائج مطابقة للبحث</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[35%]">الاسم</TableHead>
                        <TableHead className="w-[18%]">النوع</TableHead>
                        <TableHead className="w-[14%]">الحالة</TableHead>
                        <TableHead className="w-[14%]">المنتجات</TableHead>
                        <TableHead className="w-[19%]">اجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {flatCategories.map((cat) => (
                          <CategoryTableRow
                            key={cat.id}
                            category={cat}
                            onEdit={handleEdit}
                            onToggleActive={handleToggleActive}
                          />
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Summary footer cards ---- */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 sm:grid-cols-5 gap-3"
      >
        {(
          [
            "PHYSICAL",
            "DIGITAL",
            "SERVICE",
            "RESERVATION",
            "FINANCIAL",
          ] as ProductType[]
        ).map((type) => {
          const count = flattenCategories(MOCK_CATEGORIES).filter(
            (c) => (c.type as ProductType) === type
          ).length;
          return (
            <motion.div key={type} variants={itemVariants}>
              <Card className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-lg border ${TYPE_COLORS[type]}`}
                  >
                    {TYPE_ICONS[type]}
                  </div>
                  <div>
                    <p className="text-lg font-bold leading-none">{count}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {TYPE_LABELS[type]}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

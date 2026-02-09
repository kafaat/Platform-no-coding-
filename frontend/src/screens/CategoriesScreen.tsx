import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderTree,
  Plus,
  Search,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronLeft,
  GripVertical,
  FolderOpen,
  Folder,
  Package,
  Check,
  X,
  AlertTriangle,
  ChevronsDown,
  ChevronsUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import type { ProductType } from "@/types";

// ============================================================
// Types
// ============================================================

interface MockCategory {
  id: number;
  tenant_id: number;
  parent_id: number | null;
  name_ar: string;
  name_en: string;
  type: string;
  is_active: boolean;
  product_count: number;
  children?: MockCategory[];
  order: number;
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
          <motion.div key={t.id} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
              t.type === "success" ? "bg-green-600 text-white" : t.type === "warning" ? "bg-amber-500 text-white" : "bg-red-600 text-white"
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
// Type Config
// ============================================================

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  PHYSICAL: { label: "مادي", color: "bg-blue-100 text-blue-800 border-blue-200" },
  DIGITAL: { label: "رقمي", color: "bg-purple-100 text-purple-800 border-purple-200" },
  SERVICE: { label: "خدمة", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  RESERVATION: { label: "حجز", color: "bg-amber-100 text-amber-800 border-amber-200" },
  FINANCIAL: { label: "مالي", color: "bg-rose-100 text-rose-800 border-rose-200" },
};

// ============================================================
// Mock Data (flat)
// ============================================================

const initialCategories: MockCategory[] = [
  { id: 1, tenant_id: 1, parent_id: null, name_ar: "الإلكترونيات", name_en: "Electronics", type: "PHYSICAL", is_active: true, product_count: 85, order: 1 },
  { id: 2, tenant_id: 1, parent_id: 1, name_ar: "الهواتف الذكية", name_en: "Smartphones", type: "PHYSICAL", is_active: true, product_count: 42, order: 1 },
  { id: 3, tenant_id: 1, parent_id: 1, name_ar: "الحواسيب المحمولة", name_en: "Laptops", type: "PHYSICAL", is_active: true, product_count: 28, order: 2 },
  { id: 4, tenant_id: 1, parent_id: 1, name_ar: "الأجهزة اللوحية", name_en: "Tablets", type: "PHYSICAL", is_active: true, product_count: 15, order: 3 },
  { id: 5, tenant_id: 1, parent_id: null, name_ar: "الخدمات الرقمية", name_en: "Digital Services", type: "DIGITAL", is_active: true, product_count: 32, order: 2 },
  { id: 6, tenant_id: 1, parent_id: 5, name_ar: "البرمجيات", name_en: "Software", type: "DIGITAL", is_active: true, product_count: 18, order: 1 },
  { id: 7, tenant_id: 1, parent_id: 5, name_ar: "الاشتراكات", name_en: "Subscriptions", type: "DIGITAL", is_active: true, product_count: 14, order: 2 },
  { id: 8, tenant_id: 1, parent_id: null, name_ar: "الخدمات المالية", name_en: "Financial Services", type: "FINANCIAL", is_active: true, product_count: 20, order: 3 },
  { id: 9, tenant_id: 1, parent_id: 8, name_ar: "القروض", name_en: "Loans", type: "FINANCIAL", is_active: true, product_count: 8, order: 1 },
  { id: 10, tenant_id: 1, parent_id: 8, name_ar: "التسهيلات الائتمانية", name_en: "Credit Facilities", type: "FINANCIAL", is_active: true, product_count: 12, order: 2 },
  { id: 11, tenant_id: 1, parent_id: null, name_ar: "الحجوزات", name_en: "Reservations", type: "RESERVATION", is_active: true, product_count: 15, order: 4 },
  { id: 12, tenant_id: 1, parent_id: 11, name_ar: "الفنادق", name_en: "Hotels", type: "RESERVATION", is_active: true, product_count: 10, order: 1 },
  { id: 13, tenant_id: 1, parent_id: 11, name_ar: "القاعات", name_en: "Halls", type: "RESERVATION", is_active: false, product_count: 5, order: 2 },
  { id: 14, tenant_id: 1, parent_id: null, name_ar: "الخدمات الاستشارية", name_en: "Consulting Services", type: "SERVICE", is_active: true, product_count: 0, order: 5 },
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

function simulateAsync<T>(result: T, delay = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(result), delay));
}

function buildTree(items: MockCategory[]): MockCategory[] {
  const map = new Map<number, MockCategory>();
  const roots: MockCategory[] = [];
  items.forEach((item) => map.set(item.id, { ...item, children: [] }));
  map.forEach((item) => {
    if (item.parent_id && map.has(item.parent_id)) {
      map.get(item.parent_id)!.children!.push(item);
    } else {
      roots.push(item);
    }
  });
  const sortChildren = (list: MockCategory[]) => {
    list.sort((a, b) => a.order - b.order);
    list.forEach((item) => item.children && sortChildren(item.children));
  };
  sortChildren(roots);
  return roots;
}

function matchesSearch(cat: MockCategory, search: string, allCategories: MockCategory[]): boolean {
  if (!search) return true;
  const term = search.toLowerCase();
  if (cat.name_ar.includes(search) || cat.name_en.toLowerCase().includes(term) || cat.type.toLowerCase().includes(term)) return true;
  const children = allCategories.filter((c) => c.parent_id === cat.id);
  return children.some((child) => matchesSearch(child, search, allCategories));
}

function getDescendantIds(catId: number, allCategories: MockCategory[]): number[] {
  const children = allCategories.filter((c) => c.parent_id === catId);
  const ids: number[] = [];
  children.forEach((child) => { ids.push(child.id); ids.push(...getDescendantIds(child.id, allCategories)); });
  return ids;
}

function hasActiveProducts(catId: number, allCategories: MockCategory[]): boolean {
  const cat = allCategories.find((c) => c.id === catId);
  if (!cat) return false;
  if (cat.product_count > 0) return true;
  const descendants = getDescendantIds(catId, allCategories);
  return descendants.some((id) => { const c = allCategories.find((x) => x.id === id); return c && c.product_count > 0; });
}

// ============================================================
// Tree Node
// ============================================================

function CategoryTreeNode({ category, depth, expanded, onToggleExpand, onSelect, selectedId, onDragStart, onDragOver, onDrop, dragOverId }: {
  category: MockCategory; depth: number; expanded: Set<number>; onToggleExpand: (id: number) => void;
  onSelect: (cat: MockCategory) => void; selectedId: number | null;
  onDragStart: (id: number) => void; onDragOver: (id: number) => void; onDrop: (id: number) => void; dragOverId: number | null;
}) {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expanded.has(category.id);
  const isSelected = selectedId === category.id;
  const isDragOver = dragOverId === category.id;
  const typeConfig = TYPE_CONFIG[category.type] ?? { label: category.type, color: "bg-gray-100 text-gray-800" };

  return (
    <>
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}
        draggable onDragStart={() => onDragStart(category.id)} onDragOver={(e) => { e.preventDefault(); onDragOver(category.id); }} onDrop={() => onDrop(category.id)}
        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all border
          ${isSelected ? "bg-primary/5 border-primary/30 shadow-sm" : isDragOver ? "bg-blue-50 border-blue-300 border-dashed" : "border-transparent hover:bg-muted/50"}
          ${!category.is_active ? "opacity-50" : ""}
        `}
        style={{ marginRight: `${depth * 24}px` }}
        onClick={() => onSelect(category)}
      >
        <div className="text-muted-foreground cursor-grab active:cursor-grabbing"><GripVertical className="h-4 w-4" /></div>
        {hasChildren ? (
          <button className="p-0.5 rounded hover:bg-muted" onClick={(e) => { e.stopPropagation(); onToggleExpand(category.id); }}>
            {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronLeft className="h-4 w-4 text-muted-foreground" />}
          </button>
        ) : <span className="w-5" />}
        <div className={`p-1.5 rounded ${isExpanded ? "text-primary" : "text-muted-foreground"}`}>
          {isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{category.name_ar}</span>
            <span className="text-xs text-muted-foreground truncate">{category.name_en}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="outline" className={`text-[10px] ${typeConfig.color}`}>{typeConfig.label}</Badge>
          <Badge variant="secondary" className="text-[10px] gap-1"><Package className="h-3 w-3" />{category.product_count}</Badge>
          {!category.is_active && <Badge variant="outline" className="text-[10px] bg-gray-100 text-gray-600">معطّلة</Badge>}
        </div>
      </motion.div>
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            {category.children!.map((child) => (
              <CategoryTreeNode key={child.id} category={child} depth={depth + 1} expanded={expanded}
                onToggleExpand={onToggleExpand} onSelect={onSelect} selectedId={selectedId}
                onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} dragOverId={dragOverId} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function CategoriesScreen() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<MockCategory[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set([1, 5, 8, 11]));
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [saving, setSaving] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCat, setNewCat] = useState({ parent_id: "" as string, name_ar: "", name_en: "", type: "PHYSICAL" as string });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editCat, setEditCat] = useState({ id: 0, name_ar: "", name_en: "", type: "" });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; name: string }>({ open: false, id: 0, name: "" });
  const [br09Warning, setBr09Warning] = useState<{ open: boolean; id: number; name: string }>({ open: false, id: 0, name: "" });

  const addToast = useCallback((message: string, type: "success" | "error" | "warning") => {
    const id = Date.now(); setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  const dismissToast = useCallback((id: number) => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, []);

  useEffect(() => { const timer = setTimeout(() => { setCategories(initialCategories); setLoading(false); }, 800); return () => clearTimeout(timer); }, []);

  const filteredCategories = useMemo(() => {
    if (!search) return categories;
    return categories.filter((cat) => matchesSearch(cat, search, categories));
  }, [categories, search]);

  const tree = useMemo(() => buildTree(filteredCategories), [filteredCategories]);
  const selectedCategory = categories.find((c) => c.id === selectedId) ?? null;

  useEffect(() => {
    if (search) {
      const parentIds = new Set<number>();
      filteredCategories.forEach((cat) => { if (cat.parent_id) parentIds.add(cat.parent_id); });
      setExpanded((prev) => new Set([...prev, ...parentIds]));
    }
  }, [search, filteredCategories]);

  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.is_active).length;
  const rootCategories = categories.filter((c) => !c.parent_id).length;

  function handleToggleExpand(id: number) { setExpanded((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }); }
  function handleExpandAll() { setExpanded(new Set(categories.map((c) => c.id))); }
  function handleCollapseAll() { setExpanded(new Set()); }
  function handleSelectCategory(cat: MockCategory) { setSelectedId(selectedId === cat.id ? null : cat.id); }
  function handleDragStart(id: number) { setDraggingId(id); }
  function handleDragOver(id: number) { if (draggingId !== id) setDragOverId(id); }
  function handleDrop(targetId: number) {
    if (draggingId && draggingId !== targetId) {
      setCategories((prev) => { const d = prev.find((c) => c.id === draggingId); const t = prev.find((c) => c.id === targetId); if (!d || !t) return prev; const o = d.order; return prev.map((c) => { if (c.id === draggingId) return { ...c, order: t.order }; if (c.id === targetId) return { ...c, order: o }; return c; }); });
      addToast("تم إعادة ترتيب الفئة", "success");
    }
    setDraggingId(null); setDragOverId(null);
  }

  async function handleToggleActive(catId: number) {
    const cat = categories.find((c) => c.id === catId); if (!cat) return;
    if (cat.is_active && hasActiveProducts(catId, categories)) { setBr09Warning({ open: true, id: catId, name: cat.name_ar }); return; }
    setSaving(true);
    try { await simulateAsync(null, 400); setCategories((prev) => prev.map((c) => c.id === catId ? { ...c, is_active: !c.is_active } : c)); addToast(cat.is_active ? "تم تعطيل الفئة" : "تم تفعيل الفئة", "success"); } catch { addToast("فشل في تغيير الحالة", "error"); } finally { setSaving(false); }
  }

  async function handleCreateCategory() {
    if (!newCat.name_ar) { addToast("يرجى ملء الاسم بالعربية", "error"); return; }
    setSaving(true);
    try {
      const parentId = newCat.parent_id && newCat.parent_id !== "__ROOT__" ? Number(newCat.parent_id) : null;
      const created = await simulateAsync<MockCategory>({ id: Math.max(0, ...categories.map((c) => c.id)) + 1, tenant_id: 1, parent_id: parentId, name_ar: newCat.name_ar, name_en: newCat.name_en, type: newCat.type, is_active: true, product_count: 0, order: categories.filter((c) => c.parent_id === parentId).length + 1 });
      setCategories((prev) => [...prev, created]); if (parentId) setExpanded((prev) => new Set([...prev, parentId]));
      setCreateDialogOpen(false); setNewCat({ parent_id: "", name_ar: "", name_en: "", type: "PHYSICAL" }); addToast("تم إنشاء الفئة بنجاح", "success");
    } catch { addToast("فشل في إنشاء الفئة", "error"); } finally { setSaving(false); }
  }

  function openEditDialog(cat: MockCategory) { setEditCat({ id: cat.id, name_ar: cat.name_ar, name_en: cat.name_en, type: cat.type }); setEditDialogOpen(true); }

  async function handleSaveEdit() {
    setSaving(true);
    try { await simulateAsync(null, 400); setCategories((prev) => prev.map((c) => c.id === editCat.id ? { ...c, name_ar: editCat.name_ar, name_en: editCat.name_en, type: editCat.type } : c)); setEditDialogOpen(false); addToast("تم تحديث الفئة بنجاح", "success"); } catch { addToast("فشل في تحديث الفئة", "error"); } finally { setSaving(false); }
  }

  async function handleDeleteConfirm() {
    if (hasActiveProducts(deleteDialog.id, categories)) { setDeleteDialog((p) => ({ ...p, open: false })); setBr09Warning({ open: true, id: deleteDialog.id, name: deleteDialog.name }); return; }
    setSaving(true);
    try { await simulateAsync(null, 400); const ids = [deleteDialog.id, ...getDescendantIds(deleteDialog.id, categories)]; setCategories((prev) => prev.filter((c) => !ids.includes(c.id))); if (selectedId && ids.includes(selectedId)) setSelectedId(null); setDeleteDialog({ open: false, id: 0, name: "" }); addToast("تم حذف الفئة بنجاح", "success"); } catch { addToast("فشل في الحذف", "error"); } finally { setSaving(false); }
  }

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FolderTree className="h-6 w-6" />الفئات</h1>
          <p className="text-muted-foreground mt-1">إدارة شجرة فئات المنتجات والسياسات الافتراضية</p>
        </div>
        <Button size="sm" onClick={() => setCreateDialogOpen(true)}><Plus className="h-4 w-4 ml-1" />إضافة فئة</Button>
      </div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? [1, 2, 3].map((i) => <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>) : (
          <>
            <Card className="hover:shadow-md transition-shadow"><CardContent className="p-5"><div className="flex items-start justify-between"><div className="space-y-1"><p className="text-sm text-muted-foreground font-medium">إجمالي الفئات</p><p className="text-2xl font-bold">{totalCategories}</p></div><div className="p-3 rounded-lg bg-blue-50 text-blue-600"><FolderTree className="h-5 w-5" /></div></div></CardContent></Card>
            <Card className="hover:shadow-md transition-shadow"><CardContent className="p-5"><div className="flex items-start justify-between"><div className="space-y-1"><p className="text-sm text-muted-foreground font-medium">الفئات النشطة</p><p className="text-2xl font-bold">{activeCategories}</p></div><div className="p-3 rounded-lg bg-emerald-50 text-emerald-600"><FolderOpen className="h-5 w-5" /></div></div></CardContent></Card>
            <Card className="hover:shadow-md transition-shadow"><CardContent className="p-5"><div className="flex items-start justify-between"><div className="space-y-1"><p className="text-sm text-muted-foreground font-medium">الفئات الجذرية</p><p className="text-2xl font-bold">{rootCategories}</p></div><div className="p-3 rounded-lg bg-purple-50 text-purple-600"><Folder className="h-5 w-5" /></div></div></CardContent></Card>
          </>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card><CardContent className="p-4"><div className="flex gap-3 items-center">
          <div className="relative flex-1"><Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="بحث في الفئات..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9" /></div>
          <Button variant="outline" size="sm" onClick={handleExpandAll}><ChevronsDown className="h-4 w-4 ml-1" />توسيع</Button>
          <Button variant="outline" size="sm" onClick={handleCollapseAll}><ChevronsUp className="h-4 w-4 ml-1" />طي</Button>
        </div></CardContent></Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className={selectedCategory ? "lg:col-span-2" : "lg:col-span-3"}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><FolderTree className="h-4 w-4" />شجرة الفئات ({filteredCategories.length})</CardTitle></CardHeader>
            <CardContent className="p-2">
              {loading ? <div className="space-y-2 p-4">{[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div> : tree.length > 0 ? (
                <div className="space-y-1">{tree.map((root) => <CategoryTreeNode key={root.id} category={root} depth={0} expanded={expanded} onToggleExpand={handleToggleExpand} onSelect={handleSelectCategory} selectedId={selectedId} onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop} dragOverId={dragOverId} />)}</div>
              ) : <div className="flex flex-col items-center justify-center py-12 text-muted-foreground"><FolderTree className="h-10 w-10 mb-3 opacity-30" /><p className="text-sm">لا توجد فئات مطابقة</p></div>}
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence>
          {selectedCategory && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center justify-between"><span className="flex items-center gap-2"><Edit3 className="h-4 w-4" />تفاصيل الفئة</span><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedId(null)}><X className="h-4 w-4" /></Button></CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/50 rounded-lg"><p className="text-xs text-muted-foreground mb-1">المعرف</p><code className="text-sm font-mono font-semibold">#{selectedCategory.id}</code></div>
                    <div className="p-3 bg-muted/50 rounded-lg"><p className="text-xs text-muted-foreground mb-1">النوع</p><Badge variant="outline" className={TYPE_CONFIG[selectedCategory.type]?.color ?? ""}>{TYPE_CONFIG[selectedCategory.type]?.label ?? selectedCategory.type}</Badge></div>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-muted/30 rounded-lg border"><p className="text-xs text-muted-foreground mb-1">الاسم بالعربية</p><p className="text-sm font-medium">{selectedCategory.name_ar}</p></div>
                    <div className="p-3 bg-muted/30 rounded-lg border"><p className="text-xs text-muted-foreground mb-1">الاسم بالإنجليزية</p><p className="text-sm font-medium">{selectedCategory.name_en}</p></div>
                    <div className="p-3 bg-muted/30 rounded-lg border"><p className="text-xs text-muted-foreground mb-1">الفئة الأب</p><p className="text-sm font-medium">{selectedCategory.parent_id ? categories.find((c) => c.id === selectedCategory.parent_id)?.name_ar ?? "--" : "جذرية"}</p></div>
                    <div className="p-3 bg-muted/30 rounded-lg border"><p className="text-xs text-muted-foreground mb-1">عدد المنتجات</p><p className="text-sm font-bold">{selectedCategory.product_count}</p></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"><span className="text-sm">الحالة (نشطة)</span><Switch checked={selectedCategory.is_active} disabled={saving} onCheckedChange={() => handleToggleActive(selectedCategory.id)} /></div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(selectedCategory)}><Edit3 className="h-4 w-4 ml-1" />تعديل</Button>
                    <Button variant="outline" size="sm" className="flex-1 text-destructive border-destructive/30" onClick={() => setDeleteDialog({ open: true, id: selectedCategory.id, name: selectedCategory.name_ar })}><Trash2 className="h-4 w-4 ml-1" />حذف</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Category Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />إضافة فئة جديدة</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><label className="text-sm font-medium">الفئة الأب</label>
              <Select value={newCat.parent_id} onValueChange={(v) => setNewCat((p) => ({ ...p, parent_id: v }))}><SelectTrigger><SelectValue placeholder="جذرية (بدون أب)" /></SelectTrigger><SelectContent><SelectItem value="__ROOT__">جذرية (بدون أب)</SelectItem>{categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.parent_id ? `  -- ${c.name_ar}` : c.name_ar}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-1.5"><label className="text-sm font-medium">الاسم بالعربية *</label><Input placeholder="مثال: الأجهزة المنزلية" value={newCat.name_ar} onChange={(e) => setNewCat((p) => ({ ...p, name_ar: e.target.value }))} /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">الاسم بالإنجليزية</label><Input placeholder="مثال: Home Appliances" value={newCat.name_en} onChange={(e) => setNewCat((p) => ({ ...p, name_en: e.target.value }))} /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">النوع</label>
              <Select value={newCat.type} onValueChange={(v) => setNewCat((p) => ({ ...p, type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PHYSICAL">مادي (PHYSICAL)</SelectItem><SelectItem value="DIGITAL">رقمي (DIGITAL)</SelectItem><SelectItem value="SERVICE">خدمة (SERVICE)</SelectItem><SelectItem value="RESERVATION">حجز (RESERVATION)</SelectItem><SelectItem value="FINANCIAL">مالي (FINANCIAL)</SelectItem></SelectContent></Select>
            </div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose><Button onClick={handleCreateCategory} disabled={saving}>{saving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : "إنشاء"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Edit3 className="h-5 w-5" />تعديل الفئة</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><label className="text-sm font-medium">الاسم بالعربية *</label><Input value={editCat.name_ar} onChange={(e) => setEditCat((p) => ({ ...p, name_ar: e.target.value }))} /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">الاسم بالإنجليزية</label><Input value={editCat.name_en} onChange={(e) => setEditCat((p) => ({ ...p, name_en: e.target.value }))} /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">النوع</label>
              <Select value={editCat.type} onValueChange={(v) => setEditCat((p) => ({ ...p, type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PHYSICAL">مادي (PHYSICAL)</SelectItem><SelectItem value="DIGITAL">رقمي (DIGITAL)</SelectItem><SelectItem value="SERVICE">خدمة (SERVICE)</SelectItem><SelectItem value="RESERVATION">حجز (RESERVATION)</SelectItem><SelectItem value="FINANCIAL">مالي (FINANCIAL)</SelectItem></SelectContent></Select>
            </div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose><Button onClick={handleSaveEdit} disabled={saving}>{saving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : "حفظ"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog((p) => ({ ...p, open }))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" />تأكيد الحذف</DialogTitle></DialogHeader>
          <p className="text-sm py-2">هل أنت متأكد من حذف فئة <span className="font-bold">{deleteDialog.name}</span>؟ سيتم حذف جميع الفئات الفرعية أيضاً.</p>
          <DialogFooter><DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose><Button variant="destructive" onClick={handleDeleteConfirm} disabled={saving}>{saving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : "حذف"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BR-09 Warning */}
      <Dialog open={br09Warning.open} onOpenChange={(open) => setBr09Warning((p) => ({ ...p, open }))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-amber-600"><AlertTriangle className="h-5 w-5" />تحذير: BR-09</DialogTitle></DialogHeader>
          <div className="py-2 space-y-2">
            <p className="text-sm">لا يمكن تعطيل/حذف فئة <span className="font-bold">{br09Warning.name}</span> لأنها تحتوي على منتجات نشطة.</p>
            <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded border border-amber-200"><AlertTriangle className="h-4 w-4 inline ml-1" />وفقاً لقاعدة الأعمال BR-09: لا يمكن حذف فئة تحتوي على منتجات نشطة (التعطيل فقط بعد نقل المنتجات).</p>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">فهمت</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Plus,
  Search,
  Eye,
  Edit3,
  Trash2,
  MoreHorizontal,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Copy,
  ArrowUpDown,
  Tag,
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

const mockPriceLists: MockPriceList[] = [
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

const mockPriceRules: MockPriceRule[] = [
  {
    id: 1,
    price_list_id: 1,
    condition_cel: 'customer.score > 700 && qty >= 10',
    formula_cel: 'base_price * 0.9',
    priority: 1,
  },
  {
    id: 2,
    price_list_id: 1,
    condition_cel: 'customer.kyc_level == "FULL" && channel == "WEB"',
    formula_cel: 'base_price * 0.95',
    priority: 2,
  },
  {
    id: 3,
    price_list_id: 1,
    condition_cel: 'qty >= 100',
    formula_cel: 'base_price * 0.85',
    priority: 3,
  },
  {
    id: 4,
    price_list_id: 2,
    condition_cel: 'customer.score > 800',
    formula_cel: 'base_price * 0.88',
    priority: 1,
  },
  {
    id: 5,
    price_list_id: 3,
    condition_cel: 'channel == "POS" && qty >= 5',
    formula_cel: 'base_price * 0.92',
    priority: 1,
  },
  {
    id: 6,
    price_list_id: 3,
    condition_cel: 'product.type == "PHYSICAL"',
    formula_cel: 'base_price + (base_price * 0.05)',
    priority: 2,
  },
];

// ============================================================
// Animation Variants
// ============================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

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
// Component
// ============================================================

export default function PricingScreen() {
  const [search, setSearch] = useState("");
  const [selectedListId, setSelectedListId] = useState<number | null>(1);

  const filteredLists = mockPriceLists.filter(
    (pl) =>
      !search ||
      pl.name.includes(search) ||
      pl.currency.toLowerCase().includes(search.toLowerCase())
  );

  const selectedRules = selectedListId
    ? mockPriceRules.filter((r) => r.price_list_id === selectedListId)
    : [];

  const selectedList = mockPriceLists.find((pl) => pl.id === selectedListId);

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
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
        <Button size="sm">
          <Plus className="h-4 w-4 ml-1" />
          إنشاء قائمة أسعار
        </Button>
      </div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">قوائم الأسعار</p>
                <p className="text-2xl font-bold">{mockPriceLists.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <Tag className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">قواعد التسعير</p>
                <p className="text-2xl font-bold">{mockPriceRules.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                <Calculator className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">إجمالي المنتجات المسعّرة</p>
                <p className="text-2xl font-bold">
                  {mockPriceLists.reduce((sum, pl) => sum + pl.product_count, 0)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث في قوائم الأسعار..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9"
              />
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
                    <TableCell>
                      <CurrencyBadge currency={priceList.currency} />
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {priceList.valid_from}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {priceList.valid_to ?? (
                        <span className="text-muted-foreground text-xs">مفتوحة</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{priceList.product_count} منتج</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
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

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                عرض {filteredLists.length} من {mockPriceLists.length} قائمة
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
                  <Badge variant="outline" className="mr-2 font-normal">
                    {selectedList.name}
                  </Badge>
                )}
              </span>
              {selectedListId && (
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 ml-1" />
                  إضافة قاعدة
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {selectedListId ? (
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
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
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
    </motion.div>
  );
}

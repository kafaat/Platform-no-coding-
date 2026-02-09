import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ScanBarcode,
  Search,
  Filter,
  Plus,
  Download,
  Package,
  Warehouse,
  MapPin,
  ExternalLink,
  FileText,
  Tag,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IdentifierType } from "@/types";

// --- Extended Identifier for display ---

interface IdentifierRecord {
  id: number;
  productId: number;
  productName_ar: string;
  productName_en: string;
  idType: IdentifierType;
  identifier: string;
  schemeName: string;
  status: "ACTIVE" | "RESERVED" | "EXPIRED";
  serialOrLot: string | null;
  lotBatch: string | null;
  assignedAt: string;
}

// --- Mock Data: 6 identifiers across types ---

const mockIdentifiers: IdentifierRecord[] = [
  {
    id: 1,
    productId: 1,
    productName_ar: "هاتف ذكي سامسونج A54",
    productName_en: "Samsung A54",
    idType: "PRODUCT",
    identifier: "PRD-ELC-2024-000142",
    schemeName: "مخطط ترقيم المنتجات",
    status: "ACTIVE",
    serialOrLot: null,
    lotBatch: null,
    assignedAt: "2024-01-15",
  },
  {
    id: 2,
    productId: 1,
    productName_ar: "هاتف ذكي سامسونج A54",
    productName_en: "Samsung A54",
    idType: "INVENTORY",
    identifier: "INV-WH01-2024-003891",
    schemeName: "مخطط ترقيم المخزون",
    status: "ACTIVE",
    serialOrLot: "SN-SA54-BLK-20240115-0042",
    lotBatch: "LOT-2024Q1-ELC-087",
    assignedAt: "2024-01-16",
  },
  {
    id: 3,
    productId: 2,
    productName_ar: "رخصة مايكروسوفت أوفيس",
    productName_en: "MS Office License",
    idType: "PRODUCT",
    identifier: "PRD-DIG-2024-000078",
    schemeName: "مخطط ترقيم المنتجات",
    status: "ACTIVE",
    serialOrLot: "LIC-MSOFF-2024-ENT-5521",
    lotBatch: null,
    assignedAt: "2024-02-10",
  },
  {
    id: 4,
    productId: 4,
    productName_ar: "غرفة فندقية ديلوكس",
    productName_en: "Deluxe Hotel Room",
    idType: "LOCATION",
    identifier: "LOC-HTL-SNAA-FL03-R312",
    schemeName: "مخطط ترقيم المواقع",
    status: "ACTIVE",
    serialOrLot: null,
    lotBatch: null,
    assignedAt: "2024-01-20",
  },
  {
    id: 5,
    productId: 5,
    productName_ar: "قرض شخصي ميسر",
    productName_en: "Personal Loan",
    idType: "CONTRACT",
    identifier: "FIN-LOAN-2024-000456",
    schemeName: "مخطط ترقيم العقود",
    status: "RESERVED",
    serialOrLot: null,
    lotBatch: null,
    assignedAt: "2024-04-01",
  },
  {
    id: 6,
    productId: 1,
    productName_ar: "هاتف ذكي سامسونج A54",
    productName_en: "Samsung A54",
    idType: "EXTERNAL",
    identifier: "EAN-8806094959888",
    schemeName: "باركود خارجي EAN-13",
    status: "ACTIVE",
    serialOrLot: "SN-SA54-BLK-20240115-0042",
    lotBatch: "LOT-2024Q1-ELC-087",
    assignedAt: "2024-01-15",
  },
];

// --- Animation Variants ---

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

// --- Identifier Type Config ---

const idTypeConfig: Record<
  IdentifierType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  PRODUCT: {
    label: "منتج",
    icon: <Package className="h-3.5 w-3.5" />,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  INVENTORY: {
    label: "مخزون",
    icon: <Warehouse className="h-3.5 w-3.5" />,
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  LOCATION: {
    label: "موقع",
    icon: <MapPin className="h-3.5 w-3.5" />,
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  EXTERNAL: {
    label: "خارجي",
    icon: <ExternalLink className="h-3.5 w-3.5" />,
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  CONTRACT: {
    label: "عقد",
    icon: <FileText className="h-3.5 w-3.5" />,
    color: "bg-rose-100 text-rose-800 border-rose-200",
  },
};

const statusConfig: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  ACTIVE: {
    label: "نشط",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    color: "bg-green-100 text-green-800 border-green-200",
  },
  RESERVED: {
    label: "محجوز",
    icon: <Clock className="h-3.5 w-3.5" />,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  EXPIRED: {
    label: "منتهي",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

// --- Summary Stats ---

function SummaryStats() {
  const typeCounts = mockIdentifiers.reduce<Record<string, number>>((acc, item) => {
    acc[item.idType] = (acc[item.idType] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {(Object.keys(idTypeConfig) as IdentifierType[]).map((type) => {
        const config = idTypeConfig[type];
        const count = typeCounts[type] || 0;
        return (
          <motion.div key={type} variants={itemVariants}>
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${config.color}`}>{config.icon}</div>
                  <div>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                    <p className="text-lg font-bold">{count.toLocaleString('ar-EG')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

// --- Serial/LOT Assignment Card ---

function SerialLotCard({ record }: { record: IdentifierRecord }) {
  if (!record.serialOrLot && !record.lotBatch) return null;

  return (
    <motion.div
      variants={itemVariants}
      className="bg-muted/30 rounded-lg p-3 border border-dashed space-y-2"
    >
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{record.productName_ar}</span>
        <span className="text-xs text-muted-foreground font-mono">
          {record.identifier}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {record.serialOrLot && (
          <div className="flex items-center gap-2 bg-background rounded p-2 border text-xs">
            <ScanBarcode className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-muted-foreground">الرقم التسلسلي</p>
              <p className="font-mono font-medium truncate">{record.serialOrLot}</p>
            </div>
          </div>
        )}
        {record.lotBatch && (
          <div className="flex items-center gap-2 bg-background rounded p-2 border text-xs">
            <Warehouse className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-muted-foreground">رقم الدفعة / LOT</p>
              <p className="font-mono font-medium truncate">{record.lotBatch}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// --- Component ---

export default function TraceabilityScreen() {
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = useCallback((record: IdentifierRecord) => {
    navigator.clipboard.writeText(record.identifier).then(() => {
      setCopiedId(record.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const filtered = mockIdentifiers.filter((item) => {
    if (typeFilter !== "ALL" && item.idType !== typeFilter) return false;
    if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
    if (
      search &&
      !item.identifier.toLowerCase().includes(search.toLowerCase()) &&
      !item.productName_ar.includes(search) &&
      !item.productName_en.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const serialLotRecords = mockIdentifiers.filter(
    (r) => r.serialOrLot || r.lotBatch
  );

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ScanBarcode className="h-6 w-6" />
              التتبع والمعرفات
            </h1>
            <p className="text-muted-foreground mt-1">
              تتبع معرفات المنتجات والمخزون والأرقام التسلسلية ودفعات LOT
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled title="قريبا">
              <Download className="h-4 w-4 ml-1" />
              تصدير
            </Button>
            <Button size="sm" disabled title="قريبا">
              <Plus className="h-4 w-4 ml-1" />
              معرف جديد
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <SummaryStats />

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالمعرف أو اسم المنتج..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-44">
                  <Filter className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="نوع المعرف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">جميع الأنواع</SelectItem>
                  <SelectItem value="PRODUCT">منتج</SelectItem>
                  <SelectItem value="INVENTORY">مخزون</SelectItem>
                  <SelectItem value="LOCATION">موقع</SelectItem>
                  <SelectItem value="EXTERNAL">خارجي</SelectItem>
                  <SelectItem value="CONTRACT">عقد</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">جميع الحالات</SelectItem>
                  <SelectItem value="ACTIVE">نشط</SelectItem>
                  <SelectItem value="RESERVED">محجوز</SelectItem>
                  <SelectItem value="EXPIRED">منتهي</SelectItem>
                </SelectContent>
              </Select>
              {(search || typeFilter !== "ALL" || statusFilter !== "ALL") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => {
                    setSearch("");
                    setTypeFilter("ALL");
                    setStatusFilter("ALL");
                  }}
                >
                  مسح الفلاتر
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Identifiers Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                جدول المعرفات ({filtered.length.toLocaleString('ar-EG')})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>نوع المعرف</TableHead>
                  <TableHead>قيمة المعرف</TableHead>
                  <TableHead>المنتج</TableHead>
                  <TableHead>مخطط الترقيم</TableHead>
                  <TableHead>الرقم التسلسلي / LOT</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ التعيين</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((record, idx) => {
                  const typeConf = idTypeConfig[record.idType];
                  const statConf = statusConfig[record.status];
                  return (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <Badge
                          className={`gap-1 ${typeConf.color} hover:${typeConf.color}`}
                        >
                          {typeConf.icon}
                          {typeConf.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-medium">
                          {record.identifier}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{record.productName_ar}</p>
                          <p className="text-xs text-muted-foreground">
                            {record.productName_en}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {record.schemeName}
                      </TableCell>
                      <TableCell>
                        {record.serialOrLot ? (
                          <div className="space-y-1">
                            <p className="font-mono text-xs">{record.serialOrLot}</p>
                            {record.lotBatch && (
                              <p className="font-mono text-xs text-muted-foreground">
                                {record.lotBatch}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">--</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`gap-1 ${statConf.color} hover:${statConf.color}`}
                        >
                          {statConf.icon}
                          {statConf.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(record.assignedAt).toLocaleDateString('ar-EG')}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="نسخ المعرف"
                          onClick={() => handleCopy(record)}
                        >
                          {copiedId === record.id ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </motion.tr>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <ScanBarcode className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-muted-foreground text-sm">
                        لا توجد معرفات مطابقة للبحث
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                عرض {filtered.length.toLocaleString('ar-EG')} من {mockIdentifiers.length.toLocaleString('ar-EG')} معرف
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Serial/LOT Assignment View */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ScanBarcode className="h-4 w-4" />
              تعيينات الأرقام التسلسلية ودفعات LOT
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {serialLotRecords.length > 0 ? (
              serialLotRecords.map((record) => (
                <SerialLotCard key={record.id} record={record} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد تعيينات أرقام تسلسلية أو دفعات</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

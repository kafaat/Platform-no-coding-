import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Factory,
  ChevronLeft,
  Package,
  Layers,
  Plus,
  Settings2,
  Percent,
  Hash,
  ToggleRight,
  Info,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductComposition, CompositionPolicy } from "@/types";

// --- Extended BOM types for display ---

interface BOMChild {
  composition: ProductComposition;
  childName_ar: string;
  childName_en: string;
  childSku: string;
  childType: string;
  unitName: string;
}

interface BOMStructure {
  parentId: number;
  parentName_ar: string;
  parentName_en: string;
  parentSku: string;
  parentType: string;
  totalComponents: number;
  children: BOMChild[];
}

// --- Mock BOM Data: 2 structures ---

const mockBOMs: BOMStructure[] = [
  {
    parentId: 101,
    parentName_ar: "حزمة كمبيوتر مكتبي كاملة",
    parentName_en: "Complete Desktop PC Kit",
    parentSku: "KIT-PC-001",
    parentType: "PHYSICAL",
    totalComponents: 3,
    children: [
      {
        composition: {
          id: 1,
          parent_product_id: 101,
          child_product_id: 201,
          qty: 1,
          policy: "NO_EXPLODE",
          price_ratio: 0.55,
        },
        childName_ar: "شاشة عرض 27 بوصة",
        childName_en: "27\" Monitor",
        childSku: "PHY-MON-001",
        childType: "PHYSICAL",
        unitName: "قطعة",
      },
      {
        composition: {
          id: 2,
          parent_product_id: 101,
          child_product_id: 202,
          qty: 1,
          policy: "EXPLODE",
          price_ratio: 0.35,
        },
        childName_ar: "لوحة مفاتيح وماوس لاسلكي",
        childName_en: "Wireless Keyboard & Mouse",
        childSku: "PHY-KBM-001",
        childType: "PHYSICAL",
        unitName: "طقم",
      },
      {
        composition: {
          id: 3,
          parent_product_id: 101,
          child_product_id: 203,
          qty: 2,
          policy: "NO_EXPLODE",
          price_ratio: 0.10,
        },
        childName_ar: "كابل HDMI 2 متر",
        childName_en: "HDMI Cable 2m",
        childSku: "PHY-CBL-001",
        childType: "PHYSICAL",
        unitName: "قطعة",
      },
    ],
  },
  {
    parentId: 102,
    parentName_ar: "باقة خدمات تقنية سنوية",
    parentName_en: "Annual IT Service Bundle",
    parentSku: "BND-SRV-001",
    parentType: "SERVICE",
    totalComponents: 3,
    children: [
      {
        composition: {
          id: 4,
          parent_product_id: 102,
          child_product_id: 301,
          qty: 12,
          policy: "EXPLODE",
          price_ratio: 0.50,
        },
        childName_ar: "صيانة شهرية للخوادم",
        childName_en: "Monthly Server Maintenance",
        childSku: "SRV-MNT-002",
        childType: "SERVICE",
        unitName: "جلسة",
      },
      {
        composition: {
          id: 5,
          parent_product_id: 102,
          child_product_id: 302,
          qty: 4,
          policy: "NO_EXPLODE",
          price_ratio: 0.30,
        },
        childName_ar: "تدقيق أمني ربع سنوي",
        childName_en: "Quarterly Security Audit",
        childSku: "SRV-AUD-001",
        childType: "SERVICE",
        unitName: "تقرير",
      },
      {
        composition: {
          id: 6,
          parent_product_id: 102,
          child_product_id: 303,
          qty: 1,
          policy: "NO_EXPLODE",
          price_ratio: 0.20,
        },
        childName_ar: "رخصة مكافح فيروسات مؤسسي",
        childName_en: "Enterprise Antivirus License",
        childSku: "DIG-LIC-002",
        childType: "DIGITAL",
        unitName: "رخصة",
      },
    ],
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

// --- Policy Badge ---

function PolicyBadge({ policy }: { policy: CompositionPolicy }) {
  return policy === "EXPLODE" ? (
    <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
      تفصيل المكونات
    </Badge>
  ) : (
    <Badge className="bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-100">
      بدون تفصيل
    </Badge>
  );
}

// --- Type color map ---

const typeColorMap: Record<string, string> = {
  PHYSICAL: "bg-blue-50 text-blue-700",
  DIGITAL: "bg-purple-50 text-purple-700",
  SERVICE: "bg-emerald-50 text-emerald-700",
  RESERVATION: "bg-amber-50 text-amber-700",
  FINANCIAL: "bg-rose-50 text-rose-700",
};

const typeLabels: Record<string, string> = {
  PHYSICAL: "مادي",
  DIGITAL: "رقمي",
  SERVICE: "خدمة",
  RESERVATION: "حجز",
  FINANCIAL: "مالي",
};

// --- BOM Tree Node ---

function BOMTreeCard({
  bom,
  isSelected,
  onSelect,
}: {
  bom: BOMStructure;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected ? "ring-2 ring-primary shadow-md" : ""
        }`}
        onClick={onSelect}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <p className="font-semibold text-sm">{bom.parentName_ar}</p>
              </div>
              <p className="text-xs text-muted-foreground">{bom.parentName_en}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {bom.parentSku}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    typeColorMap[bom.parentType] || ""
                  }`}
                >
                  {typeLabels[bom.parentType]}
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{bom.totalComponents.toLocaleString('ar-EG')}</p>
              <p className="text-xs text-muted-foreground">مكونات</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// --- Component ---

export default function ManufacturingScreen() {
  const [selectedBOM, setSelectedBOM] = useState<BOMStructure>(mockBOMs[0]);
  const [policyFilter, setPolicyFilter] = useState<string>("ALL");

  const filteredChildren = selectedBOM.children.filter((child) => {
    if (policyFilter !== "ALL" && child.composition.policy !== policyFilter) return false;
    return true;
  });

  const totalRatio = selectedBOM.children.reduce(
    (sum, c) => sum + c.composition.price_ratio,
    0
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
              <Factory className="h-6 w-6" />
              التصنيع والتكوين
            </h1>
            <p className="text-muted-foreground mt-1">
              إدارة فواتير المكونات (BOM) وتكوين المنتجات المركبة
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled title="قريبا">
              <Settings2 className="h-4 w-4 ml-1" />
              إعدادات التكوين
            </Button>
            <Button size="sm" disabled title="قريبا">
              <Plus className="h-4 w-4 ml-1" />
              تكوين جديد
            </Button>
          </div>
        </div>
      </motion.div>

      {/* BOM Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockBOMs.map((bom) => (
          <BOMTreeCard
            key={bom.parentId}
            bom={bom}
            isSelected={selectedBOM.parentId === bom.parentId}
            onSelect={() => setSelectedBOM(bom)}
          />
        ))}
      </div>

      {/* Selected BOM Detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedBOM.parentId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  شجرة التكوين: {selectedBOM.parentName_ar}
                </CardTitle>
                <Select value={policyFilter} onValueChange={setPolicyFilter}>
                  <SelectTrigger className="w-48">
                    <ToggleRight className="h-4 w-4 ml-2" />
                    <SelectValue placeholder="سياسة التكوين" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">جميع السياسات</SelectItem>
                    <SelectItem value="EXPLODE">تفصيل المكونات فقط</SelectItem>
                    <SelectItem value="NO_EXPLODE">بدون تفصيل فقط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* BOM Tree Visual */}
              <div className="px-6 pb-4">
                <div className="bg-muted/30 rounded-lg p-4 border border-dashed">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-primary/10 text-primary rounded-lg p-2.5">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{selectedBOM.parentName_ar}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {selectedBOM.parentSku}
                      </p>
                    </div>
                    <Badge variant="outline" className="mr-auto">
                      المنتج الأب
                    </Badge>
                  </div>
                  <div className="border-r-2 border-primary/20 mr-5 pr-4 space-y-3">
                    {filteredChildren.map((child, idx) => (
                      <motion.div
                        key={child.composition.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="flex items-center gap-3 bg-background rounded-lg p-3 border"
                      >
                        <ChevronLeft className="h-3.5 w-3.5 text-primary/40 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {child.childName_ar}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {child.childName_en}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-center px-2">
                            <p className="text-xs text-muted-foreground">الكمية</p>
                            <p className="font-bold text-sm">
                              {child.composition.qty.toLocaleString('ar-EG')} {child.unitName}
                            </p>
                          </div>
                          <div className="text-center px-2">
                            <p className="text-xs text-muted-foreground">نسبة السعر</p>
                            <p className="font-bold text-sm text-primary">
                              {(child.composition.price_ratio * 100).toFixed(0)}%
                            </p>
                          </div>
                          <PolicyBadge policy={child.composition.policy} />
                        </div>
                      </motion.div>
                    ))}
                    {filteredChildren.length === 0 && (
                      <div className="text-center py-6 text-muted-foreground text-sm">
                        لا توجد مكونات مطابقة للفلتر المحدد
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Components Table */}
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>رمز المكون</TableHead>
                    <TableHead>اسم المكون</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <Hash className="h-3.5 w-3.5" />
                        الكمية
                      </div>
                    </TableHead>
                    <TableHead>الوحدة</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <Percent className="h-3.5 w-3.5" />
                        نسبة السعر
                      </div>
                    </TableHead>
                    <TableHead>سياسة التكوين</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChildren.map((child, idx) => (
                    <motion.tr
                      key={child.composition.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-mono text-xs">
                        {child.childSku}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{child.childName_ar}</p>
                          <p className="text-xs text-muted-foreground">
                            {child.childName_en}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            typeColorMap[child.childType] || ""
                          }`}
                        >
                          {typeLabels[child.childType]}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold">{child.composition.qty.toLocaleString('ar-EG')}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {child.unitName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2 max-w-[80px]">
                            <div
                              className="bg-primary rounded-full h-2 transition-all"
                              style={{
                                width: `${child.composition.price_ratio * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {(child.composition.price_ratio * 100).toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <PolicyBadge policy={child.composition.policy} />
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>

              {/* Summary Footer */}
              <div className="flex items-center justify-between p-4 border-t bg-muted/20">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">إجمالي المكونات:</span>
                    <span className="font-bold">{filteredChildren.length.toLocaleString('ar-EG')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">إجمالي نسبة السعر:</span>
                    <span
                      className={`font-bold ${
                        Math.abs(totalRatio - 1) < 0.001
                          ? "text-green-600"
                          : "text-amber-600"
                      }`}
                    >
                      {(totalRatio * 100).toFixed(0)}%
                    </span>
                    {Math.abs(totalRatio - 1) >= 0.001 && (
                      <Badge variant="outline" className="text-amber-600 border-amber-300">
                        غير متوازن
                      </Badge>
                    )}
                    {Math.abs(totalRatio - 1) < 0.001 && (
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        متوازن
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>EXPLODE: يظهر المكونات منفصلة في الفاتورة</span>
                  <span className="mx-1">|</span>
                  <span>NO_EXPLODE: يظهر كمنتج واحد</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

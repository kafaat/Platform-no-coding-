import { useState } from "react";
import { motion } from "framer-motion";
import {
  Hash,
  Plus,
  Search,
  Eye,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Activity,
  RefreshCcw,
  Copy,
  AlertCircle,
  CheckCircle2,
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
import type { GapPolicy } from "@/types";

// ============================================================
// Types
// ============================================================

interface MockNumberingScheme {
  id: number;
  tenant_id: number;
  code: string;
  pattern: string;
  context: Record<string, string>;
  gap_policy: GapPolicy;
}

interface MockNumberingSequence {
  id: number;
  scheme_id: number;
  scheme_code: string;
  branch_code: string;
  channel_code: string | null;
  current_value: number;
  reserved_until: string | null;
  status: "ACTIVE" | "EXHAUSTED";
}

// ============================================================
// Gap Policy Config
// ============================================================

const GAP_POLICY_CONFIG: Record<GapPolicy, { label: string; color: string; icon: React.ReactNode }> = {
  ALLOW: {
    label: "مسموح",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  DENY: {
    label: "ممنوع",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <AlertCircle className="h-3 w-3" />,
  },
  REUSE: {
    label: "إعادة استخدام",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: <RefreshCcw className="h-3 w-3" />,
  },
};

// ============================================================
// Mock Data (matches seed.sql)
// ============================================================

const mockSchemes: MockNumberingScheme[] = [
  {
    id: 1,
    tenant_id: 1,
    code: "PRODUCT_CODE",
    pattern: "PRD-{TYPE}-{SEQ:6}",
    context: { description: "Product identifier" },
    gap_policy: "ALLOW",
  },
  {
    id: 2,
    tenant_id: 1,
    code: "CONTRACT_NUM",
    pattern: "FIN-{TYPE}-{YEAR}-{BRANCH}-{SEQ:6}",
    context: { description: "Financial contract number" },
    gap_policy: "DENY",
  },
  {
    id: 3,
    tenant_id: 1,
    code: "INVOICE_NUM",
    pattern: "INV-{YEAR}-{SEQ:8}",
    context: { description: "Invoice number" },
    gap_policy: "DENY",
  },
  {
    id: 4,
    tenant_id: 1,
    code: "RESERVATION_NUM",
    pattern: "RSV-{YEAR}-{SEQ:6}",
    context: { description: "Reservation number" },
    gap_policy: "ALLOW",
  },
];

const mockSequences: MockNumberingSequence[] = [
  {
    id: 1,
    scheme_id: 1,
    scheme_code: "PRODUCT_CODE",
    branch_code: "HQ",
    channel_code: null,
    current_value: 142,
    reserved_until: null,
    status: "ACTIVE",
  },
  {
    id: 2,
    scheme_id: 1,
    scheme_code: "PRODUCT_CODE",
    branch_code: "ADEN",
    channel_code: "WEB",
    current_value: 38,
    reserved_until: null,
    status: "ACTIVE",
  },
  {
    id: 3,
    scheme_id: 2,
    scheme_code: "CONTRACT_NUM",
    branch_code: "HQ",
    channel_code: null,
    current_value: 567,
    reserved_until: "2024-12-31T23:59:59Z",
    status: "ACTIVE",
  },
  {
    id: 4,
    scheme_id: 2,
    scheme_code: "CONTRACT_NUM",
    branch_code: "SANAA",
    channel_code: "MOBILE",
    current_value: 89,
    reserved_until: null,
    status: "ACTIVE",
  },
  {
    id: 5,
    scheme_id: 3,
    scheme_code: "INVOICE_NUM",
    branch_code: "HQ",
    channel_code: null,
    current_value: 2340,
    reserved_until: null,
    status: "ACTIVE",
  },
  {
    id: 6,
    scheme_id: 4,
    scheme_code: "RESERVATION_NUM",
    branch_code: "HQ",
    channel_code: null,
    current_value: 95,
    reserved_until: null,
    status: "ACTIVE",
  },
  {
    id: 7,
    scheme_id: 4,
    scheme_code: "RESERVATION_NUM",
    branch_code: "ADEN",
    channel_code: "POS",
    current_value: 21,
    reserved_until: null,
    status: "ACTIVE",
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

function GapPolicyBadge({ policy }: { policy: GapPolicy }) {
  const config = GAP_POLICY_CONFIG[policy];
  return (
    <Badge variant="outline" className={`${config.color} gap-1`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}

function SequenceStatusBadge({ status }: { status: "ACTIVE" | "EXHAUSTED" }) {
  return (
    <Badge
      variant="outline"
      className={
        status === "ACTIVE"
          ? "bg-green-100 text-green-800 border-green-200"
          : "bg-red-100 text-red-800 border-red-200"
      }
    >
      {status === "ACTIVE" ? "نشط" : "مستنفد"}
    </Badge>
  );
}

// ============================================================
// Component
// ============================================================

export default function NumberingScreen() {
  const [search, setSearch] = useState("");
  const [selectedSchemeId, setSelectedSchemeId] = useState<number | null>(1);

  const filteredSchemes = mockSchemes.filter(
    (s) =>
      !search ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.pattern.includes(search)
  );

  const selectedSequences = selectedSchemeId
    ? mockSequences.filter((seq) => seq.scheme_id === selectedSchemeId)
    : [];

  const selectedScheme = mockSchemes.find((s) => s.id === selectedSchemeId);

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
            <Hash className="h-6 w-6" />
            الترقيم
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة مخططات الترقيم والتسلسلات لجميع أنواع المعرّفات
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 ml-1" />
          إنشاء مخطط
        </Button>
      </div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">المخططات</p>
                <p className="text-2xl font-bold">{mockSchemes.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <Hash className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">التسلسلات النشطة</p>
                <p className="text-2xl font-bold">
                  {mockSequences.filter((s) => s.status === "ACTIVE").length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">إجمالي الأرقام المولّدة</p>
                <p className="text-2xl font-bold">
                  {mockSequences.reduce((sum, s) => sum + s.current_value, 0).toLocaleString("ar-EG")}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                <GitBranch className="h-5 w-5" />
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
                placeholder="بحث بالرمز أو النمط..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Numbering Schemes Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Hash className="h-4 w-4" />
              مخططات الترقيم ({filteredSchemes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>الرمز</TableHead>
                  <TableHead>النمط</TableHead>
                  <TableHead>سياسة الفجوات</TableHead>
                  <TableHead>السياق</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchemes.map((scheme, idx) => (
                  <motion.tr
                    key={scheme.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`border-b transition-colors cursor-pointer ${
                      selectedSchemeId === scheme.id
                        ? "bg-primary/5 border-r-2 border-r-primary"
                        : "hover:bg-muted/30"
                    }`}
                    onClick={() => setSelectedSchemeId(scheme.id)}
                  >
                    <TableCell>
                      <code className="text-sm font-mono font-semibold bg-muted px-2 py-0.5 rounded">
                        {scheme.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded font-mono block">
                        {scheme.pattern}
                      </code>
                    </TableCell>
                    <TableCell>
                      <GapPolicyBadge policy={scheme.gap_policy} />
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {scheme.context.description}
                      </p>
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
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
                {filteredSchemes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      <Hash className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      لا توجد مخططات مطابقة للبحث
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                عرض {filteredSchemes.length} من {mockSchemes.length} مخطط
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

      {/* Sequences Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                التسلسلات
                {selectedScheme && (
                  <Badge variant="outline" className="mr-2 font-normal">
                    {selectedScheme.code}
                  </Badge>
                )}
              </span>
              {selectedSchemeId && (
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 ml-1" />
                  إضافة تسلسل
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {selectedSchemeId ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>رمز الفرع</TableHead>
                    <TableHead>رمز القناة</TableHead>
                    <TableHead>القيمة الحالية</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الحجز حتى</TableHead>
                    <TableHead className="text-center w-24">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedSequences.map((seq, idx) => (
                    <motion.tr
                      key={seq.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {seq.branch_code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {seq.channel_code ? (
                          <Badge variant="secondary" className="font-mono">
                            {seq.channel_code}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">--</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-lg font-bold font-mono">
                          {seq.current_value.toLocaleString("ar-EG")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <SequenceStatusBadge status={seq.status} />
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {seq.reserved_until ? (
                          <span className="text-amber-700">
                            {new Date(seq.reserved_until).toLocaleDateString("ar-EG")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
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
                  {selectedSequences.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        لا توجد تسلسلات لهذا المخطط
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <GitBranch className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">اختر مخطط ترقيم لعرض التسلسلات</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

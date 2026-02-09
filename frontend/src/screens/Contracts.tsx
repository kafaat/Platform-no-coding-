import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  DollarSign,
  Calendar,
  AlertTriangle,
  CreditCard,
  BookOpen,
  Scale,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { ContractStatus, InstallmentStatus } from "@/types";
import { CONTRACT_STATUS_LABELS, INSTALLMENT_STATUS_LABELS } from "@/types";

// --- Status Badge ---

function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const config = CONTRACT_STATUS_LABELS[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.ar}
    </span>
  );
}

function InstallmentStatusBadge({ status }: { status: InstallmentStatus }) {
  const config = INSTALLMENT_STATUS_LABELS[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.ar}
    </span>
  );
}

// --- Aging Badge ---

function AgingBadge({ days }: { days: number }) {
  let color = "bg-green-100 text-green-700";
  let label = "سليم";
  if (days >= 180) { color = "bg-red-100 text-red-700"; label = "180+ يوم — شطب"; }
  else if (days >= 90) { color = "bg-orange-100 text-orange-700"; label = "90 يوم — تعليق"; }
  else if (days >= 60) { color = "bg-yellow-100 text-yellow-700"; label = "60 يوم — تصعيد"; }
  else if (days >= 30) { color = "bg-amber-100 text-amber-700"; label = "30 يوم — تنبيه"; }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {days > 0 && <Clock className="h-3 w-3" />}
      {label}
    </span>
  );
}

// --- Mock Data ---

interface ContractRow {
  id: number;
  contract_number: string;
  customer_name: string;
  product_name: string;
  principal: number;
  status: ContractStatus;
  interest_type: string;
  next_due_date: string;
  aging_days: number;
}

const mockContracts: ContractRow[] = [
  { id: 1, contract_number: "CTR-2024-001", customer_name: "أحمد محمد علي", product_name: "قرض شخصي ميسر", principal: 5000000, status: "ACTIVE", interest_type: "REDUCING", next_due_date: "2024-09-15", aging_days: 0 },
  { id: 2, contract_number: "CTR-2024-002", customer_name: "خالد عبدالله سعيد", product_name: "تمويل عقاري", principal: 25000000, status: "ACTIVE", interest_type: "FLAT", next_due_date: "2024-09-01", aging_days: 0 },
  { id: 3, contract_number: "CTR-2024-003", customer_name: "فاطمة حسن أحمد", product_name: "قرض شخصي ميسر", principal: 3000000, status: "IN_ARREARS", interest_type: "REDUCING", next_due_date: "2024-07-15", aging_days: 45 },
  { id: 4, contract_number: "CTR-2024-004", customer_name: "عمر يوسف ناصر", product_name: "خط ائتمان", principal: 10000000, status: "DRAFT", interest_type: "FLAT", next_due_date: "-", aging_days: 0 },
  { id: 5, contract_number: "CTR-2023-015", customer_name: "سالم عبدالرحمن", product_name: "قرض شخصي ميسر", principal: 2000000, status: "WRITTEN_OFF", interest_type: "REDUCING", next_due_date: "-", aging_days: 200 },
  { id: 6, contract_number: "CTR-2024-005", customer_name: "نورا محمد", product_name: "تمويل عقاري", principal: 15000000, status: "CLOSED", interest_type: "FLAT", next_due_date: "-", aging_days: 0 },
  { id: 7, contract_number: "CTR-2024-006", customer_name: "ياسر حمود", product_name: "قرض شخصي ميسر", principal: 4000000, status: "IN_ARREARS", interest_type: "REDUCING", next_due_date: "2024-06-01", aging_days: 75 },
  { id: 8, contract_number: "CTR-2024-007", customer_name: "مريم عبدالكريم", product_name: "خط ائتمان", principal: 8000000, status: "RESTRUCTURED", interest_type: "FLAT", next_due_date: "2024-10-01", aging_days: 0 },
];

// --- Mock Installments ---

interface InstallmentRow {
  seq: number;
  due_on: string;
  principal_due: number;
  interest_due: number;
  fee_due: number;
  paid_principal: number;
  paid_interest: number;
  status: InstallmentStatus;
}

const mockInstallments: InstallmentRow[] = [
  { seq: 1, due_on: "2024-02-15", principal_due: 416667, interest_due: 50000, fee_due: 5000, paid_principal: 416667, paid_interest: 50000, status: "PAID" },
  { seq: 2, due_on: "2024-03-15", principal_due: 416667, interest_due: 47917, fee_due: 0, paid_principal: 416667, paid_interest: 47917, status: "PAID" },
  { seq: 3, due_on: "2024-04-15", principal_due: 416667, interest_due: 45833, fee_due: 0, paid_principal: 416667, paid_interest: 45833, status: "PAID" },
  { seq: 4, due_on: "2024-05-15", principal_due: 416667, interest_due: 43750, fee_due: 0, paid_principal: 200000, paid_interest: 20000, status: "PARTIAL" },
  { seq: 5, due_on: "2024-06-15", principal_due: 416667, interest_due: 41667, fee_due: 0, paid_principal: 0, paid_interest: 0, status: "LATE" },
  { seq: 6, due_on: "2024-07-15", principal_due: 416667, interest_due: 39583, fee_due: 0, paid_principal: 0, paid_interest: 0, status: "DUE" },
  { seq: 7, due_on: "2024-08-15", principal_due: 416667, interest_due: 37500, fee_due: 0, paid_principal: 0, paid_interest: 0, status: "DUE" },
  { seq: 8, due_on: "2024-09-15", principal_due: 416667, interest_due: 35417, fee_due: 0, paid_principal: 0, paid_interest: 0, status: "DUE" },
];

// --- Contract Detail Component ---

function ContractDetail({ contract }: { contract: ContractRow }) {
  const [detailTab, setDetailTab] = useState("overview");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Contract Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {contract.contract_number}
            <ContractStatusBadge status={contract.status} />
          </h3>
          <p className="text-sm text-muted-foreground">{contract.customer_name} — {contract.product_name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 ml-1" />
            كشف حساب
          </Button>
          <Button size="sm">
            <CreditCard className="h-4 w-4 ml-1" />
            تسجيل دفعة
          </Button>
        </div>
      </div>

      {/* Detail Tabs */}
      <Tabs value={detailTab} onValueChange={setDetailTab}>
        <TabsList>
          <TabsTrigger value="overview" className="text-xs gap-1">
            <Eye className="h-3.5 w-3.5" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="schedule" className="text-xs gap-1">
            <Calendar className="h-3.5 w-3.5" />
            جدول الأقساط
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-xs gap-1">
            <CreditCard className="h-3.5 w-3.5" />
            المدفوعات
          </TabsTrigger>
          <TabsTrigger value="statement" className="text-xs gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            كشف حساب
          </TabsTrigger>
          <TabsTrigger value="penalties" className="text-xs gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            الغرامات
          </TabsTrigger>
          <TabsTrigger value="subledger" className="text-xs gap-1">
            <Calculator className="h-3.5 w-3.5" />
            الدفتر الفرعي
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">المبلغ الأصلي</p>
              <p className="text-lg font-bold">{contract.principal.toLocaleString()} ر.ي</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">نوع الفائدة</p>
              <p className="text-lg font-bold">{contract.interest_type === "REDUCING" ? "تنازلية" : "ثابتة"}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">القسط التالي</p>
              <p className="text-lg font-bold">{contract.next_due_date}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">التقادم</p>
              <AgingBadge days={contract.aging_days} />
            </div>
          </div>

          {/* Early Settlement Preview */}
          <div className="mt-4 p-4 rounded-lg border bg-blue-50/50">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-medium text-blue-800">معاينة التسوية المبكرة</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs text-blue-600">الأصل المتبقي</p>
                <p className="font-semibold">2,916,669 ر.ي</p>
              </div>
              <div>
                <p className="text-xs text-blue-600">الفوائد المستحقة</p>
                <p className="font-semibold">65,417 ر.ي</p>
              </div>
              <div>
                <p className="text-xs text-blue-600">إجمالي التسوية</p>
                <p className="font-bold text-blue-800">2,982,086 ر.ي</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-right p-2 font-medium">#</th>
                  <th className="text-right p-2 font-medium">تاريخ الاستحقاق</th>
                  <th className="text-right p-2 font-medium">الأصل</th>
                  <th className="text-right p-2 font-medium">الفائدة</th>
                  <th className="text-right p-2 font-medium">الرسوم</th>
                  <th className="text-right p-2 font-medium">المدفوع</th>
                  <th className="text-right p-2 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {mockInstallments.map((inst) => (
                  <tr key={inst.seq} className="border-b hover:bg-muted/20">
                    <td className="p-2 font-mono">{inst.seq}</td>
                    <td className="p-2">{inst.due_on}</td>
                    <td className="p-2">{inst.principal_due.toLocaleString()}</td>
                    <td className="p-2">{inst.interest_due.toLocaleString()}</td>
                    <td className="p-2">{inst.fee_due.toLocaleString()}</td>
                    <td className="p-2">{(inst.paid_principal + inst.paid_interest).toLocaleString()}</td>
                    <td className="p-2">
                      <InstallmentStatusBadge status={inst.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="mt-4 space-y-4">
          {/* Payment Recording Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">تسجيل دفعة جديدة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">مبلغ الأصل</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">مبلغ الفائدة</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">مبلغ الرسوم</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">القناة</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRANCH">فرع</SelectItem>
                      <SelectItem value="MOBILE">تطبيق جوال</SelectItem>
                      <SelectItem value="BANK">تحويل بنكي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button size="sm">
                  <CreditCard className="h-4 w-4 ml-1" />
                  تسجيل الدفعة
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-right p-2 font-medium">التاريخ</th>
                <th className="text-right p-2 font-medium">الأصل</th>
                <th className="text-right p-2 font-medium">الفائدة</th>
                <th className="text-right p-2 font-medium">الرسوم</th>
                <th className="text-right p-2 font-medium">القناة</th>
                <th className="text-right p-2 font-medium">المرجع</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: "2024-02-14", principal: 416667, interest: 50000, fee: 5000, channel: "فرع", ref: "PAY-001" },
                { date: "2024-03-14", principal: 416667, interest: 47917, fee: 0, channel: "تحويل بنكي", ref: "PAY-002" },
                { date: "2024-04-15", principal: 416667, interest: 45833, fee: 0, channel: "تطبيق جوال", ref: "PAY-003" },
                { date: "2024-05-20", principal: 200000, interest: 20000, fee: 0, channel: "فرع", ref: "PAY-004" },
              ].map((pay) => (
                <tr key={pay.ref} className="border-b">
                  <td className="p-2">{pay.date}</td>
                  <td className="p-2">{pay.principal.toLocaleString()}</td>
                  <td className="p-2">{pay.interest.toLocaleString()}</td>
                  <td className="p-2">{pay.fee.toLocaleString()}</td>
                  <td className="p-2">{pay.channel}</td>
                  <td className="p-2 font-mono text-xs">{pay.ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>

        {/* Statement Tab */}
        <TabsContent value="statement" className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-right p-2 font-medium">التاريخ</th>
                  <th className="text-right p-2 font-medium">الوصف</th>
                  <th className="text-right p-2 font-medium">مدين</th>
                  <th className="text-right p-2 font-medium">دائن</th>
                  <th className="text-right p-2 font-medium">الرصيد</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: "2024-01-15", desc: "صرف القرض", debit: 5000000, credit: 0, balance: 5000000 },
                  { date: "2024-02-14", desc: "دفعة قسط #1", debit: 0, credit: 471667, balance: 4528333 },
                  { date: "2024-03-14", desc: "دفعة قسط #2", debit: 0, credit: 464584, balance: 4063749 },
                  { date: "2024-04-15", desc: "دفعة قسط #3", debit: 0, credit: 462500, balance: 3601249 },
                  { date: "2024-05-20", desc: "دفعة جزئية", debit: 0, credit: 220000, balance: 3381249 },
                ].map((entry, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{entry.date}</td>
                    <td className="p-2">{entry.desc}</td>
                    <td className="p-2 text-red-600">{entry.debit > 0 ? entry.debit.toLocaleString() : "-"}</td>
                    <td className="p-2 text-green-600">{entry.credit > 0 ? entry.credit.toLocaleString() : "-"}</td>
                    <td className="p-2 font-medium">{entry.balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Penalties Tab */}
        <TabsContent value="penalties" className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-right p-2 font-medium">التاريخ</th>
                  <th className="text-right p-2 font-medium">النوع</th>
                  <th className="text-right p-2 font-medium">المبلغ</th>
                  <th className="text-right p-2 font-medium">شريحة التقادم</th>
                  <th className="text-right p-2 font-medium">القسط</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: "2024-06-15", kind: "غرامة تأخير", amount: 25000, bucket: "30", seq: 5 },
                  { date: "2024-07-15", kind: "غرامة تأخير", amount: 50000, bucket: "60", seq: 5 },
                ].map((pen, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{pen.date}</td>
                    <td className="p-2">{pen.kind}</td>
                    <td className="p-2 text-red-600">{pen.amount.toLocaleString()}</td>
                    <td className="p-2"><AgingBadge days={Number(pen.bucket)} /></td>
                    <td className="p-2">#{pen.seq}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Sub-ledger Tab */}
        <TabsContent value="subledger" className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-right p-2 font-medium">التاريخ</th>
                  <th className="text-right p-2 font-medium">الحدث</th>
                  <th className="text-right p-2 font-medium">الحساب المدين</th>
                  <th className="text-right p-2 font-medium">الحساب الدائن</th>
                  <th className="text-right p-2 font-medium">المبلغ</th>
                  <th className="text-right p-2 font-medium">المرجع</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: "2024-01-15", event: "DISBURSEMENT", dr: "1101", cr: "1001", amount: 5000000, ref: "SL-001" },
                  { date: "2024-02-14", event: "PAYMENT", dr: "1001", cr: "1101", amount: 416667, ref: "SL-002" },
                  { date: "2024-02-14", event: "INTEREST_INCOME", dr: "1001", cr: "4001", amount: 50000, ref: "SL-003" },
                  { date: "2024-03-14", event: "PAYMENT", dr: "1001", cr: "1101", amount: 416667, ref: "SL-004" },
                  { date: "2024-06-15", event: "PENALTY", dr: "1102", cr: "4002", amount: 25000, ref: "SL-010" },
                ].map((entry) => (
                  <tr key={entry.ref} className="border-b">
                    <td className="p-2">{entry.date}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded bg-muted text-xs">{entry.event}</span>
                    </td>
                    <td className="p-2 font-mono text-xs">{entry.dr}</td>
                    <td className="p-2 font-mono text-xs">{entry.cr}</td>
                    <td className="p-2">{entry.amount.toLocaleString()}</td>
                    <td className="p-2 font-mono text-xs">{entry.ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

// --- Main Component ---

export default function Contracts() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedContract, setSelectedContract] = useState<ContractRow | null>(null);

  const filtered = mockContracts.filter((c) => {
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
    if (search && !c.contract_number.includes(search) && !c.customer_name.includes(search)) return false;
    return true;
  });

  if (selectedContract) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedContract(null)}>
          <ArrowRight className="h-4 w-4 ml-1" />
          العودة إلى القائمة
        </Button>
        <ContractDetail contract={selectedContract} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            العقود المالية
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة العقود المالية — القروض وخطوط الائتمان والتمويل
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 ml-1" />
            تصدير
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 ml-1" />
            عقد جديد
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">إجمالي العقود النشطة</p>
            <p className="text-2xl font-bold">342</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">إجمالي المبالغ المصروفة</p>
            <p className="text-2xl font-bold">٤٥٠M ر.ي</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">عقود متأخرة</p>
            <p className="text-2xl font-bold text-orange-600">28</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">نسبة التحصيل</p>
            <p className="text-2xl font-bold text-green-600">87%</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث برقم العقد أو اسم العميل..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 ml-2" />
                <SelectValue placeholder="حالة العقد" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">جميع الحالات</SelectItem>
                <SelectItem value="DRAFT">مسودة</SelectItem>
                <SelectItem value="ACTIVE">نشط</SelectItem>
                <SelectItem value="IN_ARREARS">متأخر</SelectItem>
                <SelectItem value="RESTRUCTURED">مُعاد هيكلته</SelectItem>
                <SelectItem value="WRITTEN_OFF">مشطوب</SelectItem>
                <SelectItem value="CLOSED">مغلق</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-right p-3 font-medium">رقم العقد</th>
                  <th className="text-right p-3 font-medium">العميل</th>
                  <th className="text-right p-3 font-medium">المنتج</th>
                  <th className="text-right p-3 font-medium">المبلغ الأصلي</th>
                  <th className="text-right p-3 font-medium">الحالة</th>
                  <th className="text-right p-3 font-medium">نوع الفائدة</th>
                  <th className="text-right p-3 font-medium">القسط التالي</th>
                  <th className="text-right p-3 font-medium">التقادم</th>
                  <th className="text-center p-3 font-medium">عرض</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((contract, idx) => (
                  <motion.tr
                    key={contract.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedContract(contract)}
                  >
                    <td className="p-3 font-mono text-xs">{contract.contract_number}</td>
                    <td className="p-3">{contract.customer_name}</td>
                    <td className="p-3 text-muted-foreground">{contract.product_name}</td>
                    <td className="p-3">{contract.principal.toLocaleString()} ر.ي</td>
                    <td className="p-3"><ContractStatusBadge status={contract.status} /></td>
                    <td className="p-3 text-xs">{contract.interest_type === "REDUCING" ? "تنازلية" : contract.interest_type === "FLAT" ? "ثابتة" : contract.interest_type}</td>
                    <td className="p-3 text-xs">{contract.next_due_date}</td>
                    <td className="p-3"><AgingBadge days={contract.aging_days} /></td>
                    <td className="p-3 text-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              عرض {filtered.length} من {mockContracts.length} عقد
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="text-sm px-3">1</span>
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

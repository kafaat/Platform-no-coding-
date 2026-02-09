import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit3,
  Phone,
  Mail,
  Shield,
  FileText,
  CalendarCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
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
import type { KYCLevel } from "@/types";

// --- KYC Badge ---

const KYC_LABELS: Record<string, { ar: string; color: string }> = {
  NONE: { ar: "بدون", color: "bg-gray-100 text-gray-700" },
  BASIC: { ar: "أساسي", color: "bg-yellow-100 text-yellow-700" },
  FULL: { ar: "كامل", color: "bg-green-100 text-green-700" },
};

function KycBadge({ level }: { level: string }) {
  const config = KYC_LABELS[level] || KYC_LABELS.NONE;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Shield className="h-3 w-3" />
      {config.ar}
    </span>
  );
}

// --- Score Badge ---

function ScoreBadge({ score }: { score: number }) {
  let color = "text-gray-500";
  if (score >= 700) color = "text-green-600";
  else if (score >= 500) color = "text-yellow-600";
  else if (score > 0) color = "text-red-600";
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${color}`}>
      <Star className="h-3.5 w-3.5" />
      {score > 0 ? score : "-"}
    </span>
  );
}

// --- Mock Data ---

interface CustomerRow {
  id: number;
  code: string;
  name_ar: string;
  name_en: string;
  kyc_level: string;
  score: number;
  phone: string;
  email: string;
  contracts_count: number;
  reservations_count: number;
}

const mockCustomers: CustomerRow[] = [
  { id: 1, code: "CUST-001", name_ar: "أحمد محمد علي", name_en: "Ahmed Mohammed Ali", kyc_level: "FULL", score: 750, phone: "+967771234567", email: "ahmed@example.com", contracts_count: 2, reservations_count: 1 },
  { id: 2, code: "CUST-002", name_ar: "خالد عبدالله سعيد", name_en: "Khaled Abdullah Saeed", kyc_level: "FULL", score: 680, phone: "+967772345678", email: "khaled@example.com", contracts_count: 1, reservations_count: 0 },
  { id: 3, code: "CUST-003", name_ar: "فاطمة حسن أحمد", name_en: "Fatima Hassan Ahmed", kyc_level: "BASIC", score: 520, phone: "+967773456789", email: "fatima@example.com", contracts_count: 1, reservations_count: 2 },
  { id: 4, code: "CUST-004", name_ar: "عمر يوسف ناصر", name_en: "Omar Youssef Nasser", kyc_level: "FULL", score: 810, phone: "+967774567890", email: "omar@example.com", contracts_count: 3, reservations_count: 0 },
  { id: 5, code: "CUST-005", name_ar: "سالم عبدالرحمن", name_en: "Salem Abdulrahman", kyc_level: "NONE", score: 0, phone: "+967775678901", email: "", contracts_count: 0, reservations_count: 1 },
  { id: 6, code: "CUST-006", name_ar: "نورا محمد العمري", name_en: "Noura Mohammed Al-Amri", kyc_level: "FULL", score: 720, phone: "+967776789012", email: "noura@example.com", contracts_count: 1, reservations_count: 3 },
  { id: 7, code: "CUST-007", name_ar: "ياسر حمود الهاشمي", name_en: "Yasser Hamoud Al-Hashmi", kyc_level: "BASIC", score: 480, phone: "+967777890123", email: "yasser@example.com", contracts_count: 1, reservations_count: 0 },
  { id: 8, code: "CUST-008", name_ar: "مريم عبدالكريم", name_en: "Mariam Abdulkareem", kyc_level: "FULL", score: 690, phone: "+967778901234", email: "mariam@example.com", contracts_count: 2, reservations_count: 1 },
];

// --- Customer Detail ---

function CustomerDetail({ customer, onBack }: { customer: CustomerRow; onBack: () => void }) {
  const [tab, setTab] = useState("info");

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowRight className="h-4 w-4 ml-1" />
        العودة إلى القائمة
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{customer.name_ar}</h2>
          <p className="text-sm text-muted-foreground">{customer.name_en} — {customer.code}</p>
        </div>
        <div className="flex items-center gap-3">
          <KycBadge level={customer.kyc_level} />
          <ScoreBadge score={customer.score} />
          <Button variant="outline" size="sm">
            <Edit3 className="h-4 w-4 ml-1" />
            تعديل
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="info" className="text-xs gap-1">
            <Users className="h-3.5 w-3.5" />
            المعلومات
          </TabsTrigger>
          <TabsTrigger value="contracts" className="text-xs gap-1">
            <FileText className="h-3.5 w-3.5" />
            العقود ({customer.contracts_count})
          </TabsTrigger>
          <TabsTrigger value="reservations" className="text-xs gap-1">
            <CalendarCheck className="h-3.5 w-3.5" />
            الحجوزات ({customer.reservations_count})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">الرمز</Label>
                <p className="font-mono">{customer.code}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">مستوى KYC</Label>
                <div><KycBadge level={customer.kyc_level} /></div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">رقم الهاتف</Label>
                <p className="flex items-center gap-1" dir="ltr">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {customer.phone}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">البريد الإلكتروني</Label>
                <p className="flex items-center gap-1" dir="ltr">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {customer.email || "غير محدد"}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">التقييم</Label>
                <div><ScoreBadge score={customer.score} /></div>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="contracts" className="mt-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {customer.contracts_count > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-right p-2 font-medium">رقم العقد</th>
                    <th className="text-right p-2 font-medium">المنتج</th>
                    <th className="text-right p-2 font-medium">المبلغ</th>
                    <th className="text-right p-2 font-medium">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-mono text-xs">CTR-2024-001</td>
                    <td className="p-2">قرض شخصي ميسر</td>
                    <td className="p-2">5,000,000 ر.ي</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">نشط</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد عقود مرتبطة</p>
              </div>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="reservations" className="mt-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {customer.reservations_count > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-right p-2 font-medium">المنتج</th>
                    <th className="text-right p-2 font-medium">من</th>
                    <th className="text-right p-2 font-medium">إلى</th>
                    <th className="text-right p-2 font-medium">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2">غرفة فندقية ديلوكس</td>
                    <td className="p-2">2024-09-10</td>
                    <td className="p-2">2024-09-15</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">مؤكد</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد حجوزات مرتبطة</p>
              </div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- Customer Form Dialog (inline) ---

function CustomerForm({ onClose }: { onClose: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">عميل جديد</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>الرمز <span className="text-destructive">*</span></Label>
            <Input placeholder="CUST-XXX" />
          </div>
          <div className="space-y-1.5">
            <Label>مستوى KYC</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">بدون</SelectItem>
                <SelectItem value="BASIC">أساسي</SelectItem>
                <SelectItem value="FULL">كامل</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>الاسم بالعربية <span className="text-destructive">*</span></Label>
            <Input placeholder="الاسم الكامل بالعربية" />
          </div>
          <div className="space-y-1.5">
            <Label>الاسم بالإنجليزية</Label>
            <Input placeholder="Full name in English" dir="ltr" />
          </div>
          <div className="space-y-1.5">
            <Label>رقم الهاتف</Label>
            <Input placeholder="+967..." dir="ltr" />
          </div>
          <div className="space-y-1.5">
            <Label>البريد الإلكتروني</Label>
            <Input placeholder="email@example.com" dir="ltr" />
          </div>
          <div className="space-y-1.5">
            <Label>التقييم</Label>
            <Input type="number" placeholder="0-1000" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button>حفظ العميل</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Main Component ---

export default function Customers() {
  const [kycFilter, setKycFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = mockCustomers.filter((c) => {
    if (kycFilter !== "ALL" && c.kyc_level !== kycFilter) return false;
    if (search && !c.name_ar.includes(search) && !c.name_en.toLowerCase().includes(search.toLowerCase()) && !c.code.includes(search)) return false;
    return true;
  });

  if (selectedCustomer) {
    return <CustomerDetail customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            العملاء
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة بيانات العملاء ومستويات KYC
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 ml-1" />
            تصدير
          </Button>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 ml-1" />
            عميل جديد
          </Button>
        </div>
      </div>

      {/* Form */}
      {showForm && <CustomerForm onClose={() => setShowForm(false)} />}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو الرمز..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9"
              />
            </div>
            <Select value={kycFilter} onValueChange={setKycFilter}>
              <SelectTrigger className="w-44">
                <Filter className="h-4 w-4 ml-2" />
                <SelectValue placeholder="مستوى KYC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">جميع المستويات</SelectItem>
                <SelectItem value="NONE">بدون</SelectItem>
                <SelectItem value="BASIC">أساسي</SelectItem>
                <SelectItem value="FULL">كامل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-right p-3 font-medium">الرمز</th>
                  <th className="text-right p-3 font-medium">الاسم</th>
                  <th className="text-right p-3 font-medium">KYC</th>
                  <th className="text-right p-3 font-medium">التقييم</th>
                  <th className="text-right p-3 font-medium">الهاتف</th>
                  <th className="text-right p-3 font-medium">البريد</th>
                  <th className="text-right p-3 font-medium">العقود</th>
                  <th className="text-right p-3 font-medium">الحجوزات</th>
                  <th className="text-center p-3 font-medium">عرض</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer, idx) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <td className="p-3 font-mono text-xs">{customer.code}</td>
                    <td className="p-3">
                      <p className="font-medium">{customer.name_ar}</p>
                      <p className="text-xs text-muted-foreground">{customer.name_en}</p>
                    </td>
                    <td className="p-3"><KycBadge level={customer.kyc_level} /></td>
                    <td className="p-3"><ScoreBadge score={customer.score} /></td>
                    <td className="p-3 text-xs font-mono" dir="ltr">{customer.phone}</td>
                    <td className="p-3 text-xs" dir="ltr">{customer.email || "-"}</td>
                    <td className="p-3 text-center">{customer.contracts_count}</td>
                    <td className="p-3 text-center">{customer.reservations_count}</td>
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
              عرض {filtered.length} من {mockCustomers.length} عميل
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

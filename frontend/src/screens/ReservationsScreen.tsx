import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  TimerOff,
  CircleDot,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Users,
  Building2,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Eye,
  Info,
  Loader2,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ReservationStatus } from "@/types";
import { RESERVATION_STATUS_LABELS } from "@/types";

// ============================================================
// Mock Data Types
// ============================================================

interface ReservationMock {
  id: number;
  tenant_id: number;
  product_id: number;
  customer_id: number;
  slot_from: string;
  slot_to: string;
  status: ReservationStatus;
  hold_until: string | null;
  deposit_amount: number;
  cancellation_policy_id: number;
  created_at: string;
  product_name: string;
  customer_name: string;
  cancellation_policy_label: string;
}

// ============================================================
// Initial Mock Data
// ============================================================

const initialReservations: ReservationMock[] = [
  {
    id: 1, tenant_id: 1, product_id: 101, customer_id: 201,
    slot_from: "2026-02-10T14:00:00", slot_to: "2026-02-12T12:00:00",
    status: "HOLD", hold_until: "2026-02-09T23:59:00", deposit_amount: 50000,
    cancellation_policy_id: 1, created_at: "2026-02-08T10:00:00",
    product_name: "غرفة فندقية ديلوكس", customer_name: "أحمد محمد العمري",
    cancellation_policy_label: "مرنة",
  },
  {
    id: 2, tenant_id: 1, product_id: 102, customer_id: 202,
    slot_from: "2026-02-11T09:00:00", slot_to: "2026-02-11T17:00:00",
    status: "CONFIRMED", hold_until: null, deposit_amount: 150000,
    cancellation_policy_id: 2, created_at: "2026-02-05T14:30:00",
    product_name: "قاعة مؤتمرات الملكية", customer_name: "شركة التقنية المتقدمة",
    cancellation_policy_label: "صارمة",
  },
  {
    id: 3, tenant_id: 1, product_id: 103, customer_id: 203,
    slot_from: "2026-02-09T10:00:00", slot_to: "2026-02-09T11:00:00",
    status: "COMPLETED", hold_until: null, deposit_amount: 15000,
    cancellation_policy_id: 1, created_at: "2026-02-07T08:00:00",
    product_name: "موعد استشارة طبية", customer_name: "فاطمة علي الحسني",
    cancellation_policy_label: "مرنة",
  },
  {
    id: 4, tenant_id: 1, product_id: 101, customer_id: 204,
    slot_from: "2026-02-13T14:00:00", slot_to: "2026-02-15T12:00:00",
    status: "CANCELLED", hold_until: null, deposit_amount: 75000,
    cancellation_policy_id: 3, created_at: "2026-02-03T16:00:00",
    product_name: "غرفة فندقية ديلوكس", customer_name: "خالد سعيد المقبلي",
    cancellation_policy_label: "بدون إلغاء",
  },
  {
    id: 5, tenant_id: 1, product_id: 102, customer_id: 205,
    slot_from: "2026-02-08T18:00:00", slot_to: "2026-02-08T22:00:00",
    status: "EXPIRED", hold_until: "2026-02-07T18:00:00", deposit_amount: 100000,
    cancellation_policy_id: 2, created_at: "2026-02-06T09:00:00",
    product_name: "قاعة مؤتمرات الملكية", customer_name: "مؤسسة النجاح للتجارة",
    cancellation_policy_label: "صارمة",
  },
];

const reservationProducts = [
  { id: 101, name: "غرفة فندقية ديلوكس", capacity: 30 },
  { id: 102, name: "قاعة مؤتمرات الملكية", capacity: 5 },
  { id: 103, name: "موعد استشارة طبية", capacity: 12 },
];

const reservationCustomers = [
  { id: 201, name: "أحمد محمد العمري" },
  { id: 202, name: "شركة التقنية المتقدمة" },
  { id: 203, name: "فاطمة علي الحسني" },
  { id: 204, name: "خالد سعيد المقبلي" },
  { id: 205, name: "مؤسسة النجاح للتجارة" },
  { id: 206, name: "سارة عبدالله" },
];

const cancellationPolicies = [
  { id: 1, label: "مرنة" },
  { id: 2, label: "صارمة" },
  { id: 3, label: "بدون إلغاء" },
];

// ============================================================
// Helpers
// ============================================================

const statusIcons: Record<ReservationStatus, React.ReactNode> = {
  HOLD: <Clock className="h-3.5 w-3.5" />,
  CONFIRMED: <CheckCircle2 className="h-3.5 w-3.5" />,
  CANCELLED: <XCircle className="h-3.5 w-3.5" />,
  EXPIRED: <TimerOff className="h-3.5 w-3.5" />,
  COMPLETED: <CircleDot className="h-3.5 w-3.5" />,
};

const policyIcons: Record<string, React.ReactNode> = {
  "مرنة": <ShieldCheck className="h-3.5 w-3.5 text-green-600" />,
  "صارمة": <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />,
  "بدون إلغاء": <ShieldOff className="h-3.5 w-3.5 text-red-600" />,
};

const policyColors: Record<string, string> = {
  "مرنة": "bg-green-50 text-green-700 border-green-200",
  "صارمة": "bg-amber-50 text-amber-700 border-amber-200",
  "بدون إلغاء": "bg-red-50 text-red-700 border-red-200",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ar-YE", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" });
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("ar-YE") + " ر.ي";
}

// ============================================================
// Weekly Calendar Helpers
// ============================================================

function getWeekDays(baseDate: Date): Date[] {
  const days: Date[] = [];
  const start = new Date(baseDate);
  const dayOfWeek = start.getDay();
  const diff = dayOfWeek >= 6 ? dayOfWeek - 6 : dayOfWeek + 1;
  start.setDate(start.getDate() - diff);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

const dayNames = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

const calendarStatusColors: Record<ReservationStatus, string> = {
  HOLD: "bg-yellow-200 border-yellow-400 text-yellow-800",
  CONFIRMED: "bg-green-200 border-green-400 text-green-800",
  CANCELLED: "bg-red-200 border-red-400 text-red-800",
  EXPIRED: "bg-gray-200 border-gray-400 text-gray-600",
  COMPLETED: "bg-blue-200 border-blue-400 text-blue-800",
};

// ============================================================
// Animation Variants
// ============================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ============================================================
// Hold Timer Component (Live Countdown)
// ============================================================

function HoldTimer({ holdUntil }: { holdUntil: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calc = () => {
      const now = new Date().getTime();
      const target = new Date(holdUntil).getTime();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        setExpired(true);
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
      setExpired(false);
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [holdUntil]);

  return (
    <motion.div
      className={`inline-flex items-center gap-1 text-[10px] font-mono mt-1 px-1.5 py-0.5 rounded ${
        expired ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
      }`}
      animate={expired ? {} : { opacity: [1, 0.6, 1] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <Clock className="h-3 w-3" />
      {expired ? "انتهت المهلة" : timeLeft}
    </motion.div>
  );
}

// ============================================================
// Sub-Components
// ============================================================

function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const config = RESERVATION_STATUS_LABELS[status];
  return (
    <Badge variant="outline" className={`gap-1 ${config.color} border-0`}>
      {statusIcons[status]}
      {config.ar}
    </Badge>
  );
}

function PolicyBadge({ label }: { label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${policyColors[label] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
      {policyIcons[label]}
      {label}
    </span>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <motion.p key={value} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-2xl font-bold mt-1">
                {value.toLocaleString('ar-EG')}
              </motion.p>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================
// Status Flow Diagram
// ============================================================

function StatusFlowDiagram() {
  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            مسار حالات الحجز
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300 gap-1 px-3 py-1.5">
                <Clock className="h-3.5 w-3.5" />
                محجوز مؤقتا
              </Badge>
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 gap-1 px-3 py-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                مؤكد
              </Badge>
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 gap-1 px-3 py-1.5">
                <CircleDot className="h-3.5 w-3.5" />
                مكتمل
              </Badge>
            </div>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300 gap-1 px-3 py-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  محجوز مؤقتا
                </Badge>
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300 gap-1 px-3 py-1.5">
                  <TimerOff className="h-3.5 w-3.5" />
                  منتهي
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 gap-1 px-3 py-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  مؤكد
                </Badge>
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 gap-1 px-3 py-1.5">
                  <XCircle className="h-3.5 w-3.5" />
                  ملغى
                </Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-1">
              BR-10: الحجوزات المؤقتة تنتهي تلقائيا بعد انقضاء المهلة المحددة (TTL)
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================
// Weekly Calendar with click-to-create
// ============================================================

function WeeklyCalendar({
  reservations,
  onSlotClick,
}: {
  reservations: ReservationMock[];
  onSlotClick: (day: Date, time: string) => void;
}) {
  const [weekOffset, setWeekOffset] = useState(0);

  const baseDate = new Date("2026-02-09");
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const weekDays = getWeekDays(baseDate);

  const timeSlots = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];

  function getReservationsForDay(day: Date): ReservationMock[] {
    return reservations.filter((r) => {
      const from = new Date(r.slot_from);
      const to = new Date(r.slot_to);
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);
      return from <= dayEnd && to >= dayStart;
    });
  }

  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              الجدول الأسبوعي
              <span className="text-xs font-normal text-muted-foreground">(اضغط على خلية فارغة لإنشاء حجز)</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" aria-label="الأسبوع السابق" onClick={() => setWeekOffset((w) => w - 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
                هذا الأسبوع
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" aria-label="الأسبوع التالي" onClick={() => setWeekOffset((w) => w + 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap mt-2">
            {(Object.keys(calendarStatusColors) as ReservationStatus[]).map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm border ${calendarStatusColors[s]}`} />
                <span className="text-xs text-muted-foreground">{RESERVATION_STATUS_LABELS[s].ar}</span>
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-right font-medium w-16 border-l">الوقت</th>
                  {weekDays.map((day, i) => {
                    const isToday = day.toDateString() === new Date("2026-02-09").toDateString();
                    return (
                      <th key={i} className={`p-2 text-center font-medium border-l ${isToday ? "bg-primary/10" : ""}`}>
                        <div className="text-xs font-medium">{dayNames[i]}</div>
                        <div className={`text-xs mt-0.5 ${isToday ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mx-auto" : "text-muted-foreground"}`}>
                          {day.getDate()}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time} className="border-b">
                    <td className="p-2 text-muted-foreground font-mono border-l text-center">{time}</td>
                    {weekDays.map((day, dayIdx) => {
                      const dayReservations = getReservationsForDay(day);
                      const slotHour = parseInt(time.split(":")[0]);
                      const matchingReservations = dayReservations.filter((r) => {
                        const fromH = new Date(r.slot_from).getHours();
                        const toH = new Date(r.slot_to).getHours();
                        const fromDay = new Date(r.slot_from).toDateString();
                        const toDay = new Date(r.slot_to).toDateString();
                        const curDay = day.toDateString();
                        if (fromDay !== toDay) {
                          if (curDay === fromDay) return slotHour >= fromH;
                          if (curDay === toDay) return slotHour <= toH;
                          return true;
                        }
                        return slotHour >= fromH && slotHour < toH;
                      });

                      return (
                        <td
                          key={dayIdx}
                          className="p-1 border-l h-10 align-top cursor-pointer hover:bg-primary/5 transition-colors"
                          onClick={() => {
                            if (matchingReservations.length === 0) {
                              onSlotClick(day, time);
                            }
                          }}
                        >
                          {matchingReservations.map((r) => (
                            <div
                              key={r.id}
                              className={`rounded px-1 py-0.5 mb-0.5 text-[10px] truncate border ${calendarStatusColors[r.status]}`}
                              title={`${r.product_name} - ${r.customer_name}`}
                            >
                              {r.product_name.substring(0, 15)}
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================
// Availability Check with loading state
// ============================================================

function AvailabilityCheck() {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);

  const product = reservationProducts.find((p) => p.id === Number(selectedProduct));

  const mockSlots = [
    { time: "08:00 - 10:00", available: true, booked: 1, capacity: product?.capacity || 0 },
    { time: "10:00 - 12:00", available: true, booked: 3, capacity: product?.capacity || 0 },
    { time: "12:00 - 14:00", available: false, booked: product?.capacity || 0, capacity: product?.capacity || 0 },
    { time: "14:00 - 16:00", available: true, booked: 2, capacity: product?.capacity || 0 },
    { time: "16:00 - 18:00", available: true, booked: 0, capacity: product?.capacity || 0 },
    { time: "18:00 - 20:00", available: true, booked: 4, capacity: product?.capacity || 0 },
  ];

  const handleCheck = () => {
    setChecking(true);
    setChecked(false);
    setTimeout(() => {
      setChecking(false);
      setChecked(true);
    }, 800);
  };

  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            فحص التوفر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">المنتج</label>
              <Select value={selectedProduct} onValueChange={(v) => { setSelectedProduct(v); setChecked(false); }}>
                <SelectTrigger><SelectValue placeholder="اختر المنتج" /></SelectTrigger>
                <SelectContent>
                  {reservationProducts.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">من تاريخ</label>
              <Input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setChecked(false); }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">إلى تاريخ</label>
              <Input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setChecked(false); }} />
            </div>
            <Button onClick={handleCheck} disabled={!selectedProduct || !fromDate || !toDate || checking}>
              {checking ? (
                <>
                  <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                  جارِ الفحص...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 ml-1" />
                  فحص التوفر
                </>
              )}
            </Button>
          </div>

          <AnimatePresence>
            {checked && product && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">نتائج التوفر: {product.name}</p>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">السعة الإجمالية: {product.capacity.toLocaleString('ar-EG')}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {mockSlots.map((slot) => (
                      <div
                        key={slot.time}
                        className={`rounded-lg border p-3 text-center ${slot.available ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                      >
                        <p className="text-xs font-medium mb-1">{slot.time}</p>
                        <p className={`text-xs font-bold ${slot.available ? "text-green-700" : "text-red-700"}`}>
                          {slot.available ? "متاح" : "ممتلئ"}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{slot.booked}/{slot.capacity} محجوز</p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${slot.available ? "bg-green-500" : "bg-red-500"}`}
                            style={{ width: `${slot.capacity ? (slot.booked / slot.capacity) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================
// Create Reservation Dialog
// ============================================================

function CreateReservationDialog({
  open,
  onClose,
  onSave,
  prefillDate,
  prefillTime,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (r: ReservationMock) => void;
  prefillDate?: string;
  prefillTime?: string;
}) {
  const [productId, setProductId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [slotFrom, setSlotFrom] = useState("");
  const [slotTo, setSlotTo] = useState("");
  const [deposit, setDeposit] = useState("");
  const [policyId, setPolicyId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prefillDate && prefillTime) {
      setSlotFrom(`${prefillDate}T${prefillTime}:00`);
      const endHour = parseInt(prefillTime.split(":")[0]) + 2;
      setSlotTo(`${prefillDate}T${String(endHour).padStart(2, "0")}:00:00`);
    }
  }, [prefillDate, prefillTime]);

  const handleSave = () => {
    if (!productId || !customerId || !slotFrom || !slotTo || !deposit || !policyId) return;
    setSaving(true);

    setTimeout(() => {
      const product = reservationProducts.find((p) => p.id === Number(productId));
      const customer = reservationCustomers.find((c) => c.id === Number(customerId));
      const policy = cancellationPolicies.find((p) => p.id === Number(policyId));

      const holdUntilDate = new Date(slotFrom);
      holdUntilDate.setHours(holdUntilDate.getHours() - 2);

      const newReservation: ReservationMock = {
        id: Date.now(),
        tenant_id: 1,
        product_id: Number(productId),
        customer_id: Number(customerId),
        slot_from: slotFrom,
        slot_to: slotTo,
        status: "HOLD",
        hold_until: holdUntilDate.toISOString(),
        deposit_amount: Number(deposit),
        cancellation_policy_id: Number(policyId),
        created_at: new Date().toISOString(),
        product_name: product?.name || "",
        customer_name: customer?.name || "",
        cancellation_policy_label: policy?.label || "",
      };

      onSave(newReservation);
      setSaving(false);
      setProductId("");
      setCustomerId("");
      setSlotFrom("");
      setSlotTo("");
      setDeposit("");
      setPolicyId("");
      onClose();
    }, 700);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>حجز جديد</DialogTitle>
          <DialogDescription>أدخل بيانات الحجز الجديد — سيتم إنشاؤه بحالة "محجوز مؤقتاً"</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5">
            <Label>المنتج <span className="text-destructive">*</span></Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger><SelectValue placeholder="اختر المنتج" /></SelectTrigger>
              <SelectContent>
                {reservationProducts.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>العميل <span className="text-destructive">*</span></Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger><SelectValue placeholder="اختر العميل" /></SelectTrigger>
              <SelectContent>
                {reservationCustomers.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>من (تاريخ ووقت) <span className="text-destructive">*</span></Label>
            <Input
              type="datetime-local"
              value={slotFrom}
              onChange={(e) => setSlotFrom(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>إلى (تاريخ ووقت) <span className="text-destructive">*</span></Label>
            <Input
              type="datetime-local"
              value={slotTo}
              onChange={(e) => setSlotTo(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>العربون (ر.ي) <span className="text-destructive">*</span></Label>
            <Input
              type="number"
              placeholder="0"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>سياسة الإلغاء <span className="text-destructive">*</span></Label>
            <Select value={policyId} onValueChange={setPolicyId}>
              <SelectTrigger><SelectValue placeholder="اختر السياسة" /></SelectTrigger>
              <SelectContent>
                {cancellationPolicies.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>إلغاء</Button>
          <Button
            onClick={handleSave}
            disabled={!productId || !customerId || !slotFrom || !slotTo || !deposit || !policyId || saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                جارِ الحفظ...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 ml-1" />
                إنشاء الحجز
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Confirm / Cancel Dialogs
// ============================================================

function ConfirmActionDialog({
  open,
  onClose,
  onConfirm,
  reservation,
  action,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reservation: ReservationMock | null;
  action: "confirm" | "cancel";
}) {
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handleConfirm = () => {
    setProcessing(true);
    setTimeout(() => {
      onConfirm();
      setProcessing(false);
      setDone(true);
      setTimeout(() => {
        setDone(false);
        onClose();
      }, 1000);
    }, 700);
  };

  useEffect(() => {
    if (!open) setDone(false);
  }, [open]);

  const isConfirm = action === "confirm";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${isConfirm ? "text-green-700" : "text-destructive"}`}>
            {isConfirm ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            {isConfirm ? "تأكيد الحجز" : "إلغاء الحجز"}
          </DialogTitle>
          <DialogDescription>
            {reservation && (
              <>
                #RSV-{String(reservation.id).padStart(4, "0")} — {reservation.product_name}
                <br />
                {reservation.customer_name}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center py-6 gap-3"
          >
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isConfirm ? "bg-green-100" : "bg-red-100"}`}>
              <Check className={`h-6 w-6 ${isConfirm ? "text-green-600" : "text-red-600"}`} />
            </div>
            <p className={`text-sm font-medium ${isConfirm ? "text-green-700" : "text-red-700"}`}>
              {isConfirm ? "تم تأكيد الحجز بنجاح" : "تم إلغاء الحجز بنجاح"}
            </p>
          </motion.div>
        ) : (
          <>
            <div className="py-2">
              {isConfirm ? (
                <p className="text-sm text-muted-foreground">هل تريد تأكيد هذا الحجز؟ سيتم تغيير حالته إلى "مؤكد".</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">هل أنت متأكد من إلغاء هذا الحجز؟</p>
                  {reservation && (
                    <div className="p-2 bg-red-50 rounded text-xs text-red-700">
                      سياسة الإلغاء: <strong>{reservation.cancellation_policy_label}</strong>
                      {reservation.cancellation_policy_label === "بدون إلغاء" && (
                        <span className="block mt-1">تحذير: قد لا يمكن استرداد العربون</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={processing}>إلغاء</Button>
              <Button
                variant={isConfirm ? "default" : "destructive"}
                onClick={handleConfirm}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                    {isConfirm ? "جارِ التأكيد..." : "جارِ الإلغاء..."}
                  </>
                ) : (
                  <>
                    {isConfirm ? <CheckCircle2 className="h-4 w-4 ml-1" /> : <XCircle className="h-4 w-4 ml-1" />}
                    {isConfirm ? "تأكيد" : "إلغاء الحجز"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function ReservationsScreen() {
  const [reservations, setReservations] = useState<ReservationMock[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [productFilter, setProductFilter] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [actionTarget, setActionTarget] = useState<ReservationMock | null>(null);
  const [prefillDate, setPrefillDate] = useState<string>("");
  const [prefillTime, setPrefillTime] = useState<string>("");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setReservations(initialReservations);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // CRUD: Add reservation
  const handleCreateReservation = useCallback((r: ReservationMock) => {
    setReservations((prev) => [r, ...prev]);
  }, []);

  // Status transition: Confirm
  const handleConfirmReservation = useCallback((id: number) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "CONFIRMED" as ReservationStatus, hold_until: null } : r))
    );
  }, []);

  // Status transition: Cancel
  const handleCancelReservation = useCallback((id: number) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "CANCELLED" as ReservationStatus } : r))
    );
  }, []);

  // Calendar slot click
  const handleSlotClick = (day: Date, time: string) => {
    const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    setPrefillDate(dateStr);
    setPrefillTime(time);
    setShowCreateDialog(true);
  };

  // Open confirm dialog
  const openConfirmDialog = (r: ReservationMock) => {
    setActionTarget(r);
    setShowConfirmDialog(true);
  };

  // Open cancel dialog
  const openCancelDialog = (r: ReservationMock) => {
    setActionTarget(r);
    setShowCancelDialog(true);
  };

  // Compute stats
  const totalCount = reservations.length;
  const holdCount = reservations.filter((r) => r.status === "HOLD").length;
  const confirmedCount = reservations.filter((r) => r.status === "CONFIRMED").length;
  const completedCount = reservations.filter((r) => r.status === "COMPLETED").length;

  // Filter reservations
  const filtered = reservations.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (productFilter !== "ALL" && r.product_id !== Number(productFilter)) return false;
    if (dateFrom) {
      const from = new Date(dateFrom);
      const slotFrom = new Date(r.slot_from);
      if (slotFrom < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      const slotTo = new Date(r.slot_to);
      if (slotTo > to) return false;
    }
    if (search && !r.product_name.includes(search) && !r.customer_name.includes(search) && !String(r.id).includes(search)) return false;
    return true;
  });

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [statusFilter, productFilter, dateFrom, dateTo, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <motion.div
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarCheck className="h-6 w-6" />
            الحجوزات
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة حجوزات الفنادق والقاعات والمواعيد
          </p>
        </div>
        <Button size="sm" onClick={() => { setPrefillDate(""); setPrefillTime(""); setShowCreateDialog(true); }}>
          <Plus className="h-4 w-4 ml-1" />
          حجز جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-7 w-12 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <>
            <StatCard title="إجمالي الحجوزات" value={totalCount} icon={<CalendarCheck className="h-5 w-5" />} color="text-blue-600 bg-blue-50" />
            <StatCard title="محجوز مؤقتا" value={holdCount} icon={<Clock className="h-5 w-5" />} color="text-yellow-600 bg-yellow-50" />
            <StatCard title="مؤكد" value={confirmedCount} icon={<CheckCircle2 className="h-5 w-5" />} color="text-green-600 bg-green-50" />
            <StatCard title="مكتمل" value={completedCount} icon={<CircleDot className="h-5 w-5" />} color="text-blue-600 bg-blue-50" />
          </>
        )}
      </div>

      {/* Status Flow Diagram */}
      <StatusFlowDiagram />

      {/* Weekly Calendar */}
      {!loading && (
        <WeeklyCalendar reservations={reservations} onSlotClick={handleSlotClick} />
      )}

      {/* Availability Check */}
      <AvailabilityCheck />

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث برقم الحجز أو اسم العميل أو المنتج..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pr-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 ml-2" />
                    <SelectValue placeholder="حالة الحجز" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">جميع الحالات</SelectItem>
                    <SelectItem value="HOLD">محجوز مؤقتا</SelectItem>
                    <SelectItem value="CONFIRMED">مؤكد</SelectItem>
                    <SelectItem value="COMPLETED">مكتمل</SelectItem>
                    <SelectItem value="CANCELLED">ملغى</SelectItem>
                    <SelectItem value="EXPIRED">منتهي</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={productFilter} onValueChange={setProductFilter}>
                  <SelectTrigger className="w-48">
                    <Building2 className="h-4 w-4 ml-2" />
                    <SelectValue placeholder="المنتج" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">جميع المنتجات</SelectItem>
                    {reservationProducts.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">من تاريخ</label>
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-44" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">إلى تاريخ</label>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-44" />
                </div>
                {(dateFrom || dateTo || statusFilter !== "ALL" || productFilter !== "ALL" || search) && (
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStatusFilter("ALL");
                        setProductFilter("ALL");
                        setDateFrom("");
                        setDateTo("");
                        setSearch("");
                      }}
                    >
                      مسح الفلاتر
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reservations Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                قائمة الحجوزات ({filtered.length.toLocaleString('ar-EG')})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>رقم الحجز</TableHead>
                  <TableHead>المنتج</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>من - إلى</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>العربون</TableHead>
                  <TableHead>سياسة الإلغاء</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <CalendarCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-muted-foreground">لا توجد حجوزات مطابقة للبحث</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((reservation, idx) => (
                    <motion.tr
                      key={reservation.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-mono text-xs font-medium">
                        #RSV-{String(reservation.id).padStart(4, "0")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm">{reservation.product_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm">{reservation.customer_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-0.5">
                          <div className="flex items-center gap-1">
                            <ArrowRight className="h-3 w-3 text-green-500" />
                            <span>{formatDate(reservation.slot_from)} {formatTime(reservation.slot_from)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ArrowLeft className="h-3 w-3 text-red-500" />
                            <span>{formatDate(reservation.slot_to)} {formatTime(reservation.slot_to)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={reservation.status}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ReservationStatusBadge status={reservation.status} />
                          </motion.div>
                        </AnimatePresence>
                        {reservation.status === "HOLD" && reservation.hold_until && (
                          <HoldTimer holdUntil={reservation.hold_until} />
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {formatCurrency(reservation.deposit_amount)}
                      </TableCell>
                      <TableCell>
                        <PolicyBadge label={reservation.cancellation_policy_label} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          {reservation.status === "HOLD" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                onClick={() => openConfirmDialog(reservation)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 ml-1" />
                                تأكيد
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                onClick={() => openCancelDialog(reservation)}
                              >
                                <XCircle className="h-3.5 w-3.5 ml-1" />
                                إلغاء
                              </Button>
                            </>
                          )}
                          {reservation.status === "CONFIRMED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              onClick={() => openCancelDialog(reservation)}
                            >
                              <XCircle className="h-3.5 w-3.5 ml-1" />
                              إلغاء
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="عرض تفاصيل الحجز" onClick={() => setActionTarget(reservation)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                عرض {paginated.length.toLocaleString('ar-EG')} من {filtered.length.toLocaleString('ar-EG')} حجز
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                  السابق
                </Button>
                <span className="text-sm px-3">صفحة {page.toLocaleString('ar-EG')} من {totalPages.toLocaleString('ar-EG')}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  التالي
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Reservation Dialog */}
      <CreateReservationDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSave={handleCreateReservation}
        prefillDate={prefillDate}
        prefillTime={prefillTime}
      />

      {/* Confirm Dialog */}
      <ConfirmActionDialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => actionTarget && handleConfirmReservation(actionTarget.id)}
        reservation={actionTarget}
        action="confirm"
      />

      {/* Cancel Dialog */}
      <ConfirmActionDialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={() => actionTarget && handleCancelReservation(actionTarget.id)}
        reservation={actionTarget}
        action="cancel"
      />
    </motion.div>
  );
}

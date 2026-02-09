import { useState } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Reservation, ReservationStatus } from "@/types";
import { RESERVATION_STATUS_LABELS } from "@/types";

// ============================================================
// Mock Data
// ============================================================

interface ReservationMock extends Reservation {
  product_name: string;
  customer_name: string;
  cancellation_policy_label: string;
}

const mockReservations: ReservationMock[] = [
  {
    id: 1,
    tenant_id: 1,
    product_id: 101,
    customer_id: 201,
    slot_from: "2026-02-10T14:00:00",
    slot_to: "2026-02-12T12:00:00",
    status: "HOLD",
    hold_until: "2026-02-09T23:59:00",
    deposit_amount: 50000,
    cancellation_policy_id: 1,
    created_at: "2026-02-08T10:00:00",
    product_name: "غرفة فندقية ديلوكس",
    customer_name: "أحمد محمد العمري",
    cancellation_policy_label: "مرنة",
  },
  {
    id: 2,
    tenant_id: 1,
    product_id: 102,
    customer_id: 202,
    slot_from: "2026-02-11T09:00:00",
    slot_to: "2026-02-11T17:00:00",
    status: "CONFIRMED",
    hold_until: null,
    deposit_amount: 150000,
    cancellation_policy_id: 2,
    created_at: "2026-02-05T14:30:00",
    product_name: "قاعة مؤتمرات الملكية",
    customer_name: "شركة التقنية المتقدمة",
    cancellation_policy_label: "صارمة",
  },
  {
    id: 3,
    tenant_id: 1,
    product_id: 103,
    customer_id: 203,
    slot_from: "2026-02-09T10:00:00",
    slot_to: "2026-02-09T11:00:00",
    status: "COMPLETED",
    hold_until: null,
    deposit_amount: 15000,
    cancellation_policy_id: 1,
    created_at: "2026-02-07T08:00:00",
    product_name: "موعد استشارة طبية",
    customer_name: "فاطمة علي الحسني",
    cancellation_policy_label: "مرنة",
  },
  {
    id: 4,
    tenant_id: 1,
    product_id: 101,
    customer_id: 204,
    slot_from: "2026-02-13T14:00:00",
    slot_to: "2026-02-15T12:00:00",
    status: "CANCELLED",
    hold_until: null,
    deposit_amount: 75000,
    cancellation_policy_id: 3,
    created_at: "2026-02-03T16:00:00",
    product_name: "غرفة فندقية ديلوكس",
    customer_name: "خالد سعيد المقبلي",
    cancellation_policy_label: "بدون إلغاء",
  },
  {
    id: 5,
    tenant_id: 1,
    product_id: 102,
    customer_id: 205,
    slot_from: "2026-02-08T18:00:00",
    slot_to: "2026-02-08T22:00:00",
    status: "EXPIRED",
    hold_until: "2026-02-07T18:00:00",
    deposit_amount: 100000,
    cancellation_policy_id: 2,
    created_at: "2026-02-06T09:00:00",
    product_name: "قاعة مؤتمرات الملكية",
    customer_name: "مؤسسة النجاح للتجارة",
    cancellation_policy_label: "صارمة",
  },
];

// ============================================================
// Products for availability check
// ============================================================

const reservationProducts = [
  { id: 101, name: "غرفة فندقية ديلوكس", capacity: 30 },
  { id: 102, name: "قاعة مؤتمرات الملكية", capacity: 5 },
  { id: 103, name: "موعد استشارة طبية", capacity: 12 },
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
  return d.toLocaleDateString("ar-YE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("ar-YE", {
    hour: "2-digit",
    minute: "2-digit",
  });
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
  // Start from Saturday (6) for Arabic week
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
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ============================================================
// Sub-Components
// ============================================================

/** Reservation status badge with icon */
function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const config = RESERVATION_STATUS_LABELS[status];
  return (
    <Badge
      variant="outline"
      className={`gap-1 ${config.color} border-0`}
    >
      {statusIcons[status]}
      {config.ar}
    </Badge>
  );
}

/** Cancellation policy badge */
function PolicyBadge({ label }: { label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
        policyColors[label] || "bg-gray-50 text-gray-700 border-gray-200"
      }`}
    >
      {policyIcons[label]}
      {label}
    </span>
  );
}

/** Stats card */
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/** Status flow diagram */
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
            {/* Main flow: HOLD -> CONFIRMED -> COMPLETED */}
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

            {/* Alternative flows */}
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

/** Weekly Calendar/Timeline view */
function WeeklyCalendar({
  reservations,
}: {
  reservations: ReservationMock[];
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
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setWeekOffset((w) => w + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekOffset(0)}
              >
                هذا الأسبوع
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setWeekOffset((w) => w - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Status Legend */}
          <div className="flex items-center gap-3 flex-wrap mt-2">
            {(Object.keys(calendarStatusColors) as ReservationStatus[]).map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <div
                  className={`w-3 h-3 rounded-sm border ${calendarStatusColors[s]}`}
                />
                <span className="text-xs text-muted-foreground">
                  {RESERVATION_STATUS_LABELS[s].ar}
                </span>
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-right font-medium w-16 border-l">
                    الوقت
                  </th>
                  {weekDays.map((day, i) => {
                    const isToday =
                      day.toDateString() === new Date("2026-02-09").toDateString();
                    return (
                      <th
                        key={i}
                        className={`p-2 text-center font-medium border-l ${
                          isToday ? "bg-primary/10" : ""
                        }`}
                      >
                        <div className="text-xs font-medium">{dayNames[i]}</div>
                        <div
                          className={`text-xs mt-0.5 ${
                            isToday
                              ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mx-auto"
                              : "text-muted-foreground"
                          }`}
                        >
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
                    <td className="p-2 text-muted-foreground font-mono border-l text-center">
                      {time}
                    </td>
                    {weekDays.map((day, dayIdx) => {
                      const dayReservations = getReservationsForDay(day);
                      const slotHour = parseInt(time.split(":")[0]);
                      const matchingReservations = dayReservations.filter((r) => {
                        const fromH = new Date(r.slot_from).getHours();
                        const toH = new Date(r.slot_to).getHours();
                        const fromDay = new Date(r.slot_from).toDateString();
                        const toDay = new Date(r.slot_to).toDateString();
                        const curDay = day.toDateString();

                        // Multi-day: show in all time slots
                        if (fromDay !== toDay) {
                          if (curDay === fromDay) return slotHour >= fromH;
                          if (curDay === toDay) return slotHour <= toH;
                          return true;
                        }
                        // Same-day reservation
                        return slotHour >= fromH && slotHour < toH;
                      });

                      return (
                        <td
                          key={dayIdx}
                          className="p-1 border-l h-10 align-top"
                        >
                          {matchingReservations.map((r) => (
                            <div
                              key={r.id}
                              className={`rounded px-1 py-0.5 mb-0.5 text-[10px] truncate border cursor-default ${
                                calendarStatusColors[r.status]
                              }`}
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

/** Availability check section */
function AvailabilityCheck() {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [checked, setChecked] = useState(false);

  const product = reservationProducts.find(
    (p) => p.id === Number(selectedProduct)
  );

  // Simulated availability results
  const mockSlots = [
    { time: "08:00 - 10:00", available: true, booked: 1, capacity: product?.capacity || 0 },
    { time: "10:00 - 12:00", available: true, booked: 3, capacity: product?.capacity || 0 },
    { time: "12:00 - 14:00", available: false, booked: product?.capacity || 0, capacity: product?.capacity || 0 },
    { time: "14:00 - 16:00", available: true, booked: 2, capacity: product?.capacity || 0 },
    { time: "16:00 - 18:00", available: true, booked: 0, capacity: product?.capacity || 0 },
    { time: "18:00 - 20:00", available: true, booked: 4, capacity: product?.capacity || 0 },
  ];

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
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المنتج" />
                </SelectTrigger>
                <SelectContent>
                  {reservationProducts.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">من تاريخ</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">إلى تاريخ</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <Button
              onClick={() => setChecked(true)}
              disabled={!selectedProduct || !fromDate || !toDate}
            >
              <Search className="h-4 w-4 ml-1" />
              فحص التوفر
            </Button>
          </div>

          {/* Availability Results */}
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
                    <p className="text-sm font-medium">
                      نتائج التوفر: {product.name}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        السعة الإجمالية: {product.capacity}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {mockSlots.map((slot) => (
                      <div
                        key={slot.time}
                        className={`rounded-lg border p-3 text-center ${
                          slot.available
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <p className="text-xs font-medium mb-1">{slot.time}</p>
                        <p
                          className={`text-xs font-bold ${
                            slot.available ? "text-green-700" : "text-red-700"
                          }`}
                        >
                          {slot.available ? "متاح" : "ممتلئ"}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {slot.booked}/{slot.capacity} محجوز
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              slot.available ? "bg-green-500" : "bg-red-500"
                            }`}
                            style={{
                              width: `${
                                slot.capacity
                                  ? (slot.booked / slot.capacity) * 100
                                  : 0
                              }%`,
                            }}
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
// Main Component
// ============================================================

export default function ReservationsScreen() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // Compute stats
  const totalCount = mockReservations.length;
  const holdCount = mockReservations.filter((r) => r.status === "HOLD").length;
  const confirmedCount = mockReservations.filter((r) => r.status === "CONFIRMED").length;
  const completedCount = mockReservations.filter((r) => r.status === "COMPLETED").length;

  // Filter reservations
  const filtered = mockReservations.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (
      search &&
      !r.product_name.includes(search) &&
      !r.customer_name.includes(search) &&
      !String(r.id).includes(search)
    )
      return false;
    return true;
  });

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
        <Button size="sm">
          <Plus className="h-4 w-4 ml-1" />
          حجز جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          title="إجمالي الحجوزات"
          value={totalCount}
          icon={<CalendarCheck className="h-5 w-5" />}
          color="text-blue-600 bg-blue-50"
        />
        <StatCard
          title="محجوز مؤقتا"
          value={holdCount}
          icon={<Clock className="h-5 w-5" />}
          color="text-yellow-600 bg-yellow-50"
        />
        <StatCard
          title="مؤكد"
          value={confirmedCount}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="text-green-600 bg-green-50"
        />
        <StatCard
          title="مكتمل"
          value={completedCount}
          icon={<CircleDot className="h-5 w-5" />}
          color="text-blue-600 bg-blue-50"
        />
      </div>

      {/* Status Flow Diagram */}
      <StatusFlowDiagram />

      {/* Weekly Calendar */}
      <WeeklyCalendar reservations={mockReservations} />

      {/* Availability Check */}
      <AvailabilityCheck />

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
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
                <SelectTrigger className="w-48">
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
                قائمة الحجوزات ({filtered.length})
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
                {filtered.map((reservation, idx) => (
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
                          <span>
                            {formatDate(reservation.slot_from)}{" "}
                            {formatTime(reservation.slot_from)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ArrowLeft className="h-3 w-3 text-red-500" />
                          <span>
                            {formatDate(reservation.slot_to)}{" "}
                            {formatTime(reservation.slot_to)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ReservationStatusBadge status={reservation.status} />
                      {reservation.status === "HOLD" && reservation.hold_until && (
                        <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-0.5">
                          <TimerOff className="h-3 w-3" />
                          ينتهي: {formatDate(reservation.hold_until)}{" "}
                          {formatTime(reservation.hold_until)}
                        </div>
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
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 ml-1" />
                              تأكيد
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
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
                          >
                            <XCircle className="h-3.5 w-3.5 ml-1" />
                            إلغاء
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <CalendarCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-muted-foreground">
                        لا توجد حجوزات مطابقة للبحث
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                عرض {filtered.length} من {mockReservations.length} حجز
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
    </motion.div>
  );
}

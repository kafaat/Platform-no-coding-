import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  Plus,
  Globe,
  Smartphone,
  Store,
  Code2,
  Phone,
  PhoneCall,
  Package,
  Settings,
  SlidersHorizontal,
  X,
  Check,
  AlertTriangle,
  Search,
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
import type { Channel } from "@/types";

// ============================================================
// Types
// ============================================================

interface MockChannel extends Channel {
  enabled: boolean;
  product_count: number;
  feature_flags: Record<string, boolean>;
  limits: Record<string, number | string>;
}

// ============================================================
// Toast
// ============================================================

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${t.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
          >
            {t.type === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {t.message}
            <button onClick={() => onDismiss(t.id)} className="mr-2 hover:opacity-70" aria-label="إغلاق الإشعار"><X className="h-3 w-3" /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Channel Icons & Colors
// ============================================================

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  WEB: <Globe className="h-8 w-8" />,
  MOBILE: <Smartphone className="h-8 w-8" />,
  POS: <Store className="h-8 w-8" />,
  API: <Code2 className="h-8 w-8" />,
  USSD: <Phone className="h-8 w-8" />,
  IVR: <PhoneCall className="h-8 w-8" />,
};

const CHANNEL_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  WEB: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200", icon: "text-blue-600" },
  MOBILE: { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200", icon: "text-purple-600" },
  POS: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200", icon: "text-emerald-600" },
  API: { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200", icon: "text-orange-600" },
  USSD: { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200", icon: "text-rose-600" },
  IVR: { bg: "bg-teal-50", text: "text-teal-800", border: "border-teal-200", icon: "text-teal-600" },
};

const FEATURE_FLAG_LABELS: Record<string, string> = {
  show_price: "عرض السعر",
  show_stock: "عرض المخزون",
  allow_purchase: "السماح بالشراء",
  allow_reservation: "السماح بالحجز",
  show_reviews: "عرض التقييمات",
  enable_notifications: "تفعيل الإشعارات",
  allow_installments: "السماح بالتقسيط",
  enable_promotions: "تفعيل العروض",
};

const LIMIT_LABELS: Record<string, string> = {
  max_qty: "الحد الأقصى للكمية",
  min_qty: "الحد الأدنى للكمية",
  max_price: "الحد الأقصى للسعر",
  daily_limit: "الحد اليومي",
  monthly_limit: "الحد الشهري",
  currency: "العملة",
};

// ============================================================
// Mock Products for drill-down
// ============================================================

const MOCK_CHANNEL_PRODUCTS: Record<string, { id: number; name_ar: string; status: string }[]> = {
  WEB: [
    { id: 101, name_ar: "هاتف ذكي سامسونج A54", status: "ACTIVE" },
    { id: 102, name_ar: "لابتوب ديل انسبيرون", status: "ACTIVE" },
    { id: 103, name_ar: "جهاز لوحي آيباد", status: "DRAFT" },
  ],
  MOBILE: [
    { id: 101, name_ar: "هاتف ذكي سامسونج A54", status: "ACTIVE" },
    { id: 104, name_ar: "طابعة HP ليزر", status: "ACTIVE" },
  ],
  POS: [
    { id: 105, name_ar: "كاميرا كانون EOS", status: "ACTIVE" },
    { id: 106, name_ar: "سماعات بوز", status: "ACTIVE" },
    { id: 107, name_ar: "شاشة LG 27 بوصة", status: "ACTIVE" },
  ],
  API: [{ id: 108, name_ar: "خدمة API تكامل", status: "ACTIVE" }],
  USSD: [{ id: 109, name_ar: "رصيد هاتف", status: "ACTIVE" }],
  IVR: [{ id: 110, name_ar: "خدمة صوتية", status: "ACTIVE" }],
};

// ============================================================
// Mock Data
// ============================================================

const initialChannels: MockChannel[] = [
  { id: 1, code: "WEB", name_ar: "الويب", name_en: "Web", enabled: true, product_count: 128, feature_flags: { show_price: true, show_stock: true, allow_purchase: true, allow_reservation: true, show_reviews: true, enable_notifications: true }, limits: { max_qty: 100, min_qty: 1, max_price: 5000000, daily_limit: 500, currency: "YER" } },
  { id: 2, code: "MOBILE", name_ar: "الجوال", name_en: "Mobile App", enabled: true, product_count: 95, feature_flags: { show_price: true, show_stock: true, allow_purchase: true, allow_reservation: true, enable_notifications: true, enable_promotions: true }, limits: { max_qty: 50, min_qty: 1, max_price: 2000000, daily_limit: 200, currency: "YER" } },
  { id: 3, code: "POS", name_ar: "نقطة البيع", name_en: "Point of Sale", enabled: true, product_count: 210, feature_flags: { show_price: true, show_stock: true, allow_purchase: true, allow_installments: true }, limits: { max_qty: 500, min_qty: 1, max_price: 10000000, daily_limit: 1000, currency: "YER" } },
  { id: 4, code: "API", name_ar: "واجهة برمجية", name_en: "API Integration", enabled: true, product_count: 340, feature_flags: { show_price: true, show_stock: true, allow_purchase: true, allow_reservation: true, allow_installments: true, enable_promotions: true }, limits: { max_qty: 10000, daily_limit: 5000, monthly_limit: 100000, currency: "YER" } },
  { id: 5, code: "USSD", name_ar: "خدمة USSD", name_en: "USSD Service", enabled: false, product_count: 12, feature_flags: { show_price: true, allow_purchase: true }, limits: { max_qty: 10, min_qty: 1, daily_limit: 50, currency: "YER" } },
  { id: 6, code: "IVR", name_ar: "الرد الصوتي", name_en: "Interactive Voice Response", enabled: false, product_count: 8, feature_flags: { show_price: true, allow_reservation: true }, limits: { max_qty: 5, daily_limit: 30, currency: "YER" } },
];

// ============================================================
// Animation Variants
// ============================================================

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const cardVariants = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } } };

// ============================================================
// Helpers
// ============================================================

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />;
}

function simulateAsync<T>(result: T, delay = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(result), delay));
}

// ============================================================
// Channel Card Sub-component
// ============================================================

function ChannelCard({ channel, isSelected, onSelect, onToggle, saving }: {
  channel: MockChannel; isSelected: boolean; onSelect: () => void; onToggle: () => void; saving: boolean;
}) {
  const colors = CHANNEL_COLORS[channel.code] ?? CHANNEL_COLORS.WEB;
  const icon = CHANNEL_ICONS[channel.code] ?? <Radio className="h-8 w-8" />;
  return (
    <motion.div variants={cardVariants}>
      <Card className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary shadow-md" : ""} ${!channel.enabled ? "opacity-60" : ""}`} onClick={onSelect}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${colors.bg} ${colors.icon}`}>{icon}</div>
            <Switch
              checked={channel.enabled}
              disabled={saving}
              onCheckedChange={() => onToggle()}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="space-y-1 mb-4">
            <h3 className="font-bold text-lg">{channel.name_ar}</h3>
            <p className="text-sm text-muted-foreground">{channel.name_en}</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Package className="h-4 w-4" /><span>{channel.product_count.toLocaleString("ar-EG")} منتج</span>
            </div>
            <Badge variant="outline" className={channel.enabled ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}>
              {channel.enabled ? "مفعّل" : "معطّل"}
            </Badge>
          </div>
          <div className="mt-3 pt-3 border-t">
            <div className="flex flex-wrap gap-1">
              {Object.entries(channel.feature_flags).filter(([, v]) => v).slice(0, 3).map(([key]) => (
                <Badge key={key} variant="secondary" className="text-[10px] px-1.5 py-0">{FEATURE_FLAG_LABELS[key] ?? key}</Badge>
              ))}
              {Object.values(channel.feature_flags).filter(Boolean).length > 3 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">+{Object.values(channel.feature_flags).filter(Boolean).length - 3}</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================
// Channel Detail Panel
// ============================================================

function ChannelDetail({ channel, onClose, onToggleFlag, onUpdateLimit, onDrillDown, saving }: {
  channel: MockChannel; onClose: () => void;
  onToggleFlag: (channelId: number, flag: string) => void;
  onUpdateLimit: (channelId: number, key: string, value: number | string) => void;
  onDrillDown: (channelCode: string) => void;
  saving: boolean;
}) {
  const colors = CHANNEL_COLORS[channel.code] ?? CHANNEL_COLORS.WEB;
  const icon = CHANNEL_ICONS[channel.code] ?? <Radio className="h-8 w-8" />;
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${colors.bg} ${colors.icon}`}>{icon}</div>
          <div>
            <h3 className="text-lg font-bold">{channel.name_ar}</h3>
            <p className="text-sm text-muted-foreground">{channel.name_en}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="إغلاق تفاصيل القناة" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">رمز القناة</p>
          <code className="text-sm font-mono font-semibold">{channel.code}</code>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => onDrillDown(channel.code)}>
          <p className="text-xs text-muted-foreground mb-1">عدد المنتجات</p>
          <p className="text-sm font-semibold text-primary underline">{channel.product_count.toLocaleString("ar-EG")}</p>
        </div>
      </div>

      {/* Feature Flags */}
      <div>
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Settings className="h-4 w-4" />علامات الميزات</h4>
        <div className="space-y-2">
          {Object.entries(channel.feature_flags).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg border">
              <span className="text-sm">{FEATURE_FLAG_LABELS[key] ?? key}</span>
              <Switch checked={value} disabled={saving} onCheckedChange={() => onToggleFlag(channel.id, key)} />
            </div>
          ))}
        </div>
      </div>

      {/* Limits */}
      <div>
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" />حدود القناة</h4>
        <div className="space-y-2">
          {Object.entries(channel.limits).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg border">
              <span className="text-sm">{LIMIT_LABELS[key] ?? key}</span>
              {typeof value === "number" ? (
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => onUpdateLimit(channel.id, key, Number(e.target.value))}
                  className="w-32 h-8 text-sm text-left font-mono"
                />
              ) : (
                <Input value={String(value)} readOnly className="w-32 h-8 text-sm text-left font-mono" />
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function ChannelsScreen() {
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<MockChannel[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Add channel dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newChannel, setNewChannel] = useState({ code: "", name_ar: "", name_en: "" });

  // Product drill-down dialog
  const [drillDownDialog, setDrillDownDialog] = useState<{ open: boolean; channelCode: string }>({ open: false, channelCode: "" });

  // Disable confirmation
  const [disableDialog, setDisableDialog] = useState<{ open: boolean; channelId: number; name: string }>({ open: false, channelId: 0, name: "" });

  const addToast = useCallback((message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const dismissToast = useCallback((id: number) => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, []);

  useEffect(() => {
    const timer = setTimeout(() => { setChannels(initialChannels); setLoading(false); }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredChannels = channels.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (c.name_ar ?? "").includes(searchTerm) || (c.name_en ?? "").toLowerCase().includes(term) || c.code.toLowerCase().includes(term);
  });

  const selectedChannel = channels.find((c) => c.id === selectedId) ?? null;
  const activeCount = channels.filter((c) => c.enabled).length;
  const totalProducts = channels.reduce((sum, c) => sum + c.product_count, 0);

  async function handleToggle(channelId: number) {
    const ch = channels.find((c) => c.id === channelId);
    if (!ch) return;
    // If disabling, show confirmation
    if (ch.enabled) {
      setDisableDialog({ open: true, channelId, name: ch.name_ar ?? ch.code });
      return;
    }
    // Enable immediately with async simulation
    setSaving(true);
    try {
      await simulateAsync(null, 400);
      setChannels((prev) => prev.map((c) => c.id === channelId ? { ...c, enabled: true } : c));
      addToast(`تم تفعيل القناة ${ch.name_ar}`, "success");
    } catch { addToast("فشل في تفعيل القناة", "error"); } finally { setSaving(false); }
  }

  async function handleConfirmDisable() {
    setSaving(true);
    try {
      await simulateAsync(null, 400);
      setChannels((prev) => prev.map((c) => c.id === disableDialog.channelId ? { ...c, enabled: false } : c));
      setDisableDialog({ open: false, channelId: 0, name: "" });
      addToast("تم تعطيل القناة بنجاح", "success");
    } catch { addToast("فشل في تعطيل القناة", "error"); } finally { setSaving(false); }
  }

  function handleToggleFlag(channelId: number, flag: string) {
    setChannels((prev) =>
      prev.map((c) => c.id === channelId ? { ...c, feature_flags: { ...c.feature_flags, [flag]: !c.feature_flags[flag] } } : c)
    );
    addToast("تم تحديث علامة الميزة", "success");
  }

  function handleUpdateLimit(channelId: number, key: string, value: number | string) {
    setChannels((prev) =>
      prev.map((c) => c.id === channelId ? { ...c, limits: { ...c.limits, [key]: value } } : c)
    );
  }

  async function handleAddChannel() {
    if (!newChannel.code || !newChannel.name_ar) { addToast("يرجى ملء جميع الحقول المطلوبة", "error"); return; }
    setSaving(true);
    try {
      const created = await simulateAsync<MockChannel>({
        id: Math.max(0, ...channels.map((c) => c.id)) + 1,
        code: newChannel.code.toUpperCase(),
        name_ar: newChannel.name_ar,
        name_en: newChannel.name_en,
        enabled: true,
        product_count: 0,
        feature_flags: { show_price: true, allow_purchase: true },
        limits: { max_qty: 100, min_qty: 1, daily_limit: 100, currency: "YER" },
      });
      setChannels((prev) => [...prev, created]);
      setAddDialogOpen(false);
      setNewChannel({ code: "", name_ar: "", name_en: "" });
      addToast("تم إضافة القناة بنجاح", "success");
    } catch { addToast("فشل في إضافة القناة", "error"); } finally { setSaving(false); }
  }

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Radio className="h-6 w-6" />القنوات</h1>
          <p className="text-muted-foreground mt-1">إدارة قنوات التوزيع وربط المنتجات بالقنوات</p>
        </div>
        <Button size="sm" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-1" />إضافة قناة
        </Button>
      </div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? [1, 2, 3].map((i) => <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>) : (
          <>
            <Card className="hover:shadow-md transition-shadow"><CardContent className="p-5"><div className="flex items-start justify-between"><div className="space-y-1"><p className="text-sm text-muted-foreground font-medium">إجمالي القنوات</p><p className="text-2xl font-bold">{channels.length.toLocaleString("ar-EG")}</p></div><div className="p-3 rounded-lg bg-blue-50 text-blue-600"><Radio className="h-5 w-5" /></div></div></CardContent></Card>
            <Card className="hover:shadow-md transition-shadow"><CardContent className="p-5"><div className="flex items-start justify-between"><div className="space-y-1"><p className="text-sm text-muted-foreground font-medium">القنوات المفعّلة</p><p className="text-2xl font-bold">{activeCount.toLocaleString("ar-EG")}</p></div><div className="p-3 rounded-lg bg-emerald-50 text-emerald-600"><Globe className="h-5 w-5" /></div></div></CardContent></Card>
            <Card className="hover:shadow-md transition-shadow"><CardContent className="p-5"><div className="flex items-start justify-between"><div className="space-y-1"><p className="text-sm text-muted-foreground font-medium">إجمالي المنتجات المرتبطة</p><p className="text-2xl font-bold">{totalProducts.toLocaleString("ar-EG")}</p></div><div className="p-3 rounded-lg bg-purple-50 text-purple-600"><Package className="h-5 w-5" /></div></div></CardContent></Card>
          </>
        )}
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants}>
        <Card><CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث في القنوات..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-9" />
          </div>
        </CardContent></Card>
      </motion.div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className={selectedChannel ? "lg:col-span-2" : "lg:col-span-3"}>
          {loading ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => <Card key={i}><CardContent className="p-5"><Skeleton className="h-40 w-full" /></CardContent></Card>)}
            </div>
          ) : (
            <div className={`grid gap-4 ${selectedChannel ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"}`}>
              {filteredChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  isSelected={selectedId === channel.id}
                  onSelect={() => setSelectedId(selectedId === channel.id ? null : channel.id)}
                  onToggle={() => handleToggle(channel.id)}
                  saving={saving}
                />
              ))}
              {filteredChannels.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Search className="h-10 w-10 mb-3 opacity-30" />
                  <p className="text-sm">لا توجد قنوات مطابقة للبحث</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {selectedChannel && (
            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4" />تفاصيل القناة</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChannelDetail
                    channel={selectedChannel}
                    onClose={() => setSelectedId(null)}
                    onToggleFlag={handleToggleFlag}
                    onUpdateLimit={handleUpdateLimit}
                    onDrillDown={(code) => setDrillDownDialog({ open: true, channelCode: code })}
                    saving={saving}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== Dialogs ===== */}

      {/* Add Channel Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />إضافة قناة جديدة</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">رمز القناة *</label>
              <Input placeholder="مثال: WHATSAPP" value={newChannel.code} onChange={(e) => setNewChannel((p) => ({ ...p, code: e.target.value.toUpperCase() }))} className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">الاسم بالعربية *</label>
              <Input placeholder="مثال: واتساب" value={newChannel.name_ar} onChange={(e) => setNewChannel((p) => ({ ...p, name_ar: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">الاسم بالإنجليزية</label>
              <Input placeholder="مثال: WhatsApp" value={newChannel.name_en} onChange={(e) => setNewChannel((p) => ({ ...p, name_en: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
            <Button onClick={handleAddChannel} disabled={saving}>
              {saving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Channel Confirmation */}
      <Dialog open={disableDialog.open} onOpenChange={(open) => setDisableDialog((p) => ({ ...p, open }))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" />تأكيد تعطيل القناة</DialogTitle></DialogHeader>
          <p className="text-sm py-2">هل أنت متأكد من تعطيل قناة <span className="font-bold">{disableDialog.name}</span>؟ لن تظهر المنتجات عبر هذه القناة بعد التعطيل.</p>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
            <Button variant="destructive" onClick={handleConfirmDisable} disabled={saving}>
              {saving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : "تعطيل"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Drill-Down Dialog */}
      <Dialog open={drillDownDialog.open} onOpenChange={(open) => setDrillDownDialog((p) => ({ ...p, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Package className="h-5 w-5" />منتجات القناة: {drillDownDialog.channelCode}</DialogTitle></DialogHeader>
          <div className="space-y-2 py-2 max-h-60 overflow-y-auto">
            {(MOCK_CHANNEL_PRODUCTS[drillDownDialog.channelCode] ?? []).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">{p.name_ar}</p>
                  <p className="text-xs text-muted-foreground font-mono">#{p.id}</p>
                </div>
                <Badge variant="outline" className={p.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>{p.status === "ACTIVE" ? "نشط" : "مسودة"}</Badge>
              </div>
            ))}
            {(MOCK_CHANNEL_PRODUCTS[drillDownDialog.channelCode] ?? []).length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">لا توجد منتجات مرتبطة</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">إغلاق</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

import { useState } from "react";
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
  ChevronLeft,
  Edit3,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  WEB: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    icon: "text-blue-600",
  },
  MOBILE: {
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-200",
    icon: "text-purple-600",
  },
  POS: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    icon: "text-emerald-600",
  },
  API: {
    bg: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-200",
    icon: "text-orange-600",
  },
  USSD: {
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    icon: "text-rose-600",
  },
  IVR: {
    bg: "bg-teal-50",
    text: "text-teal-800",
    border: "border-teal-200",
    icon: "text-teal-600",
  },
};

// ============================================================
// Feature Flag Labels
// ============================================================

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
// Mock Data (matches seed.sql channels)
// ============================================================

const mockChannels: MockChannel[] = [
  {
    id: 1,
    code: "WEB",
    name_ar: "الويب",
    name_en: "Web",
    enabled: true,
    product_count: 128,
    feature_flags: {
      show_price: true,
      show_stock: true,
      allow_purchase: true,
      allow_reservation: true,
      show_reviews: true,
      enable_notifications: true,
    },
    limits: {
      max_qty: 100,
      min_qty: 1,
      max_price: 5000000,
      daily_limit: 500,
      currency: "YER",
    },
  },
  {
    id: 2,
    code: "MOBILE",
    name_ar: "الجوال",
    name_en: "Mobile App",
    enabled: true,
    product_count: 95,
    feature_flags: {
      show_price: true,
      show_stock: true,
      allow_purchase: true,
      allow_reservation: true,
      enable_notifications: true,
      enable_promotions: true,
    },
    limits: {
      max_qty: 50,
      min_qty: 1,
      max_price: 2000000,
      daily_limit: 200,
      currency: "YER",
    },
  },
  {
    id: 3,
    code: "POS",
    name_ar: "نقطة البيع",
    name_en: "Point of Sale",
    enabled: true,
    product_count: 210,
    feature_flags: {
      show_price: true,
      show_stock: true,
      allow_purchase: true,
      allow_installments: true,
    },
    limits: {
      max_qty: 500,
      min_qty: 1,
      max_price: 10000000,
      daily_limit: 1000,
      currency: "YER",
    },
  },
  {
    id: 4,
    code: "API",
    name_ar: "واجهة برمجية",
    name_en: "API Integration",
    enabled: true,
    product_count: 340,
    feature_flags: {
      show_price: true,
      show_stock: true,
      allow_purchase: true,
      allow_reservation: true,
      allow_installments: true,
      enable_promotions: true,
    },
    limits: {
      max_qty: 10000,
      daily_limit: 5000,
      monthly_limit: 100000,
      currency: "YER",
    },
  },
  {
    id: 5,
    code: "USSD",
    name_ar: "خدمة USSD",
    name_en: "USSD Service",
    enabled: false,
    product_count: 12,
    feature_flags: {
      show_price: true,
      allow_purchase: true,
    },
    limits: {
      max_qty: 10,
      min_qty: 1,
      daily_limit: 50,
      currency: "YER",
    },
  },
  {
    id: 6,
    code: "IVR",
    name_ar: "الرد الصوتي",
    name_en: "Interactive Voice Response",
    enabled: false,
    product_count: 8,
    feature_flags: {
      show_price: true,
      allow_reservation: true,
    },
    limits: {
      max_qty: 5,
      daily_limit: 30,
      currency: "YER",
    },
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

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

// ============================================================
// Channel Card Sub-component
// ============================================================

function ChannelCard({
  channel,
  isSelected,
  onSelect,
  onToggle,
}: {
  channel: MockChannel;
  isSelected: boolean;
  onSelect: () => void;
  onToggle: () => void;
}) {
  const colors = CHANNEL_COLORS[channel.code] ?? CHANNEL_COLORS.WEB;
  const icon = CHANNEL_ICONS[channel.code] ?? <Radio className="h-8 w-8" />;

  return (
    <motion.div variants={cardVariants}>
      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected ? "ring-2 ring-primary shadow-md" : ""
        } ${!channel.enabled ? "opacity-60" : ""}`}
        onClick={onSelect}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${colors.bg} ${colors.icon}`}>
              {icon}
            </div>
            <Switch
              checked={channel.enabled}
              onCheckedChange={(e) => {
                e;
                onToggle();
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="space-y-1 mb-4">
            <h3 className="font-bold text-lg">{channel.name_ar}</h3>
            <p className="text-sm text-muted-foreground">{channel.name_en}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{channel.product_count} منتج</span>
            </div>
            <Badge
              variant="outline"
              className={
                channel.enabled
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-gray-100 text-gray-600 border-gray-200"
              }
            >
              {channel.enabled ? "مفعّل" : "معطّل"}
            </Badge>
          </div>

          <div className="mt-3 pt-3 border-t">
            <div className="flex flex-wrap gap-1">
              {Object.entries(channel.feature_flags)
                .filter(([, v]) => v)
                .slice(0, 3)
                .map(([key]) => (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {FEATURE_FLAG_LABELS[key] ?? key}
                  </Badge>
                ))}
              {Object.values(channel.feature_flags).filter(Boolean).length > 3 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  +{Object.values(channel.feature_flags).filter(Boolean).length - 3}
                </Badge>
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

function ChannelDetail({
  channel,
  onClose,
}: {
  channel: MockChannel;
  onClose: () => void;
}) {
  const colors = CHANNEL_COLORS[channel.code] ?? CHANNEL_COLORS.WEB;
  const icon = CHANNEL_ICONS[channel.code] ?? <Radio className="h-8 w-8" />;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Detail Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${colors.bg} ${colors.icon}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-bold">{channel.name_ar}</h3>
            <p className="text-sm text-muted-foreground">{channel.name_en}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit3 className="h-4 w-4 ml-1" />
            تعديل
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Channel Info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">رمز القناة</p>
          <code className="text-sm font-mono font-semibold">{channel.code}</code>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">عدد المنتجات</p>
          <p className="text-sm font-semibold">{channel.product_count}</p>
        </div>
      </div>

      {/* Feature Flags */}
      <div>
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Settings className="h-4 w-4" />
          علامات الميزات
        </h4>
        <div className="space-y-2">
          {Object.entries(channel.feature_flags).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg border"
            >
              <span className="text-sm">
                {FEATURE_FLAG_LABELS[key] ?? key}
              </span>
              <Switch checked={value} />
            </div>
          ))}
        </div>
      </div>

      {/* Limits Configuration */}
      <div>
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          حدود القناة
        </h4>
        <div className="space-y-2">
          {Object.entries(channel.limits).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg border"
            >
              <span className="text-sm">
                {LIMIT_LABELS[key] ?? key}
              </span>
              <Input
                value={typeof value === "number" ? value.toLocaleString("ar-EG") : String(value)}
                readOnly
                className="w-32 h-8 text-sm text-left font-mono"
              />
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
  const [channels, setChannels] = useState<MockChannel[]>(mockChannels);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selectedChannel = channels.find((c) => c.id === selectedId) ?? null;

  const handleToggle = (channelId: number) => {
    setChannels((prev) =>
      prev.map((c) =>
        c.id === channelId ? { ...c, enabled: !c.enabled } : c
      )
    );
  };

  const activeCount = channels.filter((c) => c.enabled).length;
  const totalProducts = channels.reduce((sum, c) => sum + c.product_count, 0);

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
            <Radio className="h-6 w-6" />
            القنوات
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة قنوات التوزيع وربط المنتجات بالقنوات
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 ml-1" />
          إضافة قناة
        </Button>
      </div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">إجمالي القنوات</p>
                <p className="text-2xl font-bold">{channels.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <Radio className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">القنوات المفعّلة</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                <Globe className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">إجمالي المنتجات المرتبطة</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Layout: Cards Grid + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Channel Cards Grid */}
        <motion.div
          variants={itemVariants}
          className={selectedChannel ? "lg:col-span-2" : "lg:col-span-3"}
        >
          <div
            className={`grid gap-4 ${
              selectedChannel
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
            }`}
          >
            {channels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                isSelected={selectedId === channel.id}
                onSelect={() =>
                  setSelectedId(selectedId === channel.id ? null : channel.id)
                }
                onToggle={() => handleToggle(channel.id)}
              />
            ))}
          </div>
        </motion.div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedChannel && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="lg:col-span-1"
            >
              <Card className="sticky top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    تفاصيل القناة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChannelDetail
                    channel={selectedChannel}
                    onClose={() => setSelectedId(null)}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

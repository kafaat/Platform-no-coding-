import { Bell, Search, Moon, Sun, Globe, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";

interface HeaderBarProps {
  sidebarCollapsed: boolean;
}

export default function HeaderBar({ sidebarCollapsed }: HeaderBarProps) {
  const { darkMode, setDarkMode, locale, setLocale } = useApp();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleLang = () => {
    setLocale(locale === "ar" ? "en" : "ar");
  };

  return (
    <header
      className="fixed top-0 left-0 h-16 bg-card/80 backdrop-blur-sm border-b border-border z-30 flex items-center justify-between px-6 transition-all duration-200"
      style={{ right: sidebarCollapsed ? 64 : 260 }}
    >
      {/* Search */}
      <div className="relative w-72">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          placeholder={locale === "ar" ? "بحث..." : "Search..."}
          className="pr-10 h-9 text-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleLang} className="h-9 w-9" title={locale === "ar" ? "English" : "العربية"}>
          <Globe size={16} />
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="h-9 w-9" title={darkMode ? "الوضع الفاتح" : "الوضع الداكن"}>
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </Button>

        <Button variant="ghost" size="icon" className="relative h-9 w-9" title="الإشعارات">
          <Bell size={16} />
          <Badge className="absolute -top-1 -left-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]" variant="destructive">
            3
          </Badge>
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button variant="ghost" className="h-9 gap-2 px-2">
          <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
            <User size={14} className="text-primary-foreground" />
          </div>
          <span className="text-sm font-medium">المسؤول</span>
        </Button>
      </div>
    </header>
  );
}

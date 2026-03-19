"use client";

import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Home, TrendingUp, GraduationCap, Gamepad2, Swords, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => {
      // Detect mobile: touch support + narrow viewport, or userAgent
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isNarrow = window.innerWidth <= 500;
      setIsMobile(hasTouch && isNarrow);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export function MobileLayout({ children, className }: LayoutProps) {
  const { theme, toggle } = useTheme();
  const isMobile = useIsMobile();

  if (isMobile) {
    // On real phones: no frame, full viewport, fixed to screen
    return (
      <div
        className={cn(
          "w-full bg-background overflow-hidden relative flex flex-col",
          className
        )}
        style={{ height: "100dvh" }}
      >
        {/* Slim status bar with just theme toggle */}
        <div className="h-6 bg-background flex justify-end items-center px-4 shrink-0 z-50">
          <button
            onClick={toggle}
            className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors active:scale-90"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? <Moon size={12} /> : <Sun size={12} />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // On desktop: iPhone frame
  return (
    <div className="min-h-screen w-full flex justify-center items-center p-4 font-sans bg-muted">
      <div
        className={cn(
          "w-full max-w-[375px] h-[812px] bg-background shadow-2xl overflow-hidden relative flex flex-col rounded-[30px] border-8 border-primary",
          className
        )}
      >
        {/* Status Bar */}
        <div className="h-8 bg-background flex justify-between items-center px-6 text-xs font-medium text-muted-foreground shrink-0 z-50">
          <span>09:41</span>
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors active:scale-90"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? <Moon size={12} /> : <Sun size={12} />}
            </button>
            <div className="w-6 h-3 rounded-sm border border-muted-foreground/40 relative">
              <div className="absolute inset-[1px] right-[2px] bg-muted-foreground/60 rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ScreenHeader({
  title,
  onBack,
  rightAction,
  className,
  variant = "light",
}: {
  title?: string;
  onBack?: () => void;
  rightAction?: ReactNode;
  className?: string;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";
  return (
    <div className={cn("h-14 px-4 flex items-center justify-between shrink-0", isDark ? "bg-card" : "bg-background", className)}>
      <div className="flex items-center gap-4">
        {onBack && (
          <button onClick={onBack} className="text-primary" title="Back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}
        {title && (
          <h1 className={cn("text-lg font-bold", isDark ? "text-card-foreground" : "text-foreground")}>
            {title}
          </h1>
        )}
      </div>
      {rightAction}
    </div>
  );
}

export function PFButton({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline";
}) {
  return (
    <button
      className={cn(
        "w-full py-3.5 rounded-xl font-bold text-[15px] transition-all active:scale-[0.98]",
        variant === "primary" && "bg-primary text-primary-foreground hover:brightness-90 shadow-sm",
        variant === "secondary" && "bg-secondary text-secondary-foreground hover:brightness-90 shadow-sm",
        variant === "outline" && "bg-transparent border-2 border-primary text-primary",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function BottomNav({
  activeTab,
  onNavigate,
  onProfessorClick,
}: {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onProfessorClick?: () => void;
}) {
  return (
    <div className="h-20 bg-card border-t border-border flex justify-around items-end pb-2 text-[10px] font-medium text-muted-foreground shrink-0 z-20 relative">
      <NavItem icon={<Home size={24} />} label="Home" active={activeTab === "dashboard"} onClick={() => onNavigate("dashboard")} />
      <NavItem icon={<TrendingUp size={24} />} label="Future" active={activeTab === "future_engine"} onClick={() => onNavigate("future_engine")} />

      {/* Central Professor Button */}
      <div className="relative -top-6">
        <button
          onClick={onProfessorClick}
          className="w-16 h-16 bg-card rounded-full flex items-center justify-center pf-glow-sm border-4 border-background active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <GraduationCap size={24} className="text-primary-foreground" />
          </div>
        </button>
      </div>

      <NavItem
        icon={<Gamepad2 size={24} />}
        label="Solo"
        active={activeTab === "solo"}
        onClick={() => onNavigate("solo")}
      />
      <NavItem icon={<Swords size={24} />} label="Arena" active={activeTab === "arena"} onClick={() => onNavigate("arena")} />
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 w-1/5 py-2 transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

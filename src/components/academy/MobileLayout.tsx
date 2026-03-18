"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Home, Target, GraduationCap, User, BookOpen } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export function MobileLayout({ children, className }: LayoutProps) {
  return (
    <div className="min-h-screen w-full flex justify-center items-center p-4 font-sans bg-[#E8E6E1]">
      <div
        className={cn(
          "w-full max-w-[393px] h-[852px] bg-background shadow-2xl overflow-hidden relative flex flex-col rounded-[50px] border-[6px] border-[#1A2332]",
          className
        )}
      >
        {/* Status Bar */}
        <div className="h-12 bg-background flex justify-between items-center px-8 text-xs font-semibold text-foreground shrink-0 z-50">
          <span>09:41</span>
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[120px] h-[34px] bg-[#1A2332] rounded-full" />
          <div className="flex gap-1.5 items-center">
            <div className="w-4 h-2.5 rounded-sm border border-foreground/40 relative">
              <div className="absolute inset-[1px] right-[2px] bg-foreground/60 rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* Content Area */}
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
    <div
      className={cn(
        "h-14 px-5 flex items-center justify-between shrink-0",
        isDark ? "bg-[#1A2332]" : "bg-background",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className={cn(
              "transition-colors",
              isDark ? "text-[#FFC800]" : "text-[#FFC800]"
            )}
            title="Back"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}
        {title && (
          <h1
            className={cn(
              "text-lg font-bold",
              isDark ? "text-white" : "text-foreground"
            )}
          >
            {title}
          </h1>
        )}
      </div>
      {rightAction}
    </div>
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
    <div className="h-20 bg-white border-t border-border flex justify-around items-end pb-2 text-[10px] font-medium text-muted-foreground shrink-0 z-20 relative">
      <NavItem
        icon={<Home size={22} />}
        label="Home"
        active={activeTab === "dashboard"}
        onClick={() => onNavigate("dashboard")}
      />
      <NavItem
        icon={<Target size={22} />}
        label="Missions"
        active={activeTab === "missions"}
        onClick={() => onNavigate("missions")}
      />

      {/* Central Professor Button */}
      <div className="relative -top-6">
        <button
          onClick={onProfessorClick}
          className="w-16 h-16 bg-white rounded-full flex items-center justify-center pf-glow-sm border-4 border-background active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-[#FFC800] to-[#E6B400] rounded-full flex items-center justify-center">
            <GraduationCap size={24} className="text-[#1A2332]" />
          </div>
        </button>
      </div>

      <NavItem
        icon={<BookOpen size={22} />}
        label="Learn"
        active={activeTab === "learn"}
        onClick={() => onNavigate("learn")}
      />
      <NavItem
        icon={<User size={22} />}
        label="Profile"
        active={activeTab === "profile"}
        onClick={() => onNavigate("profile")}
      />
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 w-1/5 py-2 transition-colors",
        active ? "text-[#FFC800]" : "text-gray-400 hover:text-gray-600"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

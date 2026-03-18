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
    <div className="min-h-screen w-full flex justify-center items-center p-4 font-sans bg-white">
      <div
        className={cn(
          "w-full max-w-[375px] h-[812px] bg-[#F3F3F3] shadow-2xl overflow-hidden relative flex flex-col rounded-[30px] border-8 border-[#FFC800]",
          className
        )}
      >
        {/* Status Bar Mockup */}
        <div className="h-8 bg-[#F3F3F3] flex justify-between items-center px-6 text-xs font-medium text-gray-500 shrink-0 z-50">
          <span>09:41</span>
          <div className="flex gap-1.5">
            <div className="w-4 h-4 rounded-full bg-gray-300/50" />
            <div className="w-4 h-4 rounded-full bg-gray-300/50" />
            <div className="w-6 h-3 rounded-sm bg-gray-400/50" />
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
    <div className={cn("h-14 px-4 flex items-center justify-between shrink-0", isDark ? "bg-[#333333]" : "bg-[#F3F3F3]", className)}>
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className={cn("text-[#FFC800]", isDark && "text-[#FFC800]")}
            title="Back"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}
        {title && (
          <h1 className={cn("text-lg font-bold", isDark ? "text-white" : "text-[#333333]")}>
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
        variant === "primary" && "bg-[#FFC800] text-[#333333] hover:bg-[#E6B400] shadow-sm",
        variant === "secondary" && "bg-[#33307E] text-white hover:bg-[#282668] shadow-sm",
        variant === "outline" && "bg-transparent border-2 border-[#FFC800] text-[#FFC800]",
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
    <div className="h-20 bg-white border-t border-gray-200 flex justify-around items-end pb-2 text-[10px] font-medium text-gray-500 shrink-0 z-20 relative">
      <NavItem
        icon={<Home size={24} />}
        label="Home"
        active={activeTab === "dashboard"}
        onClick={() => onNavigate("dashboard")}
      />
      <NavItem
        icon={<Target size={24} />}
        label="Missions"
        active={activeTab === "missions"}
        onClick={() => onNavigate("missions")}
      />

      {/* Central Professor Button */}
      <div className="relative -top-6">
        <button
          onClick={onProfessorClick}
          className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(255,200,0,0.3)] border-4 border-[#F3F3F3] active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 bg-[#FFC800] rounded-full flex items-center justify-center">
            <GraduationCap size={24} className="text-[#333333]" />
          </div>
        </button>
      </div>

      <NavItem
        icon={<BookOpen size={24} />}
        label="Learn"
        active={activeTab === "learn"}
        onClick={() => onNavigate("learn")}
      />
      <NavItem
        icon={<User size={24} />}
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
        "flex flex-col items-center gap-1 w-1/5 py-2",
        active ? "text-[#FFC800]" : "text-gray-400 hover:text-gray-600"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

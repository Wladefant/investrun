'use client';

import { motion } from 'framer-motion';
import { Home, TrendingUp, Gamepad2, Swords, MessageCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { TabId } from '@/types';

const NAV_ITEMS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'future', label: 'Future', icon: TrendingUp },
  { id: 'solo', label: 'Solo', icon: Gamepad2 },
  { id: 'arena', label: 'Arena', icon: Swords },
  { id: 'coach', label: 'Coach', icon: MessageCircle },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useAppStore();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50">
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="relative flex flex-col items-center justify-center py-2 px-4 min-w-[64px]"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <Icon 
                className={`w-5 h-5 relative z-10 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`} 
              />
              <span 
                className={`text-[10px] mt-1 relative z-10 transition-colors ${
                  isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

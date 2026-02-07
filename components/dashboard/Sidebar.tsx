"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Rocket, Trophy, User, LogOut, Settings } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  { href: "/protected", icon: <Home className="w-5 h-5" />, label: "Feed" },
  {
    href: "/protected/nominate",
    icon: <Rocket className="w-5 h-5" />,
    label: "Nominate",
  },
  {
    href: "/protected/leaderboard",
    icon: <Trophy className="w-5 h-5" />,
    label: "Leaderboard",
  },
  {
    href: "/protected/profile",
    icon: <User className="w-5 h-5" />,
    label: "Profile",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser } = useAppStore();

  const xpToNextLevel = 1000;
  const currentXp = currentUser?.xp || 0;
  const xpProgress = ((currentXp % xpToNextLevel) / xpToNextLevel) * 100;

  return (
    <aside className="w-64 h-screen sticky top-0 glass-sidebar flex flex-col">
      {/* Background gradient blob */}
      <div className="absolute -left-20 top-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 bottom-40 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Logo */}
      <div className="p-6 relative">
        <Link href="/protected" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-button flex items-center justify-center">
            <span className="text-xl">✨</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">UNIFY</h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 relative">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/protected" && pathname === "/protected");

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${
                      isActive
                        ? "bg-purple-600/20 text-purple-400 border border-purple-500/30 glow-purple"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      {currentUser && (
        <div className="p-4 border-t border-white/10 relative">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full border-2 border-purple-500/50"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
                  {currentUser.level}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-400">
                  Lvl {currentUser.level} • {currentUser.xp} XP
                </p>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-3">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full gradient-button rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {currentXp % xpToNextLevel}/{xpToNextLevel} XP to next level
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-3">
            <Link
              href="/protected/settings"
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
            >
              <Settings className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/login"
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Rocket, User, LogOut, Shield, ChevronDown, Award, Users } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  adminOnly?: boolean;
}

interface AdminSubItem {
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
    href: "/protected/profile",
    icon: <User className="w-5 h-5" />,
    label: "Profile",
  },
];

const adminSubItems: AdminSubItem[] = [
  {
    href: "/protected/admin",
    icon: <Award className="w-4 h-4" />,
    label: "Nominations",
  },
  {
    href: "/protected/admin/users",
    icon: <Users className="w-4 h-4" />,
    label: "Users",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { currentProfile } = useAppStore();
  const [adminOpen, setAdminOpen] = useState(pathname?.startsWith("/protected/admin") || false);

  const isAdmin = currentProfile?.job_title?.toLowerCase() === "admin";
  const isAdminPage = pathname?.startsWith("/protected/admin") || false;

  const kudosBalance = currentProfile?.kudos_balance || 0;

  return (
    <aside className="w-64 h-screen sticky top-0 glass-sidebar flex flex-col">
      {/* Subtle background gradient */}
      <div className="absolute -left-20 top-20 w-64 h-64 bg-purple-100 rounded-full blur-3xl pointer-events-none opacity-50" />
      <div className="absolute -left-10 bottom-40 w-48 h-48 bg-purple-50 rounded-full blur-3xl pointer-events-none opacity-50" />

      {/* Logo */}
      <div className="px-5 py-6 relative">
        <Link href="/protected" className="group flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Unifying Services"
            className="w-12 h-12 object-contain drop-shadow-sm"
          />
          <span className="text-lg font-bold bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent tracking-tight">Unifying Services</span>
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
                        ? "bg-purple-100 text-purple-700 border border-purple-200 shadow-sm"
                        : "text-gray-600 hover:text-purple-700 hover:bg-purple-50"
                    }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}

          {/* Admin Dropdown (only visible for admins) */}
          {isAdmin && (
            <li>
              <button
                onClick={() => setAdminOpen(!adminOpen)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${
                    isAdminPage
                      ? "bg-purple-100 text-purple-700 border border-purple-200 shadow-sm"
                      : "text-gray-600 hover:text-purple-700 hover:bg-purple-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Admin</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    adminOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Sub-items */}
              {adminOpen && (
                <ul className="mt-2 ml-4 space-y-1 border-l border-gray-200 pl-4">
                  {adminSubItems.map((subItem) => {
                    const isSubActive = pathname === subItem.href;

                    return (
                      <li key={subItem.href}>
                        <Link
                          href={subItem.href}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200
                            ${
                              isSubActive
                                ? "bg-purple-100 text-purple-700"
                                : "text-gray-600 hover:text-purple-700 hover:bg-purple-50"
                            }`}
                        >
                          {subItem.icon}
                          <span>{subItem.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          )}
        </ul>
      </nav>

      {/* User Profile Section */}
      {currentProfile && (
        <div className="p-4 border-t border-gray-200 relative">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={currentProfile.avatar_url}
                  alt={currentProfile.username}
                  className="w-12 h-12 rounded-full border-2 border-purple-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {currentProfile.username}
                </p>
                <p className="text-xs text-gray-500">
                  {kudosBalance} Kudos
                </p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="mt-3">
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 py-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}

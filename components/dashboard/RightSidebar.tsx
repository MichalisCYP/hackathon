"use client";

import React, { useState, useEffect } from "react";
import { Trophy, TrendingUp, Star, Rocket, Users, Heart, Zap } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { usePathname } from "next/navigation";

export function RightSidebar() {
  const { profiles, nominations, badges } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide on profile page
  if (pathname === "/protected/profile") {
    return null;
  }

  // Calculate top performers
  const topPerformers = profiles
    .map((user) => ({
      ...user,
      recognitionsReceived: nominations.filter(
        (n) => n.receiver_id === user.id && n.status === "approved",
      ).length,
    }))
    .sort((a, b) => b.recognitionsReceived - a.recognitionsReceived)
    .slice(0, 3);

  // Company values with icons (compact)
  const companyValues = [
    { name: "Innovation", icon: <Rocket className="w-3.5 h-3.5" />, color: "text-purple-600", bg: "bg-purple-100" },
    { name: "Teamwork", icon: <Users className="w-3.5 h-3.5" />, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Customer Focus", icon: <Heart className="w-3.5 h-3.5" />, color: "text-pink-600", bg: "bg-pink-100" },
    { name: "Excellence", icon: <Star className="w-3.5 h-3.5" />, color: "text-amber-600", bg: "bg-amber-100" },
    { name: "Speed", icon: <Zap className="w-3.5 h-3.5" />, color: "text-green-600", bg: "bg-green-100" },
  ];

  return (
    <aside className="hidden xl:block w-72 h-[calc(100vh-4rem)] sticky top-16 px-4 py-4 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute right-0 top-20 w-48 h-48 bg-purple-100 rounded-full blur-3xl pointer-events-none opacity-40" />

      <div className="space-y-4 relative h-full flex flex-col">
        {/* Top Performers */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Top Performers</h3>
          </div>

          <div className="space-y-2">
            {topPerformers.map((user, index) => (
              <div
                key={user.id}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <div className="relative">
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div
                    className={`absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                    ${
                      index === 0
                        ? "bg-yellow-500 text-yellow-900"
                        : index === 1
                          ? "bg-gray-300 text-gray-800"
                          : "bg-amber-600 text-amber-100"
                    }`}
                  >
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-500">{user.department}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-semibold text-purple-600">
                    {user.recognitionsReceived}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">This Week</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {nominations.filter((n) => n.status === "approved").length}
              </p>
              <p className="text-xs text-gray-500">Celebrations</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{profiles.length}</p>
              <p className="text-xs text-gray-500">Team Members</p>
            </div>
          </div>
        </div>

        {/* Company Values - Compact */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Company Values</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {companyValues.map((value) => (
              <div
                key={value.name}
                title={value.name}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${value.bg} ${value.color} text-xs font-medium`}
              >
                {value.icon}
                <span>{value.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Nominations - at bottom */}
        <div className="glass-card p-4 border-orange-200 mt-auto">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Pending Approval
            </h3>
            <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 text-sm flex items-center justify-center font-bold">
              {nominations.filter((n) => n.status === "pending").length}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Awaiting review
          </p>
        </div>
      </div>
    </aside>
  );
}

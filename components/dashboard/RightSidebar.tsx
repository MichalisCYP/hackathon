"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Clock, Zap, TrendingUp, Award } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function RightSidebar() {
  const { dailyChallenge, users, nominations } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate top performers
  const topPerformers = users
    .map((user) => ({
      ...user,
      recognitionsReceived: nominations.filter(
        (n) => n.receiverId === user.id && n.status === "approved",
      ).length,
    }))
    .sort((a, b) => b.recognitionsReceived - a.recognitionsReceived)
    .slice(0, 3);

  // Calculate time until challenge expires
  const getTimeRemaining = () => {
    if (!dailyChallenge || !mounted) return "";
    const now = new Date();
    const expires = new Date(dailyChallenge.expiresAt);
    const diff = expires.getTime() - now.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  return (
    <aside className="hidden xl:block w-72 h-screen sticky top-0 p-6 overflow-y-auto scrollbar-thin">
      {/* Background gradient blob */}
      <div className="absolute right-0 top-40 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-6 relative">
        {/* Daily Challenge */}
        {dailyChallenge && (
          <div className="glass-card border-cyan-500/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-white">Daily Challenge</h3>
            </div>

            <h4 className="text-lg font-medium text-white mb-2">
              {dailyChallenge.title}
            </h4>
            <p className="text-sm text-gray-400 mb-4">
              {dailyChallenge.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-cyan-400 text-sm">
                <Award className="w-4 h-4" />
                <span>+{dailyChallenge.xpReward} XP</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <Clock className="w-3 h-3" />
                <span>{getTimeRemaining()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Top Performers */}
        <div className="glass-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white">Top Performers</h3>
          </div>

          <div className="space-y-3">
            {topPerformers.map((user, index) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div
                    className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
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
                  <p className="font-medium text-white text-sm truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">{user.department}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-purple-400">
                    {user.recognitionsReceived}
                  </p>
                  <p className="text-xs text-gray-500">received</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="glass-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <h3 className="font-semibold text-white">This Week</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <p className="text-2xl font-bold gradient-text">
                {nominations.filter((n) => n.status === "approved").length}
              </p>
              <p className="text-xs text-gray-500">Celebrations</p>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <p className="text-2xl font-bold gradient-text">{users.length}</p>
              <p className="text-xs text-gray-500">Team Members</p>
            </div>
          </div>
        </div>

        {/* Pending Nominations */}
        <div className="glass-card border-orange-500/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white text-sm">
              Pending Approval
            </h3>
            <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs flex items-center justify-center font-bold">
              {nominations.filter((n) => n.status === "pending").length}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Nominations waiting to be reviewed by managers
          </p>
        </div>
      </div>
    </aside>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Heart, HandMetal, Flame, Rocket, ArrowRight } from "lucide-react";
import { Nomination, Reaction } from "@/lib/store/types";
import { useAppStore } from "@/lib/store";

interface PostCardProps {
  nomination: Nomination;
}

const reactionIcons: Record<
  Reaction["type"],
  { icon: React.ReactNode; color: string }
> = {
  heart: {
    icon: <Heart className="w-4 h-4" />,
    color: "text-pink-400 hover:text-pink-300",
  },
  clap: {
    icon: <HandMetal className="w-4 h-4" />,
    color: "text-yellow-400 hover:text-yellow-300",
  },
  fire: {
    icon: <Flame className="w-4 h-4" />,
    color: "text-orange-400 hover:text-orange-300",
  },
  rocket: {
    icon: <Rocket className="w-4 h-4" />,
    color: "text-purple-400 hover:text-purple-300",
  },
};

export function PostCard({ nomination }: PostCardProps) {
  const { currentUser, addReaction } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getReactionCount = (type: Reaction["type"]) => {
    return nomination.reactions.filter((r) => r.type === type).length;
  };

  const hasUserReacted = (type: Reaction["type"]) => {
    return nomination.reactions.some(
      (r) => r.type === type && r.userId === currentUser?.id,
    );
  };

  const handleReaction = (type: Reaction["type"]) => {
    if (!hasUserReacted(type)) {
      addReaction(nomination.id, type);
    }
  };

  const formatDate = (dateString: string) => {
    if (!mounted) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="glass-card group hover:border-purple-500/30 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Sender */}
          <div className="relative">
            <img
              src={nomination.sender.avatar}
              alt={nomination.sender.name}
              className="w-10 h-10 rounded-full border-2 border-white/20"
            />
          </div>

          {/* Arrow */}
          <div className="flex items-center gap-2 text-gray-400">
            <span className="font-medium text-white text-sm">
              {nomination.sender.name}
            </span>
            <ArrowRight className="w-4 h-4" />
            <span className="font-medium text-white text-sm">
              {nomination.receiver.name}
            </span>
          </div>

          {/* Receiver */}
          <div className="relative">
            <img
              src={nomination.receiver.avatar}
              alt={nomination.receiver.name}
              className="w-10 h-10 rounded-full border-2 border-cyan-500/50"
            />
          </div>
        </div>

        {/* Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 ${nomination.badge.color}`}
        >
          <span className="text-lg">{nomination.badge.icon}</span>
          <span className="text-sm font-medium">{nomination.badge.name}</span>
        </div>
      </div>

      {/* Message */}
      <p className="text-lg text-gray-200 leading-relaxed mb-4">
        {nomination.message}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        {/* Reactions */}
        <div className="flex items-center gap-2">
          {(Object.keys(reactionIcons) as Reaction["type"][]).map((type) => {
            const { icon, color } = reactionIcons[type];
            const count = getReactionCount(type);
            const userReacted = hasUserReacted(type);

            return (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200
                  ${
                    userReacted
                      ? `bg-white/10 ${color.split(" ")[0]}`
                      : `hover:bg-white/5 text-gray-500 ${color}`
                  }`}
              >
                {icon}
                {count > 0 && (
                  <span className="text-xs font-medium">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-gray-500">
          {formatDate(nomination.createdAt)}
        </span>
      </div>
    </div>
  );
}

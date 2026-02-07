"use client";

import React from "react";
import { Sparkles, PenSquare } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { PostCard } from "./PostCard";

export function Feed() {
  const { approvedNominations, setNominationModalOpen, currentUser } =
    useAppStore();
  const nominations = approvedNominations();

  return (
    <div className="flex-1 p-6 overflow-y-auto scrollbar-thin">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Create Post Trigger */}
        <button
          onClick={() => setNominationModalOpen(true)}
          className="w-full glass-card hover:border-purple-500/30 transition-all duration-300 cursor-pointer text-left group"
        >
          <div className="flex items-center gap-4">
            {currentUser && (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full border-2 border-white/20"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 text-gray-400 group-hover:text-gray-300 transition-colors">
                <PenSquare className="w-4 h-4" />
                <span>Recognize someone amazing today...</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full gradient-button text-white text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Nominate</span>
            </div>
          </div>
        </button>

        {/* Feed Header */}
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="text-xs text-gray-500 uppercase tracking-wider">
            Recent Celebrations
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Posts */}
        {nominations.length === 0 ? (
          <div className="glass-card text-center py-12">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No celebrations yet
            </h3>
            <p className="text-gray-400 mb-4">
              Be the first to recognize someone's great work!
            </p>
            <button
              onClick={() => setNominationModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-button text-white font-medium"
            >
              <Sparkles className="w-4 h-4" />
              Send Recognition
            </button>
          </div>
        ) : (
          nominations.map((nomination) => (
            <PostCard key={nomination.id} nomination={nomination} />
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect } from "react";
import { Sparkles, Cake, Gift } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { PostCard } from "./PostCard";
import Link from "next/link";

export function Feed() {
  const { approvedNominations, fetchData } =
    useAppStore();

  useEffect(() => {
    fetchData();
    
    // Auto-refresh feed every 30 seconds to catch new birthday/anniversary posts
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchData]);

  const nominations = approvedNominations();
  
  // Check for birthday/anniversary posts to highlight them
  const isCelebrationPost = (message: string) => {
    return message.includes('🎂') || message.includes('🎉') || 
           message.toLowerCase().includes('birthday') || 
           message.toLowerCase().includes('anniversary');
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto scrollbar-thin animate-page-enter">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-600 text-sm font-medium mb-3">
            <Sparkles className="w-4 h-4" />
            <span>Recognition Feed</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Sparkles className="w-7 h-7 text-purple-500" />
            Celebrations
          </h1>
          <p className="text-gray-500 mt-2">See the latest recognitions and celebrations</p>
        </div>

        {/* Feed Divider */}
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
            Recent Activity
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>

        {/* Posts */}
        {nominations.length === 0 ? (
          <div className="glass-card text-center py-12">
            <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No celebrations yet
            </h3>
            <p className="text-gray-500 mb-4">
              Be the first to recognize someone's great work!
            </p>
            <Link
              href="/protected/nominate"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-button text-white font-medium"
            >
              <Sparkles className="w-4 h-4" />
              Send Recognition
            </Link>
          </div>
        ) : (
          nominations.map((nomination) => (
            <div key={nomination.id} className={isCelebrationPost(nomination.message) ? 'relative' : ''}>
              {isCelebrationPost(nomination.message) && (
                <div className="absolute -left-2 top-4 z-10">
                  <div className="flex items-center gap-1 bg-gradient-to-r from-pink-500 to-amber-500 text-white text-xs font-bold px-2 py-1 rounded-r-full shadow-lg">
                    {nomination.message.includes('🎂') || nomination.message.toLowerCase().includes('birthday') ? (
                      <>
                        <Cake className="w-3 h-3" />
                        <span>Birthday!</span>
                      </>
                    ) : (
                      <>
                        <Gift className="w-3 h-3" />
                        <span>Anniversary!</span>
                      </>
                    )}
                  </div>
                </div>
              )}
              <PostCard nomination={nomination} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

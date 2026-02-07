"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  Send,
  Inbox,
  Sparkles,
  Calendar,
  Briefcase,
  TrendingUp,
  ArrowRight,
  Rocket,
  Users,
  Heart,
  Zap,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Nomination } from "@/lib/store/types";

// Badge icon mapping
const badgeIcons: Record<string, React.ReactNode> = {
  innovation: <Rocket className="w-5 h-5" />,
  teamwork: <Users className="w-5 h-5" />,
  customer: <Heart className="w-5 h-5" />,
  speed: <Zap className="w-5 h-5" />,
};

export default function ProfilePage() {
  const { currentUser, nominations } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use current user as the profile
  const profile = currentUser;

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-xl p-8 text-center">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Not Logged In
          </h2>
          <p className="text-gray-400">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  // Calculate stats for this user
  const receivedNominations = nominations.filter(
    (n) => n.receiverId === profile.id && n.status === "approved"
  );
  const sentNominations = nominations.filter(
    (n) => n.senderId === profile.id && n.status === "approved"
  );

  // Get all nominations involving this user (activity history)
  const activityHistory = nominations
    .filter(
      (n) =>
        (n.receiverId === profile.id || n.senderId === profile.id) &&
        n.status === "approved"
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  // Get unique badges earned
  const earnedBadges = [
    ...new Map(receivedNominations.map((n) => [n.badge.id, n.badge])).values(),
  ];

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

  const formatJoinDate = (dateString: string) => {
    if (!mounted) return "";
    
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Banner */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-purple-900 to-slate-900" />
        <div className="absolute inset-x-0 bottom-0 transform translate-y-1/2">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex items-end gap-6">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full border-4 border-slate-900 bg-slate-800"
                />
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-2">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Name & Title */}
              <div className="pb-4">
                <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {profile.department}
                  </span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400 capitalize">{profile.role}</span>
                </div>
              </div>

              {/* Level Badge */}
              <div className="ml-auto pb-4">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-semibold">
                    Level {profile.level}
                  </span>
                  <span className="text-gray-400 text-sm">
                    ({profile.xp} XP)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Recognition Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Inbox className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-gray-300">Received</span>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {receivedNominations.length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Send className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-gray-300">Sent</span>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {sentNominations.length}
                  </span>
                </div>
              </div>

              {/* Join Date */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatJoinDate(profile.joinedAt)}</span>
                </div>
              </div>
            </div>

            {/* Badges Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                Badges Earned
              </h3>
              {earnedBadges.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {earnedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex flex-col items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div
                        className={`p-3 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-2 ${badge.color}`}
                      >
                        {badgeIcons[badge.id] || <Award className="w-5 h-5" />}
                      </div>
                      <span className="text-white text-sm font-medium text-center">
                        {badge.name}
                      </span>
                      <span className="text-2xl">{badge.icon}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Award className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No badges earned yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Activity Feed) */}
          <div className="md:col-span-2">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Activity Feed
              </h3>

              {activityHistory.length > 0 ? (
                <div className="space-y-4">
                  {activityHistory.map((nomination) => (
                    <ActivityCard
                      key={nomination.id}
                      nomination={nomination}
                      profileId={profile.id}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h4 className="text-white font-medium mb-2">
                    No activity yet
                  </h4>
                  <p className="text-gray-400 text-sm">
                    Start recognizing colleagues to build your activity feed!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Activity Card Component
function ActivityCard({
  nomination,
  profileId,
  formatDate,
}: {
  nomination: Nomination;
  profileId: string;
  formatDate: (date: string) => string;
}) {
  const isReceiver = nomination.receiverId === profileId;

  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-purple-500/20 transition-all">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <img
          src={isReceiver ? nomination.sender.avatar : nomination.receiver.avatar}
          alt={isReceiver ? nomination.sender.name : nomination.receiver.name}
          className="w-10 h-10 rounded-full border-2 border-white/20"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            {isReceiver ? (
              <>
                <span className="text-white font-medium">
                  {nomination.sender.name}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-500" />
                <span className="text-purple-400 font-medium">Recognized you</span>
              </>
            ) : (
              <>
                <span className="text-purple-400 font-medium">You recognized</span>
                <ArrowRight className="w-4 h-4 text-gray-500" />
                <span className="text-white font-medium">
                  {nomination.receiver.name}
                </span>
              </>
            )}
          </div>

          {/* Badge */}
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 ${nomination.badge.color}`}
            >
              <span>{nomination.badge.icon}</span>
              {nomination.badge.name}
            </span>
            <span className="text-gray-500 text-xs">
              {formatDate(nomination.createdAt)}
            </span>
          </div>

          {/* Message */}
          <p className="text-gray-300 text-sm mt-2 line-clamp-2">
            {nomination.message}
          </p>

          {/* Reactions */}
          {nomination.reactions.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex -space-x-1">
                {nomination.reactions.slice(0, 3).map((reaction) => (
                  <span
                    key={reaction.id}
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-xs"
                  >
                    {reaction.type === "heart" && "❤️"}
                    {reaction.type === "clap" && "👏"}
                    {reaction.type === "fire" && "🔥"}
                    {reaction.type === "rocket" && "🚀"}
                  </span>
                ))}
              </div>
              {nomination.reactions.length > 0 && (
                <span className="text-gray-500 text-xs">
                  {nomination.reactions.length} reaction
                  {nomination.reactions.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

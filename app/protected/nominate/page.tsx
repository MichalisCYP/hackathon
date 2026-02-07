"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Sparkles, ArrowRight, HelpCircle, Send, Rocket } from "lucide-react";

export default function NominatePage() {
  const router = useRouter();
  const { profiles, badges, user, currentProfile, sendNomination, fetchData } =
    useAppStore();

  const [receiverId, setReceiverId] = useState("");
  const [badgeId, setBadgeId] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!currentProfile) {
      fetchData();
    }
  }, [currentProfile, fetchData]);

  // Filter out current user from profiles list
  const nominatableProfiles = profiles.filter((p) => p.id !== user?.id);

  // Get selected receiver and badge for preview
  const selectedReceiver = profiles.find((p) => p.id === receiverId);
  const selectedBadge = badges.find((b) => b.id === badgeId);

  const isFormValid = receiverId && badgeId && message.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await sendNomination(receiverId, badgeId, message);
      router.push("/protected");
    } catch (error) {
      console.error("Error submitting nomination:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img 
            src="/logo.png" 
            alt="Loading" 
            className="w-20 h-20 object-contain animate-pulse"
          />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto scrollbar-thin animate-page-enter">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-600 text-sm font-medium mb-3">
            <Rocket className="w-4 h-4" />
            <span>Recognition</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Rocket className="w-7 h-7 text-purple-500" />
            Nominate a Colleague
          </h1>
          <p className="text-gray-500 mt-2">Recognize someone for their great work</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - The Form */}
          <div className="glass-card p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* I want to nominate... */}
              <div className="space-y-3">
                <label htmlFor="receiver-select" className="text-sm text-gray-600 font-semibold">
                  Who do you want to nominate?
                </label>
                <select
                  id="receiver-select"
                  title="Select a teammate to nominate"
                  aria-label="Select a teammate to nominate"
                  value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none px-4 py-3 text-gray-900 font-medium transition-all cursor-pointer text-base"
                >
                  <option value="" className="bg-white">
                    Select a teammate...
                  </option>
                  {nominatableProfiles.map((profile) => (
                    <option
                      key={profile.id}
                      value={profile.id}
                      className="bg-white"
                    >
                      {profile.username}
                    </option>
                  ))}
                </select>
              </div>

              {/* For the value of... */}
              <div className="space-y-3">
                <label className="text-sm text-gray-600 font-semibold">
                  For the value of...
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {badges.map((badge) => (
                    <button
                      key={badge.id}
                      type="button"
                      onClick={() => setBadgeId(badge.id)}
                      className={`aspect-square flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                        badgeId === badge.id
                          ? "bg-purple-600 border-purple-400 shadow-lg scale-[1.02]"
                          : "bg-white border-gray-200 hover:border-purple-300 hover:shadow-md hover:bg-purple-50"
                      }`}
                    >
                      <div className="text-3xl mb-1.5">{badge.icon}</div>
                      <div className={`text-xs font-semibold text-center leading-tight ${badgeId === badge.id ? 'text-white' : 'text-gray-700'}`}>
                        {badge.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Because... */}
              <div className="space-y-3">
                <label className="text-sm text-gray-600 font-semibold">
                  Why do they deserve recognition?
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share why this person deserves recognition..."
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none px-4 py-3 text-gray-900 resize-none transition-all placeholder:text-gray-400 text-base"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  isFormValid && !isSubmitting
                    ? "gradient-button text-white hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Launching...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>Send to Orbit</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column - Live Preview */}
          <div className="space-y-4 hidden lg:block">
            <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Live Preview</span>
            </div>

            {/* Preview Card */}
            <div className="glass-card p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Sender */}
                  <img
                    src={currentProfile?.avatar_url || "/placeholder-avatar.png"}
                    alt={currentProfile?.username || "You"}
                    className="w-12 h-12 rounded-full border-2 border-gray-200"
                  />

                  {/* Arrow */}
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="font-semibold text-gray-900 text-base">
                      {currentProfile?.username || "You"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                    <span className="font-semibold text-purple-700 text-base">
                      {selectedReceiver?.username || "Someone"}
                    </span>
                  </div>

                  {/* Receiver */}
                  {selectedReceiver ? (
                    <img
                      src={selectedReceiver.avatar_url}
                      alt={selectedReceiver.username}
                      className="w-12 h-12 rounded-full border-2 border-purple-300"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Badge */}
              <div className="mb-4">
                {selectedBadge ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 border border-purple-200">
                    <span className="text-xl">{selectedBadge.icon}</span>
                    <span className="text-sm font-semibold text-purple-700">
                      {selectedBadge.name}
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200">
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-400">
                      Select a badge
                    </span>
                  </div>
                )}
              </div>

              {/* Message */}
              <p className="text-gray-700 text-base leading-relaxed mb-4 min-h-[60px]">
                {message || (
                  <span className="text-gray-400 italic">
                    Your recognition message will appear here...
                  </span>
                )}
              </p>

              {/* Reactions Preview */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                {["❤️", "👏", "🔥", "🚀"].map((emoji, i) => (
                  <span key={i} className="text-lg opacity-40">{emoji}</span>
                ))}
              </div>
            </div>

            {/* Tips Card */}
            <div className="glass-card bg-gradient-to-br from-purple-50 to-white border-purple-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Send className="w-4 h-4 text-purple-500" />
                Tips for Great Recognition
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  Be specific about what they did
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  Explain the positive impact
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  Connect it to company values
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
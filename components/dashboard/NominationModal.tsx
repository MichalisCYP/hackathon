"use client";

import React, { useState } from "react";
import { X, Rocket, ChevronDown, Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function NominationModal() {
  const {
    isNominationModalOpen,
    setNominationModalOpen,
    profiles,
    badges,
    currentProfile,
    sendNomination,
  } = useAppStore();

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otherUsers = profiles.filter((u) => u.id !== currentProfile?.id);
  const selectedUser = otherUsers.find((u) => u.id === selectedUserId);

  const handleSubmit = async () => {
    if (!selectedUserId || !selectedBadgeId || !message.trim()) return;

    setIsSubmitting(true);
    await sendNomination(selectedUserId, selectedBadgeId, message);
    setIsSubmitting(false);

    // Reset form
    setSelectedUserId("");
    setSelectedBadgeId(null);
    setMessage("");
    setNominationModalOpen(false);
  };

  const isFormValid =
    selectedUserId && selectedBadgeId && message.trim().length > 10;

  if (!isNominationModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={() => setNominationModalOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={() => setNominationModalOpen(false)}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          title="Close modal"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 relative">
          <div className="w-10 h-10 rounded-xl gradient-button flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Send Recognition</h2>
            <p className="text-gray-500 text-sm">Celebrate someone's great work</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 relative">
          {/* User Selection - "I want to nominate..." */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              I want to nominate...
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-purple-300 transition-colors text-left"
              >
                {selectedUser ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedUser.avatar_url}
                      alt={selectedUser.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <p className="font-medium text-gray-900">
                      {selectedUser.username}
                    </p>
                  </div>
                ) : (
                  <span className="text-gray-400">Select a colleague...</span>
                )}
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${isUserDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown */}
              {isUserDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 py-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {otherUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-8 h-8 rounded-full"
                      />
                      <p className="font-medium text-gray-900">{user.username}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Badge Selection - "For the value of..." */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              For the value of...
            </label>
            <div className="grid grid-cols-2 gap-2">
              {badges.map((badge) => {
                const isSelected = selectedBadgeId === badge.id;

                return (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() => setSelectedBadgeId(badge.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border transition-all duration-200
                      ${
                        isSelected
                          ? "bg-purple-50 border-purple-300 shadow-sm"
                          : "bg-gray-50 border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <span
                      className={`font-medium ${isSelected ? badge.color : "text-gray-600"}`}
                    >
                      {badge.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message - "Because..." */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Because...
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share the story behind this recognition..."
              className="w-full h-20 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none resize-none text-gray-900 placeholder:text-gray-400 transition-colors text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              {message.length}/500 characters (min 10)
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl font-semibold transition-all duration-300
              ${
                isFormValid && !isSubmitting
                  ? "gradient-button text-white shadow-lg hover:scale-[1.02]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            <Rocket className="w-5 h-5" />
            {isSubmitting ? "Sending..." : "Send to Orbit"}
          </button>
        </div>
      </div>
    </div>
  );
}

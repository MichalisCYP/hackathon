"use client";

import React, { useState } from "react";
import { X, Rocket, ChevronDown, Sparkles } from "lucide-react";
import { useAppStore, badges } from "@/lib/store";
import { BadgeCategory } from "@/lib/store/types";

export function NominationModal() {
  const {
    isNominationModalOpen,
    setNominationModalOpen,
    users,
    currentUser,
    sendNomination,
  } = useAppStore();

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedBadge, setSelectedBadge] = useState<BadgeCategory | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const otherUsers = users.filter((u) => u.id !== currentUser?.id);
  const selectedUser = otherUsers.find((u) => u.id === selectedUserId);

  const handleSubmit = () => {
    if (!selectedUserId || !selectedBadge || !message.trim()) return;

    sendNomination(selectedUserId, selectedBadge, message);

    // Reset form
    setSelectedUserId("");
    setSelectedBadge(null);
    setMessage("");
    setNominationModalOpen(false);
  };

  const isFormValid =
    selectedUserId && selectedBadge && message.trim().length > 10;

  if (!isNominationModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={() => setNominationModalOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass-card border-purple-500/20 glow-purple animate-in fade-in zoom-in duration-200">
        {/* Background gradient */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={() => setNominationModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-button flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold gradient-text">Send Recognition</h2>
          <p className="text-gray-400 mt-2">Celebrate someone's great work</p>
        </div>

        {/* Form */}
        <div className="space-y-6 relative">
          {/* User Selection - "I want to nominate..." */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              I want to nominate...
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/30 transition-colors text-left"
              >
                {selectedUser ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-white">
                        {selectedUser.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedUser.department}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500">Select a colleague...</span>
                )}
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${isUserDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown */}
              {isUserDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 py-2 bg-slate-800 border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {otherUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-xs text-gray-500">
                          {user.department}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Badge Selection - "For the value of..." */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              For the value of...
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(badges) as BadgeCategory[]).map((badgeId) => {
                const badge = badges[badgeId];
                const isSelected = selectedBadge === badgeId;

                return (
                  <button
                    key={badgeId}
                    type="button"
                    onClick={() => setSelectedBadge(badgeId)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200
                      ${
                        isSelected
                          ? "bg-white/10 border-purple-500/50 glow-purple"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <span
                      className={`font-medium ${isSelected ? badge.color : "text-gray-300"}`}
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
            <label className="block text-sm text-gray-400 mb-2">
              Because...
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share the story behind this recognition..."
              className="w-full h-32 p-4 bg-transparent border-b-2 border-white/20 focus:border-purple-500 outline-none resize-none text-white placeholder:text-gray-600 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-2">
              {message.length}/500 characters (min 10)
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`w-full flex items-center justify-center gap-2 p-4 rounded-xl font-semibold transition-all duration-300
              ${
                isFormValid
                  ? "gradient-button text-white glow-purple hover:scale-[1.02]"
                  : "bg-white/5 text-gray-500 cursor-not-allowed"
              }`}
          >
            <Rocket className="w-5 h-5" />
            Send to Orbit
          </button>
        </div>
      </div>
    </div>
  );
}

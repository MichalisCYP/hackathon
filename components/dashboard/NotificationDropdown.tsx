"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, Award, X, Sparkles, CheckCheck } from "lucide-react";
import { useAppStore, Notification } from "@/lib/store";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useAppStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = unreadNotificationCount();

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "received_nomination":
        return <Award className="w-5 h-5 text-purple-500" />;
      case "nomination_approved":
        return <Check className="w-5 h-5 text-green-500" />;
      case "nomination_rejected":
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-500" />;
    }
  };

  const getNotificationBg = (type: Notification["type"], read: boolean) => {
    if (read) return "bg-gray-50";
    switch (type) {
      case "received_nomination":
        return "bg-purple-50";
      case "nomination_approved":
        return "bg-green-50";
      case "nomination_rejected":
        return "bg-red-50";
      default:
        return "bg-purple-50";
    }
  };

  const formatTime = (dateString: string) => {
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
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-purple-50 hover:border-purple-200 transition-colors shadow-sm"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-[110] animate-page-enter">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  markAllNotificationsAsRead();
                }}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  You'll be notified when you receive recognitions
                </p>
              </div>
            ) : (
              notifications.slice(0, 15).map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markNotificationAsRead(notification.id)}
                  className={`px-3 py-2.5 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${getNotificationBg(notification.type, notification.read)}`}
                >
                  <div className="flex gap-2.5">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {notification.fromUser?.avatar_url ? (
                        <img
                          src={notification.fromUser.avatar_url}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {notification.badge && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600">
                            {notification.badge.icon} {notification.badge.name}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

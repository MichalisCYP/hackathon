"use client";

import React, { useEffect, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { RightSidebar } from "./RightSidebar";
import { NominationModal } from "./NominationModal";
import { NotificationDropdown } from "./NotificationDropdown";
import { useAppStore } from "@/lib/store";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const fetchData = useAppStore((state) => state.fetchData);
  const currentProfile = useAppStore((state) => state.currentProfile);
  const nominations = useAppStore((state) => state.nominations);
  const generateNotifications = useAppStore((state) => state.generateNotifications);

  // Periodic refresh for kudos and data (every 2 minutes)
  const refreshInterval = useCallback(() => {
    console.log("[DashboardLayout] Periodic refresh...");
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Fetch data when component mounts and no profile loaded yet
    if (!currentProfile) {
      console.log("[DashboardLayout] No currentProfile, calling fetchData...");
      fetchData();
    }
    
    // Set up periodic refresh every 2 minutes (120000ms)
    const interval = setInterval(refreshInterval, 120000);
    
    return () => clearInterval(interval);
  }, [currentProfile, fetchData, refreshInterval]);

  // Auto-check for birthdays/anniversaries when admin loads the dashboard
  useEffect(() => {
    const checkOccasions = async () => {
      if (currentProfile?.job_title?.toLowerCase() === "admin") {
        const lastCheck = localStorage.getItem("lastOccasionCheck");
        const today = new Date().toDateString();
        
        // Only check once per day
        if (lastCheck !== today) {
          console.log("[DashboardLayout] Admin detected, checking occasions...");
          try {
            const response = await fetch("/api/admin/check-occasions", {
              method: "POST",
            });
            if (response.ok) {
              localStorage.setItem("lastOccasionCheck", today);
              const data = await response.json();
              if (data.results?.birthdays?.length > 0 || data.results?.anniversaries?.length > 0) {
                console.log("[DashboardLayout] Occasions found, refreshing data...");
                fetchData();
              }
            }
          } catch (error) {
            console.error("[DashboardLayout] Error checking occasions:", error);
          }
        }
      }
    };
    
    checkOccasions();
  }, [currentProfile, fetchData]);

  // Generate notifications when data changes
  useEffect(() => {
    if (currentProfile && nominations.length > 0) {
      generateNotifications();
    }
  }, [currentProfile, nominations, generateNotifications]);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Background gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none bg-gray-50">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl" />
      </div>

      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Main Content */}
        <main className="flex-1 flex animate-page-enter">
          {children}

          {/* Right Sidebar with Notification */}
          <div className="hidden xl:block relative">
            <RightSidebar />
          </div>
        </main>
        
        {/* Notification Bell - Always fixed at top right corner */}
        <div className="fixed top-4 right-4 z-[100]">
          <NotificationDropdown />
        </div>
      </div>

      {/* Nomination Modal */}
      <NominationModal />
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import {
  Shield,
  Check,
  X,
  Clock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Trash2,
  Award,
  RefreshCw,
  Cake,
  Gift,
} from "lucide-react";
import { useAppStore, Nomination } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const {
    pendingNominations,
    approvedNominations,
    nominations,
    currentProfile,
    fetchData,
    approveNomination,
    rejectNomination,
    deleteNomination,
    recalculateKudos,
    isLoading,
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isCheckingOccasions, setIsCheckingOccasions] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [fetchData]);

  // Check if user is admin
  const isAdmin = currentProfile?.job_title?.toLowerCase() === "admin";

  const pending = pendingNominations();
  const approved = approvedNominations();

  // Calculate approved/rejected today (only after mount to avoid SSR issues)
  const { approvedToday, rejectedToday } = React.useMemo(() => {
    if (!mounted) return { approvedToday: 0, rejectedToday: 0 };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const approvedCount = nominations.filter(n => {
      if (n.status !== 'approved') return false;
      const createdDate = new Date(n.created_at);
      return createdDate >= today;
    }).length;
    
    const rejectedCount = nominations.filter(n => {
      if (n.status !== 'rejected') return false;
      const createdDate = new Date(n.created_at);
      return createdDate >= today;
    }).length;
    
    return { approvedToday: approvedCount, rejectedToday: rejectedCount };
  }, [mounted, nominations]);

  const handleApprove = async (nominationId: string) => {
    setProcessingId(nominationId);
    await approveNomination(nominationId);
    setProcessingId(null);
  };

  const handleReject = async (nominationId: string) => {
    setProcessingId(nominationId);
    await rejectNomination(nominationId);
    setProcessingId(null);
  };
  
  const handleDelete = async (nominationId: string) => {
    if (!confirm("Are you sure you want to delete this nomination? This will remove the kudos points awarded.")) {
      return;
    }
    setProcessingId(nominationId);
    await deleteNomination(nominationId);
    setProcessingId(null);
  };
  
  const handleRecalculateKudos = async () => {
    if (!confirm("This will recalculate all kudos based on approved nominations. Continue?")) {
      return;
    }
    setIsRecalculating(true);
    try {
      await recalculateKudos();
      alert("✅ Kudos synced successfully for all users!");
    } catch (error: any) {
      alert(`❌ Failed to sync kudos: ${error.message || "Unknown error"}`);
    }
    setIsRecalculating(false);
  };

  const handleCheckOccasions = async () => {
    if (!confirm("This will award 5 kudos to users with birthdays or work anniversaries today. Continue?")) {
      return;
    }
    setIsCheckingOccasions(true);
    try {
      const response = await fetch('/api/admin/check-occasions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to check occasions");
      }
      
      const { birthdays, anniversaries } = result.results;
      let message = "✅ Occasions checked!\n";
      if (birthdays.length > 0) {
        message += `\n🎂 Birthdays: ${birthdays.join(", ")}`;
      }
      if (anniversaries.length > 0) {
        message += `\n🎉 Anniversaries: ${anniversaries.join(", ")}`;
      }
      if (birthdays.length === 0 && anniversaries.length === 0) {
        message += "\nNo birthdays or anniversaries today.";
      }
      alert(message);
      await fetchData();
    } catch (error: any) {
      alert(`❌ Failed: ${error.message || "Unknown error"}`);
    }
    setIsCheckingOccasions(false);
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

  if (isLoading) {
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

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="flex-1 p-6 overflow-y-auto scrollbar-thin">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-500 mb-6">
              You need admin privileges to access this page.
            </p>
            <button
              onClick={() => router.push("/protected")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-button text-white font-medium"
            >
              Go to Feed
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto scrollbar-thin animate-page-enter">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-600 text-sm font-medium">
              <Shield className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCheckOccasions}
                disabled={isCheckingOccasions}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-700 text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Cake className={`w-4 h-4 ${isCheckingOccasions ? 'animate-bounce' : ''}`} />
                {isCheckingOccasions ? 'Checking...' : 'Check Occasions'}
              </button>
              <button
                onClick={handleRecalculateKudos}
                disabled={isRecalculating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} />
                {isRecalculating ? 'Recalculating...' : 'Sync Kudos'}
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nomination Approvals
          </h1>
          <p className="text-gray-500">
            Review and approve pending nominations from team members
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pending.length}</p>
              <p className="text-sm text-gray-500">Pending Review</p>
            </div>
          </div>
          <div className="glass-card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{approvedToday}</p>
              <p className="text-sm text-gray-500">Approved Today</p>
            </div>
          </div>
          <div className="glass-card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-100">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{rejectedToday}</p>
              <p className="text-sm text-gray-500">Rejected Today</p>
            </div>
          </div>
        </div>

        {/* Pending Nominations */}
        <div className="glass-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            Pending Nominations ({pending.length})
          </h2>

          {pending.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                All caught up!
              </h3>
              <p className="text-gray-500">
                No pending nominations to review at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((nomination) => (
                <NominationCard
                  key={nomination.id}
                  nomination={nomination}
                  formatDate={formatDate}
                  onApprove={() => handleApprove(nomination.id)}
                  onReject={() => handleReject(nomination.id)}
                  isProcessing={processingId === nomination.id}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Approved Nominations */}
        <div className="glass-card mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600" />
            Approved Nominations ({approved.length})
          </h2>

          {approved.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No approved nominations yet
              </h3>
              <p className="text-gray-500">
                Approved nominations will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {approved.slice(0, 20).map((nomination) => (
                <ApprovedNominationCard
                  key={nomination.id}
                  nomination={nomination}
                  formatDate={formatDate}
                  onDelete={() => handleDelete(nomination.id)}
                  isProcessing={processingId === nomination.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Nomination Card Component
function NominationCard({
  nomination,
  formatDate,
  onApprove,
  onReject,
  isProcessing,
}: {
  nomination: Nomination;
  formatDate: (date: string) => string;
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
}) {
  const sender = nomination.sender;
  const receiver = nomination.receiver;
  const badge = nomination.badge;

  if (!sender || !receiver) return null;

  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-yellow-400 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <img
              src={sender.avatar_url}
              alt={sender.username}
              className="w-10 h-10 rounded-full border-2 border-gray-200"
            />
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-900">{sender.username}</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-purple-600">{receiver.username}</span>
            </div>
            <img
              src={receiver.avatar_url}
              alt={receiver.username}
              className="w-10 h-10 rounded-full border-2 border-purple-300"
            />
          </div>

          {/* Badge */}
          {badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 border border-purple-200 mb-3">
              <span className="text-lg">{badge.icon}</span>
              <span className="text-sm font-medium text-purple-700">{badge.name}</span>
            </div>
          )}

          {/* Message */}
          <p className="text-gray-600 text-sm leading-relaxed mb-2">
            {nomination.message}
          </p>

          {/* Time */}
          <span className="text-xs text-gray-400">
            Submitted {formatDate(nomination.created_at)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onApprove}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Approve
          </button>
          <button
            onClick={onReject}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// Approved Nomination Card Component with Delete
function ApprovedNominationCard({
  nomination,
  formatDate,
  onDelete,
  isProcessing,
}: {
  nomination: Nomination;
  formatDate: (date: string) => string;
  onDelete: () => void;
  isProcessing: boolean;
}) {
  const sender = nomination.sender;
  const receiver = nomination.receiver;
  const badge = nomination.badge;

  if (!sender || !receiver) return null;

  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-green-300 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <img
              src={sender.avatar_url}
              alt={sender.username}
              className="w-10 h-10 rounded-full border-2 border-gray-200"
            />
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-900">{sender.username}</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-purple-600">{receiver.username}</span>
            </div>
            <img
              src={receiver.avatar_url}
              alt={receiver.username}
              className="w-10 h-10 rounded-full border-2 border-purple-300"
            />
            <span className="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              <Check className="w-3 h-3" />
              Approved
            </span>
          </div>

          {/* Badge */}
          {badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 border border-purple-200 mb-3">
              <span className="text-lg">{badge.icon}</span>
              <span className="text-sm font-medium text-purple-700">{badge.name}</span>
            </div>
          )}

          {/* Message */}
          <p className="text-gray-600 text-sm leading-relaxed mb-2 line-clamp-2">
            {nomination.message}
          </p>

          {/* Time */}
          <span className="text-xs text-gray-400">
            Approved {formatDate(nomination.created_at)}
          </span>
        </div>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          disabled={isProcessing}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete nomination (removes kudos)"
        >
          {isProcessing ? (
            <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

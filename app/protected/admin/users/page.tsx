"use client";

import React, { useEffect, useState } from "react";
import {
  Shield,
  Check,
  Users,
  AlertCircle,
  Search,
  ChevronDown,
  Crown,
  Save,
  X,
} from "lucide-react";
import { useAppStore, Profile } from "@/lib/store";
import { useRouter } from "next/navigation";

type UserRole = "admin" | "Team Member";

const ROLES: { value: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "admin", label: "Admin", icon: <Crown className="w-4 h-4" />, color: "text-purple-600 bg-purple-100" },
  { value: "Team Member", label: "Team Member", icon: <Users className="w-4 h-4" />, color: "text-blue-600 bg-blue-100" },
];

export default function AdminUsersPage() {
  const router = useRouter();
  const {
    profiles,
    currentProfile,
    fetchData,
    updateUserRole,
    isLoading,
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [isSaving, setIsSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Only fetch if no data loaded yet
    if (profiles.length === 0) {
      fetchData();
    }
  }, [profiles.length, fetchData]);

  // Check if user is admin
  const isAdmin = currentProfile?.job_title?.toLowerCase() === "admin";

  // Filter users (exclude current user)
  // Filter users (including current user so admin can change their own role)
  const filteredUsers = profiles
    .filter(p => {
      const matchesSearch = 
        p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = filterRole === "all" || p.job_title?.toLowerCase() === filterRole.toLowerCase();
      
      return matchesSearch && matchesRole;
    })
    // Sort to put current user first
    .sort((a, b) => {
      if (a.id === currentProfile?.id) return -1;
      if (b.id === currentProfile?.id) return 1;
      return a.username.localeCompare(b.username);
    });

  // Count stats
  const totalAdmins = profiles.filter(p => p.job_title?.toLowerCase() === "admin").length;
  const totalTeamMembers = profiles.filter(p => p.job_title?.toLowerCase() === "team member").length;

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  const handleRoleChange = (userId: string, newRole: string) => {
    const user = profiles.find(p => p.id === userId);
    const currentRole = user?.job_title?.toLowerCase();
    
    // If selecting the same role as current, remove from pending changes
    if (currentRole === newRole.toLowerCase()) {
      setPendingChanges(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    } else {
      // Add to pending changes
      setPendingChanges(prev => ({
        ...prev,
        [userId]: newRole
      }));
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      // Save all pending changes one by one
      const entries = Object.entries(pendingChanges);
      console.log(`Saving ${entries.length} role changes...`);
      
      for (const [userId, newRole] of entries) {
        console.log(`Saving role for user ${userId}: ${newRole}`);
        await updateUserRole(userId, newRole);
      }
      
      // Verify by re-fetching data from database
      console.log("Verifying changes by re-fetching...");
      await fetchData();
      
      // Clear pending changes and show success
      setPendingChanges({});
      setSaveSuccess(true);
      console.log("✅ All changes saved and verified!");
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error("Error saving changes:", error);
      setSaveError(error?.message || "Failed to save changes. Please try again.");
      // Hide error after 5 seconds
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelChanges = () => {
    setPendingChanges({});
  };

  const getDisplayRole = (user: Profile): string => {
    // If there's a pending change for this user, show that role
    if (pendingChanges[user.id]) {
      return pendingChanges[user.id];
    }
    return user.job_title || "Team Member";
  };

  const formatDate = (dateString: string) => {
    if (!mounted) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
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
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-600 text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            <span>Admin Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            User Management
          </h1>
          <p className="text-gray-500">
            Manage user roles and permissions across your organization
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="glass-card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-100">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalAdmins}</p>
              <p className="text-sm text-gray-500">Admins</p>
            </div>
          </div>
          <div className="glass-card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalTeamMembers}</p>
              <p className="text-sm text-gray-500">Team Members</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="glass-card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900"
              />
            </div>
            
            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              aria-label="Filter by role"
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="Team Member">Team Members</option>
            </select>
          </div>
        </div>

        {/* Users List */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              All Users ({filteredUsers.length})
            </h2>
            
            {/* Save/Cancel Buttons */}
            {hasPendingChanges && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-amber-600 font-medium">
                  {Object.keys(pendingChanges).length} unsaved change{Object.keys(pendingChanges).length > 1 ? 's' : ''}
                </span>
                <button
                  onClick={handleCancelChanges}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            )}
            
            {/* Success Message */}
            {saveSuccess && (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <span className="text-sm font-medium">Changes saved successfully!</span>
              </div>
            )}
            
            {/* Error Message */}
            {saveError && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{saveError}</span>
              </div>
            )}
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  isCurrentUser={user.id === currentProfile?.id}
                  displayRole={getDisplayRole(user)}
                  hasPendingChange={!!pendingChanges[user.id]}
                  formatDate={formatDate}
                  onRoleChange={handleRoleChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// User Card Component
function UserCard({
  user,
  isCurrentUser,
  displayRole,
  hasPendingChange,
  formatDate,
  onRoleChange,
}: {
  user: Profile;
  isCurrentUser: boolean;
  displayRole: string;
  hasPendingChange: boolean;
  formatDate: (date: string) => string;
  onRoleChange: (userId: string, role: string) => void;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const currentRole = ROLES.find(r => r.value.toLowerCase() === displayRole.toLowerCase()) || ROLES[1];

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      hasPendingChange 
        ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200' 
        : isCurrentUser
        ? 'bg-purple-50 border-purple-300'
        : 'bg-gray-50 border-gray-200 hover:border-purple-200'
    }`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Avatar */}
          <img
            src={user.avatar_url}
            alt={user.username}
            className={`w-12 h-12 rounded-full border-2 flex-shrink-0 ${isCurrentUser ? 'border-purple-400' : 'border-gray-200'}`}
          />
          
          {/* User Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 truncate">{user.username}</h3>
              {isCurrentUser && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-200 text-purple-700 font-medium">
                  You
                </span>
              )}
              {hasPendingChange && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-700 font-medium">
                  Modified
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">{user.department}</span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-400">Joined {formatDate(user.created_at)}</span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-purple-600 font-medium">{user.kudos_balance} kudos</span>
            </div>
          </div>
        </div>

        {/* Role Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all min-w-[150px] justify-between ${currentRole.color} border-current/20`}
          >
            {currentRole.icon}
            <span className="text-sm font-medium">{currentRole.label}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsDropdownOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                {ROLES.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => {
                      onRoleChange(user.id, role.value);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                      currentRole.value === role.value ? "bg-purple-50" : ""
                    }`}
                  >
                    <span className={`p-1.5 rounded-lg ${role.color}`}>
                      {role.icon}
                    </span>
                    <span className="text-sm font-medium text-gray-700">{role.label}</span>
                    {currentRole.value === role.value && (
                      <Check className="w-4 h-4 text-purple-600 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

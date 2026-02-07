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
  Pencil,
  X,
  Check,
  Camera,
  Cake,
  Gift,
  ThumbsUp,
  MessageSquare,
  Flame,
} from "lucide-react";
import { useAppStore, Nomination, Badge } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";

// Badge icon mapping
const badgeIcons: Record<string, React.ReactNode> = {
  innovation: <Rocket className="w-5 h-5" />,
  teamwork: <Users className="w-5 h-5" />,
  customer: <Heart className="w-5 h-5" />,
  speed: <Zap className="w-5 h-5" />,
};

export default function ProfilePage() {
  const { currentProfile, user, nominations, reactions, fetchData, isLoading } = useAppStore();
  const [mounted, setMounted] = useState(false);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editBirthday, setEditBirthday] = useState("");
  const [editWorkAnniversary, setEditWorkAnniversary] = useState("");
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [fetchData]);
  
  // Initialize edit fields when profile loads
  useEffect(() => {
    if (currentProfile) {
      setEditName(currentProfile.username || "");
      setEditDepartment(currentProfile.department || "");
      setEditBirthday(currentProfile.birthday || "");
      setEditWorkAnniversary(currentProfile.work_anniversary || "");
    }
  }, [currentProfile]);

  // Use current user's profile
  const profile = currentProfile;
  
  // Check if viewing own profile
  const isOwnProfile = user?.id === profile?.id;
  
  const handleSaveProfile = async () => {
    if (!profile || !user) return;
    
    setIsSaving(true);
    const supabase = createClient();
    
    try {
      let avatarUrl = profile.avatar_url;
      
      // Upload new avatar if selected
      if (editAvatarFile) {
        const fileExt = editAvatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, editAvatarFile, { upsert: true });
        
        if (uploadError) {
          console.error("Error uploading avatar:", uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          avatarUrl = publicUrl;
        }
      }
      
      const { error } = await supabase
        .from("profiles")
        .update({
          username: (editName || "").trim(),
          department: (editDepartment || "").trim(),
          avatar_url: avatarUrl,
          birthday: editBirthday || null,
          work_anniversary: editWorkAnniversary || null,
        })
        .eq("id", user.id);
      
      if (error) {
        console.error("Error updating profile:", error);
        return;
      }
      
      // Reset avatar state
      setEditAvatarFile(null);
      setAvatarPreview(null);
      
      // Refresh data to show updated profile
      await fetchData();
      setIsEditing(false);
      console.log("✅ Profile updated!");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancelEdit = () => {
    if (currentProfile) {
      setEditName(currentProfile.username || "");
      setEditDepartment(currentProfile.department || "");
      setEditBirthday(currentProfile.birthday || "");
      setEditWorkAnniversary(currentProfile.work_anniversary || "");
    }
    setEditAvatarFile(null);
    setAvatarPreview(null);
    setIsEditing(false);
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!mounted || (isLoading && !currentProfile)) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <img
            src="/logo.png"
            alt="Loading"
            className="w-20 h-20 mx-auto mb-4 animate-pulse object-contain"
          />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 text-center">
          <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Not Logged In
          </h2>
          <p className="text-gray-500">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  // Calculate stats for this user
  const receivedNominations = nominations.filter(
    (n) => n.receiver_id === profile.id && n.status === "approved"
  );
  const sentNominations = nominations.filter(
    (n) => n.sender_id === profile.id && n.status === "approved"
  );

  // Calculate engagement stats (reactions)
  const reactionsGiven = reactions.filter(
    (r) => r.user_id === profile.id
  ).length;
  
  const reactionsReceived = reactions.filter(
    (r) => {
      const nomination = nominations.find(n => n.id === r.nomination_id);
      return nomination && nomination.receiver_id === profile.id;
    }
  ).length;

  // Get all nominations involving this user (activity history)
  const activityHistory = nominations
    .filter(
      (n) =>
        (n.receiver_id === profile.id || n.sender_id === profile.id) &&
        n.status === "approved"
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  // Get unique badges earned (filter out undefined badges)
  const earnedBadges = [
    ...new Map(
      receivedNominations
        .filter((n) => n.badge)
        .map((n) => [n.badge!.id, n.badge!])
    ).values(),
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
    <div className="flex-1 w-full overflow-y-auto scrollbar-thin animate-page-enter">
      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[60] p-4 pt-20">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in">
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  aria-label="Close edit modal"
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="px-5 py-4 space-y-3">
              {/* Avatar Upload */}
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={avatarPreview || profile.avatar_url}
                    alt={profile.username}
                    className="w-16 h-16 rounded-xl border-2 border-gray-200 bg-gray-100 object-cover"
                  />
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl cursor-pointer hover:bg-black/60 transition-colors opacity-0 hover:opacity-100">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      aria-label="Upload avatar"
                    />
                  </label>
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none px-3 py-2 text-gray-900 text-sm transition-all"
                  />
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    placeholder="Department"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none px-3 py-2 text-gray-600 text-sm transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-birthday-modal" className="block text-xs font-medium text-gray-500 mb-1">Birthday <span className="text-gray-400">(optional)</span></label>
                  <input
                    id="edit-birthday-modal"
                    type="date"
                    value={editBirthday}
                    onChange={(e) => setEditBirthday(e.target.value)}
                    aria-label="Birthday"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none px-3 py-2 text-gray-600 text-sm transition-all"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">dd/mm/yyyy</p>
                </div>
                <div>
                  <label htmlFor="edit-anniversary-modal" className="block text-xs font-medium text-gray-500 mb-1">Work Start <span className="text-gray-400">(optional)</span></label>
                  <input
                    id="edit-anniversary-modal"
                    type="date"
                    value={editWorkAnniversary}
                    onChange={(e) => setEditWorkAnniversary(e.target.value)}
                    aria-label="Work Anniversary"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none px-3 py-2 text-gray-600 text-sm transition-all"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">dd/mm/yyyy</p>
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving || !(editName?.trim())}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm font-medium"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative">
        <div className="h-56 bg-gradient-to-br from-purple-600 via-purple-500 to-purple-400" />
        <div className="absolute inset-x-0 bottom-0 transform translate-y-1/2">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-36 h-36 rounded-2xl border-4 border-white bg-gray-100 shadow-xl object-cover"
                />
              </div>

              {/* Name & Info Card */}
              <div className="flex-1 pt-2">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
                      <div className="flex items-center flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm font-medium">
                          <Briefcase className="w-3.5 h-3.5" />
                          {profile.department}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium capitalize">
                          {profile.job_title}
                        </span>
                        {profile.birthday && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-pink-600 text-sm font-medium">
                            <Cake className="w-3.5 h-3.5" />
                            {new Date(profile.birthday).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                        {profile.work_anniversary && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-sm font-medium">
                            <Gift className="w-3.5 h-3.5" />
                            {new Date(profile.work_anniversary).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Kudos Badge */}
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl px-4 py-2 flex items-center gap-2 shadow-md">
                        <Award className="w-5 h-5 text-white" />
                        <span className="text-white font-bold">
                          {profile.kudos_balance}
                        </span>
                        <span className="text-purple-100 text-sm">Kudos</span>
                      </div>
                      {/* Edit Button */}
                      {isOwnProfile && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                          <span className="text-sm font-medium">Edit</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Recognition Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <Inbox className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Recognitions</span>
                      <p className="text-gray-900 font-medium">Received</p>
                    </div>
                  </div>
                  <span className="text-3xl font-bold text-green-600">
                    {receivedNominations.length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Send className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Recognitions</span>
                      <p className="text-gray-900 font-medium">Sent</p>
                    </div>
                  </div>
                  <span className="text-3xl font-bold text-blue-600">
                    {sentNominations.length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Award className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Total</span>
                      <p className="text-gray-900 font-medium">Kudos Balance</p>
                    </div>
                  </div>
                  <span className="text-3xl font-bold text-purple-600">
                    {profile.kudos_balance}
                  </span>
                </div>
              </div>

              {/* Engagement Stats */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  Engagement Stats
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-pink-50 rounded-lg border border-pink-200">
                    <ThumbsUp className="w-5 h-5 text-pink-500" />
                    <div>
                      <p className="text-xs text-gray-500">Reactions Given</p>
                      <p className="text-lg font-bold text-pink-600">{reactionsGiven}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <Flame className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-xs text-gray-500">Reactions Received</p>
                      <p className="text-lg font-bold text-amber-600">{reactionsReceived}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Join Date */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatJoinDate(profile.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Badges Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                Badges Earned
              </h3>
              {earnedBadges.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {earnedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-purple-300 transition-all hover:scale-105"
                    >
                      <div
                        className={`p-3 rounded-full bg-purple-100 mb-2 ${badge.color}`}
                      >
                        {badgeIcons[badge.id] || <Award className="w-5 h-5" />}
                      </div>
                      <span className="text-gray-900 text-sm font-medium text-center">
                        {badge.name}
                      </span>
                      <span className="text-2xl mt-1">{badge.icon}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No badges earned yet</p>
                  <p className="text-gray-400 text-sm mt-1">Receive recognitions to earn badges!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Activity Feed) - Now takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 min-h-[600px]">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
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
                <div className="text-center py-16">
                  <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-gray-900 font-medium text-lg mb-2">
                    No activity yet
                  </h4>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Start recognizing colleagues to build your activity feed and earn badges!
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
  const isReceiver = nomination.receiver_id === profileId;
  const sender = nomination.sender;
  const receiver = nomination.receiver;
  const badge = nomination.badge;

  if (!sender || !receiver) return null;

  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-purple-200 transition-all">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <img
          src={isReceiver ? sender.avatar_url : receiver.avatar_url}
          alt={isReceiver ? sender.username : receiver.username}
          className="w-10 h-10 rounded-full border-2 border-gray-200"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            {isReceiver ? (
              <>
                <span className="text-gray-900 font-medium">
                  {sender.username}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span className="text-purple-600 font-medium">Recognized you</span>
              </>
            ) : (
              <>
                <span className="text-purple-600 font-medium">You recognized</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 font-medium">
                  {receiver.username}
                </span>
              </>
            )}
          </div>

          {/* Badge */}
          {badge && (
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 ${badge.color}`}
              >
                <span>{badge.icon}</span>
                {badge.name}
              </span>
              <span className="text-gray-400 text-xs">
                {formatDate(nomination.created_at)}
              </span>
            </div>
          )}

          {/* Message */}
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {nomination.message}
          </p>
        </div>
      </div>
    </div>
  );
}

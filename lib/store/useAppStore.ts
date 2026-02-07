import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { User as AuthUser } from "@supabase/supabase-js";

// Database types (matching Supabase schema)
export interface Profile {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  job_title: string;  // "employee", "admin", "Team Member", etc.
  department: string;
  kudos_balance: number;
  birthday?: string;  // ISO date string e.g. "1990-05-15"
  work_anniversary?: string;  // ISO date string e.g. "2022-03-01"
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface Nomination {
  id: string;
  sender_id: string;
  receiver_id: string;
  badge_id: string;
  message: string;
  status?: "pending" | "approved" | "rejected";  // Optional - column may not exist
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  // Joined data
  sender?: Profile;
  receiver?: Profile;
  badge?: Badge;
  reactions?: Reaction[];
  comments?: Comment[];
}

export interface Reaction {
  id: string;
  nomination_id: string;
  user_id: string;
  type: "heart" | "clap" | "fire" | "rocket";
  created_at: string;
}

export interface Comment {
  id: string;
  nomination_id: string;
  user_id: string;
  content: string;
  parent_id?: string | null;  // For replies
  created_at: string;
  // Joined data
  user?: Profile;
  likes?: CommentLike[];
  replies?: Comment[];
}

export interface CommentLike {
  id: string;
  comment_id: string;
  user_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  type: "received_nomination" | "nomination_approved" | "nomination_rejected";
  nominationId: string;
  message: string;
  fromUser?: Profile;
  badge?: Badge;
  read: boolean;
  created_at: string;
}

interface AppState {
  // Auth user from Supabase
  user: AuthUser | null;
  
  // Data from database
  profiles: Profile[];
  badges: Badge[];
  nominations: Nomination[];
  
  // Loading state
  isLoading: boolean;
  
  // Current user's profile (derived from user + profiles)
  currentProfile: Profile | null;
  
  // Fetch all data from Supabase
  fetchData: () => Promise<void>;
  
  // Refresh just nominations
  refreshFeed: () => Promise<void>;
  
  // Send a new nomination
  sendNomination: (receiver_id: string, badge_id: string, message: string) => Promise<void>;
  
  // Approve/reject nominations (for managers/admins)
  approveNomination: (nominationId: string) => Promise<void>;
  rejectNomination: (nominationId: string) => Promise<void>;
  deleteNomination: (nominationId: string) => Promise<void>;
  
  // Approve/reject admin users
  approveAdminUser: (userId: string) => Promise<void>;
  rejectAdminUser: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
  
  // Kudos management
  recalculateKudos: () => Promise<void>;
  
  // Reactions
  reactions: Reaction[];
  addReaction: (nominationId: string, type: Reaction["type"]) => Promise<void>;
  removeReaction: (nominationId: string) => Promise<void>;
  getReactionsForNomination: (nominationId: string) => Reaction[];
  getUserReactionForNomination: (nominationId: string) => Reaction | undefined;
  
  // Comments
  comments: Comment[];
  commentLikes: CommentLike[];
  addComment: (nominationId: string, content: string, parentId?: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  unlikeComment: (commentId: string) => Promise<void>;
  getCommentsForNomination: (nominationId: string) => Comment[];
  getUserLikeForComment: (commentId: string) => CommentLike | undefined;
  
  // Computed helpers
  pendingNominations: () => Nomination[];
  approvedNominations: () => Nomination[];
  pendingAdminUsers: () => Profile[];
  getProfileById: (id: string) => Profile | undefined;
  getBadgeById: (id: string) => Badge | undefined;
  
  // Notifications
  notifications: Notification[];
  unreadNotificationCount: () => number;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  generateNotifications: () => Notification[];
  
  // UI State
  isNominationModalOpen: boolean;
  setNominationModalOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()((set, get) => ({
  // Initial state
  user: null,
  profiles: [],
  badges: [],
  nominations: [],
  reactions: [],
  comments: [],
  commentLikes: [],
  notifications: [],
  isLoading: false,
  currentProfile: null,
  
  // Fetch all data from Supabase
  fetchData: async () => {
    // Don't set loading if we already have data (background refresh)
    const hasData = get().profiles.length > 0;
    if (!hasData) {
      set({ isLoading: true });
    }
    const supabase = createClient();
    
    try {
      // Get authenticated user with timeout
      let user = null;
      try {
        const { data, error: authError } = await Promise.race([
          supabase.auth.getUser(),
          new Promise<{ data: { user: null }, error: Error }>((_, reject) => 
            setTimeout(() => reject(new Error('Auth timeout')), 10000)
          )
        ]);
        
        if (authError) {
          console.warn("Auth warning:", authError.message);
        }
        user = data?.user || null;
      } catch (authTimeoutError) {
        console.warn("Auth request timed out, continuing without user");
      }
      
      if (user) {
        console.log("Authenticated user:", user.id, user.email);
      }
      
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");
      
      if (profilesError) {
        console.error("Profiles fetch error:", profilesError);
      }
      console.log("Fetched profiles:", profiles?.length, profiles);
      
      // Fetch badges
      const { data: badges, error: badgesError } = await supabase
        .from("badges")
        .select("*");
      
      if (badgesError) {
        console.error("Badges fetch error:", badgesError);
      }
      console.log("Fetched badges:", badges?.length, badges);
      
      // Fetch nominations with joined data
      const { data: nominations, error: nominationsError } = await supabase
        .from("nominations")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (nominationsError) {
        console.error("Nominations fetch error:", nominationsError);
      }
      console.log("Fetched nominations:", nominations?.length);
      
      // Fetch reactions
      const { data: reactions, error: reactionsError } = await supabase
        .from("reactions")
        .select("*");
      
      if (reactionsError) {
        console.error("Reactions fetch error:", reactionsError);
      }
      console.log("Fetched reactions:", reactions?.length);
      
      // Fetch comments
      const { data: comments, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: true });
      
      if (commentsError && commentsError.code !== '42P01') {
        // 42P01 = table doesn't exist, which is fine
        console.error("Comments fetch error:", commentsError);
      }
      console.log("Fetched comments:", comments?.length);
      
      // Fetch comment likes
      const { data: commentLikes, error: commentLikesError } = await supabase
        .from("comment_likes")
        .select("*");
      
      if (commentLikesError && commentLikesError.code !== '42P01') {
        // 42P01 = table doesn't exist, which is fine
        console.error("Comment likes fetch error:", commentLikesError);
      }
      console.log("Fetched comment likes:", commentLikes?.length);
      
      // Find current user's profile
      const currentProfile = profiles?.find(p => p.id === user?.id) || null;
      console.log("Current profile found:", currentProfile);
      
      // Enrich comments with user data, likes, and organize replies
      const enrichedComments = (comments || []).map(c => ({
        ...c,
        user: profiles?.find(p => p.id === c.user_id),
        likes: (commentLikes || []).filter(l => l.comment_id === c.id),
      }));
      
      // Separate top-level comments and replies
      const topLevelComments = enrichedComments.filter(c => !c.parent_id);
      const replyComments = enrichedComments.filter(c => c.parent_id);
      
      // Attach replies to their parent comments
      const commentsWithReplies = topLevelComments.map(c => ({
        ...c,
        replies: replyComments.filter(r => r.parent_id === c.id),
      }));
      
      // Enrich nominations with sender, receiver, badge, reactions, and comments data
      const enrichedNominations = (nominations || []).map(nom => ({
        ...nom,
        sender: profiles?.find(p => p.id === nom.sender_id),
        receiver: profiles?.find(p => p.id === nom.receiver_id),
        badge: badges?.find(b => b.id === nom.badge_id),
        reactions: (reactions || []).filter(r => r.nomination_id === nom.id),
        comments: commentsWithReplies.filter(c => c.nomination_id === nom.id),
      }));
      
      set({
        user,
        profiles: profiles || [],
        badges: badges || [],
        nominations: enrichedNominations,
        reactions: reactions || [],
        comments: enrichedComments || [],
        commentLikes: commentLikes || [],
        currentProfile,
        isLoading: false,
      });
    } catch (error: any) {
      // Handle network errors silently during background refresh
      const errorMessage = error?.message || String(error);
      const isNetworkError = errorMessage.includes('Failed to fetch') || 
                             errorMessage.includes('NetworkError') ||
                             errorMessage.includes('timeout');
      
      if (isNetworkError) {
        console.warn("Network issue during fetch, will retry on next refresh");
      } else {
        console.error("Error fetching data:", error);
      }
      set({ isLoading: false });
    }
  },
  
  // Refresh just the nominations feed
  refreshFeed: async () => {
    const supabase = createClient();
    const { profiles, badges } = get();
    
    try {
      const { data: nominations } = await supabase
        .from("nominations")
        .select("*")
        .order("created_at", { ascending: false });
      
      // Fetch reactions
      const { data: reactions } = await supabase
        .from("reactions")
        .select("*");
      
      // Enrich nominations with sender, receiver, badge, and reactions data
      const enrichedNominations = (nominations || []).map(nom => ({
        ...nom,
        sender: profiles.find(p => p.id === nom.sender_id),
        receiver: profiles.find(p => p.id === nom.receiver_id),
        badge: badges.find(b => b.id === nom.badge_id),
        reactions: (reactions || []).filter(r => r.nomination_id === nom.id),
      }));
      
      set({ nominations: enrichedNominations, reactions: reactions || [] });
    } catch (error: any) {
      // Handle network errors silently for background refreshes
      const errorMessage = error?.message || String(error);
      const isNetworkError = errorMessage.includes('Failed to fetch') || 
                             errorMessage.includes('NetworkError');
      if (!isNetworkError) {
        console.error("Error refreshing feed:", error);
      }
    }
  },
  
  // Send a new nomination
  sendNomination: async (receiver_id: string, badge_id: string, message: string) => {
    const supabase = createClient();
    const { user } = get();
    
    if (!user) {
      console.error("User not authenticated");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("nominations")
        .insert({
          sender_id: user.id,
          receiver_id,
          badge_id,
          message,
          status: "pending",
        })
        .select();
      
      if (error) {
        console.error("Error sending nomination:", error.message, error.details, error.hint);
        return;
      }
      
      console.log("Nomination inserted:", data);
      
      // Re-fetch nominations to update UI
      await get().refreshFeed();
      
      console.log("🎉 Nomination sent successfully!");
    } catch (error) {
      console.error("Error sending nomination:", error);
    }
  },
  
  // Approve a nomination
  approveNomination: async (nominationId: string) => {
    const supabase = createClient();
    const { user, nominations, profiles } = get();
    
    if (!user) return;
    
    // Find the nomination to get sender and receiver IDs
    const nomination = nominations.find(n => n.id === nominationId);
    if (!nomination) return;
    
    const senderId = nomination.sender_id;
    const receiverId = nomination.receiver_id;
    
    // Kudos points config
    const SENDER_KUDOS = 1;   // Points for sending a recognition
    const RECEIVER_KUDOS = 2; // Points for receiving a recognition
    
    // Optimistically update local state first
    const updatedNominations = nominations.map(n => 
      n.id === nominationId ? { ...n, status: "approved" as const } : n
    );
    
    // Optimistically update kudos balances in profiles
    const updatedProfiles = profiles.map(p => {
      if (p.id === senderId) {
        return { ...p, kudos_balance: p.kudos_balance + SENDER_KUDOS };
      }
      if (p.id === receiverId) {
        return { ...p, kudos_balance: p.kudos_balance + RECEIVER_KUDOS };
      }
      return p;
    });
    
    set({ nominations: updatedNominations, profiles: updatedProfiles });
    
    try {
      // Update nomination status
      const { data, error } = await supabase
        .from("nominations")
        .update({ status: "approved" })
        .eq("id", nominationId)
        .select();
      
      if (error) {
        console.error("Error approving nomination:", error.message, error.details, error.hint);
        // Revert on error
        set({ nominations, profiles });
        return;
      }
      
      // Update sender's kudos balance - get fresh value first
      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("kudos_balance")
        .eq("id", senderId)
        .single();
      
      const senderCurrentKudos = senderProfile?.kudos_balance || 0;
      const { error: senderUpdateError } = await supabase
        .from("profiles")
        .update({ kudos_balance: senderCurrentKudos + SENDER_KUDOS })
        .eq("id", senderId);
      
      if (senderUpdateError) {
        console.error("Error updating sender kudos:", senderUpdateError);
      } else {
        console.log(`Sender kudos updated: ${senderCurrentKudos} -> ${senderCurrentKudos + SENDER_KUDOS}`);
      }
      
      // Update receiver's kudos balance - get fresh value first
      const { data: receiverProfile } = await supabase
        .from("profiles")
        .select("kudos_balance")
        .eq("id", receiverId)
        .single();
      
      const receiverCurrentKudos = receiverProfile?.kudos_balance || 0;
      const { error: receiverUpdateError } = await supabase
        .from("profiles")
        .update({ kudos_balance: receiverCurrentKudos + RECEIVER_KUDOS })
        .eq("id", receiverId);
      
      if (receiverUpdateError) {
        console.error("Error updating receiver kudos:", receiverUpdateError);
      } else {
        console.log(`Receiver kudos updated: ${receiverCurrentKudos} -> ${receiverCurrentKudos + RECEIVER_KUDOS}`);
      }
      
      console.log("Nomination approved in DB:", data);
      console.log(`✅ Kudos awarded: +${SENDER_KUDOS} to sender, +${RECEIVER_KUDOS} to receiver`);
      
      // Refresh data to ensure UI is in sync with database
      await get().fetchData();
      
      console.log("✅ Nomination approved!");
    } catch (error) {
      console.error("Error approving nomination:", error);
      // Keep the optimistic update even on error
    }
  },
  
  // Reject a nomination
  rejectNomination: async (nominationId: string) => {
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from("nominations")
        .update({ status: "rejected" })
        .eq("id", nominationId);
      
      if (error) {
        console.error("Error rejecting nomination:", error);
        return;
      }
      
      await get().fetchData();
      console.log("❌ Nomination rejected");
    } catch (error) {
      console.error("Error rejecting nomination:", error);
    }
  },
  
  // Delete a nomination (admin only) - removes kudos but not below 0
  deleteNomination: async (nominationId: string) => {
    const supabase = createClient();
    const { nominations, profiles } = get();
    
    // Find the nomination to get sender and receiver IDs
    const nomination = nominations.find(n => n.id === nominationId);
    if (!nomination) {
      console.error("Nomination not found");
      return;
    }
    
    const SENDER_KUDOS = 1;
    const RECEIVER_KUDOS = 2;
    const wasApproved = nomination.status === "approved";
    
    try {
      // Delete the nomination
      const { error } = await supabase
        .from("nominations")
        .delete()
        .eq("id", nominationId);
      
      if (error) {
        console.error("Error deleting nomination:", error);
        return;
      }
      
      // If nomination was approved, remove kudos (but don't go below 0)
      if (wasApproved) {
        // Update sender's kudos
        const { data: senderProfile } = await supabase
          .from("profiles")
          .select("kudos_balance")
          .eq("id", nomination.sender_id)
          .single();
        
        const newSenderKudos = Math.max(0, (senderProfile?.kudos_balance || 0) - SENDER_KUDOS);
        await supabase
          .from("profiles")
          .update({ kudos_balance: newSenderKudos })
          .eq("id", nomination.sender_id);
        
        console.log(`Sender kudos reduced: ${senderProfile?.kudos_balance} -> ${newSenderKudos}`);
        
        // Update receiver's kudos
        const { data: receiverProfile } = await supabase
          .from("profiles")
          .select("kudos_balance")
          .eq("id", nomination.receiver_id)
          .single();
        
        const newReceiverKudos = Math.max(0, (receiverProfile?.kudos_balance || 0) - RECEIVER_KUDOS);
        await supabase
          .from("profiles")
          .update({ kudos_balance: newReceiverKudos })
          .eq("id", nomination.receiver_id);
        
        console.log(`Receiver kudos reduced: ${receiverProfile?.kudos_balance} -> ${newReceiverKudos}`);
      }
      
      // Refresh data
      await get().fetchData();
      console.log("🗑️ Nomination deleted");
    } catch (error) {
      console.error("Error deleting nomination:", error);
    }
  },
  
  // Approve a pending admin user
  approveAdminUser: async (userId: string) => {
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ job_title: "admin" })
        .eq("id", userId);
      
      if (error) {
        console.error("Error approving admin user:", error);
        return;
      }
      
      await get().fetchData();
      console.log("✅ Admin user approved!");
    } catch (error) {
      console.error("Error approving admin user:", error);
    }
  },
  
  // Reject a pending admin user (demote to employee)
  rejectAdminUser: async (userId: string) => {
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ job_title: "employee" })
        .eq("id", userId);
      
      if (error) {
        console.error("Error rejecting admin user:", error);
        return;
      }
      
      await get().fetchData();
      console.log("❌ Admin request rejected - demoted to employee");
    } catch (error) {
      console.error("Error rejecting admin user:", error);
    }
  },
  
  // Update any user's role (via API to handle RLS properly)
  updateUserRole: async (userId: string, role: string) => {
    const { profiles } = get();
    
    console.log(`[updateUserRole] Updating user ${userId} role to: ${role}`);
    
    try {
      // Use API route to handle the update (bypasses RLS issues)
      const response = await fetch('/api/admin/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, newRole: role }),
      });
      
      const result = await response.json();
      
      console.log(`[updateUserRole] API Response:`, result);
      
      if (!response.ok) {
        console.error("[updateUserRole] API Error:", result.error);
        throw new Error(result.error || "Failed to update role");
      }
      
      console.log("[updateUserRole] Update successful:", result.data);
      
      // Update local state with the returned data from API
      const updatedProfiles = profiles.map(p => 
        p.id === userId ? { ...p, job_title: result.data.job_title } : p
      );
      set({ profiles: updatedProfiles });
      
      console.log(`[updateUserRole] ✅ User role updated to ${result.data.job_title}`);
      return true;
    } catch (error: any) {
      console.error("[updateUserRole] Error:", error);
      throw error;
    }
  },
  
  // Add or toggle a reaction to a nomination
  addReaction: async (nominationId: string, type: Reaction["type"]) => {
    const supabase = createClient();
    const { user, reactions, nominations } = get();
    
    if (!user) return;
    
    // Check if user already has a reaction on this nomination
    const existingReaction = reactions.find(
      r => r.nomination_id === nominationId && r.user_id === user.id
    );
    
    try {
      if (existingReaction) {
        if (existingReaction.type === type) {
          // Same type - remove the reaction
          const { error } = await supabase
            .from("reactions")
            .delete()
            .eq("id", existingReaction.id);
          
          if (error) {
            console.error("Error removing reaction:", error);
            return;
          }
          
          // Update local state
          const newReactions = reactions.filter(r => r.id !== existingReaction.id);
          const newNominations = nominations.map(n => 
            n.id === nominationId 
              ? { ...n, reactions: n.reactions?.filter(r => r.id !== existingReaction.id) }
              : n
          );
          set({ reactions: newReactions, nominations: newNominations });
          console.log("Reaction removed");
        } else {
          // Different type - update the reaction
          const { data, error } = await supabase
            .from("reactions")
            .update({ type })
            .eq("id", existingReaction.id)
            .select()
            .single();
          
          if (error) {
            console.error("Error updating reaction:", error);
            return;
          }
          
          // Update local state
          const newReactions = reactions.map(r => 
            r.id === existingReaction.id ? { ...r, type } : r
          );
          const newNominations = nominations.map(n => 
            n.id === nominationId 
              ? { ...n, reactions: n.reactions?.map(r => r.id === existingReaction.id ? { ...r, type } : r) }
              : n
          );
          set({ reactions: newReactions, nominations: newNominations });
          console.log("Reaction updated to:", type);
        }
      } else {
        // No existing reaction - insert new one
        const { data, error } = await supabase
          .from("reactions")
          .insert({
            nomination_id: nominationId,
            user_id: user.id,
            type,
          })
          .select()
          .single();
        
        if (error) {
          console.error("Error adding reaction:", error);
          return;
        }
        
        // Update local state
        const newReaction = data as Reaction;
        const newReactions = [...reactions, newReaction];
        const newNominations = nominations.map(n => 
          n.id === nominationId 
            ? { ...n, reactions: [...(n.reactions || []), newReaction] }
            : n
        );
        set({ reactions: newReactions, nominations: newNominations });
        console.log("Reaction added:", type);
      }
    } catch (error) {
      console.error("Error with reaction:", error);
    }
  },
  
  // Remove user's reaction from a nomination
  removeReaction: async (nominationId: string) => {
    const supabase = createClient();
    const { user, reactions, nominations } = get();
    
    if (!user) return;
    
    const existingReaction = reactions.find(
      r => r.nomination_id === nominationId && r.user_id === user.id
    );
    
    if (!existingReaction) return;
    
    try {
      const { error } = await supabase
        .from("reactions")
        .delete()
        .eq("id", existingReaction.id);
      
      if (error) {
        console.error("Error removing reaction:", error);
        return;
      }
      
      const newReactions = reactions.filter(r => r.id !== existingReaction.id);
      const newNominations = nominations.map(n => 
        n.id === nominationId 
          ? { ...n, reactions: n.reactions?.filter(r => r.id !== existingReaction.id) }
          : n
      );
      set({ reactions: newReactions, nominations: newNominations });
    } catch (error) {
      console.error("Error removing reaction:", error);
    }
  },
  
  // Get all reactions for a nomination
  getReactionsForNomination: (nominationId: string) => {
    return get().reactions.filter(r => r.nomination_id === nominationId);
  },
  
  // Get current user's reaction for a nomination
  getUserReactionForNomination: (nominationId: string) => {
    const { user, reactions } = get();
    if (!user) return undefined;
    return reactions.find(r => r.nomination_id === nominationId && r.user_id === user.id);
  },
  
  // Add a comment to a nomination (or reply to another comment)
  addComment: async (nominationId: string, content: string, parentId?: string) => {
    const supabase = createClient();
    const { user, comments, nominations, profiles } = get();
    
    if (!user || !content.trim()) return;
    
    try {
      const insertData: any = {
        nomination_id: nominationId,
        user_id: user.id,
        content: content.trim(),
      };
      
      if (parentId) {
        insertData.parent_id = parentId;
      }
      
      const { data, error } = await supabase
        .from("comments")
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error("Error adding comment:", error);
        return;
      }
      
      // Refresh data to get properly organized comments with replies
      await get().fetchData();
      console.log(parentId ? "Reply added" : "Comment added");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  },
  
  // Delete a comment
  deleteComment: async (commentId: string) => {
    const supabase = createClient();
    const { user, comments, nominations, currentProfile } = get();
    
    if (!user) return;
    
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    
    // Only allow deletion by comment author or admin
    const isAdmin = currentProfile?.job_title?.toLowerCase() === "admin";
    if (comment.user_id !== user.id && !isAdmin) return;
    
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);
      
      if (error) {
        console.error("Error deleting comment:", error);
        return;
      }
      
      // Update local state
      const newComments = comments.filter(c => c.id !== commentId);
      const newNominations = nominations.map(n => ({
        ...n,
        comments: n.comments?.filter(c => c.id !== commentId),
      }));
      set({ comments: newComments, nominations: newNominations });
      console.log("Comment deleted");
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  },
  
  // Get comments for a nomination
  getCommentsForNomination: (nominationId: string) => {
    const { comments, profiles } = get();
    return comments
      .filter(c => c.nomination_id === nominationId)
      .map(c => ({ ...c, user: profiles.find(p => p.id === c.user_id) }));
  },
  
  // Like a comment
  likeComment: async (commentId: string) => {
    const supabase = createClient();
    const { user, commentLikes } = get();
    
    if (!user) return;
    
    // Check if already liked
    const existingLike = commentLikes.find(l => l.comment_id === commentId && l.user_id === user.id);
    if (existingLike) return;
    
    try {
      const { data, error } = await supabase
        .from("comment_likes")
        .insert({
          comment_id: commentId,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error liking comment:", error);
        return;
      }
      
      // Refresh data
      await get().fetchData();
      console.log("Comment liked");
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  },
  
  // Unlike a comment
  unlikeComment: async (commentId: string) => {
    const supabase = createClient();
    const { user, commentLikes } = get();
    
    if (!user) return;
    
    const existingLike = commentLikes.find(l => l.comment_id === commentId && l.user_id === user.id);
    if (!existingLike) return;
    
    try {
      const { error } = await supabase
        .from("comment_likes")
        .delete()
        .eq("id", existingLike.id);
      
      if (error) {
        console.error("Error unliking comment:", error);
        return;
      }
      
      // Refresh data
      await get().fetchData();
      console.log("Comment unliked");
    } catch (error) {
      console.error("Error unliking comment:", error);
    }
  },
  
  // Get user's like for a comment
  getUserLikeForComment: (commentId: string) => {
    const { user, commentLikes } = get();
    if (!user) return undefined;
    return commentLikes.find(l => l.comment_id === commentId && l.user_id === user.id);
  },
  
  // Recalculate all kudos based on approved nominations
  recalculateKudos: async () => {
    try {
      console.log("[recalculateKudos] Starting kudos sync via API...");
      
      // Use API route to handle the update (bypasses RLS issues)
      const response = await fetch('/api/admin/sync-kudos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      console.log("[recalculateKudos] API Response:", result);
      
      if (!response.ok) {
        console.error("[recalculateKudos] API Error:", result.error);
        throw new Error(result.error || "Failed to sync kudos");
      }
      
      console.log(`[recalculateKudos] ✅ ${result.message}`);
      
      // Refresh data to reflect changes
      await get().fetchData();
    } catch (error) {
      console.error("[recalculateKudos] Error:", error);
      throw error;
    }
  },
  
  // Computed helpers
  pendingNominations: () => get().nominations.filter(n => n.status === "pending"),
  approvedNominations: () => get().nominations.filter(n => n.status === "approved"),
  pendingAdminUsers: () => get().profiles.filter(p => p.job_title?.toLowerCase() === "pending_admin"),
  getProfileById: (id: string) => get().profiles.find(p => p.id === id),
  getBadgeById: (id: string) => get().badges.find(b => b.id === id),
  
  // Notification functions
  unreadNotificationCount: () => get().notifications.filter(n => !n.read).length,
  
  markNotificationAsRead: (notificationId: string) => {
    const { notifications, currentProfile } = get();
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    set({ notifications: updatedNotifications });
    
    // Persist to localStorage
    if (currentProfile && typeof window !== 'undefined') {
      const readIds = updatedNotifications.filter(n => n.read).map(n => n.id);
      localStorage.setItem(`notifications_read_${currentProfile.id}`, JSON.stringify(readIds));
    }
  },
  
  markAllNotificationsAsRead: () => {
    const { notifications, currentProfile } = get();
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    set({ notifications: updatedNotifications });
    
    // Persist to localStorage
    if (currentProfile && typeof window !== 'undefined') {
      const readIds = updatedNotifications.map(n => n.id);
      localStorage.setItem(`notifications_read_${currentProfile.id}`, JSON.stringify(readIds));
    }
  },
  
  generateNotifications: () => {
    const { nominations, currentProfile, profiles, badges } = get();
    if (!currentProfile) return [];
    
    const notifications: Notification[] = [];
    
    // Load read notification IDs from localStorage
    let readNotificationIds: string[] = [];
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`notifications_read_${currentProfile.id}`);
        if (stored) {
          readNotificationIds = JSON.parse(stored);
        }
      } catch (e) {
        console.error('Error loading notification read state:', e);
      }
    }
    
    for (const nom of nominations) {
      // Notification for receiving a nomination (when someone nominated you)
      if (nom.receiver_id === currentProfile.id && nom.status === "approved") {
        const notifId = `received-${nom.id}`;
        notifications.push({
          id: notifId,
          type: "received_nomination",
          nominationId: nom.id,
          message: `${nom.sender?.username || "Someone"} recognized you with ${nom.badge?.name || "a badge"}!`,
          fromUser: nom.sender,
          badge: nom.badge,
          read: readNotificationIds.includes(notifId),
          created_at: nom.created_at,
        });
      }
      
      // Notification for your nomination being approved
      if (nom.sender_id === currentProfile.id && nom.status === "approved") {
        const notifId = `approved-${nom.id}`;
        notifications.push({
          id: notifId,
          type: "nomination_approved",
          nominationId: nom.id,
          message: `Your recognition of ${nom.receiver?.username || "someone"} was approved! +1 kudos`,
          fromUser: nom.receiver,
          badge: nom.badge,
          read: readNotificationIds.includes(notifId),
          created_at: nom.approved_at || nom.created_at,
        });
      }
      
      // Notification for your nomination being rejected
      if (nom.sender_id === currentProfile.id && nom.status === "rejected") {
        const notifId = `rejected-${nom.id}`;
        notifications.push({
          id: notifId,
          type: "nomination_rejected",
          nominationId: nom.id,
          message: `Your recognition of ${nom.receiver?.username || "someone"} was not approved.`,
          fromUser: nom.receiver,
          badge: nom.badge,
          read: readNotificationIds.includes(notifId),
          created_at: nom.created_at,
        });
      }
    }
    
    // Sort by date (newest first)
    notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    // Update store with generated notifications
    set({ notifications });
    
    return notifications;
  },
  
  // UI State
  isNominationModalOpen: false,
  setNominationModalOpen: (open) => set({ isNominationModalOpen: open }),
}));


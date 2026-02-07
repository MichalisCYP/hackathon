"use client";

import React, { useState, useEffect } from "react";
import { Heart, HandMetal, Flame, Rocket, ArrowRight, Trash2, MoreHorizontal, MessageCircle, Send, X, Reply, ThumbsUp } from "lucide-react";
import { Nomination, Reaction, Comment } from "@/lib/store";
import { useAppStore } from "@/lib/store";

interface PostCardProps {
  nomination: Nomination;
}

const reactionIcons: Record<
  Reaction["type"],
  { icon: React.ReactNode; activeIcon: React.ReactNode; color: string; activeColor: string; activeBg: string }
> = {
  heart: {
    icon: <Heart className="w-4 h-4" />,
    activeIcon: <Heart className="w-4 h-4 fill-current" />,
    color: "text-gray-500 hover:text-pink-400",
    activeColor: "text-pink-400",
    activeBg: "bg-pink-500/20",
  },
  clap: {
    icon: <HandMetal className="w-4 h-4" />,
    activeIcon: <HandMetal className="w-4 h-4" />,
    color: "text-gray-500 hover:text-yellow-400",
    activeColor: "text-yellow-400",
    activeBg: "bg-yellow-500/20",
  },
  fire: {
    icon: <Flame className="w-4 h-4" />,
    activeIcon: <Flame className="w-4 h-4 fill-current" />,
    color: "text-gray-500 hover:text-orange-400",
    activeColor: "text-orange-400",
    activeBg: "bg-orange-500/20",
  },
  rocket: {
    icon: <Rocket className="w-4 h-4" />,
    activeIcon: <Rocket className="w-4 h-4 fill-current" />,
    color: "text-gray-500 hover:text-purple-400",
    activeColor: "text-purple-400",
    activeBg: "bg-purple-500/20",
  },
};

export function PostCard({ nomination }: PostCardProps) {
  const { user, addReaction, deleteNomination, addComment, deleteComment, likeComment, unlikeComment, getUserLikeForComment, currentProfile } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const sender = nomination.sender;
  const receiver = nomination.receiver;
  const badge = nomination.badge;
  const reactions = nomination.reactions || [];
  const comments = nomination.comments || [];
  
  // Get user's current reaction for this nomination
  const userReaction = reactions.find(r => r.user_id === user?.id);
  
  // Count reactions by type
  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {} as Record<Reaction["type"], number>);

  const handleReaction = (type: Reaction["type"]) => {
    addReaction(nomination.id, type);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this nomination? This will remove the kudos points awarded.")) {
      return;
    }
    setIsDeleting(true);
    setShowMenu(false);
    await deleteNomination(nomination.id);
    setIsDeleting(false);
  };

  // Check if current user can delete (sender or admin)
  const canDelete = user?.id === nomination.sender_id || 
    currentProfile?.job_title?.toLowerCase() === "admin";

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;
    
    setIsSubmittingComment(true);
    await addComment(nomination.id, newComment);
    setNewComment("");
    setIsSubmittingComment(false);
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyContent.trim() || isSubmittingComment) return;
    
    setIsSubmittingComment(true);
    await addComment(nomination.id, replyContent, parentId);
    setReplyContent("");
    setReplyingTo(null);
    setIsSubmittingComment(false);
  };

  const handleLikeComment = async (commentId: string) => {
    const existingLike = getUserLikeForComment(commentId);
    if (existingLike) {
      await unlikeComment(commentId);
    } else {
      await likeComment(commentId);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
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

  if (!sender || !receiver) return null;

  return (
    <div className="glass-card group hover:border-purple-300 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Sender */}
          <div className="relative">
            <img
              src={sender.avatar_url}
              alt={sender.username}
              className="w-10 h-10 rounded-full border-2 border-gray-200"
            />
          </div>

          {/* Arrow */}
          <div className="flex items-center gap-2 text-gray-400">
            <span className="font-medium text-gray-900 text-sm">
              {sender.username}
            </span>
            <ArrowRight className="w-4 h-4" />
            <span className="font-medium text-purple-700 text-sm">
              {receiver.username}
            </span>
          </div>

          {/* Receiver */}
          <div className="relative">
            <img
              src={receiver.avatar_url}
              alt={receiver.username}
              className="w-10 h-10 rounded-full border-2 border-purple-300"
            />
          </div>
        </div>

        {/* Badge and Menu */}
        <div className="flex items-center gap-2">
          {badge && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 ${badge.color}`}
            >
              <span className="text-lg">{badge.icon}</span>
              <span className="text-sm font-medium text-purple-700">{badge.name}</span>
            </div>
          )}
          
          {/* Delete Menu */}
          {canDelete && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                disabled={isDeleting}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
                ) : (
                  <MoreHorizontal className="w-4 h-4" />
                )}
              </button>
              
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMenu(false)} 
                  />
                  <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-50 transition-colors text-left text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Message */}
      <p className="text-lg text-gray-700 leading-relaxed mb-4">
        {nomination.message}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {/* Reactions */}
        <div className="flex items-center gap-2">
          {(Object.keys(reactionIcons) as Reaction["type"][]).map((type) => {
            const { icon, activeIcon, color, activeColor, activeBg } = reactionIcons[type];
            const count = reactionCounts[type] || 0;
            const isActive = userReaction?.type === type;

            return (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200
                  ${isActive 
                    ? `${activeBg} ${activeColor}` 
                    : `hover:bg-gray-100 ${color}`
                  }`}
              >
                {isActive ? activeIcon : icon}
                {count > 0 && (
                  <span className={`text-xs font-medium ${isActive ? activeColor : 'text-gray-500'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Comment button + Timestamp */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200
              ${showComments 
                ? 'bg-blue-500/20 text-blue-500' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-blue-400'
              }`}
          >
            <MessageCircle className="w-4 h-4" />
            {comments.length > 0 && (
              <span className={`text-xs font-medium ${showComments ? 'text-blue-500' : 'text-gray-500'}`}>
                {comments.length}
              </span>
            )}
          </button>
          <span className="text-xs text-gray-400">
            {formatDate(nomination.created_at)}
          </span>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          {/* Existing Comments */}
          {comments.length > 0 && (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {comments.map((comment) => {
                const commentLiked = getUserLikeForComment(comment.id);
                const likeCount = comment.likes?.length || 0;
                
                return (
                  <div key={comment.id} className="space-y-2">
                    {/* Main Comment */}
                    <div className="flex gap-3 group">
                      <img
                        src={comment.user?.avatar_url || '/placeholder-avatar.png'}
                        alt={comment.user?.username || 'User'}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-50 rounded-xl px-3 py-2">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-medium text-gray-900">
                              {comment.user?.username || 'Unknown'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                        {/* Comment Actions */}
                        <div className="flex items-center gap-3 mt-1 ml-2">
                          <button
                            onClick={() => handleLikeComment(comment.id)}
                            className={`flex items-center gap-1 text-xs transition-colors ${
                              commentLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'
                            }`}
                          >
                            <ThumbsUp className={`w-3 h-3 ${commentLiked ? 'fill-current' : ''}`} />
                            {likeCount > 0 && <span>{likeCount}</span>}
                            {likeCount === 0 && <span>Like</span>}
                          </button>
                          <button
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <Reply className="w-3 h-3" />
                            Reply
                          </button>
                          {(comment.user_id === user?.id || currentProfile?.job_title?.toLowerCase() === "admin") && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                        
                        {/* Reply Form */}
                        {replyingTo === comment.id && (
                          <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="flex gap-2 mt-2 ml-2">
                            <input
                              type="text"
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder={`Reply to ${comment.user?.username || 'comment'}...`}
                              autoFocus
                              className="flex-1 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-sm focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-all"
                            />
                            <button
                              type="submit"
                              title="Send reply"
                              disabled={!replyContent.trim() || isSubmittingComment}
                              className={`p-1.5 rounded-full transition-all ${
                                replyContent.trim() && !isSubmittingComment
                                  ? 'bg-purple-500 text-white hover:bg-purple-600'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              <Send className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              title="Cancel reply"
                              onClick={() => { setReplyingTo(null); setReplyContent(""); }}
                              className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                    
                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-11 space-y-2">
                        {comment.replies.map((reply) => {
                          const replyLiked = getUserLikeForComment(reply.id);
                          const replyLikeCount = reply.likes?.length || 0;
                          
                          return (
                            <div key={reply.id} className="flex gap-2 group">
                              <img
                                src={reply.user?.avatar_url || '/placeholder-avatar.png'}
                                alt={reply.user?.username || 'User'}
                                className="w-6 h-6 rounded-full flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="bg-gray-50 rounded-xl px-3 py-2">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs font-medium text-gray-900">
                                      {reply.user?.username || 'Unknown'}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {formatDate(reply.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-700">{reply.content}</p>
                                </div>
                                {/* Reply Actions */}
                                <div className="flex items-center gap-3 mt-0.5 ml-2">
                                  <button
                                    onClick={() => handleLikeComment(reply.id)}
                                    className={`flex items-center gap-1 text-xs transition-colors ${
                                      replyLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'
                                    }`}
                                  >
                                    <ThumbsUp className={`w-2.5 h-2.5 ${replyLiked ? 'fill-current' : ''}`} />
                                    {replyLikeCount > 0 && <span>{replyLikeCount}</span>}
                                  </button>
                                  {(reply.user_id === user?.id || currentProfile?.job_title?.toLowerCase() === "admin") && (
                                    <button
                                      onClick={() => handleDeleteComment(reply.id)}
                                      className="text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Comment Form */}
          <form onSubmit={handleSubmitComment} className="flex gap-2">
            <img
              src={currentProfile?.avatar_url || '/placeholder-avatar.png'}
              alt="You"
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmittingComment}
                className={`p-2 rounded-full transition-all ${
                  newComment.trim() && !isSubmittingComment
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmittingComment ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

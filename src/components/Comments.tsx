import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { toast } from 'react-toastify';
import { MessageCircle, Send, Trash2, User } from 'lucide-react';

interface Comment {
  id: string;
  content_type: string;
  content_id: string;
  user_email: string;
  user_name: string;
  comment_text: string;
  created_at: string;
}

interface CommentsProps {
  contentType: 'post' | 'activity' | 'meeting';
  contentId: string;
}

export default function Comments({ contentType, contentId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (showComments) {
      fetchComments();
      checkAuth();
    }
  }, [showComments, contentId]);

  const checkAuth = async () => {
    if (!isSupabaseReady || !supabase) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) {
      setIsAuthenticated(true);
      setUserEmail(session.user.email);
      setUserName(session.user.user_metadata?.name || session.user.email.split('@')[0]);
    }
  };

  const fetchComments = async () => {
    if (!isSupabaseReady || !supabase) return;

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      setComments(data || []);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }

    if (!isSupabaseReady || !supabase) {
      toast.error('Database not configured');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          content_type: contentType,
          content_id: contentId,
          user_email: userEmail,
          user_name: userName,
          comment_text: newComment.trim(),
        }]);

      if (error) throw error;

      setNewComment('');
      toast.success('Comment posted!');
      fetchComments();
    } catch (error: any) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!isSupabaseReady || !supabase) return;

    if (!confirm('Delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast.success('Comment deleted');
      fetchComments();
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="border-t border-gray-100">
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium px-4 py-3 w-full text-left"
      >
        <MessageCircle size={18} className="mr-2" />
        Comments ({comments.length})
      </button>

      {showComments && (
        <div className="px-4 pb-4">
          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bjp-saffron focus:border-transparent text-sm"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !newComment.trim()}
                  className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              Please login to post comments
            </div>
          )}

          {comments.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-4">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-bjp-lightSaffron rounded-full flex items-center justify-center mr-2">
                        <User size={16} className="text-bjp-saffron" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{comment.user_name}</p>
                        <p className="text-xs text-gray-500">{getTimeAgo(comment.created_at)}</p>
                      </div>
                    </div>
                    {isAuthenticated && userEmail === comment.user_email && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-900">{comment.comment_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

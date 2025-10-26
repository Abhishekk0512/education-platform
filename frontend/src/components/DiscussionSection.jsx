import { useState, useEffect } from 'react';
import { MessageCircle, Send, Trash2, Edit2, Pin, MoreVertical, X, Check } from 'lucide-react';
import { discussionAPI } from '../services/api';

const DiscussionSection = ({ courseId, user, isAdmin, isTeacher }) => {
  const [discussions, setDiscussions] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(null);

  useEffect(() => {
    if (courseId) {
      fetchDiscussions();
    }
  }, [courseId]);

  const fetchDiscussions = async () => {
    try {
      const response = await discussionAPI.getCourseDiscussions(courseId);
      setDiscussions(response.data || []);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setDiscussions([]);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const response = await discussionAPI.createComment({
        courseId,
        content: newComment,
        parentCommentId: null
      });
      setDiscussions([{ ...response.data, replies: [] }, ...discussions]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePostReply = async (commentId) => {
    if (!replyContent.trim()) return;
    setLoading(true);
    try {
      const response = await discussionAPI.createComment({
        courseId,
        content: replyContent,
        parentCommentId: commentId
      });
      setDiscussions(discussions.map(disc => 
        disc._id === commentId ? { ...disc, replies: [...(disc.replies || []), response.data] } : disc
      ));
      setReplyingTo(null);
      setReplyContent('');
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return;
    setLoading(true);
    try {
      const response = await discussionAPI.updateComment(commentId, { content: editContent });
      setDiscussions(discussions.map(disc => {
        if (disc._id === commentId) return { ...response.data, replies: disc.replies };
        if (disc.replies) {
          return { ...disc, replies: disc.replies.map(reply => reply._id === commentId ? response.data : reply) };
        }
        return disc;
      }));
      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      console.error('Error editing comment:', error);
      alert('Failed to edit comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId, isReply = false, parentId = null) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    setLoading(true);
    try {
      await discussionAPI.deleteComment(commentId);
      if (isReply && parentId) {
        setDiscussions(discussions.map(disc => 
          disc._id === parentId ? { ...disc, replies: disc.replies.filter(r => r._id !== commentId) } : disc
        ));
      } else {
        setDiscussions(discussions.filter(disc => disc._id !== commentId));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePinComment = async (commentId) => {
    try {
      const response = await discussionAPI.pinComment(commentId);
      setDiscussions(discussions.map(disc => 
        disc._id === commentId ? { ...response.data, replies: disc.replies } : disc
      ).sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      }));
    } catch (error) {
      console.error('Error pinning comment:', error);
      alert('Failed to pin comment. Please try again.');
    }
  };

  const canEdit = (comment) => user && comment.user._id === user._id;
  const canDelete = (comment) => user && (isAdmin || comment.user._id === user._id);
  const canPin = () => isAdmin || isTeacher;

  const formatDate = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now - commentDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return commentDate.toLocaleDateString();
  };

  const Comment = ({ comment, isReply = false, parentId = null }) => {
    const isEditing = editingComment === comment._id;
    return (
      <div className={`${isReply ? 'ml-12 mt-3' : ''}`}>
        <div className="flex space-x-3">
          <img src={comment.user.photo} alt={comment.user.name} className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm text-gray-900">{comment.user.name}</span>
                  {comment.user.role === 'admin' && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded">Admin</span>
                  )}
                  {comment.user.role === 'teacher' && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">Teacher</span>
                  )}
                  {comment.isPinned && <Pin className="h-3.5 w-3.5 text-yellow-600" />}
                </div>
                <div className="relative">
                  <button onClick={() => setShowMenu(showMenu === comment._id ? null : comment._id)} className="p-1 hover:bg-gray-200 rounded">
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </button>
                  {showMenu === comment._id && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {canEdit(comment) && (
                        <button onClick={() => { setEditingComment(comment._id); setEditContent(comment.content); setShowMenu(null); }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2">
                          <Edit2 className="h-4 w-4" /><span>Edit</span>
                        </button>
                      )}
                      {canPin() && !isReply && (
                        <button onClick={() => { handlePinComment(comment._id); setShowMenu(null); }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2">
                          <Pin className="h-4 w-4" /><span>{comment.isPinned ? 'Unpin' : 'Pin'}</span>
                        </button>
                      )}
                      {canDelete(comment) && (
                        <button onClick={() => { handleDeleteComment(comment._id, isReply, parentId); setShowMenu(null); }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-red-600">
                          <Trash2 className="h-4 w-4" /><span>Delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {isEditing ? (
                <div className="mt-2">
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" rows="3" />
                  <div className="flex space-x-2 mt-2">
                    <button onClick={() => handleEditComment(comment._id)} disabled={loading}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center space-x-1 disabled:opacity-50">
                      <Check className="h-4 w-4" /><span>Save</span>
                    </button>
                    <button onClick={() => { setEditingComment(null); setEditContent(''); }}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm flex items-center space-x-1">
                      <X className="h-4 w-4" /><span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              )}
              {comment.isEdited && !isEditing && <span className="text-xs text-gray-500 mt-1 inline-block">(edited)</span>}
            </div>
            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
              <span>{formatDate(comment.createdAt)}</span>
              {!isReply && user && (
                <button onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)} className="hover:text-blue-600 font-medium">Reply</button>
              )}
            </div>
            {replyingTo === comment._id && (
              <div className="mt-3">
                <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Write a reply..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" rows="2" />
                <div className="flex space-x-2 mt-2">
                  <button onClick={() => handlePostReply(comment._id)} disabled={loading || !replyContent.trim()}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center space-x-1">
                    <Send className="h-4 w-4" /><span>Reply</span>
                  </button>
                  <button onClick={() => { setReplyingTo(null); setReplyContent(''); }}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => <Comment key={reply._id} comment={reply} isReply={true} parentId={comment._id} />)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <MessageCircle className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">Discussion</h2>
        <span className="text-sm text-gray-500">({discussions.length} {discussions.length === 1 ? 'comment' : 'comments'})</span>
      </div>
      {user ? (
        <div className="mb-6">
          <div className="flex space-x-3">
            <img src={user.photo} alt={user.name} className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Ask a question or share your thoughts..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="3" />
              <button onClick={handlePostComment} disabled={loading || !newComment.trim()}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2">
                <Send className="h-4 w-4" /><span>Post Comment</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-gray-600">Please log in to join the discussion</p>
        </div>
      )}
      <div className="space-y-6">
        {discussions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No discussions yet. Be the first to comment!</p>
          </div>
        ) : (
          discussions.map((discussion) => <Comment key={discussion._id} comment={discussion} />)
        )}
      </div>
    </div>
  );
};

export default DiscussionSection;
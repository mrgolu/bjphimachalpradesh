import React, { useState } from 'react';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { Plus, Upload, X, Image, Video } from 'lucide-react';
import { toast } from 'react-toastify';

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'post' | 'activity'>('post');
  const [loading, setLoading] = useState(false);

  // Post form state
  const [postContent, setPostContent] = useState('');
  const [postFile, setPostFile] = useState<File | null>(null);
  const [postPreview, setPostPreview] = useState<string | null>(null);
  const [postFacebookUrl, setPostFacebookUrl] = useState('');
  const [postInstagramUrl, setPostInstagramUrl] = useState('');
  const [postTwitterUrl, setPostTwitterUrl] = useState('');

  // Activity form state
  const [activityTitle, setActivityTitle] = useState('');
  const [activityType, setActivityType] = useState('');
  const [activityStartDate, setActivityStartDate] = useState('');
  const [activityEndDate, setActivityEndDate] = useState('');
  const [activityLocation, setActivityLocation] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [activityCoordinator, setActivityCoordinator] = useState('');
  const [activityParticipants, setActivityParticipants] = useState('');
  const [activityFile, setActivityFile] = useState<File | null>(null);
  const [activityPreview, setActivityPreview] = useState<string | null>(null);

  const handleFileUpload = (file: File, type: 'post' | 'activity') => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image or video file');
      return;
    }

    // Convert file to data URL for persistent storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      
      if (type === 'post') {
        setPostFile(file);
        setPostPreview(dataUrl.startsWith('data:video/') ? 'video' : dataUrl);
      } else {
        setActivityFile(file);
        setActivityPreview(dataUrl.startsWith('data:video/') ? 'video' : dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    // Check if Supabase is configured
    if (!isSupabaseReady || !supabase) {
      toast.error('Database not configured. Please connect to Supabase first.');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;
      
      if (postFile) {
        // Convert file to data URL for persistent storage
        const reader = new FileReader();
        imageUrl = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(postFile);
        });
      }

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      const postData = {
        content: postContent,
        image_url: imageUrl,
        facebook_url: postFacebookUrl || null,
        instagram_url: postInstagramUrl || null,
        twitter_url: postTwitterUrl || null,
        user_id: session?.user?.id || null,
      };

      const { error } = await supabase
        .from('posts')
        .insert([postData]);

      if (error) throw error;

      // Reset form
      setPostContent('');
      setPostFile(null);
      setPostPreview(null);
      setPostFacebookUrl('');
      setPostInstagramUrl('');
      setPostTwitterUrl('');
      toast.success('Post created successfully!');
      
      // Refresh the page to show the new post
      window.location.reload();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Error creating post: ' + (error as any).message);
    } finally {
      setLoading(false);
    }
  };

  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim() || !activityType.trim() || !activityStartDate) return;

    // Check if Supabase is configured
    if (!isSupabaseReady || !supabase) {
      toast.error('Database not configured. Please connect to Supabase first.');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;
      
      if (activityFile) {
        // Convert file to data URL for persistent storage
        const reader = new FileReader();
        imageUrl = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(activityFile);
        });
      }

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      const activityData = {
        title: activityTitle,
        type: activityType,
        start_date: activityStartDate,
        end_date: activityEndDate || null,
        location: activityLocation,
        description: activityDescription,
        coordinator: activityCoordinator,
        participants: activityParticipants,
        image_url: imageUrl,
        user_id: session?.user?.id || null,
      };

      const { error } = await supabase
        .from('activities')
        .insert([activityData]);

      if (error) throw error;

      // Reset form
      setActivityTitle('');
      setActivityType('');
      setActivityStartDate('');
      setActivityEndDate('');
      setActivityLocation('');
      setActivityDescription('');
      setActivityCoordinator('');
      setActivityParticipants('');
      setActivityFile(null);
      setActivityPreview(null);
      toast.success('Activity created successfully!');
      
      // Refresh the page to show the new activity
      window.location.reload();
    } catch (error) {
      console.error('Error creating activity:', error);
      toast.error('Error creating activity: ' + (error as any).message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploadOld = (file: File, type: 'post' | 'activity') => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image or video file');
      return;
    }

    if (type === 'post') {
      setPostFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPostPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setPostPreview('video');
      }
    } else {
      setActivityFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setActivityPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setActivityPreview('video');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('post')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'post'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Create Post
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'activity'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Create Activity
            </button>
          </div>

          {/* Post Creation Form */}
          {activeTab === 'post' && (
            <form onSubmit={handlePostSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Content
                </label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What's happening in BJP Himachal Pradesh?"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              {/* Social Media URLs */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Social Media Links (Optional)</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    value={postFacebookUrl}
                    onChange={(e) => setPostFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={postInstagramUrl}
                    onChange={(e) => setPostInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter URL
                  </label>
                  <input
                    type="url"
                    value={postTwitterUrl}
                    onChange={(e) => setPostTwitterUrl(e.target.value)}
                    placeholder="https://twitter.com/... or https://x.com/..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image/Video
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'post');
                    }}
                    className="hidden"
                    id="post-file-upload"
                  />
                  <label htmlFor="post-file-upload" className="cursor-pointer">
                    {postPreview ? (
                      <div className="space-y-2">
                        {postPreview === 'video' ? (
                          <Video className="w-12 h-12 text-orange-500 mx-auto" />
                        ) : (
                          <img src={postPreview} alt="Preview" className="w-32 h-32 object-cover mx-auto rounded" />
                        )}
                        <p className="text-sm text-gray-600">{postFile?.name}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setPostFile(null);
                            setPostPreview(null);
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                        <p className="text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500">Images and videos up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !postContent.trim()}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Create Post
                  </>
                )}
              </button>
            </form>
          )}

          {/* Activity Creation Form */}
          {activeTab === 'activity' && (
            <form onSubmit={handleActivitySubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Title
                  </label>
                  <input
                    type="text"
                    value={activityTitle}
                    onChange={(e) => setActivityTitle(e.target.value)}
                    placeholder="Enter activity title"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Type
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="Rally">Rally</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Campaign">Campaign</option>
                    <option value="Event">Event</option>
                    <option value="Conference">Conference</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={activityStartDate}
                    onChange={(e) => setActivityStartDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={activityEndDate}
                    onChange={(e) => setActivityEndDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={activityLocation}
                  onChange={(e) => setActivityLocation(e.target.value)}
                  placeholder="Enter location"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  placeholder="Describe the activity"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coordinator
                  </label>
                  <input
                    type="text"
                    value={activityCoordinator}
                    onChange={(e) => setActivityCoordinator(e.target.value)}
                    placeholder="Coordinator name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Participants
                  </label>
                  <input
                    type="text"
                    value={activityParticipants}
                    onChange={(e) => setActivityParticipants(e.target.value)}
                    placeholder="Number of participants"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image/Video
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'activity');
                    }}
                    className="hidden"
                    id="activity-file-upload"
                  />
                  <label htmlFor="activity-file-upload" className="cursor-pointer">
                    {activityPreview ? (
                      <div className="space-y-2">
                        {activityPreview === 'video' ? (
                          <Video className="w-12 h-12 text-orange-500 mx-auto" />
                        ) : (
                          <img src={activityPreview} alt="Preview" className="w-32 h-32 object-cover mx-auto rounded" />
                        )}
                        <p className="text-sm text-gray-600">{activityFile?.name}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setActivityFile(null);
                            setActivityPreview(null);
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                        <p className="text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500">Images and videos up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !activityTitle.trim() || !activityType.trim() || !activityStartDate}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Create Activity
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
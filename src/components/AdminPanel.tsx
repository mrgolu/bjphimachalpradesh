import React, { useState } from 'react';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { Plus, Upload, X, Image, Video, Link as LinkIcon } from 'lucide-react';
import { toast } from 'react-toastify';

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'post' | 'activity' | 'meeting' | 'gallery'>('post');
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

  // Meeting form state
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingOrganizer, setMeetingOrganizer] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingNumber, setMeetingNumber] = useState('');
  const [meetingPassword, setMeetingPassword] = useState('');
  const [meetingAgenda, setMeetingAgenda] = useState('');
  const [meetingExpectedAttendees, setMeetingExpectedAttendees] = useState('');

  // Gallery form state
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryDescription, setGalleryDescription] = useState('');
  const [galleryType, setGalleryType] = useState('image');
  const [galleryCategory, setGalleryCategory] = useState('Other');
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryPreview, setGalleryPreview] = useState<string | null>(null);
  const [galleryTags, setGalleryTags] = useState('');
  const [galleryDate, setGalleryDate] = useState('');

  const handleFileUpload = (file: File, type: 'post' | 'activity' | 'gallery') => {
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
      } else if (type === 'activity') {
        setActivityFile(file);
        setActivityPreview(dataUrl.startsWith('data:video/') ? 'video' : dataUrl);
      } else if (type === 'gallery') {
        setGalleryFile(file);
        setGalleryPreview(dataUrl.startsWith('data:video/') ? 'video' : dataUrl);
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

  const handleMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim() || !meetingDate || !meetingTime) return;

    if (!isSupabaseReady || !supabase) {
      toast.error('Database not configured. Please connect to Supabase first.');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const meetingData = {
        title: meetingTitle,
        date: meetingDate,
        time: meetingTime,
        organizer: meetingOrganizer,
        meeting_link: meetingLink,
        meeting_number: meetingNumber,
        password: meetingPassword,
        agenda: meetingAgenda,
        expected_attendees: meetingExpectedAttendees ? meetingExpectedAttendees.split(',').map(a => a.trim()) : [],
        user_id: session?.user?.id || null,
      };

      const { error } = await supabase
        .from('meetings')
        .insert([meetingData]);

      if (error) throw error;

      setMeetingTitle('');
      setMeetingDate('');
      setMeetingTime('');
      setMeetingOrganizer('');
      setMeetingLink('');
      setMeetingNumber('');
      setMeetingPassword('');
      setMeetingAgenda('');
      setMeetingExpectedAttendees('');
      toast.success('Meeting created successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error('Error creating meeting: ' + (error as any).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryTitle.trim() || !galleryFile) return;

    if (!isSupabaseReady || !supabase) {
      toast.error('Database not configured. Please connect to Supabase first.');
      return;
    }

    setLoading(true);
    try {
      let fileUrl = null;

      if (galleryFile) {
        const reader = new FileReader();
        fileUrl = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(galleryFile);
        });
      }

      const { data: { session } } = await supabase.auth.getSession();

      const galleryData = {
        title: galleryTitle,
        description: galleryDescription,
        url: fileUrl,
        type: galleryType,
        category: galleryCategory,
        tags: galleryTags ? galleryTags.split(',').map(t => t.trim()) : [],
        date: galleryDate || new Date().toISOString().split('T')[0],
        user_id: session?.user?.id || null,
      };

      const { error } = await supabase
        .from('gallery_items')
        .insert([galleryData]);

      if (error) throw error;

      setGalleryTitle('');
      setGalleryDescription('');
      setGalleryFile(null);
      setGalleryPreview(null);
      setGalleryType('image');
      setGalleryCategory('Other');
      setGalleryTags('');
      setGalleryDate('');
      toast.success('Gallery item added successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error adding gallery item:', error);
      toast.error('Error adding gallery item: ' + (error as any).message);
    } finally {
      setLoading(false);
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
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg overflow-x-auto">
            <button
              onClick={() => setActiveTab('post')}
              className={`py-2 px-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'post'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Post
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-2 px-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'activity'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab('meeting')}
              className={`py-2 px-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'meeting'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Meeting
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`py-2 px-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'gallery'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Gallery
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

          {/* Meeting Creation Form */}
          {activeTab === 'meeting' && (
            <form onSubmit={handleMeetingSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    placeholder="Meeting title"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organizer
                  </label>
                  <input
                    type="text"
                    value={meetingOrganizer}
                    onChange={(e) => setMeetingOrganizer(e.target.value)}
                    placeholder="Organizer name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agenda
                </label>
                <textarea
                  value={meetingAgenda}
                  onChange={(e) => setMeetingAgenda(e.target.value)}
                  placeholder="Meeting agenda"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://zoom.us/..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Number
                  </label>
                  <input
                    type="text"
                    value={meetingNumber}
                    onChange={(e) => setMeetingNumber(e.target.value)}
                    placeholder="Meeting ID"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="text"
                  value={meetingPassword}
                  onChange={(e) => setMeetingPassword(e.target.value)}
                  placeholder="Meeting password"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Attendees (comma-separated)
                </label>
                <input
                  type="text"
                  value={meetingExpectedAttendees}
                  onChange={(e) => setMeetingExpectedAttendees(e.target.value)}
                  placeholder="name1@email.com, name2@email.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !meetingTitle.trim() || !meetingDate || !meetingTime}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Create Meeting
                  </>
                )}
              </button>
            </form>
          )}

          {/* Gallery Item Form */}
          {activeTab === 'gallery' && (
            <form onSubmit={handleGallerySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gallery Title
                </label>
                <input
                  type="text"
                  value={galleryTitle}
                  onChange={(e) => setGalleryTitle(e.target.value)}
                  placeholder="Gallery item title"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={galleryDescription}
                  onChange={(e) => setGalleryDescription(e.target.value)}
                  placeholder="Item description"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={galleryType}
                    onChange={(e) => setGalleryType(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={galleryCategory}
                    onChange={(e) => setGalleryCategory(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="Event">Event</option>
                    <option value="Campaign">Campaign</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={galleryTags}
                    onChange={(e) => setGalleryTags(e.target.value)}
                    placeholder="tag1, tag2, tag3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={galleryDate}
                    onChange={(e) => setGalleryDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload {galleryType === 'image' ? 'Image' : 'Video'}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                  <input
                    type="file"
                    accept={galleryType === 'image' ? 'image/*' : 'video/*'}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'gallery');
                    }}
                    className="hidden"
                    id="gallery-file-upload"
                  />
                  <label htmlFor="gallery-file-upload" className="cursor-pointer">
                    {galleryPreview ? (
                      <div className="space-y-2">
                        {galleryPreview === 'video' ? (
                          <Video className="w-12 h-12 text-orange-500 mx-auto" />
                        ) : (
                          <img src={galleryPreview} alt="Preview" className="w-32 h-32 object-cover mx-auto rounded" />
                        )}
                        <p className="text-sm text-gray-600">{galleryFile?.name}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setGalleryFile(null);
                            setGalleryPreview(null);
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {galleryType === 'image' ? (
                          <Image className="w-12 h-12 text-gray-400 mx-auto" />
                        ) : (
                          <Video className="w-12 h-12 text-gray-400 mx-auto" />
                        )}
                        <p className="text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500">Files up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !galleryTitle.trim() || !galleryFile}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Add to Gallery
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
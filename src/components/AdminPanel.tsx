import React, { useState, useEffect } from 'react';
import { Plus, Image, Video, Calendar, Users, MessageSquare, BarChart3, Settings, Trash2, Upload } from 'lucide-react';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { toast } from 'react-toastify';
import GalleryAdminPanel from './GalleryAdminPanel';

interface Post {
  id: string;
  content: string;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  image_url: string | null;
  created_at: string;
}

interface Activity {
  id: string;
  title: string;
  type: string;
  start_date: string;
  end_date: string | null;
  location: string;
  description: string;
  coordinator: string;
  participants: string;
  image_url: string | null;
  created_at: string;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  organizer: string;
  meeting_link: string;
  meeting_number: string;
  password: string;
  agenda: string;
  attendees: string[];
  expected_attendees: string[];
  created_at: string;
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'activities' | 'meetings' | 'gallery' | 'analytics'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());

  const [postForm, setPostForm] = useState({
    content: '',
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: ''
  });

  const [activityForm, setActivityForm] = useState({
    title: '',
    type: 'event',
    startDate: '',
    endDate: '',
    location: '',
    description: '',
    coordinator: '',
    participants: '',
  });

  // File upload states
  const [selectedPostFile, setSelectedPostFile] = useState<File | null>(null);
  const [selectedActivityFile, setSelectedActivityFile] = useState<File | null>(null);
  const [postFilePreview, setPostFilePreview] = useState<string | null>(null);
  const [activityFilePreview, setActivityFilePreview] = useState<string | null>(null);
  const [isUploadingPost, setIsUploadingPost] = useState(false);
  const [isUploadingActivity, setIsUploadingActivity] = useState(false);

  const handleFileSelect = (file: File, type: 'post' | 'activity') => {
    if (!file) return;

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    
    const isValidImage = validImageTypes.includes(file.type);
    const isValidVideo = validVideoTypes.includes(file.type);
    
    if (!isValidImage && !isValidVideo) {
      toast.error('Please select a valid image or video file');
      return;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    if (type === 'post') {
      setSelectedPostFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPostFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedActivityFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setActivityFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFileToStorage = async (file: File): Promise<string> => {
    if (!supabase || !user) {
      throw new Error('Authentication required');
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // For demo purposes, we'll use a placeholder URL
    // In a real app, you would upload to Supabase Storage or another service
    return URL.createObjectURL(file);
  };
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date: '',
    time: '',
    organizer: '',
    meetingLink: '',
    meetingNumber: '',
    password: '',
    agenda: '',
    attendees: '',
    expectedAttendees: ''
  });
  useEffect(() => {
    checkAuth();
  }, []);

  const fetchAllData = async () => {
    if (!isSupabaseReady || !supabase) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
      } else {
        setPosts(postsData || []);
      }

      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseReady || !supabase || !user) {
      toast.error('Please sign in to create posts');
      return;
    }

    if (!postForm.content.trim()) {
      toast.error('Content is required');
      return;
    }

    setIsUploadingPost(true);

    try {
      let imageUrl = null;

      // Upload file if selected
      if (selectedPostFile) {
        imageUrl = await uploadFileToStorage(selectedPostFile);
      }

      const { data, error } = await supabase
        .from('posts')
        .insert([{
          content: postForm.content.trim(),
          image_url: imageUrl,
          facebook_url: postForm.facebookUrl.trim() || null,
          instagram_url: postForm.instagramUrl.trim() || null,
          twitter_url: postForm.twitterUrl.trim() || null,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setPosts(prev => [data, ...prev]);
      setPostForm({
        content: '',
        facebookUrl: '',
        instagramUrl: '',
        twitterUrl: ''
      });
      setSelectedPostFile(null);
      setPostFilePreview(null);
      
      toast.success('Post created successfully!');
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post: ' + error.message);
    } finally {
      setIsUploadingPost(false);
    }
  };

  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseReady || !supabase || !user) {
      toast.error('Please sign in to create activities');
      return;
    }

    if (!activityForm.title.trim() || !activityForm.startDate || !activityForm.location.trim()) {
      toast.error('Title, start date, and location are required');
      return;
    }

    setIsUploadingActivity(true);

    try {
      let imageUrl = null;

      // Upload file if selected
      if (selectedActivityFile) {
        imageUrl = await uploadFileToStorage(selectedActivityFile);
      }

      const { data, error } = await supabase
        .from('activities')
        .insert([{
          title: activityForm.title.trim(),
          type: activityForm.type,
          start_date: activityForm.startDate,
          end_date: activityForm.endDate || null,
          location: activityForm.location.trim(),
          description: activityForm.description.trim(),
          coordinator: activityForm.coordinator.trim(),
          participants: activityForm.participants.trim(),
          image_url: imageUrl,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setActivities(prev => [data, ...prev]);
      setActivityForm({
        title: '',
        type: 'event',
        startDate: '',
        endDate: '',
        location: '',
        description: '',
        coordinator: '',
        participants: '',
      });
      setSelectedActivityFile(null);
      setActivityFilePreview(null);
      
      toast.success('Activity created successfully!');
    } catch (error: any) {
      console.error('Error creating activity:', error);
      toast.error('Failed to create activity: ' + error.message);
    } finally {
      setIsUploadingActivity(false);
    }
  };

  const handleMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseReady || !supabase || !user) {
      toast.error('Please sign in to create meetings');
      return;
    }

    if (!meetingForm.title.trim() || !meetingForm.date || !meetingForm.time) {
      toast.error('Title, date, and time are required');
      return;
    }

    try {
      const attendeesList = meetingForm.attendees
        .split('\n')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      const expectedAttendeesList = meetingForm.expectedAttendees
        .split('\n')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      const { data, error } = await supabase
        .from('meetings')
        .insert([{
          title: meetingForm.title.trim(),
          date: meetingForm.date,
          time: meetingForm.time,
          organizer: meetingForm.organizer.trim(),
          meeting_link: meetingForm.meetingLink.trim(),
          meeting_number: meetingForm.meetingNumber.trim(),
          password: meetingForm.password.trim(),
          agenda: meetingForm.agenda.trim(),
          attendees: attendeesList,
          expected_attendees: expectedAttendeesList,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setMeetings(prev => [data, ...prev]);
      setMeetingForm({
        title: '',
        date: '',
        time: '',
        organizer: '',
        meetingLink: '',
        meetingNumber: '',
        password: '',
        agenda: '',
        attendees: '',
        expectedAttendees: ''
      });
      
      toast.success('Meeting created successfully!');
    } catch (error: any) {
      console.error('Error creating meeting:', error);
      toast.error('Failed to create meeting: ' + error.message);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!isSupabaseReady || !supabase) return;

    if (!confirm('Are you sure you want to delete this post?')) return;

    setDeletingItems(prev => new Set(prev).add(id));

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPosts(prev => prev.filter(post => post.id !== id));
      toast.success('Post deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post: ' + error.message);
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!isSupabaseReady || !supabase) return;

    if (!confirm('Are you sure you want to delete this activity?')) return;

    setDeletingItems(prev => new Set(prev).add(id));

    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setActivities(prev => prev.filter(activity => activity.id !== id));
      toast.success('Activity deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting activity:', error);
      toast.error('Failed to delete activity: ' + error.message);
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (!isSupabaseReady || !supabase) return;

    if (!confirm('Are you sure you want to delete this meeting?')) return;

    setDeletingItems(prev => new Set(prev).add(id));

    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMeetings(prev => prev.filter(meeting => meeting.id !== id));
      toast.success('Meeting deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting meeting:', error);
      toast.error('Failed to delete meeting: ' + error.message);
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isSupabaseReady) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <Settings size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Database Setup Required</h3>
          <p className="text-gray-600">
            Connect to Supabase to access the admin panel.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <Settings size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h3>
          <p className="text-gray-600">
            Please sign in to access the admin panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'posts'
                ? 'border-bjp-saffron text-bjp-saffron'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MessageSquare size={20} className="inline mr-2" />
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'activities'
                ? 'border-bjp-saffron text-bjp-saffron'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar size={20} className="inline mr-2" />
            Activities ({activities.length})
          </button>
          <button
            onClick={() => setActiveTab('meetings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'meetings'
                ? 'border-bjp-saffron text-bjp-saffron'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users size={20} className="inline mr-2" />
            Meetings ({meetings.length})
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'gallery'
                ? 'border-bjp-saffron text-bjp-saffron'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Image size={20} className="inline mr-2" />
            Gallery
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-bjp-saffron text-bjp-saffron'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 size={20} className="inline mr-2" />
            Analytics
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'posts' && (
          <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <h3 className="text-lg font-semibold text-bjp-darkGray mb-4">Create New Post</h3>
              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                  </label>
                  <textarea
                    value={postForm.content}
                    onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                    placeholder="What's happening with BJP Himachal Pradesh?"
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Image/Video
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-bjp-saffron transition-colors">
                      {postFilePreview ? (
                        <div className="space-y-2">
                          {selectedPostFile?.type.startsWith('image/') ? (
                            <img
                              src={postFilePreview}
                              alt="Preview"
                              className="max-h-32 mx-auto rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded mx-auto flex items-center justify-center">
                              <Video size={24} className="text-gray-500" />
                            </div>
                          )}
                          <p className="text-sm text-gray-600">{selectedPostFile?.name}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPostFile(null);
                              setPostFilePreview(null);
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Click to upload image or video</p>
                          <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileSelect(file, 'post');
                            }}
                            className="hidden"
                            id="post-file-upload"
                          />
                          <label
                            htmlFor="post-file-upload"
                            className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-3 py-1 rounded text-sm cursor-pointer transition-colors"
                          >
                            Choose File
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      value={postForm.facebookUrl}
                      onChange={(e) => setPostForm({ ...postForm, facebookUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                      placeholder="https://facebook.com/post"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      value={postForm.instagramUrl}
                      onChange={(e) => setPostForm({ ...postForm, instagramUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                      placeholder="https://instagram.com/p/post"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Twitter URL
                    </label>
                    <input
                      type="url"
                      value={postForm.twitterUrl}
                      onChange={(e) => setPostForm({ ...postForm, twitterUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                      placeholder="https://twitter.com/post"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isUploadingPost}
                  className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-6 py-2 rounded-md transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingPost ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={20} className="mr-2" />
                      Create Post
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Recent Posts */}
            <div>
              <h3 className="text-lg font-semibold text-bjp-darkGray mb-4">Recent Posts</h3>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bjp-saffron mx-auto"></div>
                </div>
              ) : posts.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No posts yet. Create your first post above!</p>
              ) : (
                <div className="space-y-4">
                  {posts.slice(0, 5).map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-gray-900 flex-1">{post.content}</p>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          disabled={deletingItems.has(post.id)}
                          className="ml-4 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                          title="Delete post"
                        >
                          {deletingItems.has(post.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{formatDate(post.created_at)}</span>
                        <div className="flex space-x-2">
                          {post.facebook_url && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">FB</span>}
                          {post.instagram_url && <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded">IG</span>}
                          {post.twitter_url && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">TW</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-bjp-darkGray mb-4">Create New Activity</h3>
              <form onSubmit={handleActivitySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={activityForm.title}
                      onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                      placeholder="Activity title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={activityForm.type}
                      onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                    >
                      <option value="event">Event</option>
                      <option value="campaign">Campaign</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={activityForm.startDate}
                      onChange={(e) => setActivityForm({ ...activityForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={activityForm.endDate}
                      onChange={(e) => setActivityForm({ ...activityForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={activityForm.location}
                      onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                      placeholder="Event location"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coordinator
                    </label>
                    <input
                      type="text"
                      value={activityForm.coordinator}
                      onChange={(e) => setActivityForm({ ...activityForm, coordinator: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                      placeholder="Event coordinator"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={activityForm.description}
                    onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                    placeholder="Activity description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Participants
                  </label>
                  <input
                    type="text"
                    value={activityForm.participants}
                    onChange={(e) => setActivityForm({ ...activityForm, participants: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                    placeholder="Expected participants"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image/Video
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-bjp-saffron transition-colors">
                    {activityFilePreview ? (
                      <div className="space-y-2">
                        {selectedActivityFile?.type.startsWith('image/') ? (
                          <img
                            src={activityFilePreview}
                            alt="Preview"
                            className="max-h-32 mx-auto rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded mx-auto flex items-center justify-center">
                            <Video size={24} className="text-gray-500" />
                          </div>
                        )}
                        <p className="text-sm text-gray-600">{selectedActivityFile?.name}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedActivityFile(null);
                            setActivityFilePreview(null);
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Click to upload image or video</p>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(file, 'activity');
                          }}
                          className="hidden"
                          id="activity-file-upload"
                        />
                        <label
                          htmlFor="activity-file-upload"
                          className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-3 py-1 rounded text-sm cursor-pointer transition-colors"
                        >
                          Choose File
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isUploadingActivity}
                  className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-6 py-2 rounded-md transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingActivity ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={20} className="mr-2" />
                      Create Activity
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Recent Activities */}
            <div>
              <h3 className="text-lg font-semibold text-bjp-darkGray mb-4">Recent Activities</h3>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bjp-saffron mx-auto"></div>
                </div>
              ) : activities.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No activities yet. Create your first activity above!</p>
              ) : (
                <div className="space-y-4">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                          <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
                          <div className="flex items-center text-sm text-gray-500 mt-2">
                            <Calendar size={14} className="mr-1" />
                            {new Date(activity.start_date).toLocaleDateString()}
                            {activity.end_date && activity.end_date !== activity.start_date && 
                              ` - ${new Date(activity.end_date).toLocaleDateString()}`
                            }
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activity.type === 'campaign' 
                              ? 'bg-bjp-lightSaffron text-bjp-darkSaffron'
                              : 'bg-bjp-lightGreen text-bjp-darkGreen'
                          }`}>
                            {activity.type}
                          </span>
                          <button
                            onClick={() => handleDeleteActivity(activity.id)}
                            disabled={deletingItems.has(activity.id)}
                            className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                            title="Delete activity"
                          >
                            {deletingItems.has(activity.id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'meetings' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-bjp-darkGray mb-4">Create New Meeting</h3>
              <form onSubmit={handleMeetingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={meetingForm.title}
                      onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                      placeholder="Meeting title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organizer
                    </label>
                    <input
                      type="text"
                      value={meetingForm.organizer}
                      onChange={(e) => setMeetingForm({ ...meetingForm, organizer: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                      placeholder="Meeting organizer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={meetingForm.date}
                      onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time *
                    </label>
                    <input
                      type="time"
                      value={meetingForm.time}
                      onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Link
                    </label>
                    <input
                      type="url"
                      value={meetingForm.meetingLink}
                      onChange={(e) => setMeetingForm({ ...meetingForm, meetingLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Number
                    </label>
                    <input
                      type="text"
                      value={meetingForm.meetingNumber}
                      onChange={(e) => setMeetingForm({ ...meetingForm, meetingNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                      placeholder="Meeting ID/Number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="text"
                      value={meetingForm.password}
                      onChange={(e) => setMeetingForm({ ...meetingForm, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                      placeholder="Meeting password"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agenda
                  </label>
                  <textarea
                    value={meetingForm.agenda}
                    onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                    placeholder="Meeting agenda"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attendees (one per line)
                    </label>
                    <textarea
                      value={meetingForm.attendees}
                      onChange={(e) => setMeetingForm({ ...meetingForm, attendees: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                      placeholder="List of attendees"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Attendees (one per line)
                    </label>
                    <textarea
                      value={meetingForm.expectedAttendees}
                      onChange={(e) => setMeetingForm({ ...meetingForm, expectedAttendees: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                      placeholder="Expected attendee categories"
                      rows={4}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-6 py-2 rounded-md transition-colors flex items-center"
                >
                  <Plus size={20} className="mr-2" />
                  Create Meeting
                </button>
              </form>
            </div>

            {/* Recent Meetings */}
            <div>
              <h3 className="text-lg font-semibold text-bjp-darkGray mb-4">Recent Meetings</h3>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bjp-saffron mx-auto"></div>
                </div>
              ) : meetings.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No meetings yet. Create your first meeting above!</p>
              ) : (
                <div className="space-y-4">
                  {meetings.slice(0, 5).map((meeting) => (
                    <div key={meeting.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{meeting.title}</h4>
                          <p className="text-gray-600 text-sm mt-1">{meeting.agenda}</p>
                          <div className="flex items-center text-sm text-gray-500 mt-2">
                            <Calendar size={14} className="mr-1" />
                            {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                          </div>
                          {meeting.organizer && (
                            <p className="text-sm text-gray-500">Organizer: {meeting.organizer}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {meeting.meeting_link && (
                            <a
                              href={meeting.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-bjp-saffron text-white px-3 py-1 rounded text-sm hover:bg-bjp-darkSaffron transition-colors"
                            >
                              Join
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteMeeting(meeting.id)}
                            disabled={deletingItems.has(meeting.id)}
                            className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                            title="Delete meeting"
                          >
                            {deletingItems.has(meeting.id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <GalleryAdminPanel />
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-bjp-darkGray mb-4">Content Analytics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-bjp-lightGray p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-bjp-darkGray">{posts.length}</div>
                <div className="text-gray-600">Total Posts</div>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">{activities.length}</div>
                <div className="text-gray-600">Total Activities</div>
              </div>
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">{meetings.length}</div>
                <div className="text-gray-600">Total Meetings</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Recent Activity</h4>
              <div className="space-y-3">
                {[...posts, ...activities, ...meetings]
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 10)
                  .map((item: any) => (
                    <div key={`${item.id}-${item.content ? 'post' : item.location ? 'activity' : 'meeting'}`} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.content ? item.content.substring(0, 50) + '...' : 
                           item.location ? item.title : 
                           item.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.content ? 'Post' : item.location ? 'Activity' : 'Meeting'} • {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
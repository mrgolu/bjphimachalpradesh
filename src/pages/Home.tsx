import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Clock, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseReady } from '../lib/supabase';

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

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Check if Supabase is configured
      if (!isSupabaseReady || !supabase) {
        console.log('Supabase not configured yet');
        setIsLoading(false);
        return;
      }

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

      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
      } else {
        setActivities(activitiesData || []);
      }

      // Fetch meetings
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meetings')
        .select('*')
        .order('created_at', { ascending: false });

      if (meetingsError) {
        console.error('Error fetching meetings:', meetingsError);
      } else {
        setMeetings(meetingsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string, timeString?: string) => {
    const date = new Date(dateString);
    const dateFormatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    if (timeString) {
      return `${dateFormatted} at ${timeString}`;
    }
    
    return dateFormatted;
  };

  const shareOnWhatsApp = (content: string, title?: string) => {
    const message = title ? `*${title}*\n\n${content}` : content;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareActivityOnWhatsApp = (activity: Activity) => {
    const dateRange = activity.end_date && activity.end_date !== activity.start_date 
      ? `${formatDate(activity.start_date)} - ${formatDate(activity.end_date)}`
      : formatDate(activity.start_date);

    const message = `🎯 *${activity.title}*

📅 *Date:* ${dateRange}
📍 *Location:* ${activity.location}
👥 *Participants:* ${activity.participants}
🎯 *Type:* ${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}

📝 *Description:*
${activity.description}

👨‍💼 *Coordinator:* ${activity.coordinator}

Join us for this ${activity.type}! 

#BJPHimachal #${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} #${activity.title.replace(/\s+/g, '')}`;

    shareOnWhatsApp(message);
  };

  const shareMeetingOnWhatsApp = (meeting: Meeting) => {
    const message = `📅 *${meeting.title}*

🗓️ *Date:* ${formatDateTime(meeting.date, meeting.time)}
👨‍💼 *Organizer:* ${meeting.organizer}

📋 *Agenda:*
${meeting.agenda}

🔗 *Join Meeting:* ${meeting.meeting_link}
🔢 *Meeting Number:* ${meeting.meeting_number}
🔐 *Password:* ${meeting.password}

#BJPHimachal #Meeting`;

    shareOnWhatsApp(message);
  };

  const renderPostCard = (post: Post) => (
    <div key={`post-${post.id}`} className="bg-white border border-gray-200 rounded-lg mb-6 shadow-sm">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-bjp-saffron to-bjp-darkSaffron rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">BJP</span>
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-gray-900">BJP Himachal Pradesh</h3>
            <p className="text-gray-500 text-sm">{getTimeAgo(post.created_at)}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Post Image */}
      {post.image_url && (
        <div className="relative">
          <img 
            src={post.image_url} 
            alt="Post content" 
            className="w-full h-96 object-cover"
          />
        </div>
      )}

      {/* Post Actions */}
      <div className="p-4">

        {/* Post Content */}
        <div className="mb-3">
          <span className="font-semibold text-gray-900">bjphimachal </span>
          <span className="text-gray-900">{post.content}</span>
        </div>

        {/* Social Links */}
        {(post.facebook_url || post.instagram_url || post.twitter_url) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.facebook_url && (
              <a
                href={post.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
              >
                Facebook
              </a>
            )}
            {post.instagram_url && (
              <a
                href={post.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full hover:bg-pink-200 transition-colors"
              >
                Instagram
              </a>
            )}
            {post.twitter_url && (
              <a
                href={post.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
              >
                Twitter
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderActivityCard = (activity: Activity) => (
    <div key={`activity-${activity.id}`} className="bg-white border border-gray-200 rounded-lg mb-6 shadow-sm">
      {/* Activity Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-bjp-green to-bjp-darkGreen rounded-full flex items-center justify-center">
            <Calendar size={20} className="text-white" />
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-gray-900">BJP Himachal Pradesh</h3>
            <p className="text-gray-500 text-sm">{getTimeAgo(activity.created_at)}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          activity.type === 'campaign' 
            ? 'bg-bjp-lightSaffron text-bjp-darkSaffron'
            : 'bg-bjp-lightGreen text-bjp-darkGreen'
        }`}>
          {activity.type}
        </span>
      </div>

      {/* Activity Image */}
      {activity.image_url && (
        <div className="relative">
          <img 
            src={activity.image_url} 
            alt={activity.title} 
            className="w-full h-96 object-cover"
          />
        </div>
      )}

      {/* Activity Actions */}
      <div className="p-4">
        {/* Activity Content */}
        <div className="mb-3">
          <h4 className="font-semibold text-gray-900 mb-2">{activity.title}</h4>
          <p className="text-gray-900 mb-3">{activity.description}</p>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p className="flex items-center">
              <Calendar size={16} className="mr-2 text-bjp-saffron" />
              {formatDate(activity.start_date)}
              {activity.end_date && activity.end_date !== activity.start_date && 
                ` - ${formatDate(activity.end_date)}`
              }
            </p>
            <p className="flex items-center">
              <MapPin size={16} className="mr-2 text-bjp-saffron" />
              {activity.location}
            </p>
            <p className="text-gray-500">
              <strong>Coordinator:</strong> {activity.coordinator}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMeetingCard = (meeting: Meeting) => (
    <div key={`meeting-${meeting.id}`} className="bg-white border border-gray-200 rounded-lg mb-6 shadow-sm">
      {/* Meeting Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-bjp-blue to-blue-800 rounded-full flex items-center justify-center">
            <Clock size={20} className="text-white" />
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-gray-900">BJP Himachal Pradesh</h3>
            <p className="text-gray-500 text-sm">{getTimeAgo(meeting.created_at)}</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          Meeting
        </span>
      </div>

      {/* Meeting Content */}
      <div className="p-4">
        {/* Meeting Content */}
        <div className="mb-3">
          <h4 className="font-semibold text-gray-900 mb-2">{meeting.title}</h4>
          <p className="text-gray-900 mb-3">{meeting.agenda}</p>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p className="flex items-center">
              <Calendar size={16} className="mr-2 text-bjp-saffron" />
              {formatDateTime(meeting.date, meeting.time)}
            </p>
            <p className="text-gray-500">
              <strong>Organizer:</strong> {meeting.organizer}
            </p>
          </div>
        </div>

        {/* Join Meeting Button */}
        <a
          href={meeting.meeting_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-4 py-2 rounded-md transition-colors text-sm font-medium mb-3"
        >
          Join Meeting
        </a>

      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjp-saffron mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading feed...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show Supabase setup message if not configured
  if (!isSupabaseReady) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Database Setup Required</h3>
            <p className="text-gray-600 mb-4">
              To view and create posts, activities, and meetings, you need to connect to Supabase first.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Click the "Connect to Supabase" button in the top right corner to get started.
            </p>
            <Link 
              to="/admin" 
              className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-6 py-2 rounded-md transition-colors"
            >
              Go to Admin Panel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Combine all content and sort by creation date
  const allContent = [
    ...posts.map(post => ({ ...post, type: 'post', sortDate: post.created_at })),
    ...activities.map(activity => ({ ...activity, type: 'activity', sortDate: activity.created_at })),
    ...meetings.map(meeting => ({ ...meeting, type: 'meeting', sortDate: meeting.created_at }))
  ].sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-bjp-darkGray">BJP Himachal Pradesh</h1>
            <div className="flex items-center space-x-4">
              <Link to="/live" className="text-bjp-saffron hover:text-bjp-darkSaffron">
                <div className="w-8 h-8 border-2 border-current rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-current rounded-full"></div>
                </div>
              </Link>
              <Link to="/admin" className="text-gray-600 hover:text-gray-900">
                <div className="w-8 h-8 border border-current rounded-full flex items-center justify-center">
                  <span className="text-xs">+</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {allContent.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={24} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-4">Start following BJP Himachal Pradesh to see updates in your feed.</p>
            <Link 
              to="/admin" 
              className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-6 py-2 rounded-md transition-colors"
            >
              Create First Post
            </Link>
          </div>
        ) : (
          allContent.map((item: any) => {
            if (item.type === 'post') {
              return renderPostCard(item);
            } else if (item.type === 'activity') {
              return renderActivityCard(item);
            } else if (item.type === 'meeting') {
              return renderMeetingCard(item);
            }
            return null;
          })
        )}
      </div>

      {/* Quick Actions */}
      <div className="fixed bottom-24 md:bottom-6 right-6 flex flex-col gap-4 z-40">
        <Link
          to="/live"
          className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white p-4 rounded-full shadow-lg transition-all hover:scale-110"
          title="Go Live"
        >
          <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </Link>
        <Link
          to="/admin"
          className="bg-bjp-blue hover:bg-blue-900 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110"
          title="Create Post"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <span className="text-xl font-light">+</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Home;
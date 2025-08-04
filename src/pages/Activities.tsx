import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Share2, Camera, Upload, X, MessageCircle, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

interface Activity {
  id: string;
  title: string;
  type: 'campaign' | 'event';
  start_date: string;
  end_date: string | null;
  location: string;
  description: string;
  coordinator: string;
  participants: string;
  image_url?: string;
  created_at: string;
}

const Activities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [deletingActivities, setDeletingActivities] = useState<Set<string>>(new Set());

  useEffect(() => {
    checkAuth();
    fetchActivities();
  }, []);

  const checkAuth = async () => {
    if (!supabase) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  };
  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error fetching activities:', error);
      } else {
        setActivities(data || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateRange = (startDate: string, endDate: string | null) => {
    const start = formatDate(startDate);
    
    if (!endDate || endDate === startDate) {
      return start;
    }
    
    const end = formatDate(endDate);
    return `${start} - ${end}`;
  };

  const shareOnWhatsApp = (activity: Activity) => {
    const message = `🎯 *${activity.title}*

📅 *Date:* ${formatDateRange(activity.start_date, activity.end_date)}
📍 *Location:* ${activity.location}
👥 *Participants:* ${activity.participants}
🎯 *Type:* ${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}

📝 *Description:*
${activity.description}

👨‍💼 *Coordinator:* ${activity.coordinator}

Join us for this ${activity.type}! 

#BJPHimachal #${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} #${activity.title.replace(/\s+/g, '')}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const handleDeleteActivity = async (id: string) => {
    if (!supabase || !user) {
      toast.error('Please sign in to delete activities');
      return;
    }

    if (!confirm('Are you sure you want to delete this activity?')) return;

    setDeletingActivities(prev => new Set(prev).add(id));

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
      setDeletingActivities(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };
  const shareActivityDetails = async (activity: Activity) => {
    const message = `🎯 BJP Himachal Pradesh Activity

*${activity.title}*

📅 Date: ${formatDateRange(activity.start_date, activity.end_date)}
📍 Location: ${activity.location}
👥 Participants: ${activity.participants}
🎯 Type: ${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}

Description: ${activity.description}

Coordinator: ${activity.coordinator}

#BJPHimachal #${activity.type}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: activity.title,
          text: message,
          url: window.location.href
        });
      } catch (error) {
        // Fallback to clipboard if share fails (permission denied, user cancellation, etc.)
        navigator.clipboard.writeText(message);
        alert('Activity details copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(message);
      alert('Activity details copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-16 bg-bjp-lightGray min-h-screen">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjp-saffron mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 bg-bjp-lightGray min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-bjp-darkGray mb-2">Activities</h1>
            <p className="text-gray-600">BJP Himachal Pradesh activities and events</p>
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No activities available yet.</p>
            <p className="text-gray-500 text-sm mt-2">Check back later for upcoming activities and events.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.map((activity) => (
              <div key={activity.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {activity.image_url && (
                  <img
                    src={activity.image_url}
                    alt={activity.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-bjp-darkGray">{activity.title}</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        activity.type === 'campaign' 
                          ? 'bg-bjp-lightSaffron text-bjp-darkSaffron'
                          : 'bg-bjp-lightGreen text-bjp-darkGreen'
                      }`}>
                        {activity.type}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <p className="flex items-center text-gray-600">
                      <Calendar size={16} className="mr-2 text-bjp-saffron" />
                      {formatDateRange(activity.start_date, activity.end_date)}
                    </p>
                    <p className="flex items-center text-gray-600">
                      <MapPin size={16} className="mr-2 text-bjp-saffron" />
                      {activity.location}
                    </p>
                    <p className="flex items-center text-gray-600">
                      <Users size={16} className="mr-2 text-bjp-saffron" />
                      {activity.participants}
                    </p>
                  </div>
                  <p className="text-gray-700 mb-4">{activity.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Coordinator: {activity.coordinator}
                    </span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => shareOnWhatsApp(activity)}
                        className="flex items-center bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full transition-colors text-sm"
                        title="Share on WhatsApp"
                      >
                        <MessageCircle size={16} className="mr-1" />
                        WhatsApp
                      </button>
                      <button 
                        onClick={() => shareActivityDetails(activity)}
                        className="flex items-center text-bjp-saffron hover:text-bjp-darkSaffron transition-colors"
                        title="Share activity"
                      >
                        <Share2 size={16} className="mr-1" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;
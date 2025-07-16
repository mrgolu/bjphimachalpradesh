import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, Video, Share2, MessageCircle, Copy, ExternalLink, Trash2 } from 'lucide-react';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { toast } from 'react-toastify';

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

const Meetings: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [deletingMeetings, setDeletingMeetings] = useState<Set<string>>(new Set());

  useEffect(() => {
    checkAuth();
    fetchMeetings();
  }, []);

  const checkAuth = async () => {
    if (!isSupabaseReady || !supabase) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  };

  const fetchMeetings = async () => {
    if (!isSupabaseReady || !supabase) {
      // Fallback to static data if Supabase is not configured
      const staticMeeting: Meeting = {
        id: '1',
        title: "पुण्यश्लोक अहिल्याबाई होलकर जयंती वर्ष कार्यक्रम बैठक",
        date: "2025-05-18",
        time: "20:00",
        organizer: "सीमा कन्याल (महिला मोर्चा जिलाध्यक्षा, जिला सिरमौर)",
        meeting_link: "https://ithpbjp.webex.com/ithpbjp/j.php?MTID=m7f4cdb8c31acc63a4bf24f31a3fa5979",
        meeting_number: "25174524750",
        password: "12345",
        agenda: "देवी अहिल्याबाई होलकर जयंती की जिला स्तरीय बैठक दिनांक 28/05/2025 की तैयारी",
        attendees: [
          "डॉ राजीव बिंदल (भाजपा प्रदेश अध्यक्ष)",
          "श्री सुरेश कश्यप (शिमला संसदीय क्षेत्र से सांसद)",
          "श्रीमान सुखराम चौधरी (शिमला संसदीय क्षेत्र के प्रभारी)",
          "श्रीमती रीना कश्यप (पच्छाद से विधायिका)",
          "श्री बलदेव तोमर (शिलाई से पूर्व विधायक)",
          "श्री नारायण सिंह (श्री रेणुका जी से 2022 के प्रत्याशी)",
          "बलदेव भंडारी",
          "विनय गुप्ता (पूर्व जिला अध्यक्ष)",
          "धीरज गुप्ता (सिरमौर जिला के सम्माननीय अध्यक्ष)"
        ],
        expected_attendees: [
          "प्रदेश पदाधिकारी महिला मोर्चा",
          "भाजपा के जिला सिरमौर के सभी मंडल अध्यक्ष",
          "जिला प्रभारी महिला मोर्चा",
          "जिला में गठित अहिल्याबाई होलकर जयंती कमेटी",
          "महिला मोर्चा जिला सिरमौर की सभी पदाधिकारी",
          "सभी 12 मंडलों की महिला मोर्चा अध्यक्ष व महामंत्री"
        ],
        created_at: new Date().toISOString()
      };
      setMeetings([staticMeeting]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching meetings:', error);
        setMeetings([]);
      } else {
        setMeetings(data || []);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (!isSupabaseReady || !supabase || !user) {
      toast.error('Please sign in to delete meetings');
      return;
    }

    if (!confirm('Are you sure you want to delete this meeting?')) return;

    setDeletingMeetings(prev => new Set(prev).add(id));

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
      setDeletingMeetings(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('hi-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString('hi-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const shareOnWhatsApp = (meeting: Meeting) => {
    const message = `📅 *BJP Himachal Pradesh Meeting*

*${meeting.title}*

🗓️ *दिनांक व समय:* ${formatDateTime(meeting.date, meeting.time)}
👨‍💼 *आयोजक:* ${meeting.organizer}

📋 *विषय:*
${meeting.agenda}

🔗 *बैठक में शामिल हों:* ${meeting.meeting_link}
🔢 *Meeting Number:* ${meeting.meeting_number}
🔐 *Password:* ${meeting.password}

👥 *विशेष अतिथि:*
${meeting.attendees.slice(0, 5).map(attendee => `• ${attendee}`).join('\n')}
${meeting.attendees.length > 5 ? `और ${meeting.attendees.length - 5} अन्य...` : ''}

🎯 *अपेक्षित श्रेणी:*
${meeting.expected_attendees.slice(0, 3).map(category => `• ${category}`).join('\n')}
${meeting.expected_attendees.length > 3 ? `और ${meeting.expected_attendees.length - 3} अन्य...` : ''}

#BJPHimachal #Meeting #${meeting.title.replace(/\s+/g, '')}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const shareOnTelegram = (meeting: Meeting) => {
    const message = `📅 BJP Himachal Pradesh Meeting

${meeting.title}

🗓️ दिनांक व समय: ${formatDateTime(meeting.date, meeting.time)}
👨‍💼 आयोजक: ${meeting.organizer}

📋 विषय: ${meeting.agenda}

🔗 बैठक में शामिल हों: ${meeting.meeting_link}
🔢 Meeting Number: ${meeting.meeting_number}
🔐 Password: ${meeting.password}

#BJPHimachal #Meeting`;

    const encodedMessage = encodeURIComponent(message);
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(meeting.meeting_link)}&text=${encodedMessage}`;
    
    window.open(telegramUrl, '_blank');
  };

  const shareOnFacebook = (meeting: Meeting) => {
    const message = `BJP Himachal Pradesh Meeting: ${meeting.title}

दिनांक: ${formatDateTime(meeting.date, meeting.time)}
आयोजक: ${meeting.organizer}

विषय: ${meeting.agenda}

#BJPHimachal #Meeting`;

    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(meeting.meeting_link)}&quote=${encodeURIComponent(message)}`;
    
    window.open(facebookUrl, '_blank');
  };

  const shareOnTwitter = (meeting: Meeting) => {
    const message = `📅 BJP Himachal Pradesh Meeting

${meeting.title}

🗓️ ${formatDateTime(meeting.date, meeting.time)}
👨‍💼 ${meeting.organizer}

Join: ${meeting.meeting_link}

#BJPHimachal #Meeting #${meeting.title.replace(/\s+/g, '')}`;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
    
    window.open(twitterUrl, '_blank');
  };

  const copyMeetingDetails = (meeting: Meeting) => {
    const details = `BJP Himachal Pradesh Meeting

${meeting.title}

दिनांक व समय: ${formatDateTime(meeting.date, meeting.time)}
आयोजक: ${meeting.organizer}

विषय: ${meeting.agenda}

बैठक में शामिल हों: ${meeting.meeting_link}
Meeting Number: ${meeting.meeting_number}
Password: ${meeting.password}

विशेष अतिथि:
${meeting.attendees.map(attendee => `• ${attendee}`).join('\n')}

अपेक्षित श्रेणी:
${meeting.expected_attendees.map(category => `• ${category}`).join('\n')}`;

    navigator.clipboard.writeText(details).then(() => {
      toast.success('Meeting details copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy meeting details');
    });
  };

  const shareMeetingDetails = (meeting: Meeting) => {
    const details = `📅 BJP Himachal Pradesh Meeting

${meeting.title}

🗓️ दिनांक व समय: ${formatDateTime(meeting.date, meeting.time)}
👨‍💼 आयोजक: ${meeting.organizer}

📋 विषय: ${meeting.agenda}

🔗 बैठक में शामिल हों: ${meeting.meeting_link}
🔢 Meeting Number: ${meeting.meeting_number}
🔐 Password: ${meeting.password}`;

    if (navigator.share) {
      navigator.share({
        title: meeting.title,
        text: details,
        url: meeting.meeting_link
      }).catch(() => {
        copyMeetingDetails(meeting);
      });
    } else {
      copyMeetingDetails(meeting);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-16 bg-bjp-lightGray min-h-screen">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjp-saffron mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 bg-bjp-lightGray min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-bjp-darkGray mb-2">बैठक</h1>
        <p className="text-gray-600 mb-8">BJP Himachal Pradesh की आगामी बैठकें</p>

        {meetings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No meetings available yet.</p>
            <p className="text-gray-500 text-sm mt-2">Check back later for upcoming meetings.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                    <h2 className="text-2xl font-bold text-bjp-darkGray mb-4 lg:mb-0 flex-1 pr-4">
                      {meeting.title}
                    </h2>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {user && (
                        <button
                          onClick={() => handleDeleteMeeting(meeting.id)}
                          disabled={deletingMeetings.has(meeting.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors flex items-center disabled:opacity-50"
                          title="Delete meeting"
                        >
                          {deletingMeetings.has(meeting.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Trash2 size={20} className="mr-2" />
                          )}
                          Delete
                        </button>
                      )}
                      <a
                        href={meeting.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-4 py-2 rounded-md transition-colors flex items-center"
                      >
                        <Video className="mr-2" size={20} />
                        बैठक में शामिल हों
                      </a>
                      
                      {/* Share Dropdown */}
                      <div className="relative group">
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors flex items-center">
                          <Share2 className="mr-2" size={20} />
                          Share
                        </button>
                        
                        {/* Dropdown Menu */}
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                          <div className="py-2">
                            <button
                              onClick={() => shareOnWhatsApp(meeting)}
                              className="w-full text-left px-4 py-2 hover:bg-green-50 text-gray-700 hover:text-green-600 flex items-center transition-colors"
                            >
                              <MessageCircle size={16} className="mr-3 text-green-500" />
                              WhatsApp
                            </button>
                            <button
                              onClick={() => shareOnTelegram(meeting)}
                              className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600 flex items-center transition-colors"
                            >
                              <ExternalLink size={16} className="mr-3 text-blue-500" />
                              Telegram
                            </button>
                            <button
                              onClick={() => shareOnFacebook(meeting)}
                              className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600 flex items-center transition-colors"
                            >
                              <ExternalLink size={16} className="mr-3 text-blue-600" />
                              Facebook
                            </button>
                            <button
                              onClick={() => shareOnTwitter(meeting)}
                              className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600 flex items-center transition-colors"
                            >
                              <ExternalLink size={16} className="mr-3 text-blue-400" />
                              Twitter
                            </button>
                            <hr className="my-2" />
                            <button
                              onClick={() => copyMeetingDetails(meeting)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center transition-colors"
                            >
                              <Copy size={16} className="mr-3 text-gray-500" />
                              Copy Details
                            </button>
                            <button
                              onClick={() => shareMeetingDetails(meeting)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center transition-colors"
                            >
                              <Share2 size={16} className="mr-3 text-gray-500" />
                              Share Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <p className="flex items-center text-gray-700">
                        <Calendar size={20} className="mr-2 text-bjp-saffron" />
                        दिनांक: {formatDate(meeting.date)}
                      </p>
                      <p className="flex items-center text-gray-700">
                        <Clock size={20} className="mr-2 text-bjp-saffron" />
                        समय: {meeting.time} बजे
                      </p>
                      <p className="flex items-center text-gray-700">
                        <Users size={20} className="mr-2 text-bjp-saffron" />
                        आयोजक: {meeting.organizer}
                      </p>
                    </div>
                    <div className="bg-bjp-lightGray p-4 rounded-lg">
                      <h3 className="font-semibold text-bjp-darkGray mb-2">बैठक विवरण</h3>
                      <p className="text-gray-700 mb-2">Meeting Number: {meeting.meeting_number}</p>
                      <p className="text-gray-700 mb-2">Password: {meeting.password}</p>
                      <a
                        href={meeting.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-bjp-saffron hover:text-bjp-darkSaffron text-sm break-all"
                      >
                        {meeting.meeting_link}
                      </a>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-bjp-darkGray mb-2">विषय</h3>
                    <p className="text-gray-700">{meeting.agenda}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-bjp-darkGray mb-2">विशेष अतिथि</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {meeting.attendees.map((attendee, index) => (
                          <li key={index} className="text-gray-700">{attendee}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-bjp-darkGray mb-2">अपेक्षित श्रेणी</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {meeting.expected_attendees.map((attendee, index) => (
                          <li key={index} className="text-gray-700">{attendee}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Quick Share Buttons */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">Quick Share:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => shareOnWhatsApp(meeting)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center transition-colors"
                      >
                        <MessageCircle size={14} className="mr-1" />
                        WhatsApp
                      </button>
                      <button
                        onClick={() => shareOnTelegram(meeting)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center transition-colors"
                      >
                        <ExternalLink size={14} className="mr-1" />
                        Telegram
                      </button>
                      <button
                        onClick={() => copyMeetingDetails(meeting)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-full text-sm flex items-center transition-colors"
                      >
                        <Copy size={14} className="mr-1" />
                        Copy
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

export default Meetings;
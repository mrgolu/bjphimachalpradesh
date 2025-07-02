import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, Search } from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  attendees: string;
}

interface Activity {
  id: string;
  title: string;
  date: string;
  type: string;
  location: string;
  description: string;
  coordinator: string;
  participants: string;
}

const UserPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'meetings' | 'activities'>('meetings');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - In a real app, this would come from an API
  const meetings: Meeting[] = [
    {
      id: '1',
      title: 'State Executive Meeting',
      date: '2025-05-20',
      time: '10:00',
      location: 'BJP State Office, Shimla',
      description: 'Monthly state executive meeting to discuss party strategies and upcoming events.',
      attendees: 'State President, District Presidents, State Office Bearers'
    },
    {
      id: '2',
      title: 'Youth Wing Coordination Meeting',
      date: '2025-05-22',
      time: '14:30',
      location: 'District Office, Mandi',
      description: 'Planning meeting for upcoming youth wing activities and campaigns.',
      attendees: 'Youth Wing Leaders, District Coordinators'
    }
  ];

  const activities: Activity[] = [
    {
      id: '1',
      title: 'Cleanliness Drive',
      date: '2025-05-25',
      type: 'social-service',
      location: 'Mall Road, Shimla',
      description: 'City-wide cleanliness drive as part of Swachh Bharat Abhiyan.',
      coordinator: 'District Secretary',
      participants: 'Party Workers, Youth Wing Members, General Public'
    },
    {
      id: '2',
      title: 'Door-to-Door Campaign',
      date: '2025-05-27',
      type: 'campaign',
      location: 'Kullu District',
      description: 'Awareness campaign about government schemes and party initiatives.',
      coordinator: 'District President',
      participants: 'Local Leaders, Party Workers'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredActivities = activities.filter(activity =>
    activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="border-b mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('meetings')}
            className={`py-2 px-4 -mb-px ${
              activeTab === 'meetings'
                ? 'border-b-2 border-bjp-saffron text-bjp-saffron'
                : 'text-gray-500 hover:text-bjp-saffron'
            }`}
          >
            Meetings
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`py-2 px-4 -mb-px ${
              activeTab === 'activities'
                ? 'border-b-2 border-bjp-saffron text-bjp-saffron'
                : 'text-gray-500 hover:text-bjp-saffron'
            }`}
          >
            Activities
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      {activeTab === 'meetings' && (
        <div className="space-y-6">
          {filteredMeetings.length > 0 ? (
            filteredMeetings.map(meeting => (
              <div key={meeting.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-bjp-darkGray">{meeting.title}</h3>
                    <div className="mt-2 space-y-2">
                      <p className="flex items-center text-gray-600">
                        <Calendar size={16} className="mr-2 text-bjp-saffron" />
                        {formatDate(meeting.date)}
                      </p>
                      <p className="flex items-center text-gray-600">
                        <Clock size={16} className="mr-2 text-bjp-saffron" />
                        {meeting.time}
                      </p>
                      <p className="flex items-center text-gray-600">
                        <MapPin size={16} className="mr-2 text-bjp-saffron" />
                        {meeting.location}
                      </p>
                    </div>
                  </div>
                  <button className="bg-bjp-saffron text-white px-4 py-2 rounded hover:bg-bjp-darkSaffron transition-colors">
                    Join
                  </button>
                </div>
                <p className="mt-3 text-gray-600">{meeting.description}</p>
                <div className="mt-3">
                  <p className="flex items-center text-gray-600">
                    <Users size={16} className="mr-2 text-bjp-saffron" />
                    {meeting.attendees}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No meetings found matching your search.
            </div>
          )}
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="space-y-6">
          {filteredActivities.length > 0 ? (
            filteredActivities.map(activity => (
              <div key={activity.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-bjp-darkGray">{activity.title}</h3>
                    <span className="inline-block bg-bjp-lightSaffron text-bjp-darkSaffron text-sm px-2 py-1 rounded mt-1">
                      {activity.type.replace('-', ' ')}
                    </span>
                    <div className="mt-2 space-y-2">
                      <p className="flex items-center text-gray-600">
                        <Calendar size={16} className="mr-2 text-bjp-saffron" />
                        {formatDate(activity.date)}
                      </p>
                      <p className="flex items-center text-gray-600">
                        <MapPin size={16} className="mr-2 text-bjp-saffron" />
                        {activity.location}
                      </p>
                    </div>
                  </div>
                  <button className="bg-bjp-saffron text-white px-4 py-2 rounded hover:bg-bjp-darkSaffron transition-colors">
                    Participate
                  </button>
                </div>
                <p className="mt-3 text-gray-600">{activity.description}</p>
                <div className="mt-3 space-y-2">
                  <p className="text-gray-600">
                    <strong>Coordinator:</strong> {activity.coordinator}
                  </p>
                  <p className="text-gray-600">
                    <strong>Participants:</strong> {activity.participants}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No activities found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserPanel;
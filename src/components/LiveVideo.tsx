import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, Mic, MicOff, Users, Clock, Circle, Square, Settings, Send, Calendar, MessageCircle } from 'lucide-react';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { toast } from 'react-toastify';

interface LiveSession {
  id: string;
  title: string;
  description: string;
  host_name: string;
  participants: string[];
  start_time: string;
  status: 'scheduled' | 'live' | 'ended';
  viewer_count: number;
  meeting_link?: string;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  isHost?: boolean;
}

const LiveVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const autoStartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string>('');
  const [viewerCount, setViewerCount] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showLiveSetup, setShowLiveSetup] = useState(false);
  const [currentSession, setCurrentSession] = useState<LiveSession | null>(null);
  const [user, setUser] = useState<any>(null);
  const [scheduledSessions, setScheduledSessions] = useState<LiveSession[]>([]);
  const [nextSessionCountdown, setNextSessionCountdown] = useState<string>('');
  
  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');

  // Live session setup form
  const [liveSetup, setLiveSetup] = useState({
    title: '',
    description: '',
    hostName: '',
    participants: '',
    meetingLink: '',
    scheduledDate: '',
    scheduledTime: '',
    isScheduled: false
  });

  useEffect(() => {
    checkAuth();
    fetchScheduledSessions();
    
    // Set up interval to check for scheduled sessions
    const interval = setInterval(() => {
      checkForScheduledSessions();
      updateCountdowns();
    }, 1000); // Check every second

    // Auto-scroll chat to bottom when new messages arrive
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }

    return () => {
      clearInterval(interval);
      if (autoStartTimerRef.current) {
        clearTimeout(autoStartTimerRef.current);
      }
    };
  }, [chatMessages]);

  const checkAuth = async () => {
    if (!isSupabaseReady || !supabase) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        setUsername(session.user.email.split('@')[0]);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  };

  const fetchScheduledSessions = async () => {
    if (!isSupabaseReady || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('status', 'scheduled')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      setScheduledSessions(data || []);
    } catch (error) {
      console.error('Error fetching scheduled sessions:', error);
    }
  };

  const checkForScheduledSessions = async () => {
    if (!isSupabaseReady || !supabase || isStreaming) return;

    try {
      const now = new Date();
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('status', 'scheduled')
        .lte('start_time', now.toISOString())
        .order('start_time', { ascending: true })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const sessionToStart = data[0];
        await autoStartLiveSession(sessionToStart);
      }
    } catch (error) {
      console.error('Error checking for scheduled sessions:', error);
    }
  };

  const autoStartLiveSession = async (session: LiveSession) => {
    try {
      // Update session status to live
      const { error } = await supabase
        .from('live_sessions')
        .update({ status: 'live' })
        .eq('id', session.id);

      if (error) throw error;

      setCurrentSession(session);
      
      // Show notification
      toast.success(`🔴 LIVE: ${session.title} has started automatically!`, {
        autoClose: 5000,
        position: 'top-center'
      });

      // Start the live stream
      await goLiveWithSession(session);
      
      // Refresh scheduled sessions
      fetchScheduledSessions();
    } catch (error) {
      console.error('Error auto-starting live session:', error);
      toast.error('Failed to auto-start scheduled session');
    }
  };

  const updateCountdowns = () => {
    if (scheduledSessions.length > 0) {
      const nextSession = scheduledSessions[0];
      const timeUntil = getTimeUntilLive(nextSession.start_time);
      setNextSessionCountdown(timeUntil);
    }
  };

  // Simulate viewer count changes
  useEffect(() => {
    if (isLive && currentSession) {
      const interval = setInterval(async () => {
        const newCount = Math.max(0, viewerCount + (Math.floor(Math.random() * 10) - 5));
        setViewerCount(newCount);
        
        // Update viewer count in database
        if (isSupabaseReady && supabase && currentSession) {
          await supabase
            .from('live_sessions')
            .update({ viewer_count: newCount })
            .eq('id', currentSession.id);
        }
      }, 3000);

      return () => clearInterval(interval);
    } else {
      setViewerCount(0);
    }
  }, [isLive, currentSession, viewerCount]);

  // Recording duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Simulate chat messages from viewers
  useEffect(() => {
    if (isLive && currentSession) {
      const interval = setInterval(() => {
        const sampleMessages = [
          "Great session! 👏",
          "Thank you for the update",
          "When is the next meeting?",
          "Jai Hind! 🇮🇳",
          "Very informative",
          "Keep up the good work",
          "Proud to be part of BJP family",
          "Excellent leadership",
          "Looking forward to more sessions"
        ];
        
        const sampleUsernames = [
          "RameshSharma", "PriyaGupta", "VikasKumar", "SunitaVerma", 
          "AjayThakur", "MeeraJoshi", "RajeshPatel", "KavitaSingh"
        ];

        // Add a random message every 10-30 seconds
        if (Math.random() < 0.1) {
          const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
          const randomUsername = sampleUsernames[Math.floor(Math.random() * sampleUsernames.length)];
          
          addChatMessage(randomUsername, randomMessage);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isLive, currentSession]);

  const addChatMessage = (username: string, message: string, isHost = false) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      username,
      message,
      timestamp: new Date(),
      isHost
    };
    
    setChatMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const displayName = username || 'Anonymous';
    const isHost = currentSession?.host_name === displayName || user?.email?.includes('admin');
    
    addChatMessage(displayName, newMessage.trim(), isHost);
    setNewMessage('');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeUntilLive = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = start.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Starting now';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}, ${diffHours}h ${diffMinutes}m ${diffSeconds}s remaining`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m ${diffSeconds}s remaining`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ${diffSeconds}s remaining`;
    } else {
      return `${diffSeconds}s remaining`;
    }
  };

  const getDetailedCountdown = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = start.getTime() - now.getTime();
    
    if (diffMs <= 0) return { status: 'starting', display: 'Starting Now!', timeBreakdown: null };
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    let status = 'scheduled';
    let display = '';
    let timeBreakdown = { days: diffDays, hours: diffHours, minutes: diffMinutes, seconds: diffSeconds };
    
    if (diffMs <= 10000) { // Less than 10 seconds
      status = 'starting-now';
      display = `${diffSeconds}s`;
    } else if (diffMs <= 60000) { // Less than 1 minute
      status = 'starting-soon';
      display = `${diffSeconds}s`;
    } else if (diffMs <= 300000) { // Less than 5 minutes
      status = 'imminent';
      display = `${diffMinutes}m ${diffSeconds}s`;
    } else if (diffDays > 0) {
      display = `${diffDays}d ${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
    } else if (diffHours > 0) {
      display = `${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
    } else {
      display = `${diffMinutes}m ${diffSeconds}s`;
    }
    
    return { status, display, timeBreakdown };
  };

  const createLiveSession = async () => {
    if (!isSupabaseReady || !supabase || !user) {
      toast.error('Please sign in to create a live session');
      return null;
    }

    if (!liveSetup.title.trim() || !liveSetup.hostName.trim()) {
      toast.error('Title and host name are required');
      return null;
    }

    // Validate scheduled time is in the future
    if (liveSetup.isScheduled && liveSetup.scheduledDate && liveSetup.scheduledTime) {
      const scheduledDateTime = new Date(`${liveSetup.scheduledDate}T${liveSetup.scheduledTime}`);
      const now = new Date();
      
      if (scheduledDateTime <= now) {
        toast.error('Scheduled time must be in the future');
        return null;
      }
    }

    try {
      const participantsList = liveSetup.participants
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      let startTime = new Date().toISOString();
      let status: 'scheduled' | 'live' = 'live';

      // If scheduled, use the scheduled date and time
      if (liveSetup.isScheduled && liveSetup.scheduledDate && liveSetup.scheduledTime) {
        const scheduledDateTime = new Date(`${liveSetup.scheduledDate}T${liveSetup.scheduledTime}`);
        startTime = scheduledDateTime.toISOString();
        status = 'scheduled';
      }

      const { data, error } = await supabase
        .from('live_sessions')
        .insert([{
          title: liveSetup.title.trim(),
          description: liveSetup.description.trim() || null,
          host_name: liveSetup.hostName.trim(),
          participants: participantsList,
          start_time: startTime,
          status: status,
          viewer_count: 0,
          meeting_link: liveSetup.meetingLink.trim() || null,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      if (status === 'scheduled') {
        toast.success(`Live session scheduled for ${formatDateTime(startTime)}!`);
        fetchScheduledSessions();
        return null; // Don't start streaming for scheduled sessions
      } else {
        toast.success('Live session created successfully!');
        return data;
      }
    } catch (error: any) {
      console.error('Error creating live session:', error);
      toast.error('Failed to create live session: ' + error.message);
      return null;
    }
  };

  const updateSessionStatus = async (sessionId: string, status: 'live' | 'ended', endTime?: string) => {
    if (!isSupabaseReady || !supabase) return;

    try {
      const updateData: any = { status };
      if (endTime) updateData.end_time = endTime;

      await supabase
        .from('live_sessions')
        .update(updateData)
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error updating session status:', error);
    }
  };

  const startCountdown = () => {
    if (!liveSetup.title.trim() || !liveSetup.hostName.trim()) {
      setShowLiveSetup(true);
      return;
    }

    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          setCountdown(null);
          goLive();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const goLive = async () => {
    try {
      // Create live session in database
      const session = await createLiveSession();
      if (!session) return;

      setCurrentSession(session);
      await goLiveWithSession(session);
    } catch (err) {
      setError('Failed to access camera. Please ensure camera permissions are granted.');
      console.error('Error accessing media devices:', err);
    }
  };

  const goLiveWithSession = async (session: LiveSession) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        setIsStreaming(true);
        setIsLive(true);
        setError('');
        setShowChat(true); // Show chat when going live
        
        // Initialize viewer count
        const initialViewers = Math.floor(Math.random() * 50) + 10;
        setViewerCount(initialViewers);
        
        // Setup media recorder for saving the stream
        setupMediaRecorder(stream);

        // Post to social media about going live
        await postLiveAnnouncement(session);

        // Add welcome message to chat
        addChatMessage('System', `Welcome to ${session.title}! Chat is now active.`);
      }
    } catch (err) {
      setError('Failed to access camera. Please ensure camera permissions are granted.');
      console.error('Error accessing media devices:', err);
    }
  };

  const postLiveAnnouncement = async (session: LiveSession) => {
    if (!isSupabaseReady || !supabase || !user) return;

    try {
      const content = `🔴 LIVE NOW: ${session.title}

Host: ${session.host_name}
${session.description ? `\n${session.description}` : ''}
${session.participants.length > 0 ? `\nParticipants: ${session.participants.join(', ')}` : ''}
${session.meeting_link ? `\nJoin: ${session.meeting_link}` : ''}

#BJPHimachal #Live #${session.title.replace(/\s+/g, '')}`;

      await supabase
        .from('posts')
        .insert([{
          content,
          image_url: null,
          facebook_url: null,
          instagram_url: null,
          twitter_url: null,
          user_id: user.id
        }]);

      toast.success('Live session announced on social media!');
    } catch (error) {
      console.error('Error posting live announcement:', error);
    }
  };

  const setupMediaRecorder = (stream: MediaStream) => {
    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: 'video/webm'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `live-session-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };
    } catch (err) {
      console.error('Error setting up media recorder:', err);
    }
  };

  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const stopStream = async () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
      setIsLive(false);
      setShowChat(false); // Hide chat when stopping
      
      // Stop recording if active
      if (isRecording) {
        stopRecording();
      }

      // Update session status to ended
      if (currentSession) {
        await updateSessionStatus(currentSession.id, 'ended', new Date().toISOString());
        await postLiveEndAnnouncement(currentSession);
      }

      setCurrentSession(null);
      setChatMessages([]); // Clear chat messages
    }
  };

  const postLiveEndAnnouncement = async (session: LiveSession) => {
    if (!isSupabaseReady || !supabase || !user) return;

    try {
      const content = `📺 Live session ended: "${session.title}"

Thank you to everyone who joined! 
Total viewers: ${viewerCount}

Host: ${session.host_name}
Duration: ${formatDuration(recordingDuration)}

#BJPHimachal #LiveEnded`;

      await supabase
        .from('posts')
        .insert([{
          content,
          image_url: null,
          facebook_url: null,
          instagram_url: null,
          twitter_url: null,
          user_id: user.id
        }]);
    } catch (error) {
      console.error('Error posting live end announcement:', error);
    }
  };

  const toggleMute = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const handleLiveSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowLiveSetup(false);
    
    if (liveSetup.isScheduled) {
      // Just create the scheduled session
      createLiveSession();
    } else {
      // Start countdown for immediate live
      startCountdown();
    }
  };

  const formatChatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Scheduled Sessions */}
      {scheduledSessions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-bjp-darkGray mb-4">
            📅 Scheduled Live Sessions
            {nextSessionCountdown && (
              <span className="ml-2 text-sm font-normal text-bjp-saffron">
                (Next: {nextSessionCountdown})
              </span>
            )}
          </h3>
          <div className="space-y-3">
            {scheduledSessions.map((session) => {
              const countdown = getDetailedCountdown(session.start_time);
              
              return (
                <div key={session.id} className={`p-4 rounded-lg border-l-4 ${
                  countdown.status === 'starting-now'
                    ? 'bg-red-100 border-red-600 animate-pulse' 
                    : countdown.status === 'starting-soon'
                    ? 'bg-red-50 border-red-500' 
                    : countdown.status === 'imminent'
                    ? 'bg-orange-50 border-orange-500'
                    : 'bg-bjp-lightGray border-bjp-saffron'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-bjp-darkGray flex items-center">
                        {countdown.status === 'starting-now' && 
                          <Circle size={8} className="mr-2 text-red-600 fill-current animate-ping" />
                        }
                        {(countdown.status === 'starting-soon' || countdown.status === 'imminent') && 
                          <Circle size={8} className="mr-2 text-red-500 fill-current animate-pulse" />
                        }
                        {session.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-2">{session.description}</p>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Calendar size={16} className="mr-2 text-bjp-saffron" />
                        <span>{formatDateTime(session.start_time)}</span>
                      </div>
                      
                      {/* Enhanced Countdown Display with Seconds */}
                      <div className="flex items-center mb-2">
                        <Clock size={20} className="mr-2 text-bjp-saffron" />
                        <div className="flex items-center space-x-2">
                          {countdown.timeBreakdown && countdown.timeBreakdown.days > 0 && (
                            <div className="text-center">
                              <div className={`text-2xl font-bold ${
                                countdown.status === 'starting-now' ? 'text-red-600 animate-bounce' :
                                countdown.status === 'starting-soon' ? 'text-red-500 animate-pulse' :
                                countdown.status === 'imminent' ? 'text-orange-600' : 'text-bjp-saffron'
                              }`}>
                                {countdown.timeBreakdown.days}
                              </div>
                              <div className="text-xs text-gray-500 uppercase">Days</div>
                            </div>
                          )}
                          
                          {countdown.timeBreakdown && countdown.timeBreakdown.hours > 0 && (
                            <>
                              {countdown.timeBreakdown.days > 0 && <span className="text-gray-400">:</span>}
                              <div className="text-center">
                                <div className={`text-2xl font-bold ${
                                  countdown.status === 'starting-now' ? 'text-red-600 animate-bounce' :
                                  countdown.status === 'starting-soon' ? 'text-red-500 animate-pulse' :
                                  countdown.status === 'imminent' ? 'text-orange-600' : 'text-bjp-saffron'
                                }`}>
                                  {countdown.timeBreakdown.hours.toString().padStart(2, '0')}
                                </div>
                                <div className="text-xs text-gray-500 uppercase">Hours</div>
                              </div>
                            </>
                          )}
                          
                          {countdown.timeBreakdown && (
                            <>
                              {(countdown.timeBreakdown.days > 0 || countdown.timeBreakdown.hours > 0) && 
                                <span className="text-gray-400">:</span>
                              }
                              <div className="text-center">
                                <div className={`text-2xl font-bold ${
                                  countdown.status === 'starting-now' ? 'text-red-600 animate-bounce' :
                                  countdown.status === 'starting-soon' ? 'text-red-500 animate-pulse' :
                                  countdown.status === 'imminent' ? 'text-orange-600' : 'text-bjp-saffron'
                                }`}>
                                  {countdown.timeBreakdown.minutes.toString().padStart(2, '0')}
                                </div>
                                <div className="text-xs text-gray-500 uppercase">Min</div>
                              </div>
                            </>
                          )}
                          
                          {countdown.timeBreakdown && (
                            <>
                              <span className="text-gray-400">:</span>
                              <div className="text-center">
                                <div className={`text-2xl font-bold ${
                                  countdown.status === 'starting-now' ? 'text-red-600 animate-bounce text-3xl' :
                                  countdown.status === 'starting-soon' ? 'text-red-500 animate-pulse' :
                                  countdown.status === 'imminent' ? 'text-orange-600' : 'text-bjp-saffron'
                                }`}>
                                  {countdown.timeBreakdown.seconds.toString().padStart(2, '0')}
                                </div>
                                <div className="text-xs text-gray-500 uppercase">Sec</div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        Host: {session.host_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        countdown.status === 'starting-now'
                          ? 'bg-red-200 text-red-900 animate-pulse' 
                          : countdown.status === 'starting-soon'
                          ? 'bg-red-100 text-red-800' 
                          : countdown.status === 'imminent'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {countdown.status === 'starting-now' ? '🔴 STARTING NOW!' :
                         countdown.status === 'starting-soon' ? '⚡ Starting Soon' :
                         countdown.status === 'imminent' ? '🟠 Starting Soon' : '📅 Scheduled'}
                      </div>
                      {(countdown.status === 'starting-now' || countdown.status === 'starting-soon' || countdown.status === 'imminent') && (
                        <p className="text-xs text-red-600 mt-1 font-medium animate-pulse">
                          🤖 Will auto-start
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>🤖 Auto-Start:</strong> Scheduled sessions will automatically start at their designated time. 
              Live countdown updates every second with precise timing!
            </p>
          </div>
        </div>
      )}

      {/* Live Setup Modal */}
      {showLiveSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-bjp-darkGray mb-4">Setup Live Session</h3>
            <form onSubmit={handleLiveSetupSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Title *
                </label>
                <input
                  type="text"
                  value={liveSetup.title}
                  onChange={(e) => setLiveSetup({ ...liveSetup, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                  placeholder="Enter session title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Host Name *
                </label>
                <input
                  type="text"
                  value={liveSetup.hostName}
                  onChange={(e) => setLiveSetup({ ...liveSetup, hostName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                  placeholder="Enter host name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={liveSetup.description}
                  onChange={(e) => setLiveSetup({ ...liveSetup, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                  placeholder="Enter session description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Participants (one per line)
                </label>
                <textarea
                  value={liveSetup.participants}
                  onChange={(e) => setLiveSetup({ ...liveSetup, participants: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                  placeholder="Enter participant names"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Link (optional)
                </label>
                <input
                  type="url"
                  value={liveSetup.meetingLink}
                  onChange={(e) => setLiveSetup({ ...liveSetup, meetingLink: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                  placeholder="Enter meeting link"
                />
              </div>
              
              {/* Schedule Option */}
              <div className="border-t pt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={liveSetup.isScheduled}
                    onChange={(e) => setLiveSetup({ ...liveSetup, isScheduled: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Schedule for later</span>
                </label>
              </div>

              {liveSetup.isScheduled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scheduled Date *
                    </label>
                    <input
                      type="date"
                      value={liveSetup.scheduledDate}
                      onChange={(e) => setLiveSetup({ ...liveSetup, scheduledDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                      min={new Date().toISOString().split('T')[0]}
                      required={liveSetup.isScheduled}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scheduled Time *
                    </label>
                    <input
                      type="time"
                      value={liveSetup.scheduledTime}
                      onChange={(e) => setLiveSetup({ ...liveSetup, scheduledTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                      required={liveSetup.isScheduled}
                    />
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-800">
                      <strong>🤖 Auto-Start:</strong> This session will automatically start at the scheduled time with live countdown!
                    </p>
                  </div>
                </>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowLiveSetup(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-4 py-2 rounded-md transition-colors"
                >
                  {liveSetup.isScheduled ? 'Schedule Live' : 'Start Live'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Video Section */}
        <div className={`${showChat ? 'flex-1' : 'w-full'} relative`}>
          {/* Live indicator and viewer count */}
          {isLive && currentSession && (
            <div className="absolute top-4 left-4 z-10 flex items-center space-x-4">
              <div className="bg-red-500 text-white px-3 py-1 rounded-full flex items-center">
                <Circle size={8} className="mr-2 fill-current animate-pulse" />
                LIVE
              </div>
              <div className="bg-black/70 text-white px-3 py-1 rounded-full flex items-center">
                <Users size={16} className="mr-2" />
                {viewerCount.toLocaleString()}
              </div>
            </div>
          )}

          {/* Session info */}
          {isLive && currentSession && (
            <div className="absolute top-4 right-4 z-10 bg-black/70 text-white px-3 py-1 rounded-lg max-w-xs">
              <p className="font-semibold text-sm">{currentSession.title}</p>
              <p className="text-xs">Host: {currentSession.host_name}</p>
            </div>
          )}

          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-16 right-4 z-10">
              <div className="bg-red-600 text-white px-3 py-1 rounded-full flex items-center">
                <Circle size={8} className="mr-2 fill-current animate-pulse" />
                REC {formatDuration(recordingDuration)}
              </div>
            </div>
          )}

          {/* Countdown overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
              <div className="text-center">
                <div className="text-8xl font-bold text-white mb-4 animate-pulse">
                  {countdown}
                </div>
                <p className="text-white text-xl">Going live in...</p>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={true}
            className={`w-full aspect-video rounded-lg bg-gray-900 ${!isStreaming ? 'hidden' : ''}`}
          />
          
          {!isStreaming && (
            <div className="w-full aspect-video rounded-lg bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <CameraOff size={48} className="mx-auto mb-4" />
                <p className="text-lg mb-4">Ready to go live?</p>
                {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
            {!isStreaming ? (
              <>
                <button
                  onClick={() => setShowLiveSetup(true)}
                  disabled={countdown !== null}
                  className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-full transition-colors disabled:opacity-50"
                  title="Setup live session"
                >
                  <Settings size={24} />
                </button>
                <button
                  onClick={startCountdown}
                  disabled={countdown !== null}
                  className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-6 py-3 rounded-full transition-colors flex items-center disabled:opacity-50"
                  title="Start live stream"
                >
                  <Camera size={24} className="mr-2" />
                  Go Live
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={stopStream}
                  className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-colors"
                  title="Stop live stream"
                >
                  <Square size={24} />
                </button>
                
                <button
                  onClick={toggleMute}
                  className={`p-4 rounded-full transition-colors ${
                    isMuted 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-bjp-saffron hover:bg-bjp-darkSaffron'
                  } text-white`}
                  title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-4 rounded-full transition-colors ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                  title={isRecording ? 'Stop recording' : 'Start recording'}
                >
                  {isRecording ? <Square size={24} /> : <Circle size={24} />}
                </button>

                <button
                  onClick={() => setShowChat(!showChat)}
                  className={`p-4 rounded-full transition-colors ${
                    showChat 
                      ? 'bg-bjp-saffron hover:bg-bjp-darkSaffron' 
                      : 'bg-gray-500 hover:bg-gray-600'
                  } text-white`}
                  title={showChat ? 'Hide chat' : 'Show chat'}
                >
                  <MessageCircle size={24} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Live Chat Section */}
        {showChat && isLive && (
          <div className="w-80 bg-gray-50 rounded-lg border border-gray-200 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <MessageCircle size={20} className="mr-2 text-bjp-saffron" />
                  Live Chat
                </h3>
                <div className="flex items-center text-sm text-gray-500">
                  <Circle size={8} className="mr-1 text-green-500 fill-current animate-pulse" />
                  {chatMessages.length} messages
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 p-4 space-y-3 overflow-y-auto max-h-96"
            >
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs">Be the first to say something!</p>
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div key={message.id} className="flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        message.isHost ? 'text-bjp-saffron' : 'text-gray-700'
                      }`}>
                        {message.username}
                        {message.isHost && (
                          <span className="ml-1 text-xs bg-bjp-saffron text-white px-1 rounded">HOST</span>
                        )}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatChatTime(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 bg-white p-2 rounded-lg border border-gray-200">
                      {message.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron text-sm"
                  maxLength={200}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-bjp-saffron hover:bg-bjp-darkSaffron disabled:bg-gray-300 text-white p-2 rounded-md transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>Chatting as: {username || 'Anonymous'}</span>
                <span>{newMessage.length}/200</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live session info */}
      {isLive && currentSession && (
        <div className="mt-6 p-4 bg-bjp-lightGray rounded-lg">
          <h3 className="font-semibold text-bjp-darkGray mb-2">Live Session Active</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <p className="text-gray-600">Viewers</p>
              <p className="font-semibold">{viewerCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <p className="font-semibold text-red-500">LIVE</p>
            </div>
            <div>
              <p className="text-gray-600">Recording</p>
              <p className="font-semibold">{isRecording ? 'ON' : 'OFF'}</p>
            </div>
            <div>
              <p className="text-gray-600">Duration</p>
              <p className="font-semibold">{formatDuration(recordingDuration)}</p>
            </div>
          </div>
          
          <div className="mb-3">
            <h4 className="font-medium text-gray-700 mb-1">Session Details:</h4>
            <p className="text-sm text-gray-600">Title: {currentSession.title}</p>
            <p className="text-sm text-gray-600">Host: {currentSession.host_name}</p>
            {currentSession.description && (
              <p className="text-sm text-gray-600">Description: {currentSession.description}</p>
            )}
            {currentSession.participants.length > 0 && (
              <p className="text-sm text-gray-600">
                Participants: {currentSession.participants.join(', ')}
              </p>
            )}
            {currentSession.meeting_link && (
              <p className="text-sm text-gray-600">
                Meeting Link: <a href={currentSession.meeting_link} target="_blank" rel="noopener noreferrer" className="text-bjp-saffron hover:underline">{currentSession.meeting_link}</a>
              </p>
            )}
          </div>

          {isRecording && (
            <p className="text-sm text-gray-600 mt-2">
              💡 Your live session is being recorded and will be automatically saved when you stop recording.
            </p>
          )}
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Live session details have been automatically posted to your social media feed.
              {showChat && <span className="block mt-1"><strong>Chat:</strong> Live chat is active! Viewers can send messages in real-time.</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveVideo;
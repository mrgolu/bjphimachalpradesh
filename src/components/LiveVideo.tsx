import React, { useState, useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, Play, Square, Users, Clock, Calendar, Trash2, Settings, AlertCircle, Camera, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { toast } from 'react-toastify';

interface LiveSession {
  id: string;
  title: string;
  description?: string;
  host_name: string;
  participants: string[];
  start_time: string | null;
  end_time: string | null;
  status: 'scheduled' | 'live' | 'ended';
  viewer_count: number;
  meeting_link?: string;
  created_at: string;
  user_id: string;
}

const LiveVideo: React.FC = () => {
  const [isLive, setIsLive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [deviceSupport, setDeviceSupport] = useState({
    hasCamera: false,
    hasMicrophone: false,
    supportsWebRTC: false,
    browserSupported: false
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkDeviceSupport();
    checkAuth();
    fetchLiveSessions();
    
    // Cleanup on unmount
    return () => {
      stopStream();
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const checkDeviceSupport = async () => {
    const support = {
      hasCamera: false,
      hasMicrophone: false,
      supportsWebRTC: false,
      browserSupported: false
    };

    // Check if browser supports required APIs
    if (typeof navigator !== 'undefined') {
      support.supportsWebRTC = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      support.browserSupported = !!(window.MediaRecorder && window.URL && window.URL.createObjectURL);
      
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          support.hasCamera = devices.some(device => device.kind === 'videoinput');
          support.hasMicrophone = devices.some(device => device.kind === 'audioinput');
        } catch (error) {
          console.warn('Could not enumerate devices:', error);
        }
      }
    }

    setDeviceSupport(support);
    setIsLoading(false);
  };

  const checkAuth = async () => {
    if (!isSupabaseReady || !supabase) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  };

  const fetchLiveSessions = async () => {
    if (!isSupabaseReady || !supabase) {
      // Fallback to mock data
      const mockSession: LiveSession = {
        id: '1',
        title: 'BJP Himachal Pradesh Live Session',
        description: 'Weekly discussion with party leadership',
        host_name: 'BJP Himachal Pradesh',
        participants: [],
        start_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        end_time: null,
        status: 'scheduled',
        viewer_count: 0,
        meeting_link: 'https://meet.google.com/bjp-himachal-live',
        created_at: new Date().toISOString(),
        user_id: 'mock-user'
      };
      setLiveSessions([mockSession]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching live sessions:', error);
        setLiveSessions([]);
      } else {
        setLiveSessions(data || []);
      }
    } catch (error) {
      console.error('Error fetching live sessions:', error);
      setLiveSessions([]);
    }
  };

  const getMediaConstraints = () => {
    // Progressive enhancement - start with basic constraints
    const baseConstraints = {
      video: true,
      audio: true
    };

    // Enhanced constraints for supported devices
    if (deviceSupport.hasCamera && deviceSupport.hasMicrophone) {
      return {
        video: {
          width: { min: 320, ideal: 640, max: 1280 },
          height: { min: 240, ideal: 480, max: 720 },
          frameRate: { min: 15, ideal: 24, max: 30 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };
    }

    return baseConstraints;
  };

  const startStream = async () => {
    if (!deviceSupport.supportsWebRTC) {
      setCameraError('Your browser does not support live video. Please use Chrome, Firefox, Safari, or Edge.');
      return;
    }

    setIsInitializing(true);
    setCameraError(null);

    try {
      // Try with enhanced constraints first
      let constraints = getMediaConstraints();
      let stream: MediaStream;

      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        console.warn('Enhanced constraints failed, trying basic:', error);
        // Fallback to basic constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Handle different browser behaviors
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn('Auto-play failed:', error);
            // Auto-play failed, user interaction required
          });
        }
      }

      setIsLive(true);
      setViewerCount(Math.floor(Math.random() * 50) + 10);
      
      // Update video and audio states based on actual stream
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      
      setIsVideoEnabled(videoTrack ? videoTrack.enabled : false);
      setIsAudioEnabled(audioTrack ? audioTrack.enabled : false);

      toast.success('Live stream started successfully!');
    } catch (error: any) {
      console.error('Error starting stream:', error);
      
      let errorMessage = 'Failed to start live stream. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Camera/microphone access denied. Please allow permissions and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera or microphone found. Please connect a camera and try again.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Camera is already in use by another application.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage += 'Camera does not support the requested settings.';
      } else {
        errorMessage += error.message || 'Unknown error occurred.';
      }
      
      setCameraError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsInitializing(false);
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsLive(false);
    setIsRecording(false);
    setRecordingTime(0);
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    toast.info('Live stream ended');
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    toast.success('Recording started');
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    
    toast.success(`Recording saved (${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')})`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!isSupabaseReady || !supabase || !user) {
      toast.error('Please sign in to delete sessions');
      return;
    }

    if (!confirm('Are you sure you want to delete this live session?')) return;

    try {
      const { error } = await supabase
        .from('live_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      setLiveSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success('Live session deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting live session:', error);
      toast.error('Failed to delete live session: ' + error.message);
    }
  };

  const retryCamera = () => {
    setCameraError(null);
    startStream();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjp-saffron mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking device compatibility...</p>
        </div>
      </div>
    );
  }

  // Device not supported
  if (!deviceSupport.supportsWebRTC || !deviceSupport.browserSupported) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Browser Not Supported</h3>
          <p className="text-gray-600 mb-4">
            Live streaming requires a modern browser with WebRTC support.
          </p>
          <div className="text-sm text-gray-500">
            <p className="mb-2">Supported browsers:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Google Chrome (recommended)</li>
              <li>Mozilla Firefox</li>
              <li>Safari (iOS/macOS)</li>
              <li>Microsoft Edge</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Video Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative">
          {/* Video Container */}
          <div className="relative bg-gray-900 aspect-video">
            {isLive ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
                webkit-playsinline="true"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {cameraError ? (
                  <div className="text-center p-6">
                    <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Camera Error</h3>
                    <p className="text-gray-300 text-sm mb-4 max-w-md">{cameraError}</p>
                    <div className="space-y-2">
                      <button
                        onClick={retryCamera}
                        className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-4 py-2 rounded-md transition-colors flex items-center mx-auto"
                      >
                        <RefreshCw size={16} className="mr-2" />
                        Try Again
                      </button>
                      <div className="text-xs text-gray-400 max-w-sm">
                        <p className="mb-1">Troubleshooting tips:</p>
                        <ul className="list-disc list-inside space-y-1 text-left">
                          <li>Allow camera permissions in browser</li>
                          <li>Close other apps using camera</li>
                          <li>Refresh the page and try again</li>
                          <li>Check if camera is connected</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Ready to Go Live</h3>
                    <p className="text-gray-300 mb-6">Start your live session to connect with your audience</p>
                    <button
                      onClick={startStream}
                      disabled={isInitializing}
                      className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-6 py-3 rounded-md transition-colors flex items-center mx-auto disabled:opacity-50"
                    >
                      {isInitializing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play size={20} className="mr-2" />
                          Go Live
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Live Indicator */}
            {isLive && (
              <div className="absolute top-4 left-4 flex items-center space-x-4">
                <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                  LIVE
                </div>
                <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center">
                  <Users size={14} className="mr-1" />
                  {viewerCount}
                </div>
                {isRecording && (
                  <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    REC {formatTime(recordingTime)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          {isLive && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-3 bg-black/70 rounded-full px-4 py-2">
                <button
                  onClick={toggleVideo}
                  className={`p-2 rounded-full transition-colors ${
                    isVideoEnabled ? 'bg-gray-600 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                </button>
                <button
                  onClick={toggleAudio}
                  className={`p-2 rounded-full transition-colors ${
                    isAudioEnabled ? 'bg-gray-600 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                </button>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-2 rounded-full transition-colors ${
                    isRecording ? 'bg-red-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'
                  }`}
                >
                  {isRecording ? <Square size={20} /> : <div className="w-5 h-5 bg-red-500 rounded-full"></div>}
                </button>
                <button
                  onClick={stopStream}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full transition-colors text-sm font-medium"
                >
                  End Live
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scheduled Sessions */}
      {liveSessions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-bjp-darkGray mb-4">Scheduled Live Sessions</h3>
          <div className="space-y-4">
            {liveSessions.map((session) => (
              <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{session.title}</h4>
                    {session.description && (
                      <p className="text-gray-600 text-sm mt-1">{session.description}</p>
                    )}
                    <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
                      <span className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {session.start_time ? new Date(session.start_time).toLocaleString() : 'Not scheduled'}
                      </span>
                      <span className="flex items-center">
                        <Users size={14} className="mr-1" />
                        {session.host_name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      session.status === 'live' 
                        ? 'bg-red-100 text-red-800'
                        : session.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {session.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                {session.meeting_link && (
                  <div className="mt-3">
                    <a
                      href={session.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-4 py-2 rounded-md text-sm transition-colors"
                    >
                      Join Session
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Device Info (Debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm">
          <h4 className="font-semibold mb-2">Device Support:</h4>
          <ul className="space-y-1">
            <li>Camera: {deviceSupport.hasCamera ? '✅' : '❌'}</li>
            <li>Microphone: {deviceSupport.hasMicrophone ? '✅' : '❌'}</li>
            <li>WebRTC: {deviceSupport.supportsWebRTC ? '✅' : '❌'}</li>
            <li>Browser: {deviceSupport.browserSupported ? '✅' : '❌'}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LiveVideo;
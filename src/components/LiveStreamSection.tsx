import React, { useState } from 'react';
import { Play } from 'lucide-react';

const LiveStreamSection: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayClick = () => {
    setIsPlaying(true);
    // In a real implementation, this would initiate the live stream
  };

  return (
    <section className="py-16 bg-bjp-lightGray">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-bjp-darkGray mb-4">Live with BJP Himachal</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connect directly with our leaders through live sessions. Get updates, ask questions, and be part of the conversation.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative bg-black rounded-lg overflow-hidden shadow-xl aspect-video">
            {!isPlaying ? (
              <>
                <img 
                  src="https://images.pexels.com/photos/7096/people-woman-coffee-meeting.jpg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" 
                  alt="Live Stream Preview" 
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <button 
                    onClick={handlePlayClick}
                    className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white rounded-full p-6 transition-colors animate-pulse"
                    aria-label="Start live stream"
                  >
                    <Play size={36} fill="white" />
                  </button>
                  <p className="text-white font-medium mt-4 text-xl">Click to join the live session</p>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-bjp-darkGray">
                <p className="text-white text-xl">
                  Live stream would appear here in a real implementation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveStreamSection;
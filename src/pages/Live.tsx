import React from 'react';
import LiveVideo from '../components/LiveVideo';
import LiveStreamSection from '../components/LiveStreamSection';
import SocialBar from '../components/SocialBar';

const Live: React.FC = () => {
  return (
    <div className="pt-24 pb-16 bg-bjp-lightGray min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-3/4">
            <h1 className="text-3xl font-bold text-bjp-darkGray mb-2">Live Sessions</h1>
            <p className="text-gray-600 mb-8">
              Connect directly with BJP Himachal Pradesh leadership through interactive live sessions.
            </p>
            
            <LiveVideo />
            
            <div className="mt-8">
              <LiveStreamSection />
            </div>
          </div>
          
          <div className="lg:w-1/4">
            <SocialBar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Live;
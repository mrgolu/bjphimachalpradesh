import React from 'react';
import LiveVideo from '../components/LiveVideo';
import SocialBar from '../components/SocialBar';

const Live: React.FC = () => {
  return (
    <div className="pt-20 pb-20 md:pt-24 md:pb-16 bg-bjp-lightGray min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="w-full lg:w-3/4">
            <h1 className="text-2xl md:text-3xl font-bold text-bjp-darkGray mb-2">Live Sessions</h1>
            <p className="text-gray-600 mb-6 md:mb-8">
              Connect directly with BJP Himachal Pradesh leadership through interactive live sessions.
            </p>
            
            <LiveVideo />
          </div>
          
          <div className="w-full lg:w-1/4 mt-6 lg:mt-0">
            <SocialBar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Live;
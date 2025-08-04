import React from 'react';

const Gallery: React.FC = () => {
  return (
    <div className="pt-24 pb-16 bg-bjp-lightGray min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-bjp-darkGray mb-2">Photo Gallery</h1>
        <p className="text-gray-600 mb-8">
          Coming soon - Photo gallery for BJP Himachal Pradesh events and activities.
        </p>
        
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-bjp-lightSaffron rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-bjp-saffron text-2xl">📸</span>
          </div>
          <h3 className="text-xl font-semibold text-bjp-darkGray mb-2">Gallery Coming Soon</h3>
          <p className="text-gray-600">
            We're working on bringing you the best photos and videos from BJP Himachal Pradesh events.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
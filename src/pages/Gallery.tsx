import React from 'react';
import GalleryGrid from '../components/GalleryGrid';

const Gallery: React.FC = () => {
  return (
    <div className="pt-24 pb-16 bg-bjp-lightGray min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-bjp-darkGray mb-2">Photo Gallery</h1>
        <p className="text-gray-600 mb-8">
          View images from BJP Himachal Pradesh events, rallies, and activities across the state.
        </p>
        
        <div className="mb-8 p-4 bg-white rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Event Highlights</h2>
            <p className="text-gray-600">Official photographs from BJP events in Himachal Pradesh</p>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-bjp-saffron text-white rounded hover:bg-bjp-darkSaffron transition-colors">
              Latest
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
              2025
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
              2024
            </button>
          </div>
        </div>
        
        <GalleryGrid />
      </div>
    </div>
  );
};

export default Gallery;
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative bg-bjp-blue min-h-screen flex items-center">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/3760853/pexels-photo-3760853.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
          alt="Himachal Pradesh Mountains"
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      <div className="container mx-auto px-4 z-10 py-20">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight animate-slide-up">
            <span className="text-bjp-saffron">BJP</span> Himachal Pradesh
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
            Building a prosperous, developed and vibrant Himachal Pradesh with strong governance and people-centric policies.
          </p>
          <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <Link 
              to="/news" 
              className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white font-medium py-3 px-6 rounded-md transition-colors flex items-center"
            >
              Latest News
              <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link 
              to="/live" 
              className="bg-white hover:bg-gray-100 text-bjp-darkGray font-medium py-3 px-6 rounded-md transition-colors"
            >
              Go Live
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-slide-up" style={{ animationDelay: '600ms' }}>
          <div className="bg-white/90 rounded-lg p-6 shadow-lg transform hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-bjp-lightSaffron rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-bjp-darkSaffron" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-bjp-darkGray">Latest News</h3>
            <p className="text-gray-600">Stay updated with the latest news, events, and announcements from BJP Himachal Pradesh.</p>
          </div>
          <div className="bg-white/90 rounded-lg p-6 shadow-lg transform hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-bjp-lightGreen rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-bjp-darkGreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-bjp-darkGray">Live Sessions</h3>
            <p className="text-gray-600">Connect directly with our leaders through live interactive sessions and stay engaged.</p>
          </div>
          <div className="bg-white/90 rounded-lg p-6 shadow-lg transform hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-bjp-darkGray">Get Involved</h3>
            <p className="text-gray-600">Join our initiatives, volunteer for events, and become part of our mission to build a better Himachal.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-bjp-darkGray text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src="/src/assets/bjp-logo.svg" alt="BJP Logo" className="h-10 w-10" />
              <div>
                <h3 className="font-bold text-bjp-saffron text-lg">BJP</h3>
                <p className="text-xs text-bjp-lightGreen">Himachal Pradesh</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Bharatiya Janata Party, Himachal Pradesh is dedicated to the development and 
              prosperity of the state and its people.
            </p>
            <div className="flex space-x-3">
              <a href="https://www.facebook.com/bjphimachalpradesh" target="_blank" rel="noopener noreferrer" 
                 className="bg-gray-700 p-2 rounded-full hover:bg-bjp-saffron transition-colors">
                <Facebook size={18} />
              </a>
              <a href="https://www.instagram.com/bjphimachal" target="_blank" rel="noopener noreferrer" 
                 className="bg-gray-700 p-2 rounded-full hover:bg-bjp-saffron transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://twitter.com/BJP4Himachal" target="_blank" rel="noopener noreferrer" 
                 className="bg-gray-700 p-2 rounded-full hover:bg-bjp-saffron transition-colors">
                <Twitter size={18} />
              </a>
              <a href="https://www.youtube.com/channel/BJPHimachal" target="_blank" rel="noopener noreferrer" 
                 className="bg-gray-700 p-2 rounded-full hover:bg-bjp-saffron transition-colors">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-bjp-saffron">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/live" className="text-gray-300 hover:text-white transition-colors">Live</Link>
              </li>
              <li>
                <Link to="/activities" className="text-gray-300 hover:text-white transition-colors">Activities</Link>
              </li>
              <li>
                <Link to="/meetings" className="text-gray-300 hover:text-white transition-colors">Meetings</Link>
              </li>
              <li>
                <Link to="/gallery" className="text-gray-300 hover:text-white transition-colors">Gallery</Link>
              </li>
            </ul>
          </div>

          {/* Important Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-bjp-saffron">Important Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://www.bjp.org" target="_blank" rel="noopener noreferrer" 
                   className="text-gray-300 hover:text-white transition-colors">BJP National</a>
              </li>
              <li>
                <a href="https://www.narendramodi.in" target="_blank" rel="noopener noreferrer" 
                   className="text-gray-300 hover:text-white transition-colors">Narendra Modi</a>
              </li>
              <li>
                <a href="https://himachal.gov.in" target="_blank" rel="noopener noreferrer" 
                   className="text-gray-300 hover:text-white transition-colors">Himachal Pradesh Government</a>
              </li>
              <li>
                <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer" 
                   className="text-gray-300 hover:text-white transition-colors">Election Commission</a>
              </li>
              <li>
                <a href="https://www.mygov.in" target="_blank" rel="noopener noreferrer" 
                   className="text-gray-300 hover:text-white transition-colors">MyGov Portal</a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-bjp-saffron">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 mt-1 text-bjp-saffron" />
                <span className="text-gray-300">
                  BJP Office, Chakkar, Shimla, Himachal Pradesh, 171005
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 text-bjp-saffron" />
                <span className="text-gray-300">+91 123 456 7890</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 text-bjp-saffron" />
                <span className="text-gray-300">info@bjphimachal.org</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} BJP Himachal Pradesh. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
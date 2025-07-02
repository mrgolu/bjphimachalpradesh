import React from 'react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { socialLinks } from '../data/social';

const SocialBar: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Facebook':
        return <Facebook size={20} />;
      case 'Instagram':
        return <Instagram size={20} />;
      case 'Twitter':
        return <Twitter size={20} />;
      case 'Youtube':
        return <Youtube size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 sticky top-24">
      <h3 className="text-lg font-semibold mb-4 text-bjp-darkGray border-b pb-2">Follow Us</h3>
      <div className="space-y-4">
        {socialLinks.map((link) => (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-2 hover:bg-bjp-lightGray rounded transition-colors group"
          >
            <div className="mr-3 text-gray-600 group-hover:text-bjp-saffron transition-colors">
              {getIcon(link.icon)}
            </div>
            <span className="text-gray-700 group-hover:text-bjp-darkSaffron transition-colors">
              {link.platform}
            </span>
          </a>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t">
        <button className="w-full bg-bjp-saffron hover:bg-bjp-darkSaffron text-white py-2 px-4 rounded transition-colors font-medium flex items-center justify-center">
          <Youtube size={18} className="mr-2" />
          Go Live
        </button>
      </div>
    </div>
  );
};

export default SocialBar;
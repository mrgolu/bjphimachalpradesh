import React from 'react';
import { Facebook, Instagram, Twitter, Share2 } from 'lucide-react';

interface SocialPostProps {
  content: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  image?: string;
}

const SocialPost: React.FC<SocialPostProps> = ({
  content,
  facebookUrl,
  instagramUrl,
  twitterUrl,
  image
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
      <div className="flex flex-col md:flex-row">
        {image && (
          <div className="md:w-1/2">
            <img src={image} alt="Post" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="md:w-1/2 p-6">
          <p className="text-gray-800 mb-6 text-xl leading-relaxed">{content}</p>
          <div className="flex flex-wrap gap-3">
            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1877F2] text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity flex items-center"
              >
                <Facebook size={20} />
                <span className="ml-2">Share on Facebook</span>
              </a>
            )}
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E4405F] text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity flex items-center"
              >
                <Instagram size={20} />
                <span className="ml-2">View on Instagram</span>
              </a>
            )}
            {twitterUrl && (
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1DA1F2] text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity flex items-center"
              >
                <Twitter size={20} />
                <span className="ml-2">Share on Twitter</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialPost;
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrl: string;
  author?: string;
  category: 'event' | 'announcement' | 'press-release' | 'other';
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description?: string;
  date: string;
}

export interface LeaderInfo {
  id: string;
  name: string;
  position: string;
  imageUrl: string;
  bio?: string;
}
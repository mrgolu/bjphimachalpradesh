import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, Image as ImageIcon, Video, Eye } from 'lucide-react';
import { supabase, isSupabaseReady } from '../lib/supabase';

interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: 'image' | 'video';
  category: string;
  tags: string[];
  date: string;
  created_at: string;
}

const GalleryGrid: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    if (!isSupabaseReady || !supabase) {
      // Fallback to static data if Supabase is not configured
      const staticGalleryItems: GalleryItem[] = [
        {
          id: '1',
          title: 'BJP Rally in Shimla',
          description: 'Massive gathering at BJP rally in Shimla with senior leaders addressing the public',
          url: 'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
          type: 'image',
          category: 'Rally & Events',
          tags: ['rally', 'shimla', 'politics'],
          date: '2025-03-15',
          created_at: '2025-03-15T10:00:00Z'
        },
        {
          id: '2',
          title: 'Meeting with Farmers',
          description: 'State leaders meeting with farmers in Kullu district to discuss agricultural policies',
          url: 'https://images.pexels.com/photos/2774546/pexels-photo-2774546.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
          type: 'image',
          category: 'Meetings',
          tags: ['farmers', 'kullu', 'agriculture'],
          date: '2025-02-28',
          created_at: '2025-02-28T14:30:00Z'
        },
        {
          id: '3',
          title: 'Party Workers Meeting',
          description: 'State executive meeting with party workers from all districts',
          url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
          type: 'image',
          category: 'Meetings',
          tags: ['meeting', 'workers', 'executive'],
          date: '2025-02-10',
          created_at: '2025-02-10T16:00:00Z'
        },
        {
          id: '4',
          title: 'Youth Wing Inauguration',
          description: 'Inauguration of new BJP youth wing office in Dharamshala',
          url: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
          type: 'image',
          category: 'Youth Activities',
          tags: ['youth', 'inauguration', 'dharamshala'],
          date: '2025-01-25',
          created_at: '2025-01-25T11:00:00Z'
        },
        {
          id: '5',
          title: 'Medical Camp',
          description: 'Free medical camp organized by BJP Himachal Pradesh in Mandi district',
          url: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
          type: 'image',
          category: 'Community Service',
          tags: ['medical', 'camp', 'mandi', 'health'],
          date: '2025-01-15',
          created_at: '2025-01-15T09:00:00Z'
        },
        {
          id: '6',
          title: 'Education Initiative Launch',
          description: 'Launch of new education initiative for rural areas of Himachal Pradesh',
          url: 'https://images.pexels.com/photos/4427610/pexels-photo-4427610.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
          type: 'image',
          category: 'Development Projects',
          tags: ['education', 'rural', 'initiative'],
          date: '2024-12-20',
          created_at: '2024-12-20T13:00:00Z'
        }
      ];
      setGalleryItems(staticGalleryItems);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching gallery items:', error);
        // Fallback to static data on error
        setGalleryItems([]);
      } else {
        setGalleryItems(data || []);
      }
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      setGalleryItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openLightbox = (item: GalleryItem) => {
    setSelectedItem(item);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedItem(null);
    document.body.style.overflow = 'auto';
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter items
  const filteredItems = galleryItems.filter(item => {
    const matchesType = filter === 'all' || item.type === filter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesType && matchesCategory;
  });

  // Get unique categories
  const categories = [...new Set(galleryItems.map(item => item.category))].sort();

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjp-saffron mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading gallery...</p>
      </div>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md transition-colors ${
              filter === 'all' 
                ? 'bg-bjp-saffron text-white' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('image')}
            className={`px-4 py-2 rounded-md transition-colors flex items-center ${
              filter === 'image' 
                ? 'bg-bjp-saffron text-white' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ImageIcon size={16} className="mr-2" />
            Photos
          </button>
          <button
            onClick={() => setFilter('video')}
            className={`px-4 py-2 rounded-md transition-colors flex items-center ${
              filter === 'video' 
                ? 'bg-bjp-saffron text-white' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Video size={16} className="mr-2" />
            Videos
          </button>
        </div>
        
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        )}
      </div>

      {/* Gallery Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon size={24} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No media found</h3>
          <p className="text-gray-600">
            {filter !== 'all' || categoryFilter !== 'all' 
              ? 'No items match your current filters.' 
              : 'No gallery items available yet.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              className="relative overflow-hidden rounded-lg shadow-md cursor-pointer group bg-white"
              onClick={() => openLightbox(item)}
            >
              {/* Media Preview */}
              <div className="relative aspect-video">
                {item.type === 'image' ? (
                  <img 
                    src={item.url} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <Video size={48} className="text-white" />
                  </div>
                )}
                
                {/* Type indicator */}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.type === 'image' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.type === 'image' ? <ImageIcon size={12} className="inline mr-1" /> : <Video size={12} className="inline mr-1" />}
                    {item.type.toUpperCase()}
                  </span>
                </div>

                {/* View button */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors">
                    <Eye size={16} />
                  </button>
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar size={14} className="mr-1" />
                    {formatDate(item.date)}
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Tag size={14} className="mr-1 text-gray-400" />
                    <span className="bg-bjp-lightSaffron text-bjp-darkSaffron px-2 py-1 rounded-full text-xs">
                      {item.category}
                    </span>
                  </div>
                  
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-gray-400 text-xs">+{item.tags.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in">
          <button 
            className="absolute top-4 right-4 text-white hover:text-bjp-saffron z-10"
            onClick={closeLightbox}
          >
            <X size={28} />
          </button>
          <div className="max-w-5xl w-full">
            <div className="relative">
              {selectedItem.type === 'image' ? (
                <img 
                  src={selectedItem.url} 
                  alt={selectedItem.title} 
                  className="w-full max-h-[80vh] object-contain"
                />
              ) : (
                <video 
                  src={selectedItem.url} 
                  controls 
                  className="w-full max-h-[80vh] object-contain"
                  autoPlay
                />
              )}
              <div className="bg-white p-4 rounded-b-lg">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold text-bjp-darkGray">{selectedItem.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedItem.type === 'image' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedItem.type.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar size={14} className="mr-1" />
                  {formatDate(selectedItem.date)}
                  <span className="mx-2">•</span>
                  <Tag size={14} className="mr-1" />
                  {selectedItem.category}
                </div>
                
                {selectedItem.description && (
                  <p className="text-gray-600 mb-3">{selectedItem.description}</p>
                )}
                
                {selectedItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedItem.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryGrid;
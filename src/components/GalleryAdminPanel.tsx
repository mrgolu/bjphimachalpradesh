import React, { useState, useEffect, useRef } from 'react';
import { Upload, Image, Video, Trash2, Edit3, Eye, Calendar, Tag, Search, Filter, Grid, List, Plus, X, Save, Camera, FolderOpen, UploadCloud as CloudUpload } from 'lucide-react';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { toast } from 'react-toastify';

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
  user_id: string;
}

const GalleryAdminPanel: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [user, setUser] = useState<any>(null);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    url: '',
    type: 'image' as 'image' | 'video',
    category: '',
    tags: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Categories for organization
  const categories = [
    'Rally & Events',
    'Meetings',
    'Press Conference',
    'Community Service',
    'Youth Activities',
    'Women Empowerment',
    'Development Projects',
    'Cultural Events',
    'Political Campaigns',
    'Other'
  ];

  useEffect(() => {
    checkAuth();
    fetchGalleryItems();
  }, []);

  // Handle drag events
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!dragRef.current?.contains(e.relatedTarget as Node)) {
        setDragActive(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    };

    if (showUploadModal && uploadMethod === 'file') {
      document.addEventListener('dragover', handleDragOver);
      document.addEventListener('dragenter', handleDragEnter);
      document.addEventListener('dragleave', handleDragLeave);
      document.addEventListener('drop', handleDrop);
    }

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, [showUploadModal, uploadMethod]);

  const checkAuth = async () => {
    if (!isSupabaseReady || !supabase) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  };

  const fetchGalleryItems = async () => {
    if (!isSupabaseReady || !supabase) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching gallery items:', error);
      } else {
        setGalleryItems(data || []);
      }
    } catch (error) {
      console.error('Error fetching gallery items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
    
    const isValidImage = validImageTypes.includes(file.type);
    const isValidVideo = validVideoTypes.includes(file.type);
    
    if (!isValidImage && !isValidVideo) {
      toast.error('Please select a valid image or video file');
      return;
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    
    // Set file type based on file
    const fileType = isValidImage ? 'image' : 'video';
    setUploadForm(prev => ({ 
      ...prev, 
      type: fileType,
      title: prev.title || file.name.split('.')[0] // Auto-fill title from filename
    }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const uploadFileToStorage = async (file: File): Promise<string> => {
    if (!supabase || !user) {
      throw new Error('Authentication required');
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseReady || !supabase || !user) {
      toast.error('Please sign in to upload gallery items');
      return;
    }

    if (!uploadForm.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (uploadMethod === 'url' && !uploadForm.url.trim()) {
      toast.error('URL is required');
      return;
    }

    if (uploadMethod === 'file' && !selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);

    try {
      let fileUrl = uploadForm.url;

      // Upload file if using file method
      if (uploadMethod === 'file' && selectedFile) {
        fileUrl = await uploadFileToStorage(selectedFile);
      }

      const tagsArray = uploadForm.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const { data, error } = await supabase
        .from('gallery_items')
        .insert([{
          title: uploadForm.title.trim(),
          description: uploadForm.description.trim() || null,
          url: fileUrl,
          type: uploadForm.type,
          category: uploadForm.category || 'Other',
          tags: tagsArray,
          date: uploadForm.date,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setGalleryItems(prev => [data, ...prev]);
      setShowUploadModal(false);
      resetUploadForm();
      
      toast.success(`${uploadForm.type === 'image' ? 'Photo' : 'Video'} uploaded successfully!`);
    } catch (error: any) {
      console.error('Error uploading gallery item:', error);
      toast.error('Failed to upload: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      title: '',
      description: '',
      url: '',
      type: 'image',
      category: '',
      tags: '',
      date: new Date().toISOString().split('T')[0]
    });
    setSelectedFile(null);
    setFilePreview(null);
    setUploadMethod('file');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseReady || !supabase || !editingItem) return;

    try {
      const tagsArray = editingItem.tags;

      const { data, error } = await supabase
        .from('gallery_items')
        .update({
          title: editingItem.title,
          description: editingItem.description,
          url: editingItem.url,
          category: editingItem.category,
          tags: tagsArray,
          date: editingItem.date
        })
        .eq('id', editingItem.id)
        .select()
        .single();

      if (error) throw error;

      setGalleryItems(prev => 
        prev.map(item => item.id === editingItem.id ? data : item)
      );
      
      setShowEditModal(false);
      setEditingItem(null);
      toast.success('Gallery item updated successfully!');
    } catch (error: any) {
      console.error('Error updating gallery item:', error);
      toast.error('Failed to update: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isSupabaseReady || !supabase) return;

    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGalleryItems(prev => prev.filter(item => item.id !== id));
      toast.success('Gallery item deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting gallery item:', error);
      toast.error('Failed to delete: ' + error.message);
    }
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem({ ...item });
    setShowEditModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter gallery items
  const filteredItems = galleryItems.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const getUniqueCategories = () => {
    const usedCategories = [...new Set(galleryItems.map(item => item.category))];
    return usedCategories.sort();
  };

  if (!isSupabaseReady) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <Camera size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Database Setup Required</h3>
          <p className="text-gray-600">
            Connect to Supabase to manage gallery photos and videos.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <Camera size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h3>
          <p className="text-gray-600">
            Please sign in to manage gallery photos and videos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-bjp-darkGray mb-2">Gallery Management</h2>
          <p className="text-gray-600">Manage photos and videos for BJP Himachal Pradesh</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-4 py-2 rounded-md transition-colors flex items-center mt-4 md:mt-0"
        >
          <Plus size={20} className="mr-2" />
          Add Media
        </button>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search photos and videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'image' | 'video')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
            >
              <option value="all">All Types</option>
              <option value="image">Photos</option>
              <option value="video">Videos</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
            >
              <option value="all">All Categories</option>
              {getUniqueCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-bjp-saffron text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-bjp-saffron text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-bjp-lightGray p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-bjp-darkGray">{galleryItems.length}</div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {galleryItems.filter(item => item.type === 'image').length}
          </div>
          <div className="text-sm text-gray-600">Photos</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {galleryItems.filter(item => item.type === 'video').length}
          </div>
          <div className="text-sm text-gray-600">Videos</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            {getUniqueCategories().length}
          </div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
      </div>

      {/* Gallery Items */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjp-saffron mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading gallery items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <Camera size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No media found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== 'all' || filterCategory !== 'all' 
              ? 'No items match your current filters.' 
              : 'Start by uploading your first photo or video.'
            }
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-6 py-2 rounded-md transition-colors"
          >
            Add First Media
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {filteredItems.map((item) => (
            <div key={item.id} className={`bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
              viewMode === 'list' ? 'flex' : ''
            }`}>
              {/* Media Preview */}
              <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-video'}`}>
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <Video size={48} className="text-white" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.type === 'image' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.type === 'image' ? <Image size={12} className="inline mr-1" /> : <Video size={12} className="inline mr-1" />}
                    {item.type.toUpperCase()}
                  </span>
                </div>
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    onClick={() => window.open(item.url, '_blank')}
                    className="bg-black/70 text-white p-1 rounded-full hover:bg-black/90 transition-colors"
                    title="View full size"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    className="bg-black/70 text-white p-1 rounded-full hover:bg-black/90 transition-colors"
                    title="Edit"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-500/70 text-white p-1 rounded-full hover:bg-red-500/90 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-1">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                {item.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                )}
                
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-bjp-darkGray">Add Media</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  resetUploadForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Upload Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Method
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setUploadMethod('file')}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    uploadMethod === 'file'
                      ? 'bg-bjp-saffron text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <CloudUpload size={20} className="mr-2" />
                  Upload File
                </button>
                <button
                  onClick={() => setUploadMethod('url')}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    uploadMethod === 'url'
                      ? 'bg-bjp-saffron text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FolderOpen size={20} className="mr-2" />
                  From URL
                </button>
              </div>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* File Upload Section */}
              {uploadMethod === 'file' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select File *
                  </label>
                  
                  {/* Drag and Drop Area */}
                  <div
                    ref={dragRef}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? 'border-bjp-saffron bg-bjp-lightSaffron/20'
                        : 'border-gray-300 hover:border-bjp-saffron'
                    }`}
                  >
                    {filePreview ? (
                      <div className="space-y-4">
                        {uploadForm.type === 'image' ? (
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="max-h-48 mx-auto rounded-lg"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                            <Video size={32} className="text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{selectedFile?.name}</p>
                          <p className="text-sm text-gray-500">
                            {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setFilePreview(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <div>
                        <CloudUpload size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">
                          Drop files here or click to browse
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          Supports: JPG, PNG, GIF, WebP, MP4, WebM, MOV (Max 50MB)
                        </p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-4 py-2 rounded-md transition-colors"
                        >
                          Choose File
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              )}

              {/* URL Input Section */}
              {uploadMethod === 'url' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Media URL *
                  </label>
                  <input
                    type="url"
                    value={uploadForm.url}
                    onChange={(e) => setUploadForm({ ...uploadForm, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                    placeholder="https://example.com/image.jpg"
                    required={uploadMethod === 'url'}
                  />
                </div>
              )}

              {/* Media Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Media Type *
                </label>
                <select
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value as 'image' | 'video' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                  required
                  disabled={uploadMethod === 'file' && selectedFile !== null}
                >
                  <option value="image">Photo</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                    placeholder="Enter media title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={uploadForm.date}
                  onChange={(e) => setUploadForm({ ...uploadForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                  placeholder="Enter description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                  placeholder="rally, shimla, 2025"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    resetUploadForm();
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-colors"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || (uploadMethod === 'file' && !selectedFile) || (uploadMethod === 'url' && !uploadForm.url)}
                  className="flex-1 bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={20} className="mr-2" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-bjp-darkGray">Edit Media</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  value={editingItem.url}
                  onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={editingItem.date}
                  onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editingItem.tags.join(', ')}
                  onChange={(e) => setEditingItem({ 
                    ...editingItem, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bjp-saffron focus:border-bjp-saffron"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center"
                >
                  <Save size={20} className="mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryAdminPanel;
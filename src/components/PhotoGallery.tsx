import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera,
  Upload,
  Heart,
  Calendar,
  User,
  Download,
  Trash2,
  Plus,
  Grid,
  List,
  Filter,
  X,
  Eye,
  Edit3,
  Save,
  ImagePlus,
  Wifi,
  WifiOff
} from 'lucide-react';
import { photosAPI, utils } from '../utils/api';
import { useAppContext } from '../contexts/AppContext';
import { toast } from 'sonner@2.0.3';

interface Photo {
  id: string;
  url: string;
  caption: string;
  uploaded_by: string;
  timestamp: string;
  category: 'kepler' | 'house' | 'roommates' | 'memories' | 'other';
  tags: string[];
  likes: string[];
}

export function PhotoGallery() {
  const { isEditMode, editingSection, setEditingSection } = useAppContext();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isUploadingMultiple, setIsUploadingMultiple] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [newPhoto, setNewPhoto] = useState<{
    photo?: File;
    caption: string;
    uploadedBy: string;
    category: string;
    tags: string[];
  }>({
    caption: '',
    uploadedBy: 'Landon',
    category: 'memories',
    tags: []
  });

  const categories = [
    { value: 'all', label: 'All Photos', color: 'gray' },
    { value: 'kepler', label: 'Kepler', color: 'red' },
    { value: 'house', label: 'House Life', color: 'blue' },
    { value: 'roommates', label: 'Roommates', color: 'green' },
    { value: 'memories', label: 'Memories', color: 'purple' },
    { value: 'other', label: 'Other', color: 'orange' }
  ];

  const residents = ['Nick', 'Alex', 'Landon'];

  // Glassmorphism styles with dark mode support
  const glassStyle = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
  };

  useEffect(() => {
    loadPhotos();
    checkConnection();
  }, [selectedCategory]);

  const checkConnection = async () => {
    const isConnected = await utils.testConnection();
    setConnected(isConnected);
    if (!isConnected) {
      toast.error('Backend not connected. Please start the Flask server.');
    }
  };

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const fetchedPhotos = await photosAPI.getAll(selectedCategory);
      setPhotos(fetchedPhotos);
      setConnected(true);
    } catch (error) {
      console.error('Failed to load photos:', error);
      setConnected(false);
      toast.error(utils.handleError(error));
    } finally {
      setLoading(false);
    }
  };



  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewPhoto(prev => ({ ...prev, photo: file }));
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      handleMultipleFiles(files);
    }
  };

  const handleMultipleFiles = async (files: File[]) => {
    setIsUploadingMultiple(true);
    
    try {
      for (const file of files) {
        const photoData = {
          photo: file,
          caption: `Photo uploaded on ${new Date().toLocaleDateString()}`,
          uploadedBy: 'Landon',
          category: 'memories',
          tags: [file.name.split('.')[0]]
        };
        
        await photosAPI.upload(photoData);
      }
      
      await loadPhotos(); // Refresh the list
      toast.success(`${files.length} photos uploaded successfully!`);
    } catch (error) {
      console.error('Failed to upload photos:', error);
      toast.error(utils.handleError(error));
    } finally {
      setIsUploadingMultiple(false);
    }
  };

  const addPhoto = async () => {
    if (newPhoto.photo && newPhoto.caption) {
      try {
        await photosAPI.upload({
          photo: newPhoto.photo,
          caption: newPhoto.caption,
          uploadedBy: newPhoto.uploadedBy,
          category: newPhoto.category,
          tags: newPhoto.tags
        });
        
        await loadPhotos(); // Refresh the list
        setNewPhoto({
          caption: '',
          uploadedBy: 'Landon',
          category: 'memories',
          tags: []
        });
        setShowUpload(false);
        toast.success('Photo uploaded successfully!');
      } catch (error) {
        console.error('Failed to upload photo:', error);
        toast.error(utils.handleError(error));
      }
    }
  };

  // Quick photo capture from clipboard
  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleMultipleFiles([file]);
          }
        }
      }
    }
  };

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [photos]);

  const deletePhoto = async (photoId: string) => {
    try {
      await photosAPI.delete(photoId);
      await loadPhotos(); // Refresh the list
      setSelectedPhoto(null);
      toast.success('Photo deleted successfully!');
    } catch (error) {
      console.error('Failed to delete photo:', error);
      toast.error(utils.handleError(error));
    }
  };

  const toggleLike = async (photoId: string, user: string) => {
    try {
      await photosAPI.toggleLike(photoId, user);
      await loadPhotos(); // Refresh the list
    } catch (error) {
      console.error('Failed to toggle like:', error);
      toast.error(utils.handleError(error));
    }
  };

  const addTag = (photoId: string, tag: string) => {
    if (tag.trim()) {
      savePhotos(photos.map(photo => {
        if (photo.id === photoId && !photo.tags.includes(tag.trim())) {
          return { ...photo, tags: [...photo.tags, tag.trim()] };
        }
        return photo;
      }));
    }
  };

  const filteredPhotos = photos.filter(photo => 
    selectedCategory === 'all' || photo.category === selectedCategory
  );

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.value === category);
    switch (cat?.color) {
      case 'red': return 'bg-red-100 text-red-700 border-red-200';
      case 'blue': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'green': return 'bg-green-100 text-green-700 border-green-200';
      case 'purple': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'orange': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      className="space-y-6"
      ref={dropZoneRef}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {dragOver && (
        <div className="fixed inset-0 bg-purple-500/20 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in">
          <div className="bg-white/20 backdrop-blur-md border-2 border-dashed border-purple-400 rounded-2xl p-8 text-center max-w-md">
            <ImagePlus className="w-16 h-16 mx-auto mb-4 text-purple-600" />
            <h3 className="text-xl text-purple-700 dark:text-purple-300 mb-2">Drop Photos Here</h3>
            <p className="text-purple-600 dark:text-purple-400">Drop your images to add them to the gallery</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
            Photo Gallery
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Capture and share memories of your life together. 
            <span className="text-sm block mt-1 text-purple-600 dark:text-purple-400">
              💡 Drag & drop photos or paste from clipboard!
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          {isEditMode && (
            <button
              onClick={() => setEditingSection(editingSection === 'photos' ? null : 'photos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                editingSection === 'photos'
                  ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                  : 'bg-white/10 dark:bg-black/20 text-gray-600 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-black/30'
              }`}
            >
              {editingSection === 'photos' ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {editingSection === 'photos' ? 'Save' : 'Edit'}
            </button>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) {
                handleMultipleFiles(files);
              }
            }}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Upload className="w-4 h-4" />
            Quick Upload
          </button>
          
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Photo
          </button>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploadingMultiple && (
        <div className="rounded-xl p-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-blue-700 dark:text-blue-300">Uploading photos...</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                selectedCategory === category.value
                  ? getCategoryColor(category.value)
                  : 'bg-white/10 text-gray-600 border-white/20 hover:bg-white/20'
              }`}
            >
              {category.label}
              {category.value !== 'all' && (
                <span className="ml-2 text-xs">
                  ({photos.filter(p => p.category === category.value).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* View Mode */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'bg-white/10 text-gray-600'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'bg-white/10 text-gray-600'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Photo Grid/List */}
      {filteredPhotos.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {filteredPhotos.map(photo => (
            <div
              key={photo.id}
              className={`rounded-2xl shadow-xl overflow-hidden cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300 group animate-fade-in ${
                viewMode === 'list' ? 'flex gap-4 p-4' : ''
              }`}
              style={glassStyle}
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-32 h-24 flex-shrink-0' : 'aspect-square'}`}>
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Eye className="w-5 h-5 text-white drop-shadow-lg" />
                </div>
              </div>
              
              <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(photo.category)}`}>
                    {categories.find(c => c.value === photo.category)?.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <Heart 
                      className={`w-4 h-4 ${photo.likes.length > 0 ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                    />
                    <span className="text-xs text-gray-600">{photo.likes.length}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-800 mb-2 line-clamp-2">{photo.caption}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{photo.uploaded_by}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatTimestamp(photo.timestamp)}</span>
                  </div>
                </div>
                
                {photo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {photo.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-white/20 rounded text-xs text-gray-600">
                        #{tag}
                      </span>
                    ))}
                    {photo.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{photo.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl p-8 shadow-xl text-center" style={glassStyle}>
          <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg text-gray-600 mb-2">No photos yet</h3>
          <p className="text-gray-500 mb-4">Start building your photo memories!</p>
          <button
            onClick={() => setShowUpload(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
          >
            Add First Photo
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 shadow-xl max-w-md w-full" style={glassStyle}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg text-gray-800">Add New Photo</h3>
              <button
                onClick={() => setShowUpload(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Upload Photo</label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Click to upload a photo</p>
                  </label>
                </div>
                {newPhoto.url && (
                  <div className="mt-3">
                    <img src={newPhoto.url} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Caption</label>
                <textarea
                  value={newPhoto.caption || ''}
                  onChange={(e) => setNewPhoto(prev => ({ ...prev, caption: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Tell us about this photo..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Category</label>
                  <select
                    value={newPhoto.category}
                    onChange={(e) => setNewPhoto(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.filter(c => c.value !== 'all').map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Uploaded By</label>
                  <select
                    value={newPhoto.uploadedBy}
                    onChange={(e) => setNewPhoto(prev => ({ ...prev, uploadedBy: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {residents.map(resident => (
                      <option key={resident} value={resident}>{resident}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newPhoto.tags?.join(', ') || ''}
                  onChange={(e) => setNewPhoto(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                  }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="kepler, cute, playing..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={addPhoto}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Add Photo
              </button>
              <button
                onClick={() => setShowUpload(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={glassStyle}>
            <div className="relative">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                className="w-full h-auto max-h-96 object-contain"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm border ${getCategoryColor(selectedPhoto.category)}`}>
                  {categories.find(c => c.value === selectedPhoto.category)?.label}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleLike(selectedPhoto.id, 'Current User')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                      selectedPhoto.likes.includes('Current User') 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-white/10 text-gray-600 hover:bg-white/20'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${selectedPhoto.likes.includes('Current User') ? 'fill-current' : ''}`} />
                    <span>{selectedPhoto.likes.length}</span>
                  </button>
                  <button
                    onClick={() => deletePhoto(selectedPhoto.id)}
                    className="p-2 text-red-600 hover:bg-red-50/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-800 mb-4">{selectedPhoto.caption}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>Uploaded by {selectedPhoto.uploadedBy}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatTimestamp(selectedPhoto.timestamp)}</span>
                </div>
              </div>
              
              {selectedPhoto.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedPhoto.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-white/20 rounded text-sm text-gray-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              {selectedPhoto.likes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-sm text-gray-600 mb-2">Liked by:</p>
                  <div className="flex gap-2">
                    {selectedPhoto.likes.map(user => (
                      <span key={user} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                        {user}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
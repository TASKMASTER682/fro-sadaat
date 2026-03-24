'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Images, Plus, Upload, Eye, EyeOff, Trash2, Check, Loader2, X, FileImage } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { useAuthStore } from '@/hooks/useAuth';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface GalleryItem {
  _id: string;
  title: string;
  description?: string;
  imageData: string;
  imageType: string;
  category: string;
  uploadedBy: { _id: string; name: string; role: string };
  status: 'draft' | 'published';
  publishedBy?: { _id: string; name: string };
  publishedAt?: string;
  createdAt: string;
}

const CATEGORIES = [
  { value: 'event', label: 'Event' },
  { value: 'family', label: 'Family' },
  { value: 'historical', label: 'Historical' },
  { value: 'landmark', label: 'Landmark' },
  { value: 'general', label: 'General' },
];

const CATEGORY_COLORS: Record<string, string> = {
  event: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  family: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  historical: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  landmark: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  general: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
};

export default function GalleryPage() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDrafts, setShowDrafts] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'general',
  });

  const canUpload = ['admin', 'leader', 'scholar'].includes(user?.role || '');
  const canPublish = ['leader', 'scholar'].includes(user?.role || '');
  const showAdminView = ['admin', 'leader', 'scholar'].includes(user?.role || '');

  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (showDrafts || showAdminView) params.set('status', 'all');
      
      const res = await api.get(`/gallery?${params}`);
      setItems(res.data.data);
    } catch {
      toast.error('Failed to load gallery');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [selectedCategory, showDrafts]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !selectedFile) {
      toast.error('Title and image are required');
      return;
    }
    setUploading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        imageData: previewUrl,
        imageType: selectedFile.type,
      };
      await api.post('/gallery', payload);
      toast.success('Image uploaded successfully');
      setForm({ title: '', description: '', category: 'general' });
      setSelectedFile(null);
      setPreviewUrl('');
      setShowUploadForm(false);
      fetchGallery();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await api.put(`/gallery/${id}/publish`);
      toast.success('Image published!');
      fetchGallery();
    } catch {
      toast.error('Failed to publish');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image?')) return;
    try {
      await api.delete(`/gallery/${id}`);
      toast.success('Image deleted');
      fetchGallery();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        <PageHeader
          title="GALLERY"
          subtitle="Clan photos and memories"
          icon={Images}
          action={
            canUpload && (
              <button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-clan-gold/15 text-clan-gold border border-clan-gold/30 hover:bg-clan-gold/25 transition-all"
              >
                {showUploadForm ? <X size={14} /> : <Plus size={14} />}
                {showUploadForm ? 'Cancel' : 'Upload'}
              </button>
            )
          }
        />

        {/* Upload Form */}
        <AnimatePresence>
          {showUploadForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-panel rounded-2xl border border-clan-border p-6"
            >
              <h3 className="font-cinzel text-clan-gold text-sm tracking-wider mb-4">UPLOAD PHOTO</h3>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Title *</label>
                  <input
                    className="input-dark w-full"
                    placeholder="Photo title..."
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    maxLength={200}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Description</label>
                  <textarea
                    className="input-dark w-full min-h-[80px] resize-y"
                    placeholder="Describe this photo..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    maxLength={1000}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Image *</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="gallery-upload"
                    />
                    <label
                      htmlFor="gallery-upload"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-clan-gold/30 bg-clan-dark-3 hover:bg-clan-dark-4 hover:border-clan-gold/50 cursor-pointer transition-all"
                    >
                      {previewUrl ? (
                        <div className="flex items-center gap-3">
                          <img src={previewUrl} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
                          <span className="text-sm text-clan-gold">Click to change</span>
                        </div>
                      ) : (
                        <>
                          <FileImage size={18} className="text-clan-gold/60" />
                          <span className="text-sm text-muted-foreground">Click to select image</span>
                        </>
                      )}
                    </label>
                  </div>
                  {selectedFile && (
                    <p className="text-xs text-muted-foreground mt-1">{selectedFile.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Category</label>
                  <select
                    className="input-dark w-full"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-gold flex items-center gap-2"
                >
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  Upload as Draft
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                selectedCategory === 'all'
                  ? 'bg-clan-gold/15 text-clan-gold border border-clan-gold/30'
                  : 'text-muted-foreground border border-transparent hover:border-clan-border'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-clan-gold/15 text-clan-gold border border-clan-gold/30'
                    : 'text-muted-foreground border border-transparent hover:border-clan-border'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {showAdminView && (
            <button
              onClick={() => setShowDrafts(!showDrafts)}
              className={`ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${
                showDrafts
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-muted-foreground border border-transparent hover:border-clan-border'
              }`}
            >
              {showDrafts ? <EyeOff size={12} /> : <Eye size={12} />}
              {showDrafts ? 'Hide Drafts' : 'Show Drafts'}
            </button>
          )}
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-clan-gold animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={FileImage}
            title="No photos yet"
            description="Upload the first clan photo!"
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-panel rounded-xl border border-clan-border overflow-hidden group"
              >
                <div
                  className="relative aspect-square cursor-pointer overflow-hidden"
                  onClick={() => setSelectedImage(item)}
                >
                  <img
                    src={item.imageData}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.png';
                    }}
                  />
                  {item.status === 'draft' && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 text-[10px] rounded-full bg-amber-500/80 text-black font-medium">
                      DRAFT
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-medium text-foreground truncate mb-1">{item.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[item.category]}`}>
                      {item.category}
                    </span>
                  </div>
                  {showAdminView && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-clan-border/50">
                      {item.status === 'draft' && canPublish && (
                        <button
                          onClick={() => handlePublish(item._id)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-all"
                        >
                          <Check size={10} />
                          Publish
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 text-[10px] rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.imageData}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              <div className="mt-4 text-center">
                <h3 className="font-cinzel text-clan-gold text-lg">{selectedImage.title}</h3>
                {selectedImage.description && (
                  <p className="text-muted-foreground text-sm mt-2">{selectedImage.description}</p>
                )}
                <p className="text-muted-foreground text-xs mt-2">
                  Uploaded by {selectedImage.uploadedBy?.name}
                  {selectedImage.status === 'published' && selectedImage.publishedBy && (
                    <> · Published by {selectedImage.publishedBy.name}</>
                  )}
                </p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-clan-dark-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

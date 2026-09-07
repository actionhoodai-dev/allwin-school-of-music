'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Eye, EyeOff, Image as ImageIcon, Check } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ImageUploader from '@/components/admin/ImageUploader';
import {
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
} from '@/lib/firebase/firestore';
import { GALLERY_CATEGORIES } from '@/lib/constants';
import type { GalleryImage, GalleryCategory, CloudinaryUploadResult } from '@/types';

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [uploadedMedia, setUploadedMedia] = useState<CloudinaryUploadResult | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GalleryCategory>('classes');
  const [description, setDescription] = useState('');
  const [published, setPublished] = useState(true);

  const loadGallery = async () => {
    setLoading(true);
    try {
      const data = await getDocuments<GalleryImage>('gallery');
      setImages(data);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedMedia) {
      alert('Please select and upload a photo first.');
      return;
    }

    setSaving(true);
    try {
      await addDocument('gallery', {
        title: title.trim(),
        category,
        description: description.trim(),
        imageUrl: uploadedMedia.secure_url,
        publicId: uploadedMedia.public_id,
        width: uploadedMedia.width,
        height: uploadedMedia.height,
        format: uploadedMedia.format,
        bytes: uploadedMedia.bytes,
        published,
      });

      setIsModalOpen(false);
      // Reset form
      setUploadedMedia(null);
      setTitle('');
      setDescription('');
      loadGallery();
    } catch (err) {
      console.error('Failed to save gallery image:', err);
      alert('Error saving image. Please check credentials and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      await updateDocument('gallery', id, { published: !current });
      setImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, published: !current } : img))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) return;
    try {
      await deleteDocument('gallery', id);
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      console.error('Failed to delete image:', err);
    }
  };

  const categoriesOptions = GALLERY_CATEGORIES.filter((c) => c.value !== 'all').map(
    (c) => ({ value: c.value, label: c.label })
  );

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Gallery & Media Manager" />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Header Action */}
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-text-secondary">
            Upload high-resolution photos for recitals, events, and classroom moments.
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            icon={<Plus className="w-4 h-4" />}
          >
            Add New Photo
          </Button>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="p-12 text-center">
            <Spinner size="lg" />
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img) => (
              <div
                key={img.id}
                className="rounded-2xl bg-white border border-border overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div className="relative w-full h-48 bg-slate-900">
                  <Image
                    src={img.imageUrl}
                    alt={img.title || 'Allwin Gallery'}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover"
                  />
                  <span className="absolute top-2 left-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-navy/80 text-white backdrop-blur-sm">
                    {img.category}
                  </span>
                  <span
                    className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      img.published
                        ? 'bg-green-600 text-white'
                        : 'bg-yellow-500 text-slate-900'
                    }`}
                  >
                    {img.published ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-heading font-semibold text-sm text-navy line-clamp-1">
                    {img.title || 'Untitled Image'}
                  </h3>
                  {img.description && (
                    <p className="text-xs text-text-secondary line-clamp-2">
                      {img.description}
                    </p>
                  )}
                </div>

                <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-surface-dim/40">
                  <button
                    onClick={() => handleTogglePublish(img.id!, img.published)}
                    className="text-xs font-semibold text-text-secondary hover:text-navy flex items-center gap-1"
                  >
                    {img.published ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Unpublish</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Publish</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(img.id!)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                    title="Delete Image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Gallery Images Uploaded"
            description="Upload performance recitals, classroom moments, and student photos."
            action={
              <Button onClick={() => setIsModalOpen(true)} size="sm">
                Upload First Image
              </Button>
            }
          />
        )}

        {/* Upload Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Upload Photo to Gallery"
          size="lg"
        >
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <ImageUploader
              onUploadSuccess={(result) => setUploadedMedia(result)}
              label="Select Photo to Upload"
            />

            <Input
              label="Photo Title / Caption *"
              placeholder="e.g. Annual Student Piano Recital 2024"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Select
              label="Category"
              options={categoriesOptions}
              value={category}
              onChange={(e) => setCategory(e.target.value as GalleryCategory)}
            />

            <Textarea
              label="Description (Optional)"
              placeholder="Brief description of the event, classroom session, or students..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="publishedCheckbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 rounded text-violet focus:ring-violet"
              />
              <label htmlFor="publishedCheckbox" className="text-sm font-medium text-text-primary cursor-pointer">
                Publish immediately to website gallery
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving || !uploadedMedia}
              >
                {saving ? 'Saving to Database...' : 'Save & Publish Photo'}
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}

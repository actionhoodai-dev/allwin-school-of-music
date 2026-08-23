'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Star, Eye, EyeOff } from 'lucide-react';
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
import { INSTRUMENT_OPTIONS } from '@/lib/constants';
import type { Testimonial } from '@/types';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    profileImage: '',
    profileImagePublicId: '',
    rating: 5,
    testimonial: '',
    course: 'Keyboard',
    date: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    published: true,
  });

  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const data = await getDocuments<Testimonial>('testimonials');
      setTestimonials(data);
    } catch (err) {
      console.error('Failed to load testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      profileImage: '',
      profileImagePublicId: '',
      rating: 5,
      testimonial: '',
      course: 'Keyboard',
      date: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      published: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t: Testimonial) => {
    setEditingId(t.id!);
    setFormData({
      name: t.name || '',
      profileImage: t.profileImage || '',
      profileImagePublicId: t.profileImagePublicId || '',
      rating: t.rating || 5,
      testimonial: t.testimonial || '',
      course: t.course || 'Keyboard',
      date: t.date || '',
      published: t.published ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateDocument('testimonials', editingId, formData);
      } else {
        await addDocument('testimonials', formData as any);
      }

      setIsModalOpen(false);
      loadTestimonials();
    } catch (err) {
      console.error('Failed to save testimonial:', err);
      alert('Failed to save testimonial.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await deleteDocument('testimonials', id);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      await updateDocument('testimonials', id, { published: !current });
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, published: !current } : t))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Testimonials & Reviews Manager" />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-text-secondary">
            Manage genuine student and parent reviews. Never publish fabricated claims.
          </p>
          <Button
            onClick={openAddModal}
            size="sm"
            icon={<Plus className="w-4 h-4" />}
          >
            Add Testimonial
          </Button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Spinner size="lg" />
          </div>
        ) : testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="p-6 rounded-2xl bg-white border border-border shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    {t.date && (
                      <span className="text-xs text-text-muted">{t.date}</span>
                    )}
                  </div>

                  <p className="text-xs text-text-secondary italic line-clamp-3">
                    &ldquo;{t.testimonial}&rdquo;
                  </p>

                  <div className="pt-2 border-t border-slate-100">
                    <h4 className="font-heading font-bold text-sm text-navy">{t.name}</h4>
                    {t.course && (
                      <p className="text-xs text-violet font-semibold">{t.course}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      t.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {t.published ? 'Published' : 'Draft'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePublish(t.id!, t.published)}
                      className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-dim"
                      title={t.published ? 'Unpublish' : 'Publish'}
                    >
                      {t.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openEditModal(t)}
                      className="p-1.5 rounded-lg text-violet hover:bg-purple-deep/5"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id!)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Testimonials Added"
            description="Add verified student quotes, exam feedback, and parent reflections."
            action={
              <Button onClick={openAddModal} size="sm">
                Add First Testimonial
              </Button>
            }
          />
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? 'Edit Testimonial' : 'Add Testimonial'}
          size="lg"
        >
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Student / Parent Name *"
                placeholder="e.g. Priyadharshini M."
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Select
                label="Course / Instrument *"
                options={INSTRUMENT_OPTIONS}
                value={formData.course}
                onChange={(e) =>
                  setFormData({ ...formData, course: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Rating (Stars)
                </label>
                <select
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm outline-none focus:border-violet"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                  <option value={3}>⭐⭐⭐ (3 Stars)</option>
                </select>
              </div>

              <Input
                label="Date / Period"
                placeholder="e.g. Jan 2024"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>

            <Textarea
              label="Testimonial / Review Text *"
              placeholder="Paste the student's or parent's genuine feedback..."
              required
              value={formData.testimonial}
              onChange={(e) =>
                setFormData({ ...formData, testimonial: e.target.value })
              }
            />

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="testPublished"
                checked={formData.published}
                onChange={(e) =>
                  setFormData({ ...formData, published: e.target.checked })
                }
                className="w-4 h-4 rounded text-violet focus:ring-violet"
              />
              <label htmlFor="testPublished" className="text-sm font-medium text-text-primary cursor-pointer">
                Publish on website
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
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? 'Saving...' : 'Save Testimonial'}
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Edit2, Trophy, Eye, EyeOff } from 'lucide-react';
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
import { ACHIEVEMENT_CATEGORIES } from '@/lib/constants';
import type { Achievement, AchievementCategory } from '@/types';

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    studentName: '',
    title: '',
    category: 'grade-examination' as AchievementCategory,
    description: '',
    year: new Date().getFullYear().toString(),
    imageUrl: '',
    imagePublicId: '',
    certificateUrl: '',
    certificatePublicId: '',
    published: true,
  });

  const loadAchievements = async () => {
    setLoading(true);
    try {
      const data = await getDocuments<Achievement>('achievements');
      setAchievements(data);
    } catch (err) {
      console.error('Failed to load achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      studentName: '',
      title: '',
      category: 'grade-examination',
      description: '',
      year: new Date().getFullYear().toString(),
      imageUrl: '',
      imagePublicId: '',
      certificateUrl: '',
      certificatePublicId: '',
      published: true,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateDocument('achievements', editingId, formData);
      } else {
        await addDocument('achievements', formData as any);
      }

      setIsModalOpen(false);
      loadAchievements();
    } catch (err) {
      console.error('Failed to save achievement:', err);
      alert('Failed to save achievement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this achievement record?')) return;
    try {
      await deleteDocument('achievements', id);
      setAchievements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      await updateDocument('achievements', id, { published: !current });
      setAchievements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, published: !current } : a))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const catOptions = ACHIEVEMENT_CATEGORIES.filter((c) => c.value !== 'all').map((c) => ({
    value: c.value,
    label: c.label,
  }));

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Student Achievements & Milestones" />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-text-secondary">
            Publish Trinity Grade examination distinctions, recital awards, and certifications.
          </p>
          <Button
            onClick={openAddModal}
            size="sm"
            icon={<Plus className="w-4 h-4" />}
          >
            Add Achievement
          </Button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Spinner size="lg" />
          </div>
        ) : achievements.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-white border border-border shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {item.imageUrl && (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-violet">
                      {item.category.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-text-muted">{item.year}</span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-navy">
                    {item.title}
                  </h3>

                  {item.studentName && (
                    <p className="text-xs font-semibold text-orange">
                      Student: {item.studentName}
                    </p>
                  )}

                  <p className="text-xs text-text-secondary line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      item.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {item.published ? 'Published' : 'Draft'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePublish(item.id!, item.published)}
                      className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-dim"
                      title={item.published ? 'Unpublish' : 'Publish'}
                    >
                      {item.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id!)}
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
            title="No Achievements Added"
            description="Add Trinity grade examination certificates, recital achievements, or competition distinctions."
            action={
              <Button onClick={openAddModal} size="sm">
                Add Achievement
              </Button>
            }
          />
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? 'Edit Achievement' : 'Add Student Achievement'}
          size="lg"
        >
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <ImageUploader
              onUploadSuccess={(res) =>
                setFormData((prev) => ({
                  ...prev,
                  imageUrl: res.secure_url,
                  imagePublicId: res.public_id,
                }))
              }
              currentImageUrl={formData.imageUrl}
              label="Photo / Certificate Image (Cloudinary)"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Student Name"
                placeholder="e.g. Master David R."
                value={formData.studentName}
                onChange={(e) =>
                  setFormData({ ...formData, studentName: e.target.value })
                }
              />
              <Input
                label="Achievement Title *"
                placeholder="e.g. Trinity Grade 5 Piano Distinction"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Category"
                options={catOptions}
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as AchievementCategory,
                  })
                }
              />
              <Input
                label="Year"
                placeholder="2024"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
              />
            </div>

            <Textarea
              label="Description / Details"
              placeholder="Provide details about the marks, examination piece, or competition award..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="achPublished"
                checked={formData.published}
                onChange={(e) =>
                  setFormData({ ...formData, published: e.target.checked })
                }
                className="w-4 h-4 rounded text-violet focus:ring-violet"
              />
              <label htmlFor="achPublished" className="text-sm font-medium text-text-primary cursor-pointer">
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
                {saving ? 'Saving...' : 'Save Achievement'}
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}

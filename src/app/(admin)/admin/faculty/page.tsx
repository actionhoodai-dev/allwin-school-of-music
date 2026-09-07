'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Edit2, Users, Eye, EyeOff } from 'lucide-react';
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
import type { Faculty, CloudinaryUploadResult } from '@/types';

export default function AdminFacultyPage() {
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    photo: '',
    photoPublicId: '',
    instrument: 'Keyboard',
    qualification: '',
    experience: '',
    specialization: '',
    bio: '',
    order: 0,
    published: true,
  });

  const loadFaculty = async () => {
    setLoading(true);
    try {
      const data = await getDocuments<Faculty>('faculty');
      setFacultyList(data);
    } catch (err) {
      console.error('Failed to load faculty:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaculty();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      photo: '',
      photoPublicId: '',
      instrument: 'Keyboard',
      qualification: '',
      experience: '',
      specialization: '',
      bio: '',
      order: facultyList.length + 1,
      published: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (f: Faculty) => {
    setEditingId(f.id!);
    setFormData({
      name: f.name || '',
      photo: f.photo || '',
      photoPublicId: f.photoPublicId || '',
      instrument: f.instrument || 'Keyboard',
      qualification: f.qualification || '',
      experience: f.experience || '',
      specialization: f.specialization || '',
      bio: f.bio || '',
      order: f.order || 0,
      published: f.published ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateDocument('faculty', editingId, formData);
      } else {
        await addDocument('faculty', formData as any);
      }

      setIsModalOpen(false);
      loadFaculty();
    } catch (err) {
      console.error('Failed to save faculty member:', err);
      alert('Failed to save faculty member.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this faculty member?')) return;
    try {
      await deleteDocument('faculty', id);
      setFacultyList((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      await updateDocument('faculty', id, { published: !current });
      setFacultyList((prev) =>
        prev.map((f) => (f.id === id ? { ...f, published: !current } : f))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Faculty & Music Educators Roster" />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-text-secondary">
            Add real educator profiles, qualifications, and specializations as available.
          </p>
          <Button
            onClick={openAddModal}
            size="sm"
            icon={<Plus className="w-4 h-4" />}
          >
            Add Faculty Member
          </Button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Spinner size="lg" />
          </div>
        ) : facultyList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facultyList.map((f) => (
              <div
                key={f.id}
                className="p-6 rounded-2xl bg-white border border-border shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {f.photo ? (
                    <div className="relative w-full h-44 rounded-xl overflow-hidden">
                      <Image
                        src={f.photo}
                        alt={f.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-32 rounded-xl bg-surface-dim flex items-center justify-center">
                      <Users className="w-10 h-10 text-violet/40" />
                    </div>
                  )}

                  <div>
                    <h3 className="font-heading font-bold text-lg text-navy">
                      {f.name}
                    </h3>
                    <p className="text-xs text-violet font-semibold">
                      {f.instrument}
                    </p>
                  </div>

                  {f.qualification && (
                    <p className="text-xs text-text-secondary">
                      🎓 {f.qualification}
                    </p>
                  )}
                  {f.experience && (
                    <p className="text-xs text-text-secondary">
                      ⏳ {f.experience}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      f.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {f.published ? 'Published' : 'Draft'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePublish(f.id!, f.published)}
                      className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-dim"
                      title={f.published ? 'Unpublish' : 'Publish'}
                    >
                      {f.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openEditModal(f)}
                      className="p-1.5 rounded-lg text-violet hover:bg-purple-deep/5"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(f.id!)}
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
            title="No Faculty Profiles Added"
            description="The public Faculty page currently displays the professional placeholder. As real teacher profiles become available, add them here."
            action={
              <Button onClick={openAddModal} size="sm">
                Add First Educator
              </Button>
            }
          />
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? 'Edit Faculty Member' : 'Add Faculty Member'}
          size="lg"
        >
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <ImageUploader
              onUploadSuccess={(res) =>
                setFormData((prev) => ({
                  ...prev,
                  photo: res.secure_url,
                  photoPublicId: res.public_id,
                }))
              }
              currentImageUrl={formData.photo}
              label="Educator Photo"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                placeholder="e.g. Mr. S. Moses"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Select
                label="Instrument / Discipline *"
                options={INSTRUMENT_OPTIONS}
                value={formData.instrument}
                onChange={(e) =>
                  setFormData({ ...formData, instrument: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Qualification"
                placeholder="e.g. Trinity Grade 8 / Diploma"
                value={formData.qualification}
                onChange={(e) =>
                  setFormData({ ...formData, qualification: e.target.value })
                }
              />
              <Input
                label="Teaching Experience"
                placeholder="e.g. 10+ Years"
                value={formData.experience}
                onChange={(e) =>
                  setFormData({ ...formData, experience: e.target.value })
                }
              />
            </div>

            <Textarea
              label="Short Biography & Specialization"
              placeholder="Brief summary of musical background, style, and teaching philosophy..."
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
            />

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="facPublished"
                checked={formData.published}
                onChange={(e) =>
                  setFormData({ ...formData, published: e.target.checked })
                }
                className="w-4 h-4 rounded text-violet focus:ring-violet"
              />
              <label htmlFor="facPublished" className="text-sm font-medium text-text-primary cursor-pointer">
                Publish on Faculty page
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
                {saving ? 'Saving...' : 'Save Educator'}
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}

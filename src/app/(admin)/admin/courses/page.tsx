'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Eye, EyeOff, GraduationCap } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import {
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
} from '@/lib/firebase/firestore';
import type { Course } from '@/types';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Instrumental',
    description: '',
    overview: '',
    suitableLearners: '',
    learningFocus: '',
    affiliation: 'Trinity College London',
    examInfo: '',
    order: 0,
    published: true,
  });

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await getDocuments<Course>('courses');
      setCourses(data);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      slug: '',
      category: 'Instrumental',
      description: '',
      overview: '',
      suitableLearners: '',
      learningFocus: '',
      affiliation: 'Trinity College London',
      examInfo: '',
      order: courses.length + 1,
      published: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c: Course) => {
    setEditingId(c.id!);
    setFormData({
      title: c.title || '',
      slug: c.slug || '',
      category: c.category || 'Instrumental',
      description: c.description || '',
      overview: c.overview || '',
      suitableLearners: c.suitableLearners || '',
      learningFocus: c.learningFocus || '',
      affiliation: c.affiliation || '',
      examInfo: c.examInfo || '',
      order: c.order || 0,
      published: c.published ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const slug = formData.slug.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const payload = {
        ...formData,
        slug,
      };

      if (editingId) {
        await updateDocument('courses', editingId, payload);
      } else {
        await addDocument('courses', payload as any);
      }

      setIsModalOpen(false);
      loadCourses();
    } catch (err) {
      console.error('Failed to save course:', err);
      alert('Failed to save course.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course from database?')) return;
    try {
      await deleteDocument('courses', id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      await updateDocument('courses', id, { published: !current });
      setCourses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, published: !current } : c))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Course Management" />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-text-secondary">
            Manage music curriculum, target learners, and exam affiliation information.
          </p>
          <Button
            onClick={openAddModal}
            size="sm"
            icon={<Plus className="w-4 h-4" />}
          >
            Add New Course
          </Button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Spinner size="lg" />
          </div>
        ) : courses.length > 0 ? (
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="p-6 rounded-2xl bg-white border border-border shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-heading font-bold text-lg text-navy">
                      {course.title}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet/10 text-violet font-semibold">
                      {course.category}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        course.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {course.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2">
                    {course.overview || course.description}
                  </p>
                  {course.examInfo && (
                    <p className="text-xs text-orange font-medium">
                      Exam Pathway: {course.examInfo}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleTogglePublish(course.id!, course.published)}
                    className="p-2 rounded-xl text-text-secondary hover:bg-surface-dim transition-colors"
                    title={course.published ? 'Unpublish' : 'Publish'}
                  >
                    {course.published ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4 text-green-600" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(course)}
                    className="p-2 rounded-xl text-violet hover:bg-purple-deep/5 transition-colors"
                    title="Edit Course"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(course.id!)}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Custom Courses Added"
            description="The website currently displays the 6 core default musical disciplines (Keyboard, Guitar, Violin, Vocal, Bharatham, Theory). You can add additional customized syllabi here."
            action={
              <Button onClick={openAddModal} size="sm">
                Add Custom Course
              </Button>
            }
          />
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? 'Edit Course' : 'Add New Course'}
          size="lg"
        >
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Course Title *"
                placeholder="e.g. Western Classical Piano"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <Select
                label="Category"
                options={['Instrumental', 'Vocal', 'Classical Dance', 'Academic', 'Grade Exam']}
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
            </div>

            <Textarea
              label="Course Overview *"
              placeholder="Comprehensive summary of what students will learn..."
              required
              value={formData.overview}
              onChange={(e) =>
                setFormData({ ...formData, overview: e.target.value })
              }
            />

            <Input
              label="Target / Suitable Learners"
              placeholder="e.g. Beginners, children age 5+, grade exam candidates"
              value={formData.suitableLearners}
              onChange={(e) =>
                setFormData({ ...formData, suitableLearners: e.target.value })
              }
            />

            <Input
              label="Examination / Affiliation Information"
              placeholder="e.g. Trinity College London Initial to Grade 8"
              value={formData.examInfo}
              onChange={(e) =>
                setFormData({ ...formData, examInfo: e.target.value })
              }
            />

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="coursePublished"
                checked={formData.published}
                onChange={(e) =>
                  setFormData({ ...formData, published: e.target.checked })
                }
                className="w-4 h-4 rounded text-violet focus:ring-violet"
              />
              <label htmlFor="coursePublished" className="text-sm font-medium text-text-primary cursor-pointer">
                Publish course on website
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
                {saving ? 'Saving...' : 'Save Course'}
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Eye, EyeOff, GraduationCap, ShieldCheck } from 'lucide-react';
import LevelsGradesManager from '@/components/admin/LevelsGradesManager';
import AdminHeader from '@/components/admin/AdminHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import {
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
} from '@/lib/firebase/firestore';
import type { Course } from '@/types';

// The 6 core default courses — always visible
const DEFAULT_COURSES: {
  slug: string;
  title: string;
  category: string;
  overview: string;
  suitableLearners: string;
  examInfo: string;
  order: number;
}[] = [
  {
    slug: 'keyboard',
    title: 'Keyboard / Piano Classes',
    category: 'Instrumental',
    overview:
      'A comprehensive curriculum covering keyboard fundamentals, practical piano technique, music reading, rhythm, and classical as well as contemporary pieces.',
    suitableLearners:
      'Beginners, children (from age 5+), teens, adults, and Trinity grade exam aspirants.',
    examInfo:
      'Trinity College London Western Music Grade Examinations (Initial to Grade 8).',
    order: 1,
  },
  {
    slug: 'guitar',
    title: 'Guitar Classes',
    category: 'Instrumental',
    overview:
      'Structured training for acoustic and classical guitar covering fundamentals, open and barre chords, rhythm, fingerpicking, and grade syllabus pieces.',
    suitableLearners:
      'Ages 7+, teens, adults, casual learners, and Trinity College London certificate aspirants.',
    examInfo:
      'Trinity College London Acoustic & Classical Guitar Grade Examinations.',
    order: 2,
  },
  {
    slug: 'violin',
    title: 'Violin Classes',
    category: 'Instrumental',
    overview:
      'Refined instruction in violin performance covering correct posture, bowing mechanics, intonation calibration, and repertoire across Western and Classical styles.',
    suitableLearners:
      'Ages 6+, dedicated beginners, and learners preparing for graded certifications.',
    examInfo: 'Western Music Grade Examinations & Classical certifications.',
    order: 3,
  },
  {
    slug: 'bharatham',
    title: 'Bharatham (Bharatanatyam)',
    category: 'Classical Dance',
    overview:
      'Traditional Indian classical dance training rooted in systematic Adavu practice, Mudras, rhythmic discipline (Talam), and expressive performance.',
    suitableLearners:
      'Children from age 5+, teens, and adult learners passionate about classical dance.',
    examInfo:
      'Associated with Annamalai University grade/diploma certifications.',
    order: 4,
  },
  {
    slug: 'vocal',
    title: 'Vocal Music Classes',
    category: 'Vocal',
    overview:
      'Systematic vocal training designed to build strong pitch awareness, diaphragmatic breath control, voice projection, range, and expressive confidence.',
    suitableLearners:
      'All age groups — children, teens, and adults pursuing classical or light music singing.',
    examInfo:
      'Graded performance examinations & university certified syllabus.',
    order: 5,
  },
  {
    slug: 'theory-of-music',
    title: 'Theory of Music',
    category: 'Academic Music',
    overview:
      'The essential foundation for every disciplined musician — covering staff notation, key signatures, intervals, chord harmony, rhythm, and analysis.',
    suitableLearners:
      'Students of all instruments, practical exam candidates, and music enthusiasts.',
    examInfo:
      'Trinity College London Theory of Music Examinations (Grades 1 to 8).',
    order: 6,
  },
];

export default function AdminCoursesPage() {
  const [dbCourses, setDbCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDefaultSlug, setEditingDefaultSlug] = useState<string | null>(null);
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
      setDbCourses(data);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Build merged view: default courses (use DB override if exists) + extra custom courses
  const defaultSlugs = DEFAULT_COURSES.map((d) => d.slug);
  const dbOverrides = new Map(
    dbCourses.filter((c) => defaultSlugs.includes(c.slug)).map((c) => [c.slug, c])
  );
  const customCourses = dbCourses.filter((c) => !defaultSlugs.includes(c.slug));

  const mergedDefaults = DEFAULT_COURSES.map((def) => {
    const override = dbOverrides.get(def.slug);
    if (override) {
      return { ...override, isDefault: true, hasOverride: true };
    }
    return {
      id: undefined as string | undefined,
      title: def.title,
      slug: def.slug,
      category: def.category,
      overview: def.overview,
      description: '',
      suitableLearners: def.suitableLearners,
      learningFocus: '',
      affiliation: '',
      examInfo: def.examInfo,
      icon: '',
      order: def.order,
      published: true,
      isDefault: true,
      hasOverride: false,
    };
  });

  const openAddModal = () => {
    setEditingId(null);
    setEditingDefaultSlug(null);
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
      order: dbCourses.length + DEFAULT_COURSES.length + 1,
      published: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c: {
    id?: string;
    title: string;
    slug: string;
    category: string;
    description?: string;
    overview: string;
    suitableLearners: string;
    learningFocus?: string;
    affiliation?: string;
    examInfo: string;
    order: number;
    published: boolean;
    isDefault?: boolean;
    hasOverride?: boolean;
  }) => {
    if (c.id) {
      setEditingId(c.id);
      setEditingDefaultSlug(null);
    } else {
      // Default course not yet in DB
      setEditingId(null);
      setEditingDefaultSlug(c.slug);
    }
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

  const openEditCustom = (c: Course) => {
    setEditingId(c.id!);
    setEditingDefaultSlug(null);
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
      const slug =
        formData.slug.trim() ||
        formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const payload = {
        ...formData,
        slug,
      };

      if (editingId) {
        // Existing Firestore doc
        await updateDocument('courses', editingId, payload);
      } else if (editingDefaultSlug) {
        // Default course being edited for the first time — create in Firestore
        await addDocument('courses', payload as any);
      } else {
        // Brand new custom course
        await addDocument('courses', payload as any);
      }

      setIsModalOpen(false);
      setEditingDefaultSlug(null);
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
      setDbCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      await updateDocument('courses', id, { published: !current });
      setDbCourses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, published: !current } : c))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Reset default: delete the Firestore override so it falls back to hardcoded values
  const handleResetDefault = async (slug: string) => {
    const override = dbOverrides.get(slug);
    if (!override) return;
    if (!confirm('Reset this course to its original default values? Your edits will be removed.'))
      return;
    try {
      await deleteDocument('courses', override.id!);
      loadCourses();
    } catch (err) {
      console.error('Failed to reset:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Course Management" />

      <main className="p-6 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-text-secondary">
            Manage music curriculum, target learners, and exam affiliation
            information.
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
        ) : (
          <>
            {/* ── Default Courses Section ── */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1">
                <ShieldCheck className="w-4 h-4 text-violet" />
                <h2 className="text-sm font-bold text-navy tracking-wide uppercase">
                  Core Courses
                </h2>
                <span className="text-[10px] font-semibold bg-violet/10 text-violet px-2 py-0.5 rounded-full">
                  {mergedDefaults.length} Defaults
                </span>
              </div>

              <div className="space-y-3">
                {mergedDefaults.map((course) => (
                  <div
                    key={course.slug}
                    className="p-5 rounded-2xl bg-white border border-border shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all hover:shadow-md"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-heading font-bold text-base text-navy">
                          {course.title}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet/10 text-violet font-semibold">
                          {course.category}
                        </span>
                        {course.hasOverride ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
                            Customized
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">
                            Default
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            course.published
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {course.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-2">
                        {course.overview || course.description}
                      </p>
                      {course.examInfo && (
                        <p className="text-[11px] text-orange font-medium">
                          Exam: {course.examInfo}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {course.hasOverride && course.id && (
                        <>
                          <button
                            onClick={() =>
                              handleTogglePublish(course.id!, course.published)
                            }
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
                            onClick={() => handleResetDefault(course.slug)}
                            className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                            title="Reset to default"
                          >
                            Reset
                          </button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEditModal(course)}
                        icon={<Edit2 className="w-3.5 h-3.5" />}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Custom Courses Section ── */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1">
                <GraduationCap className="w-4 h-4 text-orange" />
                <h2 className="text-sm font-bold text-navy tracking-wide uppercase">
                  Custom Courses
                </h2>
                <span className="text-[10px] font-semibold bg-orange/10 text-orange px-2 py-0.5 rounded-full">
                  {customCourses.length} Added
                </span>
              </div>

              {customCourses.length > 0 ? (
                <div className="space-y-3">
                  {customCourses.map((course) => (
                    <div
                      key={course.id}
                      className="p-5 rounded-2xl bg-white border border-border shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all hover:shadow-md"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-heading font-bold text-base text-navy">
                            {course.title}
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet/10 text-violet font-semibold">
                            {course.category}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                            Custom
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              course.published
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {course.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary line-clamp-2">
                          {course.overview || course.description}
                        </p>
                        {course.examInfo && (
                          <p className="text-[11px] text-orange font-medium">
                            Exam: {course.examInfo}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() =>
                            handleTogglePublish(course.id!, course.published)
                          }
                          className="p-2 rounded-xl text-text-secondary hover:bg-surface-dim transition-colors"
                          title={course.published ? 'Unpublish' : 'Publish'}
                        >
                          {course.published ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4 text-green-600" />
                          )}
                        </button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openEditCustom(course)}
                          icon={<Edit2 className="w-3.5 h-3.5" />}
                        >
                          Edit
                        </Button>
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
                <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-200 text-center">
                  <p className="text-sm text-text-secondary">
                    No custom courses added yet. Use the{' '}
                    <span className="font-semibold text-navy">"Add New Course"</span>{' '}
                    button to create additional syllabi beyond the 6 core defaults.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Levels & Grades Section ── */}
        {!loading && (
          <div className="pt-4 border-t border-slate-200/80">
            <LevelsGradesManager />
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingDefaultSlug(null);
          }}
          title={
            editingId
              ? 'Edit Course'
              : editingDefaultSlug
                ? 'Customize Default Course'
                : 'Add New Course'
          }
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
                options={[
                  'Instrumental',
                  'Vocal',
                  'Classical Dance',
                  'Academic Music',
                  'Academic',
                  'Grade Exam',
                ]}
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
              <label
                htmlFor="coursePublished"
                className="text-sm font-medium text-text-primary cursor-pointer"
              >
                Publish course on website
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingDefaultSlug(null);
                }}
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

'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  Layers,
  GripVertical,
  X,
  Check,
  BookOpen,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import {
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
} from '@/lib/firebase/firestore';
import type { CourseLevel, LevelGrade } from '@/types/student';
import { DEFAULT_COURSE_LEVELS } from '@/lib/constants';

export default function LevelsGradesManager() {
  const [levels, setLevels] = useState<CourseLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);

  // Level modal
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
  const [levelName, setLevelName] = useState('');
  const [savingLevel, setSavingLevel] = useState(false);

  // Inline grade add
  const [addingGradeToLevel, setAddingGradeToLevel] = useState<string | null>(null);
  const [newGradeName, setNewGradeName] = useState('');

  // Inline grade edit
  const [editingGrade, setEditingGrade] = useState<{ levelId: string; gradeIndex: number } | null>(null);
  const [editGradeName, setEditGradeName] = useState('');

  const loadLevels = async () => {
    setLoading(true);
    try {
      const data = await getDocuments<CourseLevel>('courseLevels');
      data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setLevels(data);
    } catch (err) {
      console.error('Failed to load levels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLevels();
  }, []);

  // ── Level CRUD ──
  const openAddLevel = () => {
    setEditingLevelId(null);
    setLevelName('');
    setIsLevelModalOpen(true);
  };

  const openEditLevel = (level: CourseLevel) => {
    setEditingLevelId(level.id!);
    setLevelName(level.name);
    setIsLevelModalOpen(true);
  };

  const handleSaveLevel = async () => {
    if (!levelName.trim()) return;
    setSavingLevel(true);
    try {
      if (editingLevelId) {
        await updateDocument('courseLevels', editingLevelId, { name: levelName.trim() });
      } else {
        await addDocument('courseLevels', {
          name: levelName.trim(),
          order: levels.length + 1,
          grades: [],
        } as any);
      }
      setIsLevelModalOpen(false);
      loadLevels();
    } catch (err: any) {
      console.error('Failed to save level:', err);
      alert(`Failed to save level: ${err?.message || 'Please check your Firestore rules in Firebase Console.'}`);
    } finally {
      setSavingLevel(false);
    }
  };

  const handleDeleteLevel = async (id: string) => {
    if (!confirm('Delete this level and all its grades? Students currently assigned to this level won\'t be affected but the option will no longer appear in enrollment.')) return;
    try {
      await deleteDocument('courseLevels', id);
      setLevels((prev) => prev.filter((l) => l.id !== id));
    } catch (err: any) {
      console.error('Failed to delete level:', err);
      alert(`Failed to delete level: ${err?.message || 'Please check your Firestore rules in Firebase Console.'}`);
    }
  };

  // ── Load / Reset Standard Structure (Pre Foundation -> Advance) ──
  const handleLoadDefaultStructure = async () => {
    if (levels.length > 0) {
      if (
        !confirm(
          'Apply the standard 6-Level curriculum structure?\n\n' +
          '• Pre Foundation Level: Initial Grade, Grade 1\n' +
          '• Foundation Level: Grade 2, Grade 3\n' +
          '• Pre Intermediate Level: Grade 4, Grade 5\n' +
          '• Intermediate Level: Grade 6\n' +
          '• Pre Advance Level: Grade 7\n' +
          '• Advance Level: Grade 8\n\n' +
          'This will configure all 6 levels and grades in your database. Continue?'
        )
      ) {
        return;
      }
    }
    setSavingLevel(true);
    try {
      // Clear existing levels
      for (const lvl of levels) {
        if (lvl.id) {
          await deleteDocument('courseLevels', lvl.id);
        }
      }
      // Populate standard hierarchy
      for (const dl of DEFAULT_COURSE_LEVELS) {
        await addDocument('courseLevels', {
          name: dl.name,
          order: dl.order,
          grades: dl.grades,
        } as any);
      }
      await loadLevels();
    } catch (err: any) {
      console.error('Failed to load standard levels:', err);
      const isPermission = err?.code === 'permission-denied' || String(err?.message || '').toLowerCase().includes('permission');
      if (isPermission) {
        alert('Permission Denied by Cloud Firestore: Your Firebase Security Rules in Firebase Console must allow read/write on "courseLevels". Please update the rules in Firebase Console to resolve this.');
      } else {
        alert(`Failed to save standard levels: ${err?.message || 'Please check your connection and try again.'}`);
      }
    } finally {
      setSavingLevel(false);
    }
  };

  // ── Grade CRUD (inline, updates the grades array inside a level document) ──
  const handleAddGrade = async (levelId: string) => {
    if (!newGradeName.trim()) return;
    const level = levels.find((l) => l.id === levelId);
    if (!level) return;
    const existingGrades = level.grades || [];
    const updatedGrades = [
      ...existingGrades,
      { name: newGradeName.trim(), order: existingGrades.length + 1 },
    ];
    try {
      await updateDocument('courseLevels', levelId, { grades: updatedGrades });
      setLevels((prev) =>
        prev.map((l) => (l.id === levelId ? { ...l, grades: updatedGrades } : l))
      );
      setNewGradeName('');
      setAddingGradeToLevel(null);
    } catch (err) {
      console.error('Failed to add grade:', err);
    }
  };

  const handleEditGrade = async (levelId: string, gradeIndex: number) => {
    if (!editGradeName.trim()) return;
    const level = levels.find((l) => l.id === levelId);
    if (!level) return;
    const updatedGrades = [...(level.grades || [])];
    updatedGrades[gradeIndex] = { ...updatedGrades[gradeIndex], name: editGradeName.trim() };
    try {
      await updateDocument('courseLevels', levelId, { grades: updatedGrades });
      setLevels((prev) =>
        prev.map((l) => (l.id === levelId ? { ...l, grades: updatedGrades } : l))
      );
      setEditingGrade(null);
      setEditGradeName('');
    } catch (err) {
      console.error('Failed to edit grade:', err);
    }
  };

  const handleDeleteGrade = async (levelId: string, gradeIndex: number) => {
    const level = levels.find((l) => l.id === levelId);
    if (!level) return;
    const updatedGrades = (level.grades || []).filter((_, i) => i !== gradeIndex);
    // Re-order
    updatedGrades.forEach((g, i) => (g.order = i + 1));
    try {
      await updateDocument('courseLevels', levelId, { grades: updatedGrades });
      setLevels((prev) =>
        prev.map((l) => (l.id === levelId ? { ...l, grades: updatedGrades } : l))
      );
    } catch (err) {
      console.error('Failed to delete grade:', err);
    }
  };

  const handleMoveGrade = async (levelId: string, gradeIndex: number, direction: 'up' | 'down') => {
    const level = levels.find((l) => l.id === levelId);
    if (!level) return;
    const grades = [...(level.grades || [])];
    const swapIndex = direction === 'up' ? gradeIndex - 1 : gradeIndex + 1;
    if (swapIndex < 0 || swapIndex >= grades.length) return;
    [grades[gradeIndex], grades[swapIndex]] = [grades[swapIndex], grades[gradeIndex]];
    grades.forEach((g, i) => (g.order = i + 1));
    try {
      await updateDocument('courseLevels', levelId, { grades });
      setLevels((prev) =>
        prev.map((l) => (l.id === levelId ? { ...l, grades } : l))
      );
    } catch (err) {
      console.error('Failed to reorder:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-navy tracking-wide uppercase">
            Levels & Grades Hierarchy
          </h2>
          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
            {levels.length} Levels
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLoadDefaultStructure}
            disabled={savingLevel}
            icon={<RotateCcw className="w-3.5 h-3.5 text-violet" />}
          >
            {savingLevel ? 'Updating...' : 'Standard Structure (6 Levels)'}
          </Button>
          <Button
            onClick={openAddLevel}
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Level
          </Button>
        </div>
      </div>

      {/* Levels List */}
      {levels.length > 0 ? (
        <div className="space-y-2.5">
          {levels.map((level) => {
            const isExpanded = expandedLevel === level.id;
            const gradeCount = (level.grades || []).length;
            return (
              <div
                key={level.id}
                className="rounded-2xl bg-white border border-border shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                {/* Level Header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer select-none"
                  onClick={() =>
                    setExpandedLevel(isExpanded ? null : level.id!)
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-emerald-700" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-sm text-navy">
                        {level.name}
                      </h3>
                      <p className="text-[11px] text-text-secondary">
                        {gradeCount} {gradeCount === 1 ? 'grade' : 'grades'}
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => openEditLevel(level)}
                      className="p-1.5 rounded-lg text-violet hover:bg-violet/5 transition-colors"
                      title="Edit Level Name"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteLevel(level.id!)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete Level"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Grades List (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-2">
                    {(level.grades || []).length > 0 ? (
                      <div className="space-y-1.5">
                        {(level.grades || [])
                          .sort((a, b) => a.order - b.order)
                          .map((grade, gIndex) => (
                          <div
                            key={gIndex}
                            className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-100 group"
                          >
                            {editingGrade?.levelId === level.id && editingGrade?.gradeIndex === gIndex ? (
                              // Inline Edit Mode
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="text"
                                  value={editGradeName}
                                  onChange={(e) => setEditGradeName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEditGrade(level.id!, gIndex);
                                    if (e.key === 'Escape') { setEditingGrade(null); setEditGradeName(''); }
                                  }}
                                  autoFocus
                                  className="flex-1 px-2.5 py-1 rounded-lg border border-violet/30 bg-white text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-violet"
                                />
                                <button
                                  onClick={() => handleEditGrade(level.id!, gIndex)}
                                  className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => { setEditingGrade(null); setEditGradeName(''); }}
                                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              // Display Mode
                              <>
                                <div className="flex items-center gap-2.5">
                                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="text-xs font-semibold text-navy">
                                    {grade.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {/* Move buttons */}
                                  {gIndex > 0 && (
                                    <button
                                      onClick={() => handleMoveGrade(level.id!, gIndex, 'up')}
                                      className="p-1 rounded text-slate-400 hover:text-navy hover:bg-slate-100 text-[10px] font-bold"
                                      title="Move Up"
                                    >
                                      ▲
                                    </button>
                                  )}
                                  {gIndex < (level.grades || []).length - 1 && (
                                    <button
                                      onClick={() => handleMoveGrade(level.id!, gIndex, 'down')}
                                      className="p-1 rounded text-slate-400 hover:text-navy hover:bg-slate-100 text-[10px] font-bold"
                                      title="Move Down"
                                    >
                                      ▼
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setEditingGrade({ levelId: level.id!, gradeIndex: gIndex });
                                      setEditGradeName(grade.name);
                                    }}
                                    className="p-1 rounded-lg text-violet hover:bg-violet/5"
                                    title="Edit Grade"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteGrade(level.id!, gIndex)}
                                    className="p-1 rounded-lg text-red-400 hover:bg-red-50"
                                    title="Remove Grade"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 text-center py-2 italic">
                        No grades added to this level yet
                      </p>
                    )}

                    {/* Add Grade Inline */}
                    {addingGradeToLevel === level.id ? (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={newGradeName}
                          onChange={(e) => setNewGradeName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddGrade(level.id!);
                            if (e.key === 'Escape') { setAddingGradeToLevel(null); setNewGradeName(''); }
                          }}
                          placeholder="e.g. Grade 1, Initial, Diploma..."
                          autoFocus
                          className="flex-1 px-3 py-2 rounded-xl border border-violet/30 bg-white text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-violet placeholder:text-slate-300"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddGrade(level.id!)}
                          disabled={!newGradeName.trim()}
                        >
                          Add
                        </Button>
                        <button
                          onClick={() => { setAddingGradeToLevel(null); setNewGradeName(''); }}
                          className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAddingGradeToLevel(level.id!);
                          setNewGradeName('');
                        }}
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-violet hover:text-violet/80 transition-colors pt-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add Grade
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-navy">
              No Levels & Grades Defined Yet
            </p>
            <p className="text-xs text-text-secondary mt-1 max-w-md mx-auto">
              Set up the official Allwin School of Music 6-Level structure (Pre Foundation to Advance Level with Initial Grade to Grade 8), or create custom levels.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Button
              onClick={handleLoadDefaultStructure}
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5" />}
              disabled={savingLevel}
            >
              {savingLevel ? 'Applying...' : 'Apply Standard Structure (6 Levels, 8 Grades)'}
            </Button>
            <Button
              onClick={openAddLevel}
              variant="outline"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Create Custom Level
            </Button>
          </div>
        </div>
      )}

      {/* Level Name Modal */}
      <Modal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        title={editingLevelId ? 'Edit Level Name' : 'Add New Level'}
        size="sm"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Level Name *
            </label>
            <input
              type="text"
              value={levelName}
              onChange={(e) => setLevelName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveLevel(); }}
              placeholder="e.g. Beginner, Intermediate, Advanced, Foundation..."
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-slate-50 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-violet"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsLevelModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveLevel}
              disabled={savingLevel || !levelName.trim()}
            >
              {savingLevel ? 'Saving...' : editingLevelId ? 'Update' : 'Create Level'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

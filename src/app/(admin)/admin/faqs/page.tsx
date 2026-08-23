'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, HelpCircle, Eye, EyeOff } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
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
import type { FAQ } from '@/types';

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    order: 0,
    published: true,
  });

  const loadFaqs = async () => {
    setLoading(true);
    try {
      const data = await getDocuments<FAQ>('faqs');
      setFaqs(data);
    } catch (err) {
      console.error('Failed to load faqs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      question: '',
      answer: '',
      order: faqs.length + 1,
      published: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (f: FAQ) => {
    setEditingId(f.id!);
    setFormData({
      question: f.question || '',
      answer: f.answer || '',
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
        await updateDocument('faqs', editingId, formData);
      } else {
        await addDocument('faqs', formData as any);
      }

      setIsModalOpen(false);
      loadFaqs();
    } catch (err) {
      console.error('Failed to save FAQ:', err);
      alert('Failed to save FAQ.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    try {
      await deleteDocument('faqs', id);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      await updateDocument('faqs', id, { published: !current });
      setFaqs((prev) =>
        prev.map((f) => (f.id === id ? { ...f, published: !current } : f))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="FAQ Management" />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-text-secondary">
            Manage answers to common questions about music education, affiliations, and admissions.
          </p>
          <Button
            onClick={openAddModal}
            size="sm"
            icon={<Plus className="w-4 h-4" />}
          >
            Add New FAQ
          </Button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Spinner size="lg" />
          </div>
        ) : faqs.length > 0 ? (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="p-6 rounded-2xl bg-white border border-border shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-3xl">
                  <h3 className="font-heading font-bold text-base text-navy flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-violet shrink-0" />
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {faq.answer}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      faq.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {faq.published ? 'Published' : 'Draft'}
                  </span>

                  <button
                    onClick={() => handleTogglePublish(faq.id!, faq.published)}
                    className="p-2 rounded-xl text-text-secondary hover:bg-surface-dim"
                    title={faq.published ? 'Unpublish' : 'Publish'}
                  >
                    {faq.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEditModal(faq)}
                    className="p-2 rounded-xl text-violet hover:bg-purple-deep/5"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id!)}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Custom FAQs Added"
            description="The website is currently using the 6 core default FAQs. You can add custom questions and answers here."
            action={
              <Button onClick={openAddModal} size="sm">
                Add Custom FAQ
              </Button>
            }
          />
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? 'Edit FAQ' : 'Add FAQ'}
          size="lg"
        >
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <Input
              label="Question *"
              placeholder="e.g. Do you offer weekend classes?"
              required
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
            />

            <Textarea
              label="Answer *"
              placeholder="Detailed explanation of timings, procedures, or guidelines..."
              required
              rows={4}
              value={formData.answer}
              onChange={(e) =>
                setFormData({ ...formData, answer: e.target.value })
              }
            />

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="faqPublished"
                checked={formData.published}
                onChange={(e) =>
                  setFormData({ ...formData, published: e.target.checked })
                }
                className="w-4 h-4 rounded text-violet focus:ring-violet"
              />
              <label htmlFor="faqPublished" className="text-sm font-medium text-text-primary cursor-pointer">
                Publish on FAQ page
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
                {saving ? 'Saving...' : 'Save FAQ'}
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}

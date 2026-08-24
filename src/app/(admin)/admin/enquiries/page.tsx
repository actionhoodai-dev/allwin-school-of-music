'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Phone,
  Mail,
  Trash2,
  CheckCircle,
  Clock,
  Filter,
  Search,
  MessageCircle,
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { getDocuments, updateDocument, deleteDocument } from '@/lib/firebase/firestore';
import { ENQUIRY_STATUSES, BUSINESS } from '@/lib/constants';
import type { Enquiry, EnquiryStatus } from '@/types';

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const data = await getDocuments<Enquiry>('enquiries');
      setEnquiries(data);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const handleStatusChange = async (id: string, status: EnquiryStatus) => {
    try {
      await updateDocument('enquiries', id, { status });
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status } : e))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      await deleteDocument('enquiries', id);
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Failed to delete enquiry:', err);
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
    const matchesSearch =
      e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.phone?.includes(searchQuery) ||
      e.course?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: EnquiryStatus) => {
    switch (status) {
      case 'new':
        return <Badge variant="info">New</Badge>;
      case 'contacted':
        return <Badge variant="warning">Contacted</Badge>;
      case 'converted':
        return <Badge variant="success">Converted</Badge>;
      case 'closed':
        return <Badge variant="default">Closed</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Student Enquiries & Admissions" />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Filter and Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone, course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border text-sm outline-none focus:border-violet focus:ring-1 focus:ring-violet"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === 'all'
                  ? 'bg-navy text-white'
                  : 'bg-surface-dim text-text-secondary hover:bg-slate-200'
              }`}
            >
              All ({enquiries.length})
            </button>
            {ENQUIRY_STATUSES.map((st) => (
              <button
                key={st.value}
                onClick={() => setFilterStatus(st.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filterStatus === st.value
                    ? 'bg-navy text-white'
                    : 'bg-surface-dim text-text-secondary hover:bg-slate-200'
                }`}
              >
                {st.label} (
                {enquiries.filter((e) => e.status === st.value).length})
              </button>
            ))}
          </div>
        </div>

        {/* Table / Cards */}
        {loading ? (
          <div className="p-12 text-center">
            <Spinner size="lg" />
          </div>
        ) : filteredEnquiries.length > 0 ? (
          <div className="space-y-4">
            {filteredEnquiries.map((enq) => (
              <div
                key={enq.id}
                className="p-6 rounded-2xl bg-white border border-border shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-violet/30 transition-all"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <h3 className="font-heading font-bold text-lg text-navy">
                      {enq.name}
                    </h3>
                    {getStatusBadge(enq.status)}
                    <span className="text-xs text-text-muted px-2 py-0.5 rounded bg-surface-dim">
                      {enq.course || 'General Enquiry'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                    <a
                      href={`tel:${enq.phone}`}
                      className="flex items-center gap-1 hover:text-violet font-medium"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{enq.phone}</span>
                    </a>
                    {enq.email && (
                      <a
                        href={`mailto:${enq.email}`}
                        className="flex items-center gap-1 hover:text-violet"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>{enq.email}</span>
                      </a>
                    )}
                    {enq.contactMethod && (
                      <span className="text-text-muted">
                        Prefers: {enq.contactMethod}
                      </span>
                    )}
                  </div>

                  {enq.message && (
                    <p className="text-xs text-text-secondary bg-surface-dim p-3 rounded-xl border border-slate-100 italic">
                      &ldquo;{enq.message}&rdquo;
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {/* WhatsApp trigger */}
                  <a
                    href={`https://wa.me/91${enq.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Hello ${enq.name}, thank you for enquiring at Allwin School of Music regarding the ${
                        enq.course
                          ? enq.course.toLowerCase().includes('course') || enq.course.toLowerCase().includes('class')
                            ? enq.course
                            : `${enq.course} Course`
                          : 'Music Course'
                      }.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>

                  {/* Status Dropdown */}
                  <select
                    value={enq.status || 'new'}
                    onChange={(e) =>
                      handleStatusChange(enq.id!, e.target.value as EnquiryStatus)
                    }
                    aria-label={`Change status for ${enq.name}`}
                    className="px-3 py-2 rounded-xl border border-border text-xs font-semibold bg-white outline-none cursor-pointer focus:border-violet"
                  >
                    <option value="new">Mark: New</option>
                    <option value="contacted">Mark: Contacted</option>
                    <option value="converted">Mark: Converted</option>
                    <option value="closed">Mark: Closed</option>
                  </select>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(enq.id!)}
                    className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete Enquiry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Enquiries Found"
            description={
              searchQuery || filterStatus !== 'all'
                ? 'No enquiries match the selected filter criteria.'
                : 'Incoming admissions enquiries from website visitors will appear here in real-time.'
            }
          />
        )}
      </main>
    </div>
  );
}

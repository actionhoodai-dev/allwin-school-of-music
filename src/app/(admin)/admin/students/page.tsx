// ============================================
// Admin: Students Directory & Search
// ============================================

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Search,
  Plus,
  Filter,
  GraduationCap,
  CalendarCheck,
  Phone,
  Mail,
  ChevronRight,
  User,
  Sparkles,
  ExternalLink,
  Edit,
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import StudentFormModal from '@/components/admin/StudentFormModal';
import Button from '@/components/ui/Button';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Student } from '@/types/student';
import { INSTRUMENT_OPTIONS } from '@/lib/constants';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [instrumentFilter, setInstrumentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      const snap = await getDocs(collection(db, 'students'));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Student[];
      // Sort by studentId or createdAt
      list.sort((a, b) => (b.studentId || '').localeCompare(a.studentId || ''));
      setStudents(list);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleStudentCreatedOrUpdated = (savedStudent: Student) => {
    loadStudents();
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const cleanDigits = q.replace(/\D/g, '');
    const matchesSearch =
      !q ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.parentPhone && (
        s.parentPhone.includes(q) ||
        (cleanDigits.length >= 3 && s.parentPhone.replace(/\D/g, '').includes(cleanDigits))
      )) ||
      (s.studentId && s.studentId.toLowerCase().includes(q)) ||
      (s.parentEmail && s.parentEmail.toLowerCase().includes(q)) ||
      (s.instrument && s.instrument.toLowerCase().includes(q));

    const matchesInstrument =
      instrumentFilter === 'All' || s.instrument === instrumentFilter;

    const matchesStatus =
      statusFilter === 'All' || s.status === statusFilter;

    return matchesSearch && matchesInstrument && matchesStatus;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#f1f3f6] dark:bg-[#070d18] min-h-screen">
      <AdminHeader title="Student Directory & Accounts" />

      <main className="p-6 sm:p-8 space-y-5 max-w-7xl w-full mx-auto">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
              Student Directory
            </h2>
            <p className="text-xs text-slate-500">
              Manage student accounts, sequential IDs, attendance, fees & academic reports
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedStudent(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Enroll Student</span>
          </button>
        </div>

        {/* Search & Filter Strip */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or phone number..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Instrument Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={instrumentFilter}
              onChange={(e) => setInstrumentFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <option value="All">All Instruments</option>
              {INSTRUMENT_OPTIONS.map((inst) => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active</option>
              <option value="relieved">Relieved</option>
              <option value="inactive">Inactive</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>

        {/* Directory Count / Stats */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Showing <strong>{filteredStudents.length}</strong> of {students.length} enrolled students</span>
          <Link
            href="/admin/attendance"
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Open Bulk Attendance Marker →</span>
          </Link>
        </div>

        {/* Students Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {loading ? (
            <div className="col-span-full py-16 text-center text-slate-400 text-sm">
              Loading student roster from cloud...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 text-sm bg-white dark:bg-[#0f172a] rounded-2xl border border-dashed border-slate-200">
              No students found matching your criteria.
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student.id || student.studentId}
                className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-white/10 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl bg-blue-600 p-0.5 overflow-hidden shrink-0 shadow-xs">
                        {student.photo ? (
                          <Image
                            src={student.photo}
                            alt={student.name || 'Student'}
                            fill
                            sizes="48px"
                            className="rounded-[10px] object-cover object-center"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white">
                            <User className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                          {student.name}
                        </h3>
                        <span className="text-xs font-bold tracking-wide text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40 inline-block mt-0.5">
                          {student.studentId}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        student.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                          : student.status === 'relieved'
                          ? 'bg-slate-100 text-slate-700 border border-slate-300'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {student.status}
                    </span>
                  </div>

                  {/* Info list */}
                  <div className="p-3 mt-4 rounded-xl bg-slate-50 dark:bg-white/5 text-xs space-y-1.5 border border-slate-100 dark:border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Instrument:</span>
                      <strong className="text-slate-900 dark:text-white">{student.instrument}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Course:</span>
                      <strong className="text-slate-900 dark:text-white">{student.course}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Grade / Level:</span>
                      <strong className="text-slate-900 dark:text-white">{student.grade || student.level}</strong>
                    </div>
                    {student.teacherName && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Faculty:</span>
                        <strong className="text-slate-900 dark:text-white">{student.teacherName}</strong>
                      </div>
                    )}
                  </div>

                  {/* Parent Contact */}
                  <div className="space-y-1 text-[11px] text-slate-500">
                    {student.parentName && (
                      <p>Parent: <strong className="text-slate-700 dark:text-slate-300">{student.parentName}</strong></p>
                    )}
                    {student.parentEmail && (
                      <p className="truncate">Email: {student.parentEmail}</p>
                    )}
                    {student.parentPhone && (
                      <p>Phone: {student.parentPhone}</p>
                    )}
                  </div>
                </div>

                {/* Actions Bottom Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      setIsModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-600/25 flex items-center gap-1.5 transition-all active:translate-y-0.5 active:scale-95 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Info</span>
                  </button>

                  <Link
                    href={`/admin/students/${student.studentId || student.id}`}
                    className="px-4 py-2 rounded-xl bg-[#2874f0] hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 flex items-center gap-1.5 transition-all active:translate-y-0.5 active:scale-95"
                  >
                    <span>Open Workspace</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Enroll / Edit Modal */}
      <StudentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleStudentCreatedOrUpdated}
        editingStudent={selectedStudent}
      />
    </div>
  );
}

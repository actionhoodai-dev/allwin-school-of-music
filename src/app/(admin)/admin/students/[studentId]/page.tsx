// ============================================
// Admin: Student Profile & Records Workspace (Streamlined)
// ============================================

'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  User,
  CalendarCheck,
  Calendar,
  Trophy,
  Award,
  CreditCard,
  GraduationCap,
  Shield,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminAttendanceCalendar from '@/components/admin/AdminAttendanceCalendar';
import StudentFormModal from '@/components/admin/StudentFormModal';
import ImageUploader from '@/components/admin/ImageUploader';
import Button from '@/components/ui/Button';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type {
  Student,
  AttendanceRecord,
  ClassScheduleItem,
  ProgressReport,
  StudentAchievementItem,
  StudentFeeItem,
  ExamRecord,
} from '@/types/student';
import { ALL_GRADES, ALL_LEVELS, getLevelForGrade } from '@/lib/constants';

const TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'schedule', label: 'Class Schedule', icon: Calendar },
  { id: 'progress', label: 'Grades & Progress', icon: Trophy },
  { id: 'achievements', label: 'Certificates', icon: Award },
  { id: 'fees', label: 'Fees & Dues', icon: CreditCard },
  { id: 'exams', label: 'Exams & Trinity', icon: GraduationCap },
  { id: 'account', label: 'Account & Security', icon: Shield },
];

export default function AdminStudentWorkspacePage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const resolvedParams = use(params);
  const rawId = decodeURIComponent(resolvedParams.studentId);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('overview');
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Collections state
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [schedules, setSchedules] = useState<ClassScheduleItem[]>([]);
  const [progressReports, setProgressReports] = useState<ProgressReport[]>([]);
  const [achievements, setAchievements] = useState<StudentAchievementItem[]>([]);
  const [fees, setFees] = useState<StudentFeeItem[]>([]);
  const [exams, setExams] = useState<ExamRecord[]>([]);

  // Sub-modals & forms
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState<{
    dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    time: string;
    endTime: string;
    notes: string;
  }>({
    dayOfWeek: 'Monday',
    time: '05:00 PM',
    endTime: '06:00 PM',
    notes: '',
  });

  const [showAddProgress, setShowAddProgress] = useState(false);
  const [newProgress, setNewProgress] = useState({
    title: 'Grade Progress Evaluation',
    term: 'Term 1',
    assessmentDate: new Date().toISOString().split('T')[0],
    level: 'Pre Foundation Level',
    grade: 'Initial Grade',
    evaluation: '',
    strengths: '',
    areasToImprove: '',
    teacherComments: '',
    reportFileUrl: '',
  });

  const [showAddAchievement, setShowAddAchievement] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    category: 'grade_exam' as any,
    description: '',
    date: new Date().toISOString().split('T')[0],
    certificateUrl: '',
    issuedBy: 'Trinity College London',
  });

  const [showAddFee, setShowAddFee] = useState(false);
  const [newFee, setNewFee] = useState({
    title: 'Monthly Tuition Fee',
    feeType: 'tuition' as any,
    amount: 2000,
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending' as any,
    paidAmount: 0,
    paymentMethod: 'UPI / GPay' as any,
    paymentReference: '',
    receiptNumber: '',
  });

  const [showAddExam, setShowAddExam] = useState(false);
  const [newExam, setNewExam] = useState({
    examName: 'Trinity Grade Assessment',
    board: 'Trinity College London' as any,
    grade: 'Grade 1',
    examDate: '',
    session: '2026',
    venue: 'Allwin Center',
    examFee: 4500,
    feeStatus: 'pending' as any,
    registrationStatus: 'registered' as any,
    candidateNumber: '',
    instructions: '',
  });

  useEffect(() => {
    loadAllStudentData();
  }, [rawId]);

  async function loadAllStudentData() {
    setLoading(true);
    try {
      let targetStudent: Student | null = null;

      const q = query(collection(db, 'students'), where('studentId', '==', rawId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        targetStudent = { id: snap.docs[0].id, ...snap.docs[0].data() } as Student;
      } else {
        const docRef = doc(db, 'students', rawId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          targetStudent = { id: docSnap.id, ...docSnap.data() } as Student;
        }
      }

      if (!targetStudent) {
        setLoading(false);
        return;
      }

      setStudent(targetStudent);
      const studentId = targetStudent.studentId;

      const [attSnap, schedSnap, progSnap, achSnap, feeSnap, examSnap] = await Promise.all([
        getDocs(query(collection(db, 'attendance'), where('studentId', '==', studentId))).catch(() => ({ docs: [] } as any)),
        getDocs(query(collection(db, 'schedules'), where('studentId', '==', studentId))).catch(() => ({ docs: [] } as any)),
        getDocs(query(collection(db, 'progressReports'), where('studentId', '==', studentId))).catch(() => ({ docs: [] } as any)),
        getDocs(query(collection(db, 'studentAchievements'), where('studentId', '==', studentId))).catch(() => ({ docs: [] } as any)),
        getDocs(query(collection(db, 'fees'), where('studentId', '==', studentId))).catch(() => ({ docs: [] } as any)),
        getDocs(query(collection(db, 'examDetails'), where('studentId', '==', studentId))).catch(() => ({ docs: [] } as any)),
      ]);

      const rawAttendance = attSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })) as AttendanceRecord[];
      const deduplicatedAtt = Array.from(
        rawAttendance.reduce((map: Map<string, AttendanceRecord>, item: AttendanceRecord) => {
          if (item.date) map.set(item.date, item);
          return map;
        }, new Map<string, AttendanceRecord>()).values()
      );
      setAttendance(deduplicatedAtt);
      setSchedules(schedSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
      setProgressReports(progSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
      setAchievements(achSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
      setFees(feeSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
      setExams(examSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Create Class Schedule Slot
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    try {
      const docRef = await addDoc(collection(db, 'schedules'), {
        studentId: student.studentId,
        course: student.course,
        instrument: student.instrument,
        active: true,
        ...newSchedule,
        createdAt: serverTimestamp(),
      });
      setSchedules((prev) => [
        ...prev,
        {
          id: docRef.id,
          studentId: student.studentId,
          course: student.course,
          instrument: student.instrument,
          active: true,
          ...newSchedule,
        },
      ]);
      setShowAddSchedule(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Create / Update Progress & Grade Evaluation
  const handleCreateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    try {
      const strengthsArr = newProgress.strengths.split(',').map((s) => s.trim()).filter(Boolean);
      const areasArr = newProgress.areasToImprove.split(',').map((s) => s.trim()).filter(Boolean);

      const docRef = await addDoc(collection(db, 'progressReports'), {
        studentId: student.studentId,
        course: student.course,
        instrument: student.instrument,
        title: newProgress.title,
        term: newProgress.term,
        assessmentDate: newProgress.assessmentDate,
        level: newProgress.level || student.level || 'Pre Foundation Level',
        grade: newProgress.grade || student.grade || 'Initial Grade',
        evaluation: newProgress.evaluation,
        strengths: strengthsArr,
        areasToImprove: areasArr,
        teacherComments: newProgress.teacherComments,
        reportFileUrl: newProgress.reportFileUrl,
        createdAt: serverTimestamp(),
      });

      // Update student's primary grade & level in Firestore
      if (student.id) {
        await updateDoc(doc(db, 'students', student.id), {
          grade: newProgress.grade,
          level: newProgress.level,
          updatedAt: serverTimestamp(),
        });
        setStudent({ ...student, grade: newProgress.grade, level: newProgress.level });
      }

      // Add in-app notification for student/parent
      await addDoc(collection(db, 'notifications'), {
        studentId: student.studentId,
        title: 'New Progress & Grade Evaluation Added',
        message: `Your teacher updated your evaluation for ${newProgress.grade} (${student.instrument}).`,
        type: 'progress',
        read: false,
        link: '/student/progress',
        createdAt: serverTimestamp(),
      });

      setProgressReports((prev) => [
        ...prev,
        {
          id: docRef.id,
          studentId: student.studentId,
          course: student.course,
          instrument: student.instrument,
          ...newProgress,
          strengths: strengthsArr,
          areasToImprove: areasArr,
        },
      ]);
      setShowAddProgress(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Create Certificate
  const handleCreateAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    try {
      const docRef = await addDoc(collection(db, 'studentAchievements'), {
        studentId: student.studentId,
        ...newAchievement,
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, 'notifications'), {
        studentId: student.studentId,
        title: 'New Certificate Uploaded',
        message: `An official certificate for "${newAchievement.title}" has been uploaded to your portal.`,
        type: 'progress',
        read: false,
        link: '/student/achievements',
        createdAt: serverTimestamp(),
      });

      setAchievements((prev) => [...prev, { id: docRef.id, studentId: student.studentId, ...newAchievement }]);
      setShowAddAchievement(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Create Fee Record
  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    try {
      const amountNum = Number(newFee.amount);
      const paidAmountNum = Number(newFee.paidAmount || 0);
      const balanceNum = amountNum - paidAmountNum;

      const docRef = await addDoc(collection(db, 'fees'), {
        studentId: student.studentId,
        ...newFee,
        amount: amountNum,
        paidAmount: paidAmountNum,
        balanceAmount: balanceNum,
        createdAt: serverTimestamp(),
      });

      if (newFee.status === 'pending') {
        await addDoc(collection(db, 'notifications'), {
          studentId: student.studentId,
          title: 'New Tuition Fee Due',
          message: `Invoice for "${newFee.title}" (₹${amountNum}) has been generated.`,
          type: 'fee',
          read: false,
          link: '/student/fees',
          createdAt: serverTimestamp(),
        });
      }

      setFees((prev) => [
        ...prev,
        {
          id: docRef.id,
          studentId: student.studentId,
          ...newFee,
          amount: amountNum,
          paidAmount: paidAmountNum,
          balanceAmount: balanceNum,
        },
      ]);
      setShowAddFee(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Create Exam Booking
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    try {
      const examFeeNum = Number(newExam.examFee);

      const docRef = await addDoc(collection(db, 'examDetails'), {
        studentId: student.studentId,
        instrument: student.instrument,
        ...newExam,
        examFee: examFeeNum,
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, 'notifications'), {
        studentId: student.studentId,
        title: 'Exam Session Registered',
        message: `Registered for ${newExam.board} - ${newExam.grade} (${newExam.examName}).`,
        type: 'exam',
        read: false,
        link: '/student/exams',
        createdAt: serverTimestamp(),
      });

      setExams((prev) => [
        ...prev,
        {
          id: docRef.id,
          studentId: student.studentId,
          instrument: student.instrument,
          ...newExam,
          examFee: examFeeNum,
        },
      ]);
      setShowAddExam(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle student active/inactive
  const handleToggleStatus = async () => {
    if (!student?.id) return;
    const newStatus = student.status === 'active' ? 'inactive' : 'active';
    try {
      await updateDoc(doc(db, 'students', student.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      setStudent({ ...student, status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Student Profile" />
        <div className="p-8 text-center text-text-muted">
          Loading student workspace...
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Student Not Found" />
        <div className="p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-crimson mx-auto" />
          <h3 className="font-heading font-bold text-lg text-navy">
            Student Record Not Found
          </h3>
          <p className="text-xs text-text-secondary">
            The student with ID "{rawId}" was not found.
          </p>
          <Link
            href="/admin/students"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet hover:underline"
          >
            ← Back to Student Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title={`Student: ${student.name} (${student.studentId})`} />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Top Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/students"
              className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center text-navy hover:bg-slate-50 transition-colors shadow-xs"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-wide text-xs bg-violet/10 text-violet px-2.5 py-0.5 rounded-full border border-violet/20">
                  {student.studentId}
                </span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                  student.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {student.status?.toUpperCase()}
                </span>
              </div>
              <h2 className="font-heading font-bold text-2xl text-navy mt-0.5">
                {student.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-600/25 flex items-center gap-1.5 transition-all active:translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>

            <Link
              href={`/student-login`}
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 active:bg-slate-950 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all active:translate-y-0.5 active:scale-95"
            >
              <span>Test Student Login</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar select-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'bg-white hover:bg-slate-100 border border-slate-200/90 text-slate-700 shadow-2xs hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 aspect-square rounded-2xl bg-blue-600 p-0.5 overflow-hidden shrink-0 shadow-xs">
                  {student.photo ? (
                    <Image
                      src={student.photo}
                      alt={student.name}
                      fill
                      sizes="64px"
                      className="rounded-[14px] object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900">{student.name}</h3>
                  <span className="text-xs text-violet font-bold tracking-wide bg-violet/10 px-2.5 py-0.5 rounded-full inline-block mt-0.5">{student.studentId}</span>
                  <p className="text-xs text-slate-600 font-semibold mt-1">{student.instrument} • {student.grade || 'Grade 1'}</p>
                </div>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Course:</span><strong className="text-slate-900 font-bold">{student.course}</strong></div>
                <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Instrument:</span><strong className="text-slate-900 font-bold">{student.instrument}</strong></div>
                <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Current Grade:</span><strong className="text-slate-900 font-bold">{student.grade || 'Initial Grade'}</strong></div>
                <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Current Level:</span><strong className="text-slate-900 font-bold">{student.level || 'Pre Foundation Level'}</strong></div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <h4 className="font-heading font-bold text-sm text-slate-900">Parent Contact</h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Parent Name:</span><strong className="text-slate-900 font-bold">{student.parentName || '—'}</strong></div>
                <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Parent Email (OTP):</span><strong className="text-slate-900 font-bold truncate max-w-[180px]">{student.parentEmail || '—'}</strong></div>
                <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Parent Phone:</span><strong className="text-slate-900 font-bold">{student.parentPhone || '—'}</strong></div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <h4 className="font-heading font-bold text-sm text-slate-900">Records Summary</h4>
              <div className="grid grid-cols-2 gap-3 text-center text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-2xl font-heading font-bold text-slate-900">{attendance.length}</div>
                  <span className="text-[11px] text-slate-500 font-medium">Attendance Records</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-2xl font-heading font-bold text-slate-900">{progressReports.length}</div>
                  <span className="text-[11px] text-slate-500 font-medium">Progress Evaluations</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-2xl font-heading font-bold text-slate-900">{achievements.length}</div>
                  <span className="text-[11px] text-slate-500 font-medium">Certificates</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-2xl font-heading font-bold text-slate-900">{fees.length}</div>
                  <span className="text-[11px] text-slate-500 font-medium">Fee Records</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <AdminAttendanceCalendar
              studentId={student.studentId}
              studentName={student.name}
              course={student.course}
              instrument={student.instrument}
              records={attendance}
              onRecordChange={(updated) => setAttendance(updated)}
            />
          </div>
        )}

        {/* TAB 3: SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Weekly Class Timetable</h3>
              <button
                onClick={() => setShowAddSchedule(true)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Class Slot</span>
              </button>
            </div>

            {showAddSchedule && (
              <form onSubmit={handleCreateSchedule} className="p-5 rounded-3xl bg-slate-50 border border-border space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Day of Week</label>
                    <select
                      value={newSchedule.dayOfWeek}
                      onChange={(e) => setNewSchedule({ ...newSchedule, dayOfWeek: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Start Time</label>
                    <input
                      type="text"
                      value={newSchedule.time}
                      onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                      placeholder="05:00 PM"
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">End Time</label>
                    <input
                      type="text"
                      value={newSchedule.endTime}
                      onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                      placeholder="06:00 PM"
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-text-muted mb-1 font-semibold">Notes (Optional)</label>
                  <input
                    type="text"
                    value={newSchedule.notes}
                    onChange={(e) => setNewSchedule({ ...newSchedule, notes: e.target.value })}
                    placeholder="e.g. Bring Trinity pieces book"
                    className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSchedule(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-900 font-bold text-xs shadow-xs active:translate-y-0.5 active:scale-95 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button type="submit" size="sm">Save Class Slot</Button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {schedules.map((s) => (
                <div key={s.id} className="p-4 rounded-2xl bg-white border border-border shadow-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-violet px-2.5 py-0.5 bg-violet/10 rounded-lg">{s.dayOfWeek}</span>
                    <h4 className="font-bold text-sm text-navy mt-1">{s.time} {s.endTime ? `– ${s.endTime}` : ''}</h4>
                    <p className="text-xs text-text-muted">{s.instrument || student.instrument} {s.notes ? `• ${s.notes}` : ''}</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!s.id) return;
                      await deleteDoc(doc(db, 'schedules', s.id));
                      setSchedules(schedules.filter((x) => x.id !== s.id));
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PROGRESS & GRADES */}
        {activeTab === 'progress' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Grades, Levels & Evaluations</h3>
                <p className="text-xs text-slate-500">Admin can update student grade, level, and upload report cards</p>
              </div>
              <button
                onClick={() => setShowAddProgress(true)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Grade Evaluation</span>
              </button>
            </div>

            {showAddProgress && (
              <form onSubmit={handleCreateProgress} className="p-5 rounded-3xl bg-slate-50 border border-border space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Evaluation Title *</label>
                    <input
                      type="text"
                      required
                      value={newProgress.title}
                      onChange={(e) => setNewProgress({ ...newProgress, title: e.target.value })}
                      placeholder="e.g. Grade 3 Piano Assessment"
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Assessment Date</label>
                    <input
                      type="date"
                      value={newProgress.assessmentDate}
                      onChange={(e) => setNewProgress({ ...newProgress, assessmentDate: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Assigned Grade</label>
                    <select
                      value={newProgress.grade}
                      onChange={(e) => {
                        const g = e.target.value;
                        const lvl = getLevelForGrade(g);
                        setNewProgress({ ...newProgress, grade: g, level: lvl || newProgress.level });
                      }}
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                    >
                      {ALL_GRADES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Level</label>
                    <select
                      value={newProgress.level}
                      onChange={(e) => setNewProgress({ ...newProgress, level: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                    >
                      {ALL_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-text-muted mb-1 font-semibold">Evaluation Summary</label>
                    <textarea
                      rows={2}
                      value={newProgress.evaluation}
                      onChange={(e) => setNewProgress({ ...newProgress, evaluation: e.target.value })}
                      placeholder="Summary of student technique, musicality, and performance..."
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Strengths (Comma separated)</label>
                    <input
                      type="text"
                      value={newProgress.strengths}
                      onChange={(e) => setNewProgress({ ...newProgress, strengths: e.target.value })}
                      placeholder="Rhythm accuracy, Finger agility"
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Areas to Improve (Comma separated)</label>
                    <input
                      type="text"
                      value={newProgress.areasToImprove}
                      onChange={(e) => setNewProgress({ ...newProgress, areasToImprove: e.target.value })}
                      placeholder="Sight reading, Scale tempo"
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <ImageUploader
                      label="Upload Evaluation / Report Card Image"
                      folder="allwin_reports"
                      currentImageUrl={newProgress.reportFileUrl}
                      onUploadSuccess={(res) => setNewProgress({ ...newProgress, reportFileUrl: res.secure_url })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddProgress(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-900 font-bold text-xs shadow-xs active:translate-y-0.5 active:scale-95 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button type="submit" size="sm">Save Evaluation</Button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {progressReports.map((r) => (
                <div key={r.id} className="p-5 rounded-2xl bg-white border border-border shadow-xs flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-violet bg-violet/10 px-2.5 py-0.5 rounded-full">{r.grade || student.grade}</span>
                      <span className="text-xs text-text-muted">{r.assessmentDate}</span>
                    </div>
                    <h4 className="font-bold text-base text-navy mt-1">{r.title}</h4>
                    <p className="text-xs text-text-secondary">{r.evaluation}</p>
                    {r.reportFileUrl && (
                      <a href={r.reportFileUrl} target="_blank" className="text-xs font-semibold text-violet hover:underline mt-1 inline-block">
                        View Uploaded Report ↗
                      </a>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      if (!r.id) return;
                      await deleteDoc(doc(db, 'progressReports', r.id));
                      setProgressReports(progressReports.filter((x) => x.id !== r.id));
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ACHIEVEMENTS */}
        {activeTab === 'achievements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Official Certificates & Awards</h3>
              <button
                onClick={() => setShowAddAchievement(true)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Certificate</span>
              </button>
            </div>

            {showAddAchievement && (
              <form onSubmit={handleCreateAchievement} className="p-5 rounded-3xl bg-slate-50 border border-border space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Certificate Title *</label>
                    <input
                      type="text"
                      required
                      value={newAchievement.title}
                      onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                      placeholder="e.g. Trinity Grade 3 Piano Distinction"
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Date</label>
                    <input
                      type="date"
                      value={newAchievement.date}
                      onChange={(e) => setNewAchievement({ ...newAchievement, date: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <ImageUploader
                      label="Upload Certificate / Laurel Image"
                      folder="allwin_certificates"
                      currentImageUrl={newAchievement.certificateUrl}
                      onUploadSuccess={(res) => setNewAchievement({ ...newAchievement, certificateUrl: res.secure_url })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAchievement(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-900 font-bold text-xs shadow-xs active:translate-y-0.5 active:scale-95 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button type="submit" size="sm">Save Certificate</Button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-white border border-border shadow-xs flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{item.category}</span>
                    <h4 className="font-bold text-sm text-navy mt-1">{item.title}</h4>
                    <p className="text-xs text-text-muted mt-0.5">{item.date} • {item.issuedBy}</p>
                    {item.certificateUrl && (
                      <a href={item.certificateUrl} target="_blank" className="text-xs font-semibold text-violet hover:underline mt-1 inline-block">
                        View Certificate File ↗
                      </a>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      if (!item.id) return;
                      await deleteDoc(doc(db, 'studentAchievements', item.id));
                      setAchievements(achievements.filter((x) => x.id !== item.id));
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: FEES */}
        {activeTab === 'fees' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Tuition Fee Ledger</h3>
              <button
                onClick={() => setShowAddFee(true)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Fee Due</span>
              </button>
            </div>

            {showAddFee && (
              <form onSubmit={handleCreateFee} className="p-5 rounded-3xl bg-slate-50 border border-border space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Fee Title *</label>
                    <input
                      type="text"
                      required
                      value={newFee.title}
                      onChange={(e) => setNewFee({ ...newFee, title: e.target.value })}
                      placeholder="e.g. Tuition Fee - August 2026"
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      value={newFee.amount}
                      onChange={(e) => setNewFee({ ...newFee, amount: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Status</label>
                    <select
                      value={newFee.status}
                      onChange={(e) => setNewFee({ ...newFee, status: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Due Date</label>
                    <input
                      type="date"
                      value={newFee.dueDate}
                      onChange={(e) => setNewFee({ ...newFee, dueDate: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Receipt Number</label>
                    <input
                      type="text"
                      value={newFee.receiptNumber}
                      onChange={(e) => setNewFee({ ...newFee, receiptNumber: e.target.value })}
                      placeholder="ASM-REC-101"
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddFee(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-900 font-bold text-xs shadow-xs active:translate-y-0.5 active:scale-95 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button type="submit" size="sm">Save Fee Record</Button>
                </div>
              </form>
            )}

            <div className="space-y-2.5">
              {fees.map((fee) => (
                <div key={fee.id} className="p-4 rounded-2xl bg-white border border-border shadow-xs flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${fee.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{fee.status.toUpperCase()}</span>
                      <span className="text-xs text-text-muted">Due: {fee.dueDate}</span>
                    </div>
                    <h4 className="font-bold text-sm text-navy mt-1">{fee.title}</h4>
                    <p className="text-xs text-text-secondary">Amount: ₹{fee.amount} {fee.receiptNumber ? `(Receipt: ${fee.receiptNumber})` : ''}</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!fee.id) return;
                      await deleteDoc(doc(db, 'fees', fee.id));
                      setFees(fees.filter((x) => x.id !== fee.id));
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: EXAMS & TRINITY */}
        {activeTab === 'exams' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Board & Trinity Exam Bookings</h3>
              <button
                onClick={() => setShowAddExam(true)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book Exam Session</span>
              </button>
            </div>

            {showAddExam && (
              <form onSubmit={handleCreateExam} className="p-5 rounded-3xl bg-slate-50 border border-border space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Exam Name *</label>
                    <input
                      type="text"
                      required
                      value={newExam.examName}
                      onChange={(e) => setNewExam({ ...newExam, examName: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Board</label>
                    <select
                      value={newExam.board}
                      onChange={(e) => setNewExam({ ...newExam, board: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                    >
                      <option value="Trinity College London">Trinity College London</option>
                      <option value="ABRSM">ABRSM</option>
                      <option value="State Board">State Board</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Exam Fee (₹)</label>
                    <input
                      type="number"
                      value={newExam.examFee}
                      onChange={(e) => setNewExam({ ...newExam, examFee: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddExam(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-900 font-bold text-xs shadow-xs active:translate-y-0.5 active:scale-95 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button type="submit" size="sm">Save Exam Entry</Button>
                </div>
              </form>
            )}

            <div className="space-y-2.5">
              {exams.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-white border border-border shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-violet">{item.board} • {item.grade}</span>
                    <h4 className="font-bold text-sm text-navy mt-0.5">{item.examName}</h4>
                    <p className="text-xs text-text-muted">Fee: ₹{item.examFee} ({item.feeStatus}) • Status: {item.registrationStatus}</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!item.id) return;
                      await deleteDoc(doc(db, 'examDetails', item.id));
                      setExams(exams.filter((x) => x.id !== item.id));
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: ACCOUNT & SECURITY */}
        {activeTab === 'account' && (
          <div className="p-6 rounded-3xl bg-white border border-border shadow-xs space-y-6 max-w-2xl">
            <div>
              <h3 className="font-heading font-bold text-base text-navy">Student Account Controls</h3>
              <p className="text-xs text-text-muted">Administrative permissions and authentication security settings</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="font-bold text-navy block text-sm">Account Status</span>
                  <p className="text-text-muted text-xs">Enable or disable student portal access</p>
                </div>
                <button
                  onClick={handleToggleStatus}
                  className={`px-4 py-2 rounded-xl font-semibold text-xs transition-colors shadow-xs ${
                    student.status === 'active'
                      ? 'bg-red-50 text-crimson hover:bg-red-100 border border-red-200'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  {student.status === 'active' ? 'Deactivate Student' : 'Activate Student'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="font-bold text-navy block text-sm">Force Password Reset</span>
                  <p className="text-text-muted text-xs">Prompts student to choose a new password on next login</p>
                </div>
                <button
                  onClick={async () => {
                    if (!student.id) return;
                    await updateDoc(doc(db, 'students', student.id), {
                      mustChangePassword: true,
                    });
                    setStudent({ ...student, mustChangePassword: true });
                    alert('Password reset required on next login.');
                  }}
                  className="px-4 py-2 rounded-xl bg-navy hover:bg-navy-light text-white font-bold transition-all text-xs shadow-xs active:scale-95"
                >
                  Flag for Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Student Modal */}
      <StudentFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={(updated) => setStudent({ ...student, ...updated })}
        editingStudent={student}
      />
    </div>
  );
}

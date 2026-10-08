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
  AlertTriangle,
  ExternalLink,
  X,
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminAttendanceCalendar from '@/components/admin/AdminAttendanceCalendar';
import StudentFormModal from '@/components/admin/StudentFormModal';
import DeleteStudentModal from '@/components/admin/DeleteStudentModal';
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
import { getLastDayOfMonth, ensureSequentialMonthlyFees, getFeeMonthDetails, toggleFeeStatusInDb } from '@/lib/utils/fees';

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Helper to ensure evaluations are strictly sorted by date descending (latest first)
  const sortProgressReportsDesc = (list: ProgressReport[]): ProgressReport[] => {
    return [...list].sort((a, b) => (b.assessmentDate || '').localeCompare(a.assessmentDate || ''));
  };

  // Collections state
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [schedules, setSchedules] = useState<ClassScheduleItem[]>([]);
  const [progressReports, setProgressReports] = useState<ProgressReport[]>([]);
  const [achievements, setAchievements] = useState<StudentAchievementItem[]>([]);
  const [fees, setFees] = useState<StudentFeeItem[]>([]);
  const [exams, setExams] = useState<ExamRecord[]>([]);

  // Sub-modals & forms
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState('');
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
    assessmentDate: new Date().toISOString().split('T')[0],
    todaysClass: '',
    practiceWork: '',
    songsCovered: '',
  });
  const [editingProgress, setEditingProgress] = useState<ProgressReport | null>(null);
  const [editProgressForm, setEditProgressForm] = useState({
    id: '',
    assessmentDate: new Date().toISOString().split('T')[0],
    todaysClass: '',
    practiceWork: '',
    songsCovered: '',
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
  const [feeFilter, setFeeFilter] = useState<'unpaid' | 'paid'>('unpaid');
  const [staticFeeInput, setStaticFeeInput] = useState<string>('');
  const [isSavingStaticFee, setIsSavingStaticFee] = useState(false);
  const [updatingFeeId, setUpdatingFeeId] = useState<string | null>(null);
  const [editingFee, setEditingFee] = useState<StudentFeeItem | null>(null);
  const [isSavingFee, setIsSavingFee] = useState(false);
  const [editFeeForm, setEditFeeForm] = useState({
    title: '',
    amount: 2000,
    status: 'pending' as 'pending' | 'paid' | 'overdue',
    dueDate: '',
    paidAmount: 0,
    receiptNumber: '',
    notes: '',
  });
  const [newFee, setNewFee] = useState({
    title: 'Monthly Tuition Fee',
    feeType: 'tuition' as any,
    amount: 2000,
    dueDate: getLastDayOfMonth(),
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
      if (targetStudent.monthlyFee !== undefined && targetStudent.monthlyFee !== null && targetStudent.monthlyFee > 0) {
        setStaticFeeInput(String(targetStudent.monthlyFee));
        setNewFee((prev) => ({ ...prev, amount: targetStudent.monthlyFee || 0 }));
      } else {
        setStaticFeeInput('');
        setNewFee((prev) => ({ ...prev, amount: 0 }));
      }

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
      const rawProgress = progSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })) as ProgressReport[];
      setProgressReports(sortProgressReportsDesc(rawProgress));
      setAchievements(achSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })));

      const rawFees = feeSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })) as StudentFeeItem[];
      // Auto-ensure sequential monthly fees with student dedicated fee (no 2000 fallback!)
      const finalizedFees = targetStudent.status === 'active'
        ? await ensureSequentialMonthlyFees(studentId, rawFees, targetStudent.monthlyFee)
        : rawFees;
      setFees(finalizedFees);

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
    if (!student || isSavingSchedule) return;
    setScheduleError('');

    const trimmedTime = newSchedule.time.trim();
    const trimmedEndTime = newSchedule.endTime.trim();

    if (!trimmedTime) {
      setScheduleError('Please enter a start time.');
      return;
    }

    // Check if slot already exists on this day and time for this student
    const isDuplicate = schedules.some(
      (s) =>
        s.dayOfWeek.toLowerCase() === newSchedule.dayOfWeek.toLowerCase() &&
        s.time.trim().toLowerCase() === trimmedTime.toLowerCase()
    );

    if (isDuplicate) {
      setScheduleError(`A class slot for ${newSchedule.dayOfWeek} at ${trimmedTime} already exists.`);
      return;
    }

    try {
      setIsSavingSchedule(true);
      const docRef = await addDoc(collection(db, 'schedules'), {
        studentId: student.studentId,
        course: student.course,
        instrument: student.instrument,
        active: true,
        dayOfWeek: newSchedule.dayOfWeek,
        time: trimmedTime,
        endTime: trimmedEndTime,
        notes: newSchedule.notes.trim(),
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
          dayOfWeek: newSchedule.dayOfWeek,
          time: trimmedTime,
          endTime: trimmedEndTime,
          notes: newSchedule.notes.trim(),
        },
      ]);
      setShowAddSchedule(false);
      setScheduleError('');
      setNewSchedule({
        dayOfWeek: 'Monday',
        time: '05:00 PM',
        endTime: '06:00 PM',
        notes: '',
      });
    } catch (err) {
      console.error(err);
      setScheduleError('Failed to save class slot. Please try again.');
    } finally {
      setIsSavingSchedule(false);
    }
  };

  // Create Progress & Grade Evaluation
  const handleCreateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    try {
      const docRef = await addDoc(collection(db, 'progressReports'), {
        studentId: student.studentId,
        course: student.course || '',
        instrument: student.instrument || '',
        title: `Evaluation - ${newProgress.assessmentDate}`,
        assessmentDate: newProgress.assessmentDate,
        todaysClass: newProgress.todaysClass,
        practiceWork: newProgress.practiceWork,
        songsCovered: newProgress.songsCovered,
        createdAt: serverTimestamp(),
      });

      // Add in-app notification for student/parent
      await addDoc(collection(db, 'notifications'), {
        studentId: student.studentId,
        title: 'New Class Evaluation Added',
        message: `Evaluation for ${newProgress.assessmentDate} has been posted.`,
        type: 'progress',
        read: false,
        link: '/student/progress',
        createdAt: serverTimestamp(),
      }).catch(() => {});

      setProgressReports((prev) =>
        sortProgressReportsDesc([
          {
            id: docRef.id,
            studentId: student.studentId,
            course: student.course,
            instrument: student.instrument,
            title: `Evaluation - ${newProgress.assessmentDate}`,
            assessmentDate: newProgress.assessmentDate,
            todaysClass: newProgress.todaysClass,
            practiceWork: newProgress.practiceWork,
            songsCovered: newProgress.songsCovered,
          },
          ...prev,
        ])
      );
      setNewProgress({
        assessmentDate: new Date().toISOString().split('T')[0],
        todaysClass: '',
        practiceWork: '',
        songsCovered: '',
      });
      setShowAddProgress(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Update Existing Progress & Grade Evaluation
  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !editingProgress?.id) return;
    try {
      const progRef = doc(db, 'progressReports', editingProgress.id);
      await updateDoc(progRef, {
        assessmentDate: editProgressForm.assessmentDate,
        todaysClass: editProgressForm.todaysClass,
        practiceWork: editProgressForm.practiceWork,
        songsCovered: editProgressForm.songsCovered,
        updatedAt: serverTimestamp(),
      });

      setProgressReports((prev) =>
        sortProgressReportsDesc(
          prev.map((r) =>
            r.id === editingProgress.id
              ? {
                  ...r,
                  assessmentDate: editProgressForm.assessmentDate,
                  todaysClass: editProgressForm.todaysClass,
                  practiceWork: editProgressForm.practiceWork,
                  songsCovered: editProgressForm.songsCovered,
                }
              : r
          )
        )
      );
      setEditingProgress(null);
    } catch (err) {
      console.error('Error updating progress evaluation:', err);
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

  // Update Dedicated Static Monthly Fee for this student
  const handleUpdateStaticFee = async () => {
    if (!student) return;
    const num = staticFeeInput === '' ? 0 : Number(staticFeeInput);
    if (isNaN(num) || num < 0) {
      alert('Please enter a valid monthly fee amount.');
      return;
    }

    setIsSavingStaticFee(true);
    try {
      const studentDocId = student.id || student.studentId;
      await updateDoc(doc(db, 'students', studentDocId), {
        monthlyFee: num,
        updatedAt: serverTimestamp(),
      });

      setStudent((prev) => (prev ? { ...prev, monthlyFee: num } : null));
      setNewFee((prev) => ({ ...prev, amount: num }));

      // Also sync any pending tuition fee that had 0 amount to reflect the newly assigned static fee
      const updatedFees = await Promise.all(
        fees.map(async (f) => {
          if (f.feeType === 'tuition' && f.status === 'pending' && (!f.amount || f.amount === 0)) {
            if (f.id) {
              await updateDoc(doc(db, 'fees', f.id), {
                amount: num,
                balanceAmount: num,
                updatedAt: serverTimestamp(),
              });
            }
            return { ...f, amount: num, balanceAmount: num };
          }
          return f;
        })
      );
      setFees(updatedFees);
      alert(`Dedicated monthly fee successfully updated to ${num > 0 ? '₹' + num.toLocaleString() : 'Not Assigned'}.`);
    } catch (err) {
      console.error('Error updating static monthly fee:', err);
      alert('Failed to update dedicated monthly fee.');
    } finally {
      setIsSavingStaticFee(false);
    }
  };

  // Toggle Fee Status (Implicitly change Unpaid <-> Paid)
  const handleToggleFeeStatus = async (feeId: string, currentStatus: any, amount: number) => {
    try {
      setUpdatingFeeId(feeId);
      const nextStatus = await toggleFeeStatusInDb(feeId, currentStatus, amount);
      setFees((prev) =>
        prev.map((f) =>
          f.id === feeId
            ? {
                ...f,
                status: nextStatus,
                paidAmount: nextStatus === 'paid' ? amount : 0,
                balanceAmount: nextStatus === 'paid' ? 0 : amount,
              }
            : f
        )
      );
    } catch (err) {
      console.error('Error updating fee status:', err);
    } finally {
      setUpdatingFeeId(null);
    }
  };

  // Open Edit Fee Form
  const handleOpenEditFee = (fee: StudentFeeItem) => {
    setEditingFee(fee);
    setEditFeeForm({
      title: fee.title || '',
      amount: fee.amount ?? 2000,
      status: fee.status || 'pending',
      dueDate: fee.dueDate || '',
      paidAmount: fee.paidAmount ?? (fee.status === 'paid' ? fee.amount : 0),
      receiptNumber: fee.receiptNumber || '',
      notes: fee.notes || '',
    });
  };

  // Save / Update Fee Record
  const handleUpdateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFee || !editingFee.id) return;
    setIsSavingFee(true);
    try {
      const amountNum = Number(editFeeForm.amount) || 0;
      const isPaid = editFeeForm.status === 'paid';
      const paidAmountNum = isPaid
        ? (Number(editFeeForm.paidAmount) || amountNum)
        : (Number(editFeeForm.paidAmount) || 0);
      const balanceNum = Math.max(0, amountNum - paidAmountNum);

      const updatePayload: Record<string, any> = {
        title: editFeeForm.title.trim(),
        amount: amountNum,
        status: editFeeForm.status,
        dueDate: editFeeForm.dueDate,
        paidAmount: paidAmountNum,
        balanceAmount: balanceNum,
        receiptNumber: editFeeForm.receiptNumber.trim(),
        notes: editFeeForm.notes.trim(),
        updatedAt: serverTimestamp(),
      };

      if (isPaid && !editingFee.paymentDate) {
        updatePayload.paymentDate = new Date().toISOString().split('T')[0];
      } else if (!isPaid && editFeeForm.status === 'pending') {
        updatePayload.paymentDate = '';
      }

      await updateDoc(doc(db, 'fees', editingFee.id), updatePayload);

      setFees((prev) =>
        prev.map((f) =>
          f.id === editingFee.id
            ? {
                ...f,
                ...updatePayload,
                id: editingFee.id,
              }
            : f
        )
      );
      setEditingFee(null);
    } catch (err) {
      console.error('Error updating fee record:', err);
      alert('Failed to update fee record. Please try again.');
    } finally {
      setIsSavingFee(false);
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

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 border border-red-200 text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:translate-y-0.5 active:scale-95 cursor-pointer"
              title={`Permanently delete student ${student.studentId}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete Student</span>
            </button>
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
                <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Date of Joining:</span><strong className="text-slate-900 font-bold">{student.joiningDate || 'Not specified'}</strong></div>
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
                {scheduleError && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    {scheduleError}
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    disabled={isSavingSchedule}
                    onClick={() => {
                      setShowAddSchedule(false);
                      setScheduleError('');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 active:bg-slate-400 disabled:opacity-50 text-slate-900 font-bold text-xs shadow-xs active:translate-y-0.5 active:scale-95 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button type="submit" size="sm" disabled={isSavingSchedule}>
                    {isSavingSchedule ? 'Saving Slot...' : 'Save Class Slot'}
                  </Button>
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
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h4 className="font-bold text-slate-900 text-sm">New Class / Grade Evaluation</h4>
                  <span className="text-[11px] text-slate-500 font-medium">Record daily class coverage and practice assignments</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Date *</label>
                    <input
                      type="date"
                      required
                      value={newProgress.assessmentDate}
                      onChange={(e) => setNewProgress({ ...newProgress, assessmentDate: e.target.value })}
                      className="w-full sm:w-64 p-2.5 rounded-xl bg-white border border-border text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">For Today&apos;s Class *</label>
                    <textarea
                      rows={3}
                      required
                      value={newProgress.todaysClass}
                      onChange={(e) => setNewProgress({ ...newProgress, todaysClass: e.target.value })}
                      placeholder="Type details line-by-line (Press Enter for new line)...&#10;1. C Major scale with both hands&#10;2. Finger posture exercises"
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs focus:ring-2 focus:ring-blue-500 leading-relaxed font-normal"
                    />
                  </div>

                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Practice Work *</label>
                    <textarea
                      rows={3}
                      required
                      value={newProgress.practiceWork}
                      onChange={(e) => setNewProgress({ ...newProgress, practiceWork: e.target.value })}
                      placeholder="Type homework line-by-line (Press Enter for new line)...&#10;1. 20 mins right hand practice daily&#10;2. Metronome at 60 bpm"
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs focus:ring-2 focus:ring-blue-500 leading-relaxed font-normal"
                    />
                  </div>

                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Songs Covered *</label>
                    <textarea
                      rows={3}
                      required
                      value={newProgress.songsCovered}
                      onChange={(e) => setNewProgress({ ...newProgress, songsCovered: e.target.value })}
                      placeholder="Type song list line-by-line (Press Enter for new line)...&#10;1. Ode to Joy (Beethoven)&#10;2. Twinkle Twinkle Theme"
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs focus:ring-2 focus:ring-blue-500 leading-relaxed font-normal"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowAddProgress(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-900 font-bold text-xs shadow-xs active:translate-y-0.5 active:scale-95 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button type="submit" size="sm">Publish Evaluation</Button>
                </div>
              </form>
            )}

            {/* Edit Evaluation Modal */}
            {editingProgress && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <form
                  onSubmit={handleUpdateProgress}
                  className="w-full max-w-lg p-6 rounded-3xl bg-white border border-border shadow-2xl space-y-4 text-xs animate-scale-in"
                >
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h4 className="font-bold text-slate-900 text-base">Edit Grade Evaluation</h4>
                    <span className="text-[11px] text-slate-500 font-medium">Modify and correct published details</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-text-muted mb-1 font-semibold">Date *</label>
                      <input
                        type="date"
                        required
                        value={editProgressForm.assessmentDate}
                        onChange={(e) => setEditProgressForm({ ...editProgressForm, assessmentDate: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-white border border-border text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-text-muted mb-1 font-semibold">For Today&apos;s Class *</label>
                      <textarea
                        rows={3}
                        required
                        value={editProgressForm.todaysClass}
                        onChange={(e) => setEditProgressForm({ ...editProgressForm, todaysClass: e.target.value })}
                        placeholder="Type details line-by-line (Press Enter for new line)..."
                        className="w-full p-2.5 rounded-xl bg-white border border-border text-xs focus:ring-2 focus:ring-blue-500 leading-relaxed font-normal"
                      />
                    </div>

                    <div>
                      <label className="block text-text-muted mb-1 font-semibold">Practice Work *</label>
                      <textarea
                        rows={3}
                        required
                        value={editProgressForm.practiceWork}
                        onChange={(e) => setEditProgressForm({ ...editProgressForm, practiceWork: e.target.value })}
                        placeholder="Type homework line-by-line (Press Enter for new line)..."
                        className="w-full p-2.5 rounded-xl bg-white border border-border text-xs focus:ring-2 focus:ring-blue-500 leading-relaxed font-normal"
                      />
                    </div>

                    <div>
                      <label className="block text-text-muted mb-1 font-semibold">Songs Covered *</label>
                      <textarea
                        rows={3}
                        required
                        value={editProgressForm.songsCovered}
                        onChange={(e) => setEditProgressForm({ ...editProgressForm, songsCovered: e.target.value })}
                        placeholder="Type songs line-by-line (Press Enter for new line)..."
                        className="w-full p-2.5 rounded-xl bg-white border border-border text-xs focus:ring-2 focus:ring-blue-500 leading-relaxed font-normal"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setEditingProgress(null)}
                      className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs shadow-xs"
                    >
                      Cancel
                    </button>
                    <Button type="submit" size="sm">Save Changes</Button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-3">
              {progressReports.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-border text-slate-400 text-xs">
                  No evaluations posted yet for this student. Click &ldquo;Add Grade Evaluation&rdquo; above.
                </div>
              ) : (
                sortProgressReportsDesc(progressReports).map((r) => (
                  <div key={r.id} className="p-5 rounded-2xl bg-white border border-border shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{r.assessmentDate}</span>
                        </span>
                      </div>

                      {/* 3 Custom Fields */}
                      {r.todaysClass && (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-0.5">
                          <span className="font-bold text-slate-800 block text-[11px]">Today&apos;s Class:</span>
                          <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-line break-words">{r.todaysClass}</p>
                        </div>
                      )}

                      {r.practiceWork && (
                        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 text-xs space-y-0.5">
                          <span className="font-bold text-amber-900 block text-[11px]">Practice Work:</span>
                          <p className="text-amber-950 leading-relaxed font-medium whitespace-pre-line break-words">{r.practiceWork}</p>
                        </div>
                      )}

                      {r.songsCovered && (
                        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs space-y-0.5">
                          <span className="font-bold text-emerald-900 block text-[11px]">Songs Covered:</span>
                          <p className="text-emerald-950 leading-relaxed font-medium whitespace-pre-line break-words">{r.songsCovered}</p>
                        </div>
                      )}

                      {/* Legacy fields fallback */}
                      {!r.todaysClass && !r.practiceWork && !r.songsCovered && r.evaluation && (
                        <div className="text-xs text-text-secondary">
                          <h4 className="font-bold text-navy">{r.title}</h4>
                          <p className="mt-0.5 whitespace-pre-line break-words">{r.evaluation}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProgress(r);
                          setEditProgressForm({
                            id: r.id || '',
                            assessmentDate: r.assessmentDate || new Date().toISOString().split('T')[0],
                            todaysClass: r.todaysClass || '',
                            practiceWork: r.practiceWork || '',
                            songsCovered: r.songsCovered || '',
                          });
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center gap-1 transition-colors"
                        title="Edit Evaluation"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          if (!r.id) return;
                          if (confirm('Are you sure you want to delete this evaluation?')) {
                            await deleteDoc(doc(db, 'progressReports', r.id));
                            setProgressReports(progressReports.filter((x) => x.id !== r.id));
                          }
                        }}
                        className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete Evaluation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
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
            {/* Student Dedicated Monthly Tuition Fee Management Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Student Dedicated Monthly Fee
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Billed monthly at month end</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {student?.monthlyFee && student.monthlyFee > 0 ? (
                    <span className="text-blue-600">
                      ₹{student.monthlyFee.toLocaleString()}{' '}
                      <span className="text-xs font-normal text-slate-500">/ month</span>
                    </span>
                  ) : (
                    <span className="text-amber-600 text-lg">
                      Not Assigned Yet{' '}
                      <span className="text-xs font-normal text-slate-500">(Shows &quot;Fees Unpaid&quot; without random amounts)</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Set this student&apos;s static monthly tuition fee. It automatically applies for monthly dues and auto-billing.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={staticFeeInput}
                    onChange={(e) => setStaticFeeInput(e.target.value)}
                    placeholder="e.g. 4000"
                    className="w-32 pl-7 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUpdateStaticFee}
                  disabled={isSavingStaticFee}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingStaticFee ? 'Saving...' : 'Update Static Fee'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Tuition Fee Ledger</h3>
                <p className="text-xs text-slate-500 font-medium">Sequential monthly billing history &amp; dues</p>
              </div>
              <button
                onClick={() => {
                  setNewFee((prev) => ({
                    ...prev,
                    amount: student?.monthlyFee || 0,
                  }));
                  setShowAddFee(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
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
                      placeholder="e.g. Monthly Tuition Fee - October 2026"
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-text-muted font-semibold">Amount (₹) *</label>
                      {student?.monthlyFee && student.monthlyFee > 0 && (
                        <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                          Static Fee: ₹{student.monthlyFee}
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      required
                      value={newFee.amount}
                      onChange={(e) => setNewFee({ ...newFee, amount: Number(e.target.value) })}
                      placeholder={student?.monthlyFee ? String(student.monthlyFee) : '0'}
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {student?.monthlyFee && student.monthlyFee > 0
                        ? `Pre-filled with student's static monthly fee (₹${student.monthlyFee}). To change permanently, update the static fee above.`
                        : 'No static fee assigned yet. You can set it permanently above.'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Status</label>
                    <select
                      value={newFee.status}
                      onChange={(e) => setNewFee({ ...newFee, status: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl bg-white border border-border text-xs"
                    >
                      <option value="pending">Pending (Unpaid)</option>
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

            {/* Filter Tabs: Unpaid Dues (default) vs Paid Receipts */}
            {(() => {
              const unpaidFees = fees.filter((f) => f.status === 'pending' || f.status === 'overdue');
              const paidFeesList = fees.filter((f) => f.status === 'paid');
              const displayedFees = feeFilter === 'unpaid' ? unpaidFees : paidFeesList;
              const hasDedicatedFee = student?.monthlyFee !== undefined && student?.monthlyFee !== null && Number(student.monthlyFee) > 0;

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFeeFilter('unpaid')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          feeFilter === 'unpaid'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Unpaid Dues ({unpaidFees.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeeFilter('paid')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          feeFilter === 'paid'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Paid Receipts ({paidFeesList.length})
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-500 font-medium">
                      {feeFilter === 'unpaid'
                        ? 'Showing active unpaid fees only'
                        : 'Showing cleared paid history'}
                    </span>
                  </div>

                  {displayedFees.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="font-bold text-slate-700 text-xs">
                        {feeFilter === 'unpaid'
                          ? 'No pending unpaid dues! All fees are cleared.'
                          : 'No paid receipts recorded yet.'}
                      </p>
                      {feeFilter === 'unpaid' && (
                        <p className="text-[11px] text-slate-500 mt-1">
                          When a fee is marked paid, it moves to Paid Receipts.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {displayedFees.map((fee) => {
                        const monthDetails = getFeeMonthDetails(fee);
                        // If student dedicated fee is NOT configured, NEVER show 1500 or dummy amounts!
                        const effectiveAmount = hasDedicatedFee
                          ? (fee.amount && fee.amount > 0 ? fee.amount : Number(student!.monthlyFee))
                          : 0;
                        const showAssignedAmount = hasDedicatedFee && effectiveAmount > 0;

                        return (
                          <div
                            key={fee.id}
                            className="p-4 rounded-2xl bg-white border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    fee.status === 'paid'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {fee.status === 'paid' ? 'PAID' : 'UNPAID'}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    monthDetails.isCurrentMonth
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {monthDetails.relativeLabel || monthDetails.formattedMonth}
                                </span>
                                <span className="text-xs text-text-muted">Due: {fee.dueDate}</span>
                              </div>
                              <h4 className="font-bold text-sm text-navy mt-1">{fee.title}</h4>
                              <p className="text-xs text-text-secondary mt-0.5">
                                Amount:{' '}
                                {showAssignedAmount ? (
                                  <strong className="text-slate-900">₹{effectiveAmount.toLocaleString()}</strong>
                                ) : (
                                  <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    Fees Unpaid (Fee not assigned yet)
                                  </span>
                                )}
                                {fee.receiptNumber ? ` • Receipt: ${fee.receiptNumber}` : ''}
                                {fee.paymentDate ? ` • Paid: ${fee.paymentDate}` : ''}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              {fee.id && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleFeeStatus(fee.id!, fee.status, effectiveAmount)}
                                  disabled={updatingFeeId === fee.id}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1.5 ${
                                    fee.status === 'paid'
                                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                                  }`}
                                  title={fee.status === 'paid' ? 'Click to mark unpaid' : 'Click to mark paid (removes from unpaid dues)'}
                                >
                                  {fee.status === 'paid' ? (
                                    <span>Mark Unpaid</span>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Mark Paid</span>
                                    </>
                                  )}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenEditFee(fee)}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
                                title="Edit Fee Record (Change amount, title, due date, etc.)"
                              >
                                <Edit className="w-3.5 h-3.5 text-blue-600" />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={async () => {
                                  if (!fee.id) return;
                                  if (!confirm(`Are you sure you want to delete "${fee.title}"?`)) return;
                                  await deleteDoc(doc(db, 'fees', fee.id));
                                  setFees(fees.filter((x) => x.id !== fee.id));
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                title="Delete Fee Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Edit Fee Record Modal */}
            {editingFee && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <form
                  onSubmit={handleUpdateFee}
                  className="w-full max-w-lg p-6 rounded-3xl bg-white border border-border shadow-2xl space-y-4 text-xs animate-scale-in"
                >
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">Edit Tuition Fee Record</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Update fee amount, due date, status or receipt info</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingFee(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 mb-1 font-semibold">Fee Title *</label>
                      <input
                        type="text"
                        required
                        value={editFeeForm.title}
                        onChange={(e) => setEditFeeForm({ ...editFeeForm, title: e.target.value })}
                        placeholder="e.g. Monthly Tuition Fee - October 2026"
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-border text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold">Fee Amount (₹) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={editFeeForm.amount}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditFeeForm({
                            ...editFeeForm,
                            amount: val,
                            paidAmount: editFeeForm.status === 'paid' ? val : editFeeForm.paidAmount,
                          });
                        }}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-border text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold">Payment Status</label>
                      <select
                        value={editFeeForm.status}
                        onChange={(e) => {
                          const nextSt = e.target.value as 'pending' | 'paid' | 'overdue';
                          setEditFeeForm({
                            ...editFeeForm,
                            status: nextSt,
                            paidAmount: nextSt === 'paid' ? editFeeForm.amount : 0,
                          });
                        }}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-border text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-semibold"
                      >
                        <option value="pending">Pending (Unpaid)</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold">Due Date</label>
                      <input
                        type="date"
                        value={editFeeForm.dueDate}
                        onChange={(e) => setEditFeeForm({ ...editFeeForm, dueDate: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-border text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold">Receipt Number</label>
                      <input
                        type="text"
                        value={editFeeForm.receiptNumber}
                        onChange={(e) => setEditFeeForm({ ...editFeeForm, receiptNumber: e.target.value })}
                        placeholder="ASM-REC-101"
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-border text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      />
                    </div>

                    {editFeeForm.status === 'paid' && (
                      <div className="sm:col-span-2">
                        <label className="block text-slate-700 mb-1 font-semibold">Paid Amount (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={editFeeForm.paidAmount}
                          onChange={(e) => setEditFeeForm({ ...editFeeForm, paidAmount: Number(e.target.value) })}
                          className="w-full p-2.5 rounded-xl bg-slate-50 border border-border text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        />
                      </div>
                    )}

                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 mb-1 font-semibold">Remarks / Notes</label>
                      <input
                        type="text"
                        value={editFeeForm.notes}
                        onChange={(e) => setEditFeeForm({ ...editFeeForm, notes: e.target.value })}
                        placeholder="Optional remarks (e.g. discounted, cash received, etc.)"
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-border text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setEditingFee(null)}
                      disabled={isSavingFee}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <Button type="submit" size="sm" disabled={isSavingFee}>
                      {isSavingFee ? 'Saving Changes...' : 'Save Fee Changes'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
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

              {/* Danger Zone: Permanently Delete Student */}
              <div className="p-4 sm:p-5 rounded-2xl bg-red-50/70 border-2 border-red-200 space-y-3 mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-300 text-red-600 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                      <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300">
                          Permanent Deletion
                        </span>
                      </div>
                      <span className="font-bold text-red-900 block text-sm mt-0.5">
                        Permanently Delete Student ID ({student.studentId})
                      </span>
                      <p className="text-red-700/90 text-xs mt-0.5 leading-relaxed">
                        Permanently delete this specific student record and all associated records (fees, attendance, schedules, evaluations).
                      </p>
                      <p className="text-[11px] text-slate-600 mt-1">
                        ⚠️ <strong>Duplicate Safety:</strong> Only this specific account (<strong className="font-mono text-red-800">{student.studentId}</strong>) will be purged. Any duplicate registration with the same name under a different ID will remain safe and untouched.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-md shadow-red-600/20 flex items-center gap-2 shrink-0 transition-all active:scale-95 cursor-pointer self-start sm:self-center"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Student Permanently</span>
                  </button>
                </div>
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

      {/* Delete Student Modal */}
      <DeleteStudentModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={() => {
          router.push('/admin/students');
        }}
        student={student}
      />
    </div>
  );
}

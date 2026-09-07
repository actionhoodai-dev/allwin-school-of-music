// ============================================
// Allwin School of Music — Student & Portal Types
// ============================================

import { Timestamp } from 'firebase/firestore';

// ---- Base Student Profile ----
export type StudentStatus = 'active' | 'inactive' | 'paused' | 'relieved';
export type Gender = 'male' | 'female' | 'other';

export interface Student {
  id?: string;
  studentId: string; // e.g. ASM101
  uid: string; // Firebase Auth UID
  name: string;
  email: string; // Login email (e.g. asm101@student.allwin.internal)
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  dob?: string;
  age?: number;
  gender?: Gender;
  course: string; // e.g. Western Music, Classical Carnatic, Vocal, Bharatham
  instrument: string; // e.g. Keyboard, Guitar, Violin, Vocal, Bharatham
  level: string; // e.g. Pre Foundation Level, Foundation Level, Pre Intermediate Level, Intermediate Level, Pre Advance Level, Advance Level
  grade?: string; // e.g. Initial Grade, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6, Grade 7, Grade 8
  teacherName?: string;
  photo?: string;
  photoPublicId?: string;
  status: StudentStatus;
  mustChangePassword?: boolean;
  notes?: string;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
  lastLoginAt?: Timestamp | any;
}

// ---- Course Levels & Grades (Admin-defined hierarchy) ----
export interface LevelGrade {
  name: string;
  order: number;
}

export interface CourseLevel {
  id?: string;
  name: string; // e.g. "Pre Foundation Level", "Foundation Level", "Pre Intermediate Level", "Intermediate Level", "Pre Advance Level", "Advance Level"
  order: number;
  grades: LevelGrade[]; // e.g. [{ name: "Initial Grade", order: 1 }, { name: "Grade 1", order: 2 }]
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

// ---- Attendance ----
export type AttendanceStatus = 'present' | 'absent' | 'no_class';

export interface AttendanceRecord {
  id?: string;
  studentId: string; // ASM101
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  course?: string;
  instrument?: string;
  teacherName?: string;
  remarks?: string;
  markedBy?: string;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

// ---- Class Schedule (Simplified — No room requirement) ----
export interface ClassScheduleItem {
  id?: string;
  studentId?: string; // Specific student or course-wide
  course: string;
  instrument: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  time: string; // e.g. "05:00 PM"
  endTime?: string; // e.g. "06:00 PM"
  teacherName?: string;
  notes?: string;
  active: boolean;
  createdAt?: Timestamp | any;
}

// ---- Progress, Levels & Evaluations ----
export interface ProgressReport {
  id?: string;
  studentId: string;
  title: string; // e.g. "Quarter 1 Evaluation"
  term?: string; // e.g. "Term 1 - 2026"
  assessmentDate: string;
  course?: string;
  instrument?: string;
  level?: string; // e.g. Beginner, Intermediate, Advanced
  grade?: string; // e.g. Grade 1, Grade 2, Grade 3
  evaluation: string;
  strengths?: string[];
  areasToImprove?: string[];
  teacherComments?: string;
  reportFileUrl?: string;
  reportPublicId?: string;
  createdAt?: Timestamp | any;
}

// ---- Certificates & Achievements ----
export interface StudentAchievementItem {
  id?: string;
  studentId: string;
  title: string;
  category: 'grade_exam' | 'performance' | 'competition' | 'certification' | 'milestone';
  description?: string;
  date: string;
  certificateUrl?: string;
  certificatePublicId?: string;
  imageUrl?: string;
  issuedBy?: string; // e.g. Trinity College London
  createdAt?: Timestamp | any;
}

// ---- Fees & Payments ----
export type FeeStatus = 'paid' | 'pending' | 'overdue';

export interface StudentFeeItem {
  id?: string;
  studentId: string;
  title: string; // e.g. "Monthly Tuition Fee - August 2026"
  month?: string;
  feeType: 'tuition' | 'exam' | 'registration' | 'material' | 'other';
  amount: number;
  paidAmount: number;
  balanceAmount: number;
  dueDate: string;
  paymentDate?: string;
  status: FeeStatus;
  paymentMethod?: 'Cash' | 'UPI / GPay' | 'Bank Transfer' | 'Card';
  paymentReference?: string;
  receiptNumber?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

// ---- Exam Records (Trinity College London, etc.) ----
export type ExamBoard = 'Trinity College London' | 'ABRSM' | 'LCM' | 'State Board' | 'Allwin Academy Internal';
export type ExamStatus = 'registered' | 'fee_pending' | 'scheduled' | 'completed' | 'result_declared';

export interface ExamRecord {
  id?: string;
  studentId: string;
  examName: string; // e.g. "Trinity Grade 3 Piano Assessment"
  board: ExamBoard;
  grade: string; // e.g. "Grade 3"
  instrument: string;
  examDate?: string;
  session?: string; // e.g. "Nov-Dec 2026"
  venue?: string;
  examFee: number;
  feeStatus: 'paid' | 'pending';
  registrationStatus: ExamStatus;
  registrationNumber?: string;
  candidateNumber?: string;
  instructions?: string;
  resultScore?: number;
  resultClassification?: 'Pass' | 'Merit' | 'Distinction' | 'Pending';
  certificateUrl?: string;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

// ---- School Announcements ----
export interface SchoolAnnouncement {
  id?: string;
  title: string;
  content: string;
  date: string;
  priority: 'normal' | 'important' | 'urgent';
  targetCourse?: string;
  attachmentUrl?: string;
  expiryDate?: string;
  published: boolean;
  authorName?: string;
  createdAt?: Timestamp | any;
}

// ---- In-App Notifications ----
export interface StudentNotification {
  id?: string;
  studentId: string;
  title: string;
  message: string;
  type: 'attendance' | 'fee' | 'exam' | 'announcement' | 'progress' | 'achievement' | 'general';
  read: boolean;
  link?: string;
  createdAt?: Timestamp | any;
}

// ---- Section Activity Tracking (for Unread Counts / Badges) ----
export interface SectionBadgeState {
  attendance?: number;
  progress?: number;
  fees?: number;
  exams?: number;
  announcements?: number;
  achievements?: number;
}

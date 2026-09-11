// ============================================
// Student Auth Context & Unread Badge Counter
// ============================================

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  limit,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import {
  signInStudent,
  signOutStudent,
  enablePersistentSession,
} from '@/lib/firebase/student-auth';
import type { Student, StudentNotification, SectionBadgeState } from '@/types/student';

interface StudentAuthContextType {
  user: User | null;
  student: Student | null;
  loading: boolean;
  hasCachedSession: boolean;
  unreadNotifications: number;
  notifications: StudentNotification[];
  sectionBadges: SectionBadgeState;
  markSectionViewed: (section: keyof SectionBadgeState) => void;
  signIn: (identifier: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshStudent: () => Promise<void>;
}

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(undefined);

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCachedSession, setHasCachedSession] = useState(false);
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [sectionBadges, setSectionBadges] = useState<SectionBadgeState>({});

  // Load cached student profile and badge state
  useEffect(() => {
    try {
      const cached = localStorage.getItem('allwin_student_profile');
      if (cached) {
        setStudent(JSON.parse(cached));
        setHasCachedSession(true);
      }
      const cachedBadges = localStorage.getItem('allwin_section_badges');
      if (cachedBadges) {
        setSectionBadges(JSON.parse(cachedBadges));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const fetchStudentForUser = useCallback(async (firebaseUser: User) => {
    try {
      // 1. Try matching by UID
      const uidQuery = query(
        collection(db, 'students'),
        where('uid', '==', firebaseUser.uid)
      );
      const uidSnap = await getDocs(uidQuery);
      if (!uidSnap.empty) {
        const d = uidSnap.docs[0];
        const studentData = { id: d.id, ...d.data() } as Student;
        setStudent(studentData);
        localStorage.setItem('allwin_student_profile', JSON.stringify(studentData));
        return studentData;
      }

      // 2. Try matching by Email
      if (firebaseUser.email) {
        const emailQuery = query(
          collection(db, 'students'),
          where('email', '==', firebaseUser.email.toLowerCase())
        );
        const emailSnap = await getDocs(emailQuery);
        if (!emailSnap.empty) {
          const d = emailSnap.docs[0];
          const studentData = { id: d.id, ...d.data() } as Student;
          setStudent(studentData);
          localStorage.setItem('allwin_student_profile', JSON.stringify(studentData));
          return studentData;
        }
      }

      return null;
    } catch (err) {
      console.warn('[StudentAuth] Error fetching student record:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    let graceTimeout: NodeJS.Timeout | null = null;
    enablePersistentSession();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (graceTimeout) clearTimeout(graceTimeout);
        setUser(firebaseUser);
        setHasCachedSession(true);
        await fetchStudentForUser(firebaseUser);
        setLoading(false);
      } else {
        // If student profile is cached, give mobile Chrome a grace period to reconnect
        // rather than immediately destroying the local session on first tick
        const cached = localStorage.getItem('allwin_student_profile');
        if (cached && !auth.currentUser) {
          if (graceTimeout) clearTimeout(graceTimeout);
          graceTimeout = setTimeout(() => {
            if (auth.currentUser) {
              setUser(auth.currentUser);
              setLoading(false);
            } else {
              setStudent(null);
              setHasCachedSession(false);
              localStorage.removeItem('allwin_student_profile');
              setLoading(false);
            }
          }, 2500);
        } else {
          setStudent(null);
          setHasCachedSession(false);
          localStorage.removeItem('allwin_student_profile');
          setLoading(false);
        }
      }
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && auth.currentUser) {
        setUser(auth.currentUser);
        setLoading(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (graceTimeout) clearTimeout(graceTimeout);
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchStudentForUser]);

  // Subscribe to real-time student document updates
  useEffect(() => {
    if (!student?.id) return;
    const unsub = onSnapshot(doc(db, 'students', student.id), (snap) => {
      if (snap.exists()) {
        const updated = { id: snap.id, ...snap.data() } as Student;
        setStudent(updated);
        localStorage.setItem('allwin_student_profile', JSON.stringify(updated));
      }
    });
    return () => unsub();
  }, [student?.id]);

  // Subscribe to real-time notifications & calculate section unread counts
  useEffect(() => {
    if (!student?.studentId) return;

    try {
      const q = query(
        collection(db, 'notifications'),
        where('studentId', 'in', [student.studentId, 'ALL'])
      );

      const unsub = onSnapshot(q, (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as StudentNotification[];
        setNotifications(list);

        // Derive section badges strictly from unread notifications
        const unreadList = list.filter((n) => !n.read);
        const counts: SectionBadgeState = {
          attendance: 0,
          progress: 0,
          fees: 0,
          exams: 0,
          announcements: 0,
          achievements: 0,
        };

        unreadList.forEach((n) => {
          if (n.type === 'attendance') counts.attendance = (counts.attendance || 0) + 1;
          if (n.type === 'progress') counts.progress = (counts.progress || 0) + 1;
          if (n.type === 'fee') counts.fees = (counts.fees || 0) + 1;
          if (n.type === 'exam') counts.exams = (counts.exams || 0) + 1;
          if (n.type === 'announcement') counts.announcements = (counts.announcements || 0) + 1;
          if (n.type === 'achievement') counts.achievements = (counts.achievements || 0) + 1;
        });

        // Also check if announcements were already marked as read in local storage
        try {
          const readAnnStr = localStorage.getItem(`allwin_read_announcements_${student.studentId}`);
          const readAnnIds: string[] = readAnnStr ? JSON.parse(readAnnStr) : [];
          if (readAnnIds.length > 0 && (counts.announcements || 0) > 0) {
            const unreadAnnCount = unreadList.filter(
              (n) => n.type === 'announcement' && !readAnnIds.includes(n.id || '')
            ).length;
            counts.announcements = unreadAnnCount;
          }
        } catch {}

        setSectionBadges((prev) => {
          const updated = { ...prev, ...counts };
          try {
            localStorage.setItem('allwin_section_badges', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }, (err) => {
        console.warn('[StudentNotifications] Subscription warning:', err);
      });

      return () => unsub();
    } catch (err) {
      console.warn('[StudentNotifications] Query error:', err);
    }
  }, [student?.studentId]);

  // Check announcements in real time to count unread announcements
  useEffect(() => {
    if (!student?.studentId) return;

    const annQuery = query(
      collection(db, 'announcements'),
      where('published', '==', true),
      limit(10)
    );

    const unsubAnn = onSnapshot(annQuery, (snap) => {
      try {
        const readAnnStr = localStorage.getItem(`allwin_read_announcements_${student.studentId}`);
        const readAnnIds: string[] = readAnnStr ? JSON.parse(readAnnStr) : [];

        // Count how many published announcement IDs are unread
        const unreadAnnouncementCount = snap.docs.filter((d) => !readAnnIds.includes(d.id)).length;

        setSectionBadges((prev) => {
          const updated = { ...prev, announcements: unreadAnnouncementCount };
          try {
            localStorage.setItem('allwin_section_badges', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      } catch (err) {
        console.warn('Error evaluating announcements badge count:', err);
      }
    }, () => {});

    return () => unsubAnn();
  }, [student?.studentId]);

  // Dismiss badge and mark associated notifications as read
  const markSectionViewed = useCallback(async (section: keyof SectionBadgeState) => {
    // 1. Instantly reset the section badge count to 0
    setSectionBadges((prev) => {
      const updated = { ...prev, [section]: 0 };
      try {
        localStorage.setItem('allwin_section_badges', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (!student?.studentId) return;

    // 2. For announcements, mark all current published announcements as read
    if (section === 'announcements') {
      try {
        const annQuery = query(
          collection(db, 'announcements'),
          where('published', '==', true),
          limit(20)
        );
        const annSnap = await getDocs(annQuery);
        const allIds = annSnap.docs.map((d) => d.id);
        localStorage.setItem(
          `allwin_read_announcements_${student.studentId}`,
          JSON.stringify(allIds)
        );
      } catch (err) {
        console.warn('Error caching read announcements:', err);
      }
    }

    // 3. Mark matching notifications as read in Firestore
    const matchingTypeMap: Record<string, string[]> = {
      attendance: ['attendance'],
      progress: ['progress'],
      fees: ['fee'],
      exams: ['exam'],
      announcements: ['announcement'],
      achievements: ['achievement'],
    };

    const typesToClear = matchingTypeMap[section] || [section];

    const unreadMatching = notifications.filter(
      (n) => !n.read && n.id && typesToClear.includes(n.type)
    );

    if (unreadMatching.length > 0) {
      // Locally mark them read immediately so UI updates without lag
      setNotifications((prev) =>
        prev.map((n) => (typesToClear.includes(n.type) ? { ...n, read: true } : n))
      );

      // Async update in Firestore
      try {
        await Promise.all(
          unreadMatching.map((n) =>
            updateDoc(doc(db, 'notifications', n.id!), { read: true })
          )
        );
      } catch (err) {
        console.warn(`Error marking ${section} notifications read in Firestore:`, err);
      }
    }
  }, [student?.studentId, notifications]);

  const signIn = async (identifier: string, pass: string) => {
    setLoading(true);
    try {
      const { user: authedUser, student: studentData } = await signInStudent(identifier, pass);
      setUser(authedUser);
      setStudent(studentData);
      setHasCachedSession(true);
      localStorage.setItem('allwin_student_profile', JSON.stringify(studentData));
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setHasCachedSession(false);
    await signOutStudent();
    setUser(null);
    setStudent(null);
    setNotifications([]);
    setSectionBadges({});
    localStorage.removeItem('allwin_student_profile');
    localStorage.removeItem('allwin_section_badges');
  };

  const refreshStudent = async () => {
    if (user) {
      await fetchStudentForUser(user);
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <StudentAuthContext.Provider
      value={{
        user,
        student,
        loading,
        hasCachedSession,
        unreadNotifications,
        notifications,
        sectionBadges,
        markSectionViewed,
        signIn,
        signOut,
        refreshStudent,
      }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth() {
  const context = useContext(StudentAuthContext);
  if (!context) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
}

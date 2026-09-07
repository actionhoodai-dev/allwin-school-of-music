// ============================================
// Student Notification Bottom Sheet / Modal (Clean White Theme)
// ============================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  X,
  CheckCircle2,
  Calendar,
  BookOpen,
  CreditCard,
  Trophy,
  Megaphone,
} from 'lucide-react';
import { useStudentAuth } from '@/context/StudentAuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const { notifications } = useStudentAuth();
  const [markingAll, setMarkingAll] = useState(false);

  if (!isOpen) return null;

  const markAsRead = async (id?: string) => {
    if (!id) return;
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.warn('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await Promise.all(
        notifications
          .filter((n) => !n.read && n.id)
          .map((n) => updateDoc(doc(db, 'notifications', n.id!), { read: true }))
      );
    } catch (err) {
      console.warn('Error marking all as read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case 'assignment':
        return <BookOpen className="w-4 h-4 text-[#2874f0]" />;
      case 'fee':
        return <CreditCard className="w-4 h-4 text-amber-600" />;
      case 'exam':
      case 'progress':
        return <Trophy className="w-4 h-4 text-indigo-600" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-[#fb641b]" />;
      default:
        return <Bell className="w-4 h-4 text-[#2874f0]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col z-10 overflow-hidden animate-slide-in-right sm:animate-scale-in text-slate-900">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2874f0] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">Notifications</h2>
              <p className="text-xs text-slate-500 font-medium">
                {notifications.filter((n) => !n.read).length} unread updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.read) && (
              <button
                onClick={markAllAsRead}
                disabled={markingAll}
                className="text-xs text-[#2874f0] hover:underline font-bold px-2 py-1"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 active:scale-95 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-2.5 max-h-[60vh]">
          {notifications.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-900">
                You're all caught up!
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                No new notifications or alerts from Allwin School of Music.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`p-3.5 rounded-xl border transition-all ${
                  !n.read
                    ? 'bg-blue-50/60 border-blue-200'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white shrink-0 mt-0.5 shadow-xs border border-slate-100">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-xs text-slate-900 truncate">
                        {n.title}
                      </h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-[#fb641b] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 font-medium">
                      {n.message}
                    </p>
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={onClose}
                        className="inline-block mt-2 text-[11px] font-bold text-[#2874f0] hover:underline"
                      >
                        View Details →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

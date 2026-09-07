// ============================================
// Student Portal: Payment History & Receipts (Clean White Theme)
// ============================================

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStudentAuth } from '@/context/StudentAuthContext';
import {
  Receipt,
  Download,
  ChevronLeft,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { StudentFeeItem } from '@/types/student';

export default function StudentFeeHistoryPage() {
  const { student } = useStudentAuth();
  const [fees, setFees] = useState<StudentFeeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student?.studentId) return;

    async function loadFees() {
      try {
        const q = query(
          collection(db, 'fees'),
          where('studentId', '==', student!.studentId)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as StudentFeeItem[];
        // Sort paid items by paymentDate or dueDate desc
        list.sort((a, b) => (b.paymentDate || b.dueDate || '').localeCompare(a.paymentDate || a.dueDate || ''));
        setFees(list);
      } catch (err) {
        console.error('Error loading fee history:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFees();
  }, [student?.studentId]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/student/fees"
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:scale-95 shadow-sm hover:bg-slate-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="font-bold text-xl sm:text-2xl text-slate-900">
            Payment History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Archive of all cleared fees, tuition payments, and receipts
          </p>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {fees.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-base text-slate-900">
              No Payment Records Found
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Cleared payments entered by school administration will appear here with official transaction details.
            </p>
          </div>
        ) : (
          fees.map((fee) => (
            <div
              key={fee.id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {fee.status === 'paid' ? 'PAID' : fee.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {fee.month || fee.dueDate}
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-slate-900 mt-1">
                    {fee.title}
                  </h4>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-lg font-bold text-emerald-700">
                    ₹{fee.paidAmount || fee.amount}
                  </div>
                  {fee.paymentDate && (
                    <span className="text-[11px] text-slate-500 block font-medium">
                      Paid on: {fee.paymentDate}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 font-medium">
                <div className="flex flex-wrap items-center gap-3">
                  {fee.paymentMethod && (
                    <span>Mode: <strong className="text-slate-900">{fee.paymentMethod}</strong></span>
                  )}
                  {fee.paymentReference && (
                    <span>Ref: <strong className="font-semibold text-slate-900">{fee.paymentReference}</strong></span>
                  )}
                  {fee.receiptNumber && (
                    <span>Receipt No: <strong className="font-bold text-[#2874f0]">{fee.receiptNumber}</strong></span>
                  )}
                </div>

                {fee.receiptUrl && (
                  <a
                    href={fee.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#2874f0] font-bold hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Receipt</span>
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

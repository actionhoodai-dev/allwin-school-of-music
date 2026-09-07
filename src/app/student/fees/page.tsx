// ============================================
// Student Portal: Fees & Tuition Overview (Clean White Theme)
// ============================================

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStudentAuth } from '@/context/StudentAuthContext';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight,
  Receipt,
  Smartphone,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { StudentFeeItem } from '@/types/student';

export default function StudentFeesPage() {
  const { student, markSectionViewed } = useStudentAuth();
  const [fees, setFees] = useState<StudentFeeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Clear the unread badge when parent opens this section
  useEffect(() => {
    markSectionViewed('fees');
  }, []);

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
        list.sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || ''));
        setFees(list);
      } catch (err) {
        console.error('Error fetching fees:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFees();
  }, [student?.studentId]);

  const pendingDues = fees.filter((f) => f.status === 'pending' || f.status === 'overdue');
  const paidFees = fees.filter((f) => f.status === 'paid');
  const totalPendingAmount = pendingDues.reduce((sum, f) => sum + (f.balanceAmount || f.amount || 0), 0);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Title & History link */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-xl sm:text-2xl text-slate-900">
            Class Fees & Dues
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monthly tuition records, exam dues & payment history
          </p>
        </div>

        <Link
          href="/student/fees/history"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 text-xs font-bold text-[#2874f0] hover:bg-blue-100 transition-all self-start sm:self-auto shadow-sm active:scale-95"
        >
          <Receipt className="w-4 h-4" />
          <span>Payment Receipts</span>
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </Link>
      </div>

      {/* Main Status Hero Card — Clean White with Amazon Gold Accent */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-[#fff7e6] text-[#b78103] border border-[#ffd591]">
              Current Fee Status
            </span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
              {totalPendingAmount > 0 ? `₹${totalPendingAmount.toLocaleString()}` : '₹0.00'}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {totalPendingAmount > 0 ? 'Total outstanding tuition & exam dues' : 'All tuition fees are fully cleared'}
            </p>
          </div>

          <div className="shrink-0">
            {totalPendingAmount === 0 ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>PAID & UP TO DATE</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 border border-orange-200 text-[#fb641b] font-bold text-xs">
                <Clock className="w-4 h-4" />
                <span>PAYMENT PENDING</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Dues Breakdown */}
      {pendingDues.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider px-1">
            Pending Invoices ({pendingDues.length})
          </h3>

          <div className="space-y-2.5">
            {pendingDues.map((fee) => (
              <div
                key={fee.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                      {fee.feeType || 'Tuition'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Due: {fee.dueDate}</span>
                  </div>

                  <h4 className="font-bold text-base text-slate-900 mt-1">
                    {fee.title}
                  </h4>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xl font-bold text-[#fb641b]">
                    ₹{fee.amount}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Pay via UPI or at academy desk</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Modes Information */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[#2874f0]" />
          <span>Payment Methods</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block text-xs">
              UPI / Google Pay / PhonePe
            </span>
            <span className="text-[#2874f0] font-bold tracking-wide mt-1 block text-sm">
              +91 94892 03683
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block font-medium">
              Please include student ID in payment remarks.
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block text-xs">
              Cash at Academy Office
            </span>
            <span className="text-xs text-slate-500 mt-1 block font-medium">
              Allwin School of Music, Chinnathirupathi, Salem. Open Mon–Sat 9am–7:30pm.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

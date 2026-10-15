'use client';

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { mockGroups, mockStudents } from '../data/mockData';
import { X, CheckCircle, CreditCard, UserPlus, FileUp } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddStudentModal({ isOpen, onClose }: ModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998 9');
  const [group, setGroup] = useState(mockGroups[0]?.name || '');
  const [initialPayment, setInitialPayment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`O'quvchi muvaffaqiyatli ro'yxatga olindi:\n${name} (${phone})\nGuruh: ${group}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <UserPlus className="h-5 w-5 text-brand-600" />
            <span>{t.modals.addStudentTitle}</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              {t.modals.studentName}
            </label>
            <input
              type="text"
              required
              placeholder="Masalan: Sardor Rustamov"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:border-brand-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              {t.modals.phone}
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:border-brand-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              {t.modals.group}
            </label>
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:border-brand-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {mockGroups.map((g) => (
                <option key={g.id} value={g.name}>
                  {g.name} ({g.monthlyFee.toLocaleString()} so'm/oy)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              Boshlang'ich to'lov (ixtiyoriy)
            </label>
            <input
              type="number"
              placeholder="0"
              value={initialPayment}
              onChange={(e) => setInitialPayment(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:border-brand-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t.actions.cancel}
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700"
            >
              {t.actions.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function RecordPaymentModal({ isOpen, onClose }: ModalProps) {
  const { t } = useLanguage();
  const [student, setStudent] = useState(mockStudents[0]?.name || '');
  const [amount, setAmount] = useState('750000');
  const [method, setMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [notes, setNotes] = useState('Oylik to\'lov');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`To'lov muvaffaqiyatli qabul qilindi!\nO'quvchi: ${student}\nSumma: ${Number(amount).toLocaleString()} so'm\nUsul: ${method}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            <span>{t.modals.recordPaymentTitle}</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              O'quvchini tanlang
            </label>
            <select
              value={student}
              onChange={(e) => setStudent(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:border-brand-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {mockStudents.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.groupName}) - Balans: {s.balance.toLocaleString()} so'm
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              {t.modals.amount} (so'm)
            </label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:border-brand-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              {t.modals.paymentMethod}
            </label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {[
                { id: 'cash', label: t.modals.cash },
                { id: 'card', label: t.modals.card },
                { id: 'transfer', label: t.modals.transfer },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id as any)}
                  className={`rounded-xl border p-2 text-center text-xs font-semibold transition-all ${
                    method === m.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              {t.modals.notes}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:border-brand-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t.actions.cancel}
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-700"
            >
              {t.actions.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

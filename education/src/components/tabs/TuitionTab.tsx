'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { mockPayments, mockStudents } from '../../data/mockData';
import { formatMoney } from '../../lib/format';
import {
  CreditCard,
  Plus,
  AlertCircle,
  CheckCircle2,
  FileText,
  DollarSign,
  Download,
} from 'lucide-react';
import { RecordPaymentModal } from '../Modals';

export function TuitionTab() {
  const { t } = useLanguage();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'receipts' | 'debtors'>('receipts');

  const totalCollected = mockPayments.reduce((acc, p) => acc + p.amount, 0);
  const debtors = mockStudents.filter((s) => s.balance < 0);
  const totalDebt = debtors.reduce((acc, s) => acc + Math.abs(s.balance), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CreditCard className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              To'lovlar, Kassa va Shartnomalar
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Kassa tushumlari, o'quvchilar oylik to'lov shartnomalari va qarzdorliklar daftari.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaymentOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>To'lov qabul qilish (Kvitansiya)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Kassadagi jami tushum
          </span>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatMoney(totalCollected)} UZS
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Oxirgi 30 kunlik tushumlar summasi
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Undirilishi kerak bo'lgan qarz
          </span>
          <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {formatMoney(totalDebt)} UZS
          </div>
          <p className="mt-1 text-[11px] text-rose-500">
            {debtors.length} nafar o'quvchida to'lov muddati o'tgan
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Bugungi to'lovlar
          </span>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {formatMoney(1550000)} UZS
          </div>
          <p className="mt-1 text-[11px] text-emerald-600 font-semibold">
            2 ta yangi to'lov kvitansiyasi
          </p>
        </div>
      </div>

      {/* Sub Tabs Toggle */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('receipts')}
          className={`pb-3 px-4 transition-all border-b-2 flex items-center gap-2 ${
            activeSubTab === 'receipts'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Oxirgi Kvitansiyalar ({mockPayments.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('debtors')}
          className={`pb-3 px-4 transition-all border-b-2 flex items-center gap-2 ${
            activeSubTab === 'debtors'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          <span>Qarzdorlar Ro'yxati ({debtors.length})</span>
        </button>
      </div>

      {/* Tab Content: Receipts Table */}
      {activeSubTab === 'receipts' ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              To'lov Kvitansiyalari Jurnali
            </h2>
            <button
              onClick={() => alert("Kvitansiyalar Excel formatda yuklab olindi.")}
              className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Excel ga eksport</span>
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 dark:border-slate-800">
                  <th className="pb-3 font-semibold">Kvitansiya №</th>
                  <th className="pb-3 font-semibold">O'quvchi F.I.Sh</th>
                  <th className="pb-3 font-semibold">Guruhi</th>
                  <th className="pb-3 font-semibold">To'langan Summa</th>
                  <th className="pb-3 font-semibold">To'lov Usuli</th>
                  <th className="pb-3 font-semibold">Sana va Vaqt</th>
                  <th className="pb-3 font-semibold">Qabul Qildi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mockPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-mono font-bold text-brand-600">{p.receiptNumber}</td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">{p.studentName}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{p.groupName}</td>
                    <td className="py-3 font-bold text-emerald-600">{formatMoney(p.amount)} UZS</td>
                    <td className="py-3">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300 uppercase">
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{p.date}</td>
                    <td className="py-3 text-slate-500">{p.recordedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Debtors Table */
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white text-rose-600">
              Qarzdor O'quvchilar Ro'yxati
            </h2>
            <span className="text-xs text-slate-400">
              Jami qarzdorlik: {formatMoney(totalDebt)} UZS
            </span>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {debtors.map((s) => (
              <div key={s.id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {s.name}
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    {s.groupName} • Telefon: <span className="font-mono">{s.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                      {formatMoney(Math.abs(s.balance))} UZS
                    </div>
                    <div className="text-[10px] text-slate-400">Oylik qarzdorlik</div>
                  </div>

                  <button
                    onClick={() => setIsPaymentOpen(true)}
                    className="rounded-xl bg-emerald-600 px-3 py-1.5 font-semibold text-white shadow-xs hover:bg-emerald-700 transition-all"
                  >
                    To'lov olish
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <RecordPaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />
    </div>
  );
}

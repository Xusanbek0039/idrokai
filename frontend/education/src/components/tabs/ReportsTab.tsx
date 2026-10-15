'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { mockPayments, mockStudents, mockGroups } from '../../data/mockData';
import { formatMoney } from '../../lib/format';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  PieChart,
  Users,
} from 'lucide-react';

export function ReportsTab() {
  const { t } = useLanguage();

  const totalRevenue = mockPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalDebt = mockStudents.filter((s) => s.balance < 0).reduce((acc, s) => acc + Math.abs(s.balance), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Tahliliy va Moliyaviy Hisobotlar
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Tushumlar dinamikasi, qarzdorlik balansi, o'quvchilar soni o'sishi va davomat statistikasi.
          </p>
        </div>

        <button
          onClick={() => alert("Barcha hisobotlar to'liq Excel fayl sifatida yuklab olindi.")}
          className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 transition-all"
        >
          <Download className="h-4 w-4" />
          <span>Hisobotni yuklab olish (Excel)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Oylik sof tushum
          </span>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatMoney(totalRevenue)} UZS
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+18% o'tgan chorakka nisbatan</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Mavjud qarzdorlik
          </span>
          <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {formatMoney(totalDebt)} UZS
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            O'quv to'lovlarining 88% qismi undirilgan
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            O'rtacha oylik davomat
          </span>
          <div className="mt-2 text-2xl font-bold text-brand-600 dark:text-brand-400">
            94.6%
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Markaz bo'yicha yuqori ko'rsatkich
          </p>
        </div>
      </div>

      {/* Breakdown by Groups */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
          Guruhlar Kesimida Moliyaviy va Akademik Ko'rsatkichlar
        </h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 dark:border-slate-800">
                <th className="pb-3 font-semibold">Guruh Nomi</th>
                <th className="pb-3 font-semibold">Kurs Yo'nalishi</th>
                <th className="pb-3 font-semibold">Ustoz</th>
                <th className="pb-3 font-semibold">O'quvchilar</th>
                <th className="pb-3 font-semibold">Kutilayotgan Oylik Tushum</th>
                <th className="pb-3 font-semibold">O'rtacha Davomat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockGroups.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-bold text-slate-900 dark:text-white">{g.name}</td>
                  <td className="py-3 text-slate-600 dark:text-slate-300">{g.course}</td>
                  <td className="py-3 text-slate-500">{g.teacherName}</td>
                  <td className="py-3 font-semibold text-brand-600">{g.studentsCount} nafar</td>
                  <td className="py-3 font-bold text-emerald-600">
                    {formatMoney(g.studentsCount * g.monthlyFee)} UZS
                  </td>
                  <td className="py-3">
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      94%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

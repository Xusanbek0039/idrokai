'use client';

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { mockGroups, mockStudents, mockTeachers, mockPayments } from '../data/mockData';
import { formatMoney } from '../lib/format';
import {
  Users,
  GraduationCap,
  TrendingUp,
  AlertCircle,
  CreditCard,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  PieChart,
} from 'lucide-react';
import { AddStudentModal, RecordPaymentModal } from './Modals';

export function OwnerView() {
  const { t } = useLanguage();
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Financial aggregates
  const totalStudents = mockStudents.length;
  const activeGroups = mockGroups.length;
  const totalRevenue = mockPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalDebt = mockStudents.filter(s => s.balance < 0).reduce((acc, s) => acc + Math.abs(s.balance), 0);
  const avgAttendance = 94;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome with Quick Actions */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-gradient-to-r from-purple-500/10 via-brand-500/10 to-indigo-500/10 p-5 dark:border-slate-800 dark:from-purple-950/30 dark:via-brand-950/30 dark:to-indigo-950/30 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
              <ShieldCheck className="mr-1 h-3.5 w-3.5" />
              Boshliq Kabineti (Owner Executive)
            </span>
          </div>
          <h1 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            O'quv Markaz Umumiy Ko'rsatkichlari
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Moliyaviy tushumlar, qarzdorlik tahlili, o'qituvchilar va guruhlar to'liq nazorati.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>{t.actions.addStudent}</span>
          </button>
          <button
            onClick={() => setIsPaymentOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
          >
            <CreditCard className="h-4 w-4" />
            <span>{t.actions.recordPayment}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Students */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.stats.totalStudents}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {totalStudents} nafar
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+12% o'tgan oyga nisbatan</span>
          </div>
        </div>

        {/* Active Groups */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.stats.activeGroups}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {activeGroups} ta guruh
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {mockTeachers.length} nafar o'qituvchi biriktirilgan
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.stats.monthlyRevenue}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatMoney(totalRevenue)} UZS
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Kassa balansida mavjud</span>
          </div>
        </div>

        {/* Overdue Debt */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.stats.overdueDebt}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {formatMoney(totalDebt)} UZS
          </div>
          <div className="mt-1 text-xs text-rose-500">
            3 ta o'quvchida to'lov muddati o'tgan
          </div>
        </div>
      </div>

      {/* Grid: Groups Status & Recent Payments */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Groups Overview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Faol Kurslar va Guruhlar
            </h2>
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
              Jami {mockGroups.length} ta
            </span>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {mockGroups.map((g) => (
              <div key={g.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {g.name}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                    Ustoz: {g.teacherName} • {g.room}
                  </div>
                  <div className="text-[11px] text-brand-600 dark:text-brand-400 font-medium mt-0.5">
                    {g.days} ({g.time})
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {g.monthlyFee.toLocaleString()} so'm/oy
                  </div>
                  <span className="inline-block mt-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {g.studentsCount} ta o'quvchi
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Debtors & Receivables */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-rose-500" />
              <span>Qarzdorlik Nazorati (Debtor Students)</span>
            </h2>
            <span className="text-xs text-rose-500 font-semibold">
              Tezkor undirish
            </span>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {mockStudents
              .filter((s) => s.balance < 0)
              .map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {s.name}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      {s.groupName} • {s.phone}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-rose-600 dark:text-rose-400">
                      {Math.abs(s.balance).toLocaleString()} UZS
                    </div>
                    <button
                      onClick={() => setIsPaymentOpen(true)}
                      className="mt-1 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 transition-colors"
                    >
                      To'lov olish
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Staff & Teachers Overview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
          O'qituvchilar Shtati va Yuklamalari
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 dark:border-slate-800">
                <th className="pb-3 font-semibold">O'qituvchi F.I.Sh</th>
                <th className="pb-3 font-semibold">Mutaxassisligi</th>
                <th className="pb-3 font-semibold">Telefon</th>
                <th className="pb-3 font-semibold">Guruhlar</th>
                <th className="pb-3 font-semibold">O'quvchilar</th>
                <th className="pb-3 font-semibold">Hisob-kitob modeli</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockTeachers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-bold text-slate-900 dark:text-white">
                    {t.name}
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-300">{t.subject}</td>
                  <td className="py-3 text-slate-500">{t.phone}</td>
                  <td className="py-3 font-semibold text-brand-600">{t.groupsCount} ta guruh</td>
                  <td className="py-3">{t.studentsCount} nafar</td>
                  <td className="py-3">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {t.salaryType}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddStudentModal isOpen={isAddStudentOpen} onClose={() => setIsAddStudentOpen(false)} />
      <RecordPaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />
    </div>
  );
}

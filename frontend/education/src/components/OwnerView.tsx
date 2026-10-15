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
  Calendar,
  BookOpen,
  ArrowRight,
  Building2,
  Sparkles,
} from 'lucide-react';
import { AddStudentModal, RecordPaymentModal } from './Modals';
import { NavTab } from './Sidebar';

interface OwnerViewProps {
  onNavigate?: (tab: NavTab) => void;
}

export function OwnerView({ onNavigate }: OwnerViewProps) {
  const { t } = useLanguage();
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Financial aggregates
  const totalStudents = mockStudents.length;
  const activeGroups = mockGroups.length;
  const totalRevenue = mockPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalDebt = mockStudents.filter((s) => s.balance < 0).reduce((acc, s) => acc + Math.abs(s.balance), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Executive Master Oversight */}
      <div className="flex flex-col gap-4 rounded-3xl border border-purple-200/80 bg-gradient-to-r from-purple-500/10 via-brand-500/10 to-indigo-500/10 p-6 shadow-sm dark:border-purple-800/70 dark:from-purple-950/40 dark:via-brand-950/40 dark:to-indigo-950/40 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-lg bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
              <ShieldCheck className="mr-1.5 h-4 w-4 text-purple-600 dark:text-purple-400" />
              Boshliq Kabineti (Owner Executive Master)
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Cheksiz Nazorat Faol
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            O'quv Markaz Boshqaruv va Nazorat Markazi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Barcha filiallar, moliyaviy oqimlar, xodimlar yuklamasi va o'quvchilar to'liq nazoratingiz ostida.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/25 hover:from-brand-500 hover:to-indigo-500 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>{t.actions.addStudent}</span>
          </button>
          <button
            onClick={() => setIsPaymentOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-500 transition-all"
          >
            <CreditCard className="h-4 w-4" />
            <span>{t.actions.recordPayment}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigate?.('students')}
          className="cursor-pointer group rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-xs transition-all hover:border-blue-400 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/90 dark:hover:border-blue-500/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {t.stats.totalStudents}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {totalStudents} nafar
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              +12% o'tgan oyga nisbatan
            </span>
            <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Active Groups */}
        <div
          onClick={() => onNavigate?.('groups')}
          className="cursor-pointer group rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-xs transition-all hover:border-purple-400 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/90 dark:hover:border-purple-500/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {t.stats.activeGroups}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {activeGroups} ta guruh
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{mockTeachers.length} nafar o'qituvchi</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Monthly Revenue */}
        <div
          onClick={() => onNavigate?.('tuition')}
          className="cursor-pointer group rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-xs transition-all hover:border-emerald-400 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/90 dark:hover:border-emerald-500/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {t.stats.monthlyRevenue}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatMoney(totalRevenue)} UZS
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Kassada tushum mavjud
            </span>
            <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Overdue Debt */}
        <div
          onClick={() => onNavigate?.('tuition')}
          className="cursor-pointer group rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-xs transition-all hover:border-rose-400 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/90 dark:hover:border-rose-500/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {t.stats.overdueDebt}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatMoney(totalDebt)} UZS
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-rose-500 font-bold">
            <span>3 ta o'quvchida muddat o'tgan</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      {/* Quick Oversight Shortcuts for Owner */}
      <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/90">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Tezkor Nazorat va Bo'limlar
          </span>
          <span className="text-[11px] text-brand-600 dark:text-brand-400 font-bold">
            Barcha ma'lumotlar jonli rejimda
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            { id: 'students' as NavTab, label: "O'quvchilar", icon: Users, color: 'text-blue-500' },
            { id: 'tuition' as NavTab, label: "Kassa & Qarzlar", icon: CreditCard, color: 'text-emerald-500' },
            { id: 'groups' as NavTab, label: "Guruhlar", icon: GraduationCap, color: 'text-purple-500' },
            { id: 'teachers' as NavTab, label: "O'qituvchilar", icon: BookOpen, color: 'text-amber-500' },
            { id: 'timetable' as NavTab, label: "Dars Jadvali", icon: Calendar, color: 'text-indigo-500' },
            { id: 'reports' as NavTab, label: "Hisobotlar", icon: PieChart, color: 'text-rose-500' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id)}
                className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 text-xs font-bold text-slate-800 hover:bg-brand-50 hover:border-brand-300 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:border-brand-500/50 transition-all text-left"
              >
                <Icon className={`h-4 w-4 ${item.color} shrink-0`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Groups Status & Recent Payments */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Groups Overview */}
        <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/90">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Faol Kurslar va Guruhlar
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                O'quv xonalari va oylik abonent to'lovlari
              </p>
            </div>
            <button
              onClick={() => onNavigate?.('groups')}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>Barchasini ko'rish</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/80">
            {mockGroups.map((g) => (
              <div key={g.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {g.name}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                    Ustoz: {g.teacherName} • {g.room}
                  </div>
                  <div className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold mt-0.5">
                    {g.days} ({g.time})
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {formatMoney(g.monthlyFee)} so'm/oy
                  </div>
                  <span className="inline-block mt-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {g.studentsCount} ta o'quvchi
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Debtors & Receivables */}
        <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/90">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-rose-500" />
                <span>Qarzdorlik Nazorati (Debtor Students)</span>
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                To'lov muddati o'tgan o'quvchilar ro'yxati
              </p>
            </div>
            <button
              onClick={() => onNavigate?.('tuition')}
              className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1"
            >
              <span>Kassa daftari</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/80">
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
                      {formatMoney(Math.abs(s.balance))} UZS
                    </div>
                    <button
                      onClick={() => setIsPaymentOpen(true)}
                      className="mt-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 transition-colors"
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
      <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/90">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              O'qituvchilar Shtati va Yuklamalari
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              O'qituvchilar hisob-kitob modellari va biriktirilgan guruhlar
            </p>
          </div>
          <button
            onClick={() => onNavigate?.('teachers')}
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>Barcha o'qituvchilar</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 dark:border-slate-800">
                <th className="pb-3 font-bold">O'qituvchi F.I.Sh</th>
                <th className="pb-3 font-bold">Mutaxassisligi</th>
                <th className="pb-3 font-bold">Telefon</th>
                <th className="pb-3 font-bold">Guruhlar</th>
                <th className="pb-3 font-bold">O'quvchilar</th>
                <th className="pb-3 font-bold">Hisob-kitob modeli</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {mockTeachers.map((tch) => (
                <tr key={tch.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-bold text-slate-900 dark:text-white">
                    {tch.name}
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-300">{tch.subject}</td>
                  <td className="py-3 text-slate-500">{tch.phone}</td>
                  <td className="py-3 font-bold text-brand-600 dark:text-brand-400">{tch.groupsCount} ta guruh</td>
                  <td className="py-3">{tch.studentsCount} nafar</td>
                  <td className="py-3">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {tch.salaryType}
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

'use client';

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { mockStudents, mockPayments, mockGroups } from '../data/mockData';
import { formatMoney } from '../lib/format';
import {
  Users,
  CreditCard,
  UserPlus,
  Search,
  CheckCircle,
  AlertCircle,
  FileText,
  Filter,
  GraduationCap,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { AddStudentModal, RecordPaymentModal } from './Modals';
import { NavTab } from './Sidebar';

interface AssistantAdminViewProps {
  onNavigate?: (tab: NavTab) => void;
}

export function AssistantAdminView({ onNavigate }: AssistantAdminViewProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const filteredStudents = mockStudents.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm);
    const matchesGroup = selectedGroup === 'all' || s.groupName === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const totalCollected = mockPayments.reduce((acc, p) => acc + p.amount, 0);
  const debtors = mockStudents.filter((s) => s.balance < 0);
  const totalDebt = debtors.reduce((acc, s) => acc + Math.abs(s.balance), 0);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col gap-4 rounded-3xl border border-blue-200/80 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-indigo-500/10 p-6 shadow-sm dark:border-blue-900/40 dark:from-blue-950/40 dark:to-indigo-950/40 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
              <ShieldCheck className="mr-1.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
              Yordamchi Admin Paneli (Assistant Administrator)
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              To'liq Operatsion Nazorat
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            O'quvchilar Qabuli, Kassa va Guruhlar Nazorati
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Yangi o'quvchilarni guruhga biriktirish, kassa to'lovlarini qabul qilish va barcha jarayonlarni nazorat qilish.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/25 hover:from-brand-500 hover:to-indigo-500 transition-all"
          >
            <UserPlus className="h-4 w-4" />
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

      {/* KPI Stats for Assistant Admin */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div
          onClick={() => onNavigate?.('students')}
          className="cursor-pointer group rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-xs transition-all hover:border-blue-400 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/90 dark:hover:border-blue-500/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Jami Ro'yxatdagi O'quvchilar
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {mockStudents.length} nafar
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {debtors.length} ta o'quvchida qarzdorlik bor
          </p>
        </div>

        <div
          onClick={() => onNavigate?.('tuition')}
          className="cursor-pointer group rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-xs transition-all hover:border-emerald-400 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/90 dark:hover:border-emerald-500/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Kassa Tushumi
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatMoney(totalCollected)} UZS
          </div>
          <p className="mt-1 text-xs text-emerald-600 font-bold">
            Barcha kvitansiyalar tasdiqlangan
          </p>
        </div>

        <div
          onClick={() => onNavigate?.('tuition')}
          className="cursor-pointer group rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-xs transition-all hover:border-rose-400 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/90 dark:hover:border-rose-500/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Undirilishi Kerak Bo'lgan Qarzlar
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatMoney(totalDebt)} UZS
          </div>
          <p className="mt-1 text-xs text-rose-500 font-bold">
            Tezkor xabarnoma yuborish tavsiya etiladi
          </p>
        </div>
      </div>

      {/* Quick Access Shortcuts */}
      <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/90">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Admin Nazorat Bo'limlari
          </span>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
            Barcha operatsiyalar ochiq
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {[
            { id: 'students' as NavTab, label: "O'quvchilar Daftari", icon: Users, color: 'text-blue-500' },
            { id: 'tuition' as NavTab, label: "To'lovlar & Kvitansiyalar", icon: CreditCard, color: 'text-emerald-500' },
            { id: 'groups' as NavTab, label: "Guruhlar", icon: GraduationCap, color: 'text-purple-500' },
            { id: 'timetable' as NavTab, label: "Dars Jadvali", icon: Calendar, color: 'text-indigo-500' },
            { id: 'attendance' as NavTab, label: "Davomat Jurnali", icon: CheckCircle2, color: 'text-emerald-500' },
            { id: 'reports' as NavTab, label: "Hisobotlar", icon: FileText, color: 'text-amber-500' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id)}
                className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 text-xs font-bold text-slate-800 hover:bg-blue-50 hover:border-blue-300 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:border-blue-500/50 transition-all text-left"
              >
                <Icon className={`h-4 w-4 ${item.color} shrink-0`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/90 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="O'quvchi ismi yoki telefoni bo'yicha qidiruv..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 outline-none focus:border-brand-500 focus:bg-white dark:border-slate-800 dark:bg-slate-800/80 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-200"
          >
            <option value="all">Barcha guruhlar</option>
            {mockGroups.map((g) => (
              <option key={g.id} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Registry Table */}
      <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/90">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              O'quvchilar Boshqaruv Daftari ({filteredStudents.length} ta)
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Qabul qilingan o'quvchilar, telefon raqamlari va hisob holati
            </p>
          </div>
          <button
            onClick={() => onNavigate?.('students')}
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>Kengaytirilgan boshqaruv</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 dark:border-slate-800">
                <th className="pb-3 font-bold">O'quvchi F.I.Sh</th>
                <th className="pb-3 font-bold">Guruh</th>
                <th className="pb-3 font-bold">Telefon</th>
                <th className="pb-3 font-bold">Hisob Balansi</th>
                <th className="pb-3 font-bold">Davomat</th>
                <th className="pb-3 font-bold text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredStudents.map((std) => (
                <tr key={std.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-bold text-slate-900 dark:text-white">
                    {std.name}
                  </td>
                  <td className="py-3 font-semibold text-brand-600 dark:text-brand-400">
                    {std.groupName}
                  </td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{std.phone}</td>
                  <td className="py-3">
                    {std.balance < 0 ? (
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        {formatMoney(Math.abs(std.balance))} UZS qarz
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatMoney(std.balance)} UZS to'langan
                      </span>
                    )}
                  </td>
                  <td className="py-3 font-bold">{std.attendanceRate}%</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setIsPaymentOpen(true)}
                      className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 transition-colors"
                    >
                      To'lov olish
                    </button>
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

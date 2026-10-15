'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { mockStudents, mockGroups } from '../../data/mockData';
import { formatMoney } from '../../lib/format';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MoreVertical,
  Key,
  Copy,
} from 'lucide-react';
import { AddStudentModal, RecordPaymentModal } from '../Modals';

export function StudentsTab() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'debt' | 'paid'>('all');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const filteredStudents = mockStudents.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm);
    const matchesGroup = selectedGroup === 'all' || s.groupName === selectedGroup;
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'debt'
        ? s.balance < 0
        : s.balance >= 0;
    return matchesSearch && matchesGroup && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              O'quvchilar Boshqaruvi
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Markazdagi barcha o'quvchilar profillari, to'lov balanslari va davomat statistikasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>Yangi o'quvchi qo'shish</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="O'quvchi ismi yoki telefoni bo'yicha qidiruv..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 outline-none focus:border-brand-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Group Filter */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">Barcha guruhlar</option>
            {mockGroups.map((g) => (
              <option key={g.id} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-medium dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => setStatusFilter('all')}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                statusFilter === 'all'
                  ? 'bg-white font-bold text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Hammasi
            </button>
            <button
              onClick={() => setStatusFilter('debt')}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                statusFilter === 'debt'
                  ? 'bg-rose-100 font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Qarzdorlar
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                statusFilter === 'paid'
                  ? 'bg-emerald-100 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              To'laganlar
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            Topilgan o'quvchilar: {filteredStudents.length} nafar
          </span>
          <span className="text-xs text-slate-400">
            Oxirgi yangilanish: bugun
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 dark:border-slate-800">
                <th className="pb-3 font-semibold">O'quvchi F.I.Sh</th>
                <th className="pb-3 font-semibold">Guruh va Kurs</th>
                <th className="pb-3 font-semibold">Login & Parol (Portal)</th>
                <th className="pb-3 font-semibold">To'lov Holati</th>
                <th className="pb-3 font-semibold">Davomat</th>
                <th className="pb-3 font-semibold">XP / Tangalar</th>
                <th className="pb-3 font-semibold">Ro'yxat sanasi</th>
                <th className="pb-3 text-right font-semibold">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                    {s.name}
                  </td>
                  <td className="py-3.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {s.groupName}
                    </span>
                    <div className="text-[10px] text-slate-400">{s.course}</div>
                  <td className="py-3.5">
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {s.phone}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[10px] text-brand-600 dark:text-brand-400 font-bold bg-brand-50 dark:bg-brand-950/60 px-1.5 py-0.5 rounded-md border border-brand-200/60 dark:border-brand-800/60">
                        🔑 {s.password || '12345678'}
                      </span>
                      <button
                        type="button"
                        title="Login va parolni nusxalash"
                        onClick={() => {
                          navigator.clipboard.writeText(`O'quvchi: ${s.name}\nLogin: ${s.phone}\nParol: ${s.password || '12345678'}`);
                          alert(`Login va parol nusxalandi:\nLogin: ${s.phone}\nParol: ${s.password || '12345678'}`);
                        }}
                        className="p-0.5 rounded-md text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5">
                    {s.balance < 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                        <AlertCircle className="h-3 w-3" />
                        {formatMoney(Math.abs(s.balance))} UZS qarz
                      </span>
                    ) : s.balance > 0 ? (
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                        +{formatMoney(s.balance)} UZS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <CheckCircle className="h-3 w-3" />
                        To'langan
                      </span>
                    )}
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-16 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full ${s.attendanceRate >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${s.attendanceRate}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {s.attendanceRate}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 font-semibold text-brand-600 dark:text-brand-400">
                    {s.xp} XP • {s.coins} 🪙
                  </td>
                  <td className="py-3.5 text-slate-400">{s.joinedDate}</td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => setIsPaymentOpen(true)}
                      className="rounded-lg bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 transition-colors"
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

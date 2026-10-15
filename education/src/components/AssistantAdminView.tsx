'use client';

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { mockStudents, mockPayments, mockGroups } from '../data/mockData';
import {
  Users,
  CreditCard,
  UserPlus,
  Search,
  CheckCircle,
  AlertCircle,
  FileText,
  Filter,
} from 'lucide-react';
import { AddStudentModal, RecordPaymentModal } from './Modals';

export function AssistantAdminView() {
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

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col gap-4 rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-indigo-500/10 p-5 dark:border-blue-900/40 dark:from-blue-950/30 dark:to-indigo-950/30 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
            Yordamchi Admin Paneli (Assistant Administrator)
          </span>
          <h1 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            O'quvchilar Qabuli va To'lovlar Nazorati
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Yangi o'quvchilarni guruhga biriktirish, kassa to'lovlarini qabul qilish va kvitansiyalar chiqarish.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 transition-all"
          >
            <UserPlus className="h-4 w-4" />
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

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
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
        </div>
      </div>

      {/* Students Registry Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            O'quvchilar Ro'yxati ({filteredStudents.length} nafar)
          </h2>
          <span className="text-xs text-slate-500">
            Davomat va o'qish to'lovi balansi
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 dark:border-slate-800">
                <th className="pb-3 font-semibold">O'quvchi F.I.Sh</th>
                <th className="pb-3 font-semibold">Guruhi va Kursi</th>
                <th className="pb-3 font-semibold">Telefon</th>
                <th className="pb-3 font-semibold">To'lov Holati</th>
                <th className="pb-3 font-semibold">Davomat</th>
                <th className="pb-3 font-semibold">XP / Tangalar</th>
                <th className="pb-3 text-right font-semibold">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-bold text-slate-900 dark:text-white">
                    {s.name}
                  </td>
                  <td className="py-3">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {s.groupName}
                    </span>
                    <div className="text-[10px] text-slate-400">{s.course}</div>
                  </td>
                  <td className="py-3 text-slate-500">{s.phone}</td>
                  <td className="py-3">
                    {s.balance < 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                        <AlertCircle className="h-3 w-3" />
                        {Math.abs(s.balance).toLocaleString()} UZS qarz
                      </span>
                    ) : s.balance > 0 ? (
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                        +{s.balance.toLocaleString()} UZS ortiqcha
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <CheckCircle className="h-3 w-3" />
                        To'langan
                      </span>
                    )}
                  </td>
                  <td className="py-3">
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
                  <td className="py-3 font-semibold text-brand-600">
                    {s.xp} XP • {s.coins} 🪙
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setIsPaymentOpen(true)}
                      className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 transition-colors"
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

      {/* Recent Cashier Payment Receipts */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <FileText className="h-4 w-4 text-emerald-600" />
          <span>Oxirgi Qabul Qilingan To'lov Kvitansiyalari</span>
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 dark:border-slate-800">
                <th className="pb-3 font-semibold">Kvitansiya №</th>
                <th className="pb-3 font-semibold">O'quvchi</th>
                <th className="pb-3 font-semibold">Guruh</th>
                <th className="pb-3 font-semibold">Summa</th>
                <th className="pb-3 font-semibold">To'lov Usuli</th>
                <th className="pb-3 font-semibold">Vaqti</th>
                <th className="pb-3 font-semibold">Kassir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockPayments.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 font-mono font-bold text-brand-600">{p.receiptNumber}</td>
                  <td className="py-3 font-bold text-slate-900 dark:text-white">{p.studentName}</td>
                  <td className="py-3 text-slate-600 dark:text-slate-300">{p.groupName}</td>
                  <td className="py-3 font-bold text-emerald-600">{p.amount.toLocaleString()} UZS</td>
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

      <AddStudentModal isOpen={isAddStudentOpen} onClose={() => setIsAddStudentOpen(false)} />
      <RecordPaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />
    </div>
  );
}

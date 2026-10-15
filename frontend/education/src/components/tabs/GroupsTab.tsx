'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { mockGroups } from '../../data/mockData';
import { formatMoney } from '../../lib/format';
import {
  GraduationCap,
  Plus,
  Clock,
  DoorOpen,
  User,
  Users,
  Search,
  BookOpen,
} from 'lucide-react';

export function GroupsTab() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGroups = mockGroups.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <GraduationCap className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              O'quv Guruhlari va Kurslar
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Markazdagi barcha faol guruhlar, dars vaqtlari, xonalar va to'lov shartnomalari.
          </p>
        </div>

        <button
          onClick={() => alert("Yangi guruh ochish oynasi (Guruh nomi, yo'nalish, ustoz va dars vaqti belgilanadi).")}
          className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Yangi guruh ochish</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Guruh nomi, kurs yoki o'qituvchi bo'yicha qidiruv..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 shadow-xs outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        />
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {filteredGroups.map((g) => (
          <div
            key={g.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    {g.course}
                  </span>
                  <h3 className="mt-1.5 text-base font-bold text-slate-900 dark:text-white">
                    {g.name}
                  </h3>
                </div>
                <span className="rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {formatMoney(g.monthlyFee)} UZS/oy
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span>Ustoz: <strong className="text-slate-900 dark:text-white">{g.teacherName}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <DoorOpen className="h-3.5 w-3.5 text-slate-400" />
                  <span>O'quv xonasi: <strong className="text-slate-900 dark:text-white">{g.room}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Grafigi: <strong className="text-brand-600 dark:text-brand-400">{g.days} ({g.time})</strong></span>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Users className="h-3.5 w-3.5" />
                  <span>O'quvchilar: <strong className="text-slate-800 dark:text-slate-200">{g.studentsCount} / 20</strong></span>
                </div>

                <button
                  onClick={() => alert(`"${g.name}" guruhi jurnali va o'quvchilar ro'yxati ochildi.`)}
                  className="rounded-lg bg-brand-50 px-3 py-1 font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-300 transition-colors"
                >
                  Guruh jurnali
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

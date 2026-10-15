'use client';

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { mockGroups, mockStudents, mockHomeworks } from '../data/mockData';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  FileCheck,
  Send,
  Plus,
  Sparkles,
} from 'lucide-react';

export function TeacherView() {
  const { t } = useLanguage();
  const [selectedGroup, setSelectedGroup] = useState(mockGroups[0]?.name || '');

  // Attendance state for the selected group
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>({
    'std-1': 'present',
    'std-3': 'late',
  });

  const [savedAttendanceMsg, setSavedAttendanceMsg] = useState(false);

  const groupStudents = mockStudents.filter(
    (s) => s.groupName === selectedGroup || selectedGroup === mockGroups[0]?.name
  );

  const handleMark = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = () => {
    setSavedAttendanceMsg(true);
    setTimeout(() => setSavedAttendanceMsg(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-brand-500/10 p-5 dark:border-amber-900/40 dark:from-amber-950/30 dark:to-brand-950/30 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
            Ustoz Kabineti (Teacher Workspace)
          </span>
          <h1 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            Guruhlar Davomati va Uyga Vazifalar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dars davomatini belgilash, uyga vazifalarni tekshirish va o'quvchilarga XP ballar berish.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-amber-300 bg-white px-3.5 py-1.5 text-xs font-bold text-amber-800 shadow-xs dark:border-amber-800 dark:bg-slate-900 dark:text-amber-300">
            Ustoz: Temur Aliyev
          </span>
        </div>
      </div>

      {/* Group Selector */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-brand-600" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Mening guruhim:
          </span>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {mockGroups.map((g) => (
              <option key={g.id} value={g.name}>
                {g.name} ({g.days} • {g.time})
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Dars sanasi: Bugun (2026-10-15)
        </span>
      </div>

      {/* Take Attendance Component */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Bugungi Dars Davomatini Belgilash</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Har bir o'quvchi uchun davomat tugmasini bosing va saqlang
            </p>
          </div>

          <button
            onClick={handleSaveAttendance}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Davomatni Saqlash</span>
          </button>
        </div>

        {savedAttendanceMsg && (
          <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="h-4 w-4" />
            <span>Davomat muvaffaqiyatli saqlandi va o'quvchilar portalida yangilandi!</span>
          </div>
        )}

        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {groupStudents.map((s) => {
            const currentStatus = attendance[s.id] || 'present';

            return (
              <div key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {s.name}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Davomat ko'rsatkichi: {s.attendanceRate}% • Balans: {s.xp} XP
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleMark(s.id, 'present')}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      currentStatus === 'present'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Bor
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMark(s.id, 'late')}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      currentStatus === 'late'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Kechikdi
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMark(s.id, 'absent')}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      currentStatus === 'absent'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Yo'q
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Homeworks Grading & Review */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-brand-600" />
            <span>Berilgan Uyga Vazifalar va Tekshirish</span>
          </h2>
          <span className="text-xs text-brand-600 font-semibold cursor-pointer hover:underline">
            + Yangi vazifa yuklash
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {mockHomeworks.map((hw) => (
            <div
              key={hw.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs dark:border-slate-800 dark:bg-slate-850"
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {hw.title}
                </span>
                <div className="mt-1 text-slate-500">
                  Guruh: {hw.groupName} • Muddat: <span className="font-semibold text-rose-600">{hw.dueDate}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {hw.submittedCount} / {hw.totalStudents} topshirgan
                </div>
                <button
                  onClick={() => alert(`"${hw.title}" vazifasi bo'yicha o'quvchilar ishlari ochildi.`)}
                  className="mt-1 rounded-lg bg-brand-50 px-2.5 py-1 font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-300"
                >
                  Tekshirish va Baholash
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

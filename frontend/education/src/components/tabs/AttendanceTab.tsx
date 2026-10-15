'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { mockGroups, mockStudents } from '../../data/mockData';
import {
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Calendar,
  Save,
  Users,
} from 'lucide-react';

export function AttendanceTab() {
  const { t } = useLanguage();
  const [selectedGroup, setSelectedGroup] = useState(mockGroups[0]?.name || '');
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>({
    'std-1': 'present',
    'std-3': 'late',
  });
  const [saved, setSaved] = useState(false);

  const groupStudents = mockStudents.filter(
    (s) => s.groupName === selectedGroup || selectedGroup === mockGroups[0]?.name
  );

  const handleMark = (id: string, val: 'present' | 'absent' | 'late') => {
    setAttendance((prev) => ({ ...prev, [id]: val }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Dars Davomati Jurnali
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            O'quvchilarning har kungi darslarga qatnashish nazorati va elektron qaydnoma.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
        >
          <Save className="h-4 w-4" />
          <span>Davomatni Saqlash</span>
        </button>
      </div>

      {/* Select Group & Date Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-brand-600" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Guruhni tanlang:
          </span>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {mockGroups.map((g) => (
              <option key={g.id} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>Sana: <strong>Bugun, 2026-10-15</strong></span>
        </div>
      </div>

      {saved && (
        <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Tanlangan guruh bo'yicha davomat muvaffaqiyatli saqlandi!</span>
        </div>
      )}

      {/* Students Attendance Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {selectedGroup} O'quvchilari
          </h2>
          <span className="text-xs text-slate-400">
            Jami: {groupStudents.length} nafar o'quvchi
          </span>
        </div>

        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {groupStudents.map((s) => {
            const currentStatus = attendance[s.id] || 'present';

            return (
              <div key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {s.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Telefon: {s.phone} • Umumiy davomat ko'rsatkichi: {s.attendanceRate}%
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleMark(s.id, 'present')}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
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
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
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
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
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
    </div>
  );
}

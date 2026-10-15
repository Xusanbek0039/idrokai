'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { mockHomeworks } from '../../data/mockData';
import {
  FileCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export function HomeworkTab() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
              <FileCheck className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Uyga Vazifalar va O'quvchilar Topshiriqlari
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Berilgan vazifalar holati, topshirilgan ishlar va o'qituvchi baholari.
          </p>
        </div>

        <button
          onClick={() => alert("Yangi vazifa yaratish oynasi (Mavzu, fayl yuklash va muddat).")}
          className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Yangi vazifa berish</span>
        </button>
      </div>

      {/* Homework List */}
      <div className="space-y-4">
        {mockHomeworks.map((hw) => (
          <div
            key={hw.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {hw.groupName}
                </span>
                <span className="text-xs text-slate-400">Ustoz: {hw.teacherName}</span>
              </div>
              <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                {hw.title}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5 text-rose-500" />
                <span>Topshirish muddati: <strong className="text-rose-600">{hw.dueDate}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right text-xs">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {hw.submittedCount} / {hw.totalStudents}
                </div>
                <div className="text-[11px] text-slate-400">O'quvchi topshirdi</div>
              </div>

              <button
                onClick={() => alert(`"${hw.title}" vazifasi bo'yicha o'quvchilar javoblari va baholash oynasi ochildi.`)}
                className="rounded-xl bg-brand-50 px-3.5 py-2 text-xs font-bold text-brand-700 hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-300 transition-colors"
              >
                Tekshirish va Baholash
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

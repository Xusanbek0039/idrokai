'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { mockExams } from '../../data/mockData';
import {
  Award,
  Plus,
  Calendar,
  DoorOpen,
  CheckCircle2,
  BarChart,
} from 'lucide-react';

export function ExamsTab() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Award className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Testlar va Imtihonlar Nazorati
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Mock imtihonlar, oraliq nazorat testlari va natijalar jurnali.
          </p>
        </div>

        <button
          onClick={() => alert("Yangi imtihon rejalashtirish formasi.")}
          className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Yangi imtihon rejalashtirish</span>
        </button>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {mockExams.map((ex) => (
          <div
            key={ex.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <span className="rounded-md bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                {ex.groupName}
              </span>
              <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                {ex.title}
              </h3>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Sana va vaqt: <strong>{ex.date}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <DoorOpen className="h-3.5 w-3.5 text-slate-400" />
                  <span>Xona: <strong>{ex.room}</strong></span>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Maksimal ball: </span>
                <strong className="text-brand-600">{ex.maxScore}</strong>
                {ex.averageScore && (
                  <span className="ml-2 text-emerald-600 font-bold">
                    (O'rtacha: {ex.averageScore})
                  </span>
                )}
              </div>

              <button
                onClick={() => alert(`"${ex.title}" imtihoni natijalar daftari ochildi.`)}
                className="rounded-lg bg-brand-50 px-3 py-1 font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-300"
              >
                Natijalar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

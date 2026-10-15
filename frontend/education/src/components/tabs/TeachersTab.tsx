'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { mockTeachers } from '../../data/mockData';
import {
  BookOpen,
  UserPlus,
  Phone,
  GraduationCap,
  Users,
  Award,
} from 'lucide-react';

export function TeachersTab() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <BookOpen className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              O'qituvchilar Shtati va Yuklamalari
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Markazdagi ustozlar, ularning mutaxassisligi, guruhlari va hisob-kitob modellari.
          </p>
        </div>

        <button
          onClick={() => alert("Yangi o'qituvchini ishga qabul qilish formasi.")}
          className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 transition-all"
        >
          <UserPlus className="h-4 w-4" />
          <span>Yangi o'qituvchi qo'shish</span>
        </button>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {mockTeachers.map((tch) => (
          <div
            key={tch.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
          >
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 font-bold text-white shadow-md shadow-amber-500/20">
                  {tch.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {tch.name}
                  </h3>
                  <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    {tch.subject}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-850">
                <div>
                  <span className="text-[10px] text-slate-400">Guruhlar soni:</span>
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                    <GraduationCap className="h-3.5 w-3.5 text-brand-600" />
                    <span>{tch.groupsCount} ta guruh</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Jami o'quvchilar:</span>
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                    <Users className="h-3.5 w-3.5 text-blue-600" />
                    <span>{tch.studentsCount} nafar</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{tch.phone}</span>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {tch.salaryType}
                </span>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => alert(`${tch.name}ning dars jadvali ochildi.`)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Dars grafigi
              </button>
              <button
                onClick={() => alert(`${tch.name} bilan bog'lanish: ${tch.phone}`)}
                className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-300"
              >
                Bog'lanish
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

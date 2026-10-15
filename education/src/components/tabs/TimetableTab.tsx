'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { mockTimetable, mockGroups } from '../../data/mockData';
import {
  Calendar,
  Clock,
  DoorOpen,
  User,
  Plus,
  Layers,
} from 'lucide-react';

export function TimetableTab() {
  const { t } = useLanguage();
  const [selectedDay, setSelectedDay] = useState('Dushanba');

  const days = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Calendar className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Haftalik Dars Jadvali
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Dars vaqtlari, haftaning toq/juft kunlari, o'quv xonalari va ustozlar grafigi.
          </p>
        </div>

        <button
          onClick={() => alert("Yangi dars jadvali bandini qo'shish.")}
          className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Jadvalga dars qo'shish</span>
        </button>
      </div>

      {/* Days Tabs */}
      <div className="flex overflow-x-auto gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap ${
              selectedDay === day
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Schedule Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-brand-600" />
            <span>{selectedDay} Kuni Dars Mashg'ulotlari</span>
          </h2>
          <span className="text-xs text-slate-400">
            4 ta rejalashtirilgan seans
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {mockTimetable.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4.5 transition-all hover:border-brand-400 dark:border-slate-800 dark:bg-slate-850 dark:hover:border-brand-600"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-800 dark:bg-brand-900/60 dark:text-brand-300">
                    <Clock className="h-3 w-3" />
                    {item.time}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                    <DoorOpen className="h-3.5 w-3.5" />
                    {item.room}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                  {item.subject}
                </h3>
                <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Guruh: <strong className="text-slate-900 dark:text-white">{item.groupName}</strong>
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  Ustoz: <strong className="text-slate-700 dark:text-slate-300">{item.teacher}</strong>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-200/60 pt-3 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => alert(`"${item.groupName}" guruhi darsiga davomat ochildi.`)}
                  className="rounded-lg bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-300"
                >
                  Davomat olish
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { mockTimetable, mockGroups, mockTeachers } from '../data/mockData';
import {
  Calendar,
  DoorOpen,
  Clock,
  Briefcase,
  Users,
  Award,
  Layers,
} from 'lucide-react';

export function OperationsManagerView() {
  const { t } = useLanguage();
  const [selectedDay, setSelectedDay] = useState('Dushanba');

  const days = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

  const classrooms = [
    { name: 'Xona 102 (Audio)', capacity: 20, equipment: 'Proyektor + Audio tizimi', status: 'Band (14:00-16:00)' },
    { name: 'Kompyuter Lab 1', capacity: 16, equipment: '16x Core i7 PC + 500Mbps', status: 'Band (18:30-20:30)' },
    { name: 'Xona 105 (Katta)', capacity: 25, equipment: 'Interaktiv doska', status: 'Band (10:00-12:00)' },
    { name: 'Xona 201 (Aniq fanlar)', capacity: 18, equipment: 'Marker doska', status: 'Band (16:00-18:00)' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 p-5 dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-indigo-950/30 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
            Ish Boshqaruvchi Paneli (Operations Manager)
          </span>
          <h1 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            Dars Jadvallari va O'quv Xonalari Taqsimoti
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dars jadvallarini rejalashtirish, xonalar bandligi va o'qituvchilar dars soatlari monitoringi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-emerald-300 bg-white px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-xs dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-300">
            4 ta xona faol bandlikda
          </span>
        </div>
      </div>

      {/* Days Tabs */}
      <div className="flex overflow-x-auto gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`flex-1 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
              selectedDay === day
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Timetable Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-brand-600" />
          <span>{selectedDay} Kunlik Dars Grafigi</span>
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {mockTimetable.map((tt) => (
            <div
              key={tt.id}
              className="flex items-start justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:border-brand-300 dark:border-slate-800 dark:bg-slate-850 dark:hover:border-brand-700"
            >
              <div>
                <span className="inline-flex items-center gap-1 rounded-md bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-800 dark:bg-brand-900/60 dark:text-brand-300">
                  <Clock className="h-3 w-3" />
                  {tt.time}
                </span>
                <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                  {tt.subject}
                </h3>
                <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Guruh: <span className="font-semibold">{tt.groupName}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Ustoz: <span className="font-medium text-slate-700 dark:text-slate-300">{tt.teacher}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                  <DoorOpen className="h-3.5 w-3.5" />
                  {tt.room}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Classrooms Utilization Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <DoorOpen className="h-4 w-4 text-emerald-600" />
          <span>O'quv Xonalari va Uskunalari Holati</span>
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {classrooms.map((c, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-850"
            >
              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                <span>{c.name}</span>
                <span className="text-[11px] text-slate-400">Sig'im: {c.capacity}</span>
              </div>
              <p className="mt-1 text-slate-500 dark:text-slate-400 text-[11px]">
                {c.equipment}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-slate-200/70 pt-2 dark:border-slate-800">
                <span className="text-[10px] text-slate-400">Holat:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px]">
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

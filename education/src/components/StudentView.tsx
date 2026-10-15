'use client';

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  GraduationCap,
  Award,
  Coins,
  CheckCircle2,
  Calendar,
  FileCheck,
  CreditCard,
  Send,
  Sparkles,
  Trophy,
  Clock,
  Check,
} from 'lucide-react';

export function StudentView() {
  const { t } = useLanguage();
  const [submissionModal, setSubmissionModal] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const student = {
    name: 'Abdurashid Valiyev',
    groupName: 'IELTS Intensive 7.5',
    teacher: 'Temur Aliyev',
    room: 'Xona 102 (Audio)',
    days: 'Dushanba - Chorshanba - Juma (14:00 - 16:00)',
    xp: 1450,
    coins: 85,
    rank: 2,
    attendanceRate: 94,
    balance: -250000, // oylik to'lovdan 250,000 so'm qolgan
  };

  const myHomeworks = [
    {
      id: 'hw-1',
      title: 'Writing Task 2: Opinion Essay on AI in Education',
      teacher: 'Temur Aliyev',
      dueDate: '18-oktyabr, 23:59 gacha',
      status: submitted ? 'submitted' : 'pending',
      xpReward: '+100 XP va 15 🪙',
    },
    {
      id: 'hw-old',
      title: 'Reading Test: Cambridge IELTS 18 Test 2',
      teacher: 'Temur Aliyev',
      dueDate: '12-oktyabr',
      status: 'graded',
      grade: '8.0 / 9.0 (40 tadan 35 ta to\'g\'ri)',
      xpReward: '+120 XP',
    },
  ];

  const groupLeaderboard = [
    { rank: 1, name: 'Madina Ismoilova', xp: 1820, coins: 120, badge: '🥇 Oltin Lider' },
    { rank: 2, name: 'Abdurashid Valiyev (Siz)', xp: 1450, coins: 85, badge: '🥈 Kumush' },
    { rank: 3, name: 'Jasur Bekmurodov', xp: 1390, coins: 80, badge: '🥉 Bronza' },
    { rank: 4, name: 'Shaxnoza Rahimova', xp: 1200, coins: 70, badge: 'Yulduz' },
    { rank: 5, name: 'Sarvar Qosimov', xp: 950, coins: 40, badge: 'Faol' },
  ];

  const handleSubmitHomework = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setSubmissionModal(false);
    alert('Uyga vazifangiz muvaffaqiyatli topshirildi va tekshirish uchun ustozga yuborildi!');
  };

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="flex flex-col gap-4 rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-brand-500/10 p-5 dark:border-indigo-900/40 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-brand-950/30 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
            <GraduationCap className="h-3.5 w-3.5" />
            O'quvchi Shaxsiy Portali (Student Dashboard)
          </span>
          <h1 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            Salom, {student.name}!
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Guruh: <span className="font-semibold text-slate-700 dark:text-slate-200">{student.groupName}</span> • Ustoz: {student.teacher}
          </p>
        </div>

        {/* Gamification Trophy Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 shadow-xs dark:border-amber-700/60 dark:from-amber-950/40 dark:to-orange-950/40">
            <Trophy className="h-6 w-6 text-amber-500" />
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">
                Guruhda {student.rank}-o'rin
              </div>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {student.xp} XP • {student.coins} 🪙
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards: Timetable, Attendance, Tuition */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Timetable card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Navbatdagi Dars
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
            Bugun, 14:00 - 16:00
          </div>
          <p className="mt-1 text-xs text-brand-600 dark:text-brand-400 font-medium">
            {student.room}
          </p>
        </div>

        {/* Attendance card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Mening Davomatim
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {student.attendanceRate}%
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            A'lo ko'rsatkich (Darslarni qoldirmayapsiz)
          </p>
        </div>

        {/* Tuition card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              O'qish To'lovi Holati
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-base font-bold text-rose-600 dark:text-rose-400">
            {Math.abs(student.balance).toLocaleString()} UZS to'lanishi kerak
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Oylik shartnoma: 750,000 UZS (500,000 to'langan)
          </p>
        </div>
      </div>

      {/* Grid: Homework assignments & Leaderboard */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Homework list */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-brand-600" />
              <span>Mening Uyga Vazifalarim</span>
            </h2>
            <span className="text-xs text-slate-400">
              {myHomeworks.length} ta vazifa
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {myHomeworks.map((hw) => (
              <div
                key={hw.id}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs dark:border-slate-800 dark:bg-slate-850"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {hw.title}
                    </h3>
                    <div className="mt-1 text-slate-500">
                      Ustoz: {hw.teacher} • Muddat: <span className="font-semibold text-rose-600">{hw.dueDate}</span>
                    </div>
                    <div className="mt-1 text-brand-600 font-bold">
                      Mukofot: {hw.xpReward}
                    </div>
                  </div>

                  <div>
                    {hw.status === 'submitted' ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <Check className="h-3.5 w-3.5" />
                        Topshirildi
                      </span>
                    ) : hw.status === 'graded' ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2.5 py-1 font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                        Baho: {hw.grade}
                      </span>
                    ) : (
                      <button
                        onClick={() => setSubmissionModal(true)}
                        className="rounded-lg bg-brand-600 px-3 py-1 font-bold text-white shadow-xs hover:bg-brand-700 transition-colors flex items-center gap-1"
                      >
                        <Send className="h-3 w-3" />
                        Topshirish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gamification Group Leaderboard */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Guruhdagi O'quvchilar Reytingi (Leaderboard)</span>
            </h2>
            <span className="text-xs text-amber-600 font-bold">
              Haftalik yangilanish
            </span>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {groupLeaderboard.map((item) => (
              <div
                key={item.rank}
                className={`py-3 flex items-center justify-between text-xs px-2 rounded-xl transition-colors ${
                  item.name.includes('(Siz)')
                    ? 'bg-brand-50/80 dark:bg-brand-950/40 font-bold border border-brand-200 dark:border-brand-800'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                      item.rank === 1
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                        : item.rank === 2
                        ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                        : item.rank === 3
                        ? 'bg-amber-200/60 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {item.rank}
                  </span>
                  <div>
                    <div className="text-slate-900 dark:text-white font-semibold">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {item.badge}
                    </div>
                  </div>
                </div>

                <div className="text-right font-bold text-brand-600 dark:text-brand-400">
                  {item.xp} XP • {item.coins} 🪙
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Homework Submission Modal */}
      {submissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Uyga vazifani topshirish
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Writing Task 2: Opinion Essay on AI in Education
            </p>

            <form onSubmit={handleSubmitHomework} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Esse matni yoki topshiriq havolasi:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="In my opinion, artificial intelligence plays a crucial role in modern education..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:border-brand-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmissionModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-2 font-bold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700"
                >
                  Topshirish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

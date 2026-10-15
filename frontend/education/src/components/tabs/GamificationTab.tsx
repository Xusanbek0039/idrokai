'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { mockStudents } from '../../data/mockData';
import {
  Award,
  Trophy,
  Coins,
  Gift,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export function GamificationTab() {
  const { t } = useLanguage();

  const sortedStudents = [...mockStudents].sort((a, b) => b.xp - a.xp);

  const rewards = [
    { id: 'rw-1', name: 'IDROK AI Brendli Futbolka', coins: 150, image: '👕', stock: 12 },
    { id: 'rw-2', name: 'Premium Termos-Krujka', coins: 100, image: '☕', stock: 8 },
    { id: 'rw-3', name: 'Maxsus Bloknot va Ruchkalar to\'plami', coins: 50, image: '📓', stock: 25 },
    { id: 'rw-4', name: 'Bepul Rasmiy Mock Imtihon Voucheri', coins: 200, image: '🎟️', stock: 5 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Trophy className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              O'quvchilar Gamifikatsiyasi va Sovrinlar Do'koni
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Darsdagi faollik, uyga vazifalar va imtihonlar uchun berilgan XP va tangalar reytingi.
          </p>
        </div>
      </div>

      {/* Grid: Leaderboard & Rewards Store */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Leaderboard */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Markaz O'quvchilari Reytingi (Top XP)</span>
            </h2>
            <span className="text-xs text-slate-400">
              Haftalik yangilanish
            </span>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {sortedStudents.map((s, idx) => (
              <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                      idx === 0
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                        : idx === 1
                        ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                        : idx === 2
                        ? 'bg-amber-200/60 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {s.name}
                    </div>
                    <div className="text-[10px] text-slate-400">{s.groupName}</div>
                  </div>
                </div>

                <div className="text-right font-bold text-brand-600 dark:text-brand-400">
                  {s.xp} XP • {s.coins} 🪙
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rewards Store */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Gift className="h-4 w-4 text-brand-600" />
              <span>Tangalar Evaziga Sovrinlar Do'koni</span>
            </h2>
            <span className="text-xs text-emerald-600 font-bold">
              Barcha o'quvchilar uchun ochiq
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {rewards.map((rw) => (
              <div
                key={rw.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-850"
              >
                <div>
                  <div className="text-2xl">{rw.image}</div>
                  <h3 className="mt-2 font-bold text-slate-900 dark:text-white">
                    {rw.name}
                  </h3>
                  <div className="mt-1 font-bold text-amber-600 dark:text-amber-400">
                    {rw.coins} 🪙 tanga
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400">Mavjud: {rw.stock} ta</span>
                  <button
                    onClick={() => alert(`"${rw.name}" sovrinini olish uchun so'rov qabul qilindi.`)}
                    className="rounded-lg bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-brand-700"
                  >
                    Almashtirish
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

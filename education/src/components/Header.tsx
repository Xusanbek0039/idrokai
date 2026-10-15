'use client';

import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useRole, EducationRole } from '../context/RoleContext';
import {
  Sun,
  Moon,
  Globe,
  UserCheck,
  ChevronDown,
  GraduationCap,
  Shield,
  Briefcase,
  BookOpen,
  User,
  Sparkles,
  LogOut,
  ShieldCheck,
  Eye,
} from 'lucide-react';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { role, setRole, user, logout, canControlEverything, backendConnected } = useRole();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const roleIcons: Record<EducationRole, React.ReactNode> = {
    edu_owner: <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
    edu_assistant_admin: <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
    edu_operations_manager: <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
    teacher: <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    student: <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
  };

  const roleColors: Record<EducationRole, string> = {
    edu_owner: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    edu_assistant_admin: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    edu_operations_manager: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    teacher: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    student: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  };

  const rolesList: EducationRole[] = [
    'edu_owner',
    'edu_assistant_admin',
    'edu_operations_manager',
    'teacher',
    'student',
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-200 border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/80">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Center name */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-brand-500/25 ring-2 ring-brand-500/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                {t.brandTitle}
              </span>
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-brand-500 to-indigo-600 px-2 py-0.5 text-[10px] font-black text-white shadow-xs">
                PRO
              </span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.centerName}
              </p>
              {backendConnected ? (
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Django Backend Ulangan
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  Django API Tayyor
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Controls: Role Switcher, Language, Theme, Profile, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Interactive Role Switcher / Oversight */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all shadow-xs ${roleColors[role]}`}
            >
              {roleIcons[role]}
              <span className="hidden sm:inline font-bold">
                {t.roles[role]}
              </span>
              <span className="sm:hidden font-bold">
                {role === 'edu_owner' ? 'Owner' : role === 'teacher' ? 'Ustoz' : role === 'student' ? 'Talaba' : 'Admin'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                  <span>{t.switchRole}</span>
                  {canControlEverything && (
                    <span className="text-purple-600 dark:text-purple-400 font-extrabold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Super Nazorat
                    </span>
                  )}
                </div>
                <div className="space-y-1 mt-1">
                  {rolesList.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRole(r);
                        setRoleMenuOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs text-left transition-all ${
                        role === r
                          ? 'bg-brand-50 text-brand-900 dark:bg-brand-950/60 dark:text-brand-200 font-bold border border-brand-200 dark:border-brand-800'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <span className="p-1 rounded-lg bg-white dark:bg-slate-800 shadow-xs border border-slate-200/50 dark:border-slate-700">
                        {roleIcons[r]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{t.roles[r]}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                          {r === 'edu_owner' && "To'liq moliyaviy va umumiy boshqaruv"}
                          {r === 'edu_assistant_admin' && "Barcha o'quvchilar, kassa va guruhlar"}
                          {r === 'edu_operations_manager' && "Jadval, xonalar va darslar"}
                          {r === 'teacher' && "Davomat, vazifalar va baholash"}
                          {r === 'student' && "Darslarim, davomatim va reytingim"}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Language Selector (UZ / RU) */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-0.5 text-xs font-bold dark:border-slate-800 dark:bg-slate-800/80">
            <button
              onClick={() => setLanguage('uz')}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                language === 'uz'
                  ? 'bg-white font-extrabold text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              UZ
            </button>
            <button
              onClick={() => setLanguage('ru')}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                language === 'ru'
                  ? 'bg-white font-extrabold text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              RU
            </button>
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white shadow-xs"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </button>

          {/* User Profile Pill */}
          <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 font-bold text-white text-xs shadow-md shadow-brand-500/20">
              {user.avatarText}
            </div>
            <div className="text-left text-xs">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{user.name}</span>
              </div>
              <div className="text-slate-400 dark:text-slate-500 text-[11px] truncate max-w-[130px]">
                {user.permissionsBadge || user.phone}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            title={language === 'uz' ? 'Tizimdan chiqish' : 'Выйти из системы'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition-all hover:bg-rose-100 hover:text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60 dark:hover:text-rose-200 shadow-xs"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

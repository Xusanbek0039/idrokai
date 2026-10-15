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
} from 'lucide-react';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { role, setRole, user } = useRole();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const roleIcons: Record<EducationRole, React.ReactNode> = {
    edu_owner: <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
    edu_assistant_admin: <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
    edu_operations_manager: <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
    teacher: <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    student: <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
  };

  const roleColors: Record<EducationRole, string> = {
    edu_owner: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    edu_assistant_admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    edu_operations_manager: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    teacher: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    student: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
  };

  const rolesList: EducationRole[] = [
    'edu_owner',
    'edu_assistant_admin',
    'edu_operations_manager',
    'teacher',
    'student',
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-200 border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Center name */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-md shadow-brand-500/25">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                {t.brandTitle}
              </span>
              <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-700/10 dark:bg-brand-950/60 dark:text-brand-300">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.centerName}
            </p>
          </div>
        </div>

        {/* Right Controls: Role Switcher, Language, Theme, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Interactive Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs sm:text-sm font-medium transition-all shadow-sm ${roleColors[role]}`}
            >
              {roleIcons[role]}
              <span className="hidden sm:inline font-semibold">
                {t.roles[role]}
              </span>
              <span className="sm:hidden font-semibold">
                {role === 'edu_owner' ? 'Owner' : role === 'teacher' ? 'O\'qituvchi' : role === 'student' ? 'O\'quvchi' : 'Admin'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
                <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {t.switchRole}
                </div>
                <div className="space-y-1">
                  {rolesList.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRole(r);
                        setRoleMenuOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-left transition-colors ${
                        role === r
                          ? 'bg-brand-50 text-brand-900 dark:bg-brand-950/50 dark:text-brand-200 font-semibold'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="p-1 rounded-md bg-white dark:bg-slate-800 shadow-xs">
                        {roleIcons[r]}
                      </span>
                      <div>
                        <div>{t.roles[r]}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">
                          {r === 'edu_owner' && 'To\'liq moliyaviy va umumiy nazorat'}
                          {r === 'edu_assistant_admin' && 'Mijozlar, to\'lovlar va guruhlar'}
                          {r === 'edu_operations_manager' && 'Jadval, xonalar va darslar'}
                          {r === 'teacher' && 'Davomat, vazifalar va baholash'}
                          {r === 'student' && 'Darslarim, davomatim va reytingim'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Language Selector (UZ / RU) */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium dark:border-slate-800 dark:bg-slate-800/80">
            <button
              onClick={() => setLanguage('uz')}
              className={`rounded-md px-2.5 py-1 transition-all ${
                language === 'uz'
                  ? 'bg-white font-bold text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              UZ
            </button>
            <button
              onClick={() => setLanguage('ru')}
              className={`rounded-md px-2.5 py-1 transition-all ${
                language === 'ru'
                  ? 'bg-white font-bold text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
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
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </button>

          {/* User Profile Pill */}
          <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 font-semibold text-white text-xs shadow-sm">
              {user.avatarText}
            </div>
            <div className="text-left text-xs">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {user.name}
              </div>
              <div className="text-slate-400 dark:text-slate-500 truncate max-w-[120px]">
                {user.phone}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

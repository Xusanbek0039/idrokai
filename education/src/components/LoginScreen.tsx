'use client';

import React, { useState } from 'react';
import { useRole, demoAccounts, EducationRole } from '../context/RoleContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  GraduationCap,
  Shield,
  UserCheck,
  Briefcase,
  BookOpen,
  ArrowRight,
  Sun,
  Moon,
  Lock,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export function LoginScreen() {
  const { login } = useRole();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const roleIcons: Record<EducationRole, React.ReactNode> = {
    edu_owner: <Shield className="h-5 w-5 text-purple-500" />,
    edu_assistant_admin: <UserCheck className="h-5 w-5 text-blue-500" />,
    edu_operations_manager: <Briefcase className="h-5 w-5 text-emerald-500" />,
    teacher: <BookOpen className="h-5 w-5 text-amber-500" />,
    student: <GraduationCap className="h-5 w-5 text-indigo-500" />,
  };

  const roleBadges: Record<EducationRole, string> = {
    edu_owner: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/80',
    edu_assistant_admin: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/80',
    edu_operations_manager: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
    teacher: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/80',
    student: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80',
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError(language === 'uz' ? 'Iltimos, login yoki telefon raqamingizni kiriting.' : 'Пожалуйста, введите логин или телефон.');
      return;
    }

    const success = await login(username, password);
    if (!success) {
      setError(
        language === 'uz'
          ? "Login yoki parol noto'g'ri. Quyidagi tezkor rollardan birini tanlashingiz mumkin."
          : 'Неверный логин или пароль. Вы можете выбрать одну из демо-ролей ниже.'
      );
    }
  };

  const handleQuickLogin = async (role: EducationRole) => {
    await login(role);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 py-12 transition-colors duration-300 bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[600px] rounded-full bg-gradient-to-tr from-brand-600/20 via-indigo-600/20 to-purple-500/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 h-[400px] w-[500px] rounded-full bg-gradient-to-tr from-emerald-600/10 via-cyan-600/10 to-transparent blur-[120px]" />

      {/* Top Floating Controls: Dark/Light Mode and Language */}
      <div className="absolute top-5 right-5 sm:top-8 sm:right-8 flex items-center gap-2.5 z-20">
        {/* Language Selector */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-white/80 p-1 shadow-xs backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={() => setLanguage('uz')}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
              language === 'uz'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            UZ
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ru')}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
              language === 'ru'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            RU
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-700 shadow-xs backdrop-blur-md transition-all hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-600" />
          )}
        </button>
      </div>

      {/* Main Login Container */}
      <div className="w-full max-w-4xl relative z-10">
        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-brand-500/30 mb-4 ring-4 ring-brand-500/20">
            <GraduationCap className="h-9 w-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            IDROK AI Education
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {language === 'uz'
              ? "Zamonaviy o'quv markazni avtomatlashtirish, qabul, moliya, davomat va LMS platformasi"
              : 'Современная платформа управления учебным центром, приемом, финансами и LMS'}
          </p>
        </div>

        {/* Dual Card Grid: Form on left/top, Quick Roles on right/bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Traditional Login Form */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white/90 p-6 sm:p-8 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/90">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {language === 'uz' ? 'Xavfsiz Tizimga Kirish' : 'Безопасный вход'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {language === 'uz' ? 'Hisobingizga kiring' : 'Войдите в аккаунт'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
                {language === 'uz'
                  ? 'Foydalanuvchi login va parolini kiriting'
                  : 'Введите логин и пароль пользователя'}
              </p>

              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'uz' ? 'Login yoki Telefon' : 'Логин или Телефон'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masalan: owner yoki admin"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 dark:border-slate-800 dark:bg-slate-800/80 dark:text-white dark:focus:border-brand-500 dark:focus:bg-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'uz' ? 'Maxfiy Parol' : 'Пароль'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 dark:border-slate-800 dark:bg-slate-800/80 dark:text-white dark:focus:border-brand-500 dark:focus:bg-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 py-2.5 px-4 text-xs sm:text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition-all hover:from-brand-500 hover:to-indigo-500 hover:shadow-brand-500/40"
                >
                  <span>{language === 'uz' ? 'Tizimga kirish' : 'Войти в систему'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 dark:text-slate-500 text-center">
              IDROK AI Multi-Tenant Security • Toshkent filiali
            </div>
          </div>

          {/* Right: Quick One-Click Role Routing */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200/90 bg-white/90 p-6 sm:p-8 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="h-4 w-4" />
                    <span>{language === 'uz' ? 'Avtomatik Rol Ajratish' : 'Автовыбор роли'}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {language === 'uz'
                      ? 'Bir bosishda tegishli rol bilan kirish'
                      : 'Быстрый вход по выбранной роли'}
                  </h3>
                </div>
                <span className="hidden sm:inline-block rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  Demo Hisoblar
                </span>
              </div>

              <div className="space-y-3">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickLogin(acc.role)}
                    className="w-full group text-left rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 transition-all duration-200 hover:border-brand-400 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-850/60 dark:hover:border-brand-500/60 dark:hover:bg-slate-800/80"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-xs dark:bg-slate-900 dark:border dark:border-slate-800">
                          {roleIcons[acc.role]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400 transition-colors">
                              {acc.label}
                            </span>
                            <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${roleBadges[acc.role]}`}>
                              {acc.username}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {acc.description}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 pl-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200/50 text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-all dark:bg-slate-800 dark:text-slate-400">
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-purple-200/60 bg-purple-50/60 p-3 text-xs text-purple-900 dark:border-purple-900/40 dark:bg-purple-950/30 dark:text-purple-300 flex items-center gap-2.5">
              <Shield className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
              <span>
                <strong>{language === 'uz' ? 'Eslatma:' : 'Примечание:'}</strong>{' '}
                {language === 'uz'
                  ? "Boshliq va Yordamchi Admin markazdagi barcha narsani va barcha xodimlarni to'liq nazorat qilish huquqiga ega."
                  : 'Руководитель и Помощник админа имеют полный доступ ко всем функциям и персоналу.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

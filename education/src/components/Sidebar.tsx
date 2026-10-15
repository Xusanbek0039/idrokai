'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useRole, EducationRole } from '../context/RoleContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  CreditCard,
  FileCheck,
  CheckCircle2,
  Award,
  BarChart3,
  BookOpen,
  Clock,
  Coins,
  DoorOpen,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'students'
  | 'teachers'
  | 'groups'
  | 'timetable'
  | 'attendance'
  | 'tuition'
  | 'homework'
  | 'exams'
  | 'gamification'
  | 'reports';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export function Sidebar({ currentTab, onSelectTab }: SidebarProps) {
  const { t } = useLanguage();
  const { role } = useRole();

  // Role bo'yicha menyu tuzilishi
  const getNavItems = () => {
    switch (role) {
      case 'edu_owner':
        return [
          { id: 'overview' as NavTab, label: t.nav.dashboard, icon: LayoutDashboard },
          { id: 'students' as NavTab, label: t.nav.students, icon: Users, badge: '6' },
          { id: 'groups' as NavTab, label: t.nav.groups, icon: GraduationCap, badge: '4' },
          { id: 'teachers' as NavTab, label: t.nav.teachers, icon: BookOpen },
          { id: 'tuition' as NavTab, label: t.nav.tuition, icon: CreditCard, highlight: true },
          { id: 'timetable' as NavTab, label: t.nav.timetable, icon: Calendar },
          { id: 'attendance' as NavTab, label: t.nav.attendance, icon: CheckCircle2 },
          { id: 'reports' as NavTab, label: t.nav.reports, icon: BarChart3 },
        ];
      case 'edu_assistant_admin':
        return [
          { id: 'overview' as NavTab, label: t.nav.dashboard, icon: LayoutDashboard },
          { id: 'students' as NavTab, label: t.nav.students, icon: Users, badge: '6' },
          { id: 'tuition' as NavTab, label: t.nav.tuition, icon: CreditCard, highlight: true },
          { id: 'groups' as NavTab, label: t.nav.groups, icon: GraduationCap },
          { id: 'attendance' as NavTab, label: t.nav.attendance, icon: CheckCircle2 },
          { id: 'homework' as NavTab, label: t.nav.homework, icon: FileCheck },
          { id: 'exams' as NavTab, label: t.nav.exams, icon: Award },
        ];
      case 'edu_operations_manager':
        return [
          { id: 'overview' as NavTab, label: t.nav.dashboard, icon: LayoutDashboard },
          { id: 'timetable' as NavTab, label: t.nav.timetable, icon: Calendar },
          { id: 'groups' as NavTab, label: t.nav.groups, icon: GraduationCap },
          { id: 'teachers' as NavTab, label: t.nav.teachers, icon: BookOpen },
          { id: 'attendance' as NavTab, label: t.nav.attendance, icon: CheckCircle2 },
          { id: 'gamification' as NavTab, label: t.nav.gamification, icon: Award },
        ];
      case 'teacher':
        return [
          { id: 'overview' as NavTab, label: t.nav.dashboard, icon: LayoutDashboard },
          { id: 'groups' as NavTab, label: t.nav.groups, icon: GraduationCap, badge: '3 ta guruh' },
          { id: 'attendance' as NavTab, label: t.nav.attendance, icon: CheckCircle2, highlight: true },
          { id: 'homework' as NavTab, label: t.nav.homework, icon: FileCheck },
          { id: 'exams' as NavTab, label: t.nav.exams, icon: Award },
          { id: 'gamification' as NavTab, label: t.nav.gamification, icon: Coins },
        ];
      case 'student':
        return [
          { id: 'overview' as NavTab, label: t.nav.dashboard, icon: LayoutDashboard },
          { id: 'timetable' as NavTab, label: t.nav.myLessons, icon: Calendar },
          { id: 'attendance' as NavTab, label: t.nav.myAttendance, icon: CheckCircle2 },
          { id: 'homework' as NavTab, label: t.nav.myHomework, icon: FileCheck, badge: '2 ta yangi' },
          { id: 'tuition' as NavTab, label: t.nav.myTuition, icon: CreditCard },
          { id: 'gamification' as NavTab, label: t.nav.myRating, icon: Award, highlight: true },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white/50 backdrop-blur-xs p-4 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mini Education Center Info Card at bottom */}
      <div className="mt-8 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-brand-50/50 to-indigo-50/50 p-4 dark:border-slate-800/80 dark:from-brand-950/20 dark:to-indigo-950/20">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-900 dark:text-brand-300">
          <GraduationCap className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          <span>{t.centerName}</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          Toshkent, Chilonzor filiali
        </p>
        <div className="mt-3 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">Filial holati:</span>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Faol
          </span>
        </div>
      </div>
    </aside>
  );
}

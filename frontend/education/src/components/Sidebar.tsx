'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useRole } from '../context/RoleContext';
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
  Coins,
  Shield,
  ShieldCheck,
  Building2,
  Sparkles,
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

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export function Sidebar({ currentTab, onSelectTab }: SidebarProps) {
  const { t } = useLanguage();
  const { role, canControlEverything } = useRole();

  // Boshliq va Yordamchi Admin markazdagi barcha narsani va hamma odamlarni nazorat qila oladi
  const getNavSections = (): NavSection[] => {
    if (canControlEverything) {
      return [
        {
          title: "Boshqaruv",
          items: [
            { id: 'overview', label: t.nav.dashboard, icon: LayoutDashboard },
            { id: 'reports', label: t.nav.reports, icon: BarChart3 },
          ],
        },
        {
          title: "O'quv Bo'limi",
          items: [
            { id: 'students', label: t.nav.students, icon: Users, badge: '6' },
            { id: 'groups', label: t.nav.groups, icon: GraduationCap, badge: '4' },
            { id: 'teachers', label: t.nav.teachers, icon: BookOpen, badge: '3' },
          ],
        },
        {
          title: "Moliya & Kassa",
          items: [
            { id: 'tuition', label: t.nav.tuition, icon: CreditCard, highlight: true },
          ],
        },
        {
          title: "Grafik & Davomat",
          items: [
            { id: 'timetable', label: t.nav.timetable, icon: Calendar },
            { id: 'attendance', label: t.nav.attendance, icon: CheckCircle2 },
          ],
        },
        {
          title: "LMS & Nazorat",
          items: [
            { id: 'homework', label: t.nav.homework, icon: FileCheck },
            { id: 'exams', label: t.nav.exams, icon: Award },
            { id: 'gamification', label: t.nav.gamification, icon: Coins },
          ],
        },
      ];
    }

    if (role === 'edu_operations_manager') {
      return [
        {
          title: "Boshqaruv",
          items: [
            { id: 'overview', label: t.nav.dashboard, icon: LayoutDashboard },
            { id: 'timetable', label: t.nav.timetable, icon: Calendar },
            { id: 'groups', label: t.nav.groups, icon: GraduationCap },
            { id: 'teachers', label: t.nav.teachers, icon: BookOpen },
            { id: 'attendance', label: t.nav.attendance, icon: CheckCircle2 },
            { id: 'exams', label: t.nav.exams, icon: Award },
          ],
        },
      ];
    }

    if (role === 'teacher') {
      return [
        {
          title: "Ustoz Kabineti",
          items: [
            { id: 'overview', label: t.nav.dashboard, icon: LayoutDashboard },
            { id: 'groups', label: t.nav.groups, icon: GraduationCap, badge: '3 ta guruh' },
            { id: 'attendance', label: t.nav.attendance, icon: CheckCircle2, highlight: true },
            { id: 'homework', label: t.nav.homework, icon: FileCheck },
            { id: 'exams', label: t.nav.exams, icon: Award },
            { id: 'gamification', label: t.nav.gamification, icon: Coins },
          ],
        },
      ];
    }

    // student
    return [
      {
        title: "O'quvchi Portali",
        items: [
          { id: 'overview', label: t.nav.dashboard, icon: LayoutDashboard },
          { id: 'timetable', label: t.nav.myLessons, icon: Calendar },
          { id: 'attendance', label: t.nav.myAttendance, icon: CheckCircle2 },
          { id: 'homework', label: t.nav.myHomework, icon: FileCheck, badge: '2 ta yangi' },
          { id: 'tuition', label: t.nav.myTuition, icon: CreditCard },
          { id: 'gamification', label: t.nav.myRating, icon: Award, highlight: true },
        ],
      },
    ];
  };

  const sections = getNavSections();

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between border-r border-slate-200/80 bg-white/70 backdrop-blur-md p-4 dark:border-slate-800/80 dark:bg-slate-900/70 transition-colors duration-200">
      <div className="space-y-4 overflow-y-auto pr-1">
        {/* Status Indicator Pill for Admin/Owner */}
        {canControlEverything && (
          <div className="rounded-xl border border-purple-200/80 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-brand-500/10 p-2.5 text-xs dark:border-purple-800/70 dark:from-purple-950/40 dark:to-indigo-950/40">
            <div className="flex items-center gap-2 font-bold text-purple-950 dark:text-purple-200">
              <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>To'liq Markaz Nazorati</span>
            </div>
            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
              Barcha bo'limlar, kassa, xodimlar va o'quvchilar ochiq
            </p>
          </div>
        )}

        {/* Navigation Sections */}
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {section.title && (
              <div className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/25 ring-1 ring-white/20'
                      : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 ${
                        isActive
                          ? 'text-white'
                          : item.highlight
                          ? 'text-emerald-500'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? 'bg-white/25 text-white'
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
        ))}
      </div>

      {/* Mini Education Center Info Card at bottom */}
      <div className="mt-6 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-brand-50/60 to-indigo-50/60 p-3.5 dark:border-slate-800/80 dark:from-slate-850 dark:to-slate-900">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
          <Building2 className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          <span className="truncate">{t.centerName}</span>
        </div>
        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
          Chilonzor filiali • IDROK AI
        </p>
        <div className="mt-2.5 flex items-center justify-between text-[11px] border-t border-slate-200/60 dark:border-slate-800 pt-2">
          <span className="text-slate-500">Tizim holati:</span>
          <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Faol & Himoyalangan
          </span>
        </div>
      </div>
    </aside>
  );
}

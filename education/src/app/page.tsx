'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Sidebar, NavTab } from '../components/Sidebar';
import { useRole } from '../context/RoleContext';
import { OwnerView } from '../components/OwnerView';
import { AssistantAdminView } from '../components/AssistantAdminView';
import { OperationsManagerView } from '../components/OperationsManagerView';
import { TeacherView } from '../components/TeacherView';
import { StudentView } from '../components/StudentView';

import { StudentsTab } from '../components/tabs/StudentsTab';
import { GroupsTab } from '../components/tabs/GroupsTab';
import { TeachersTab } from '../components/tabs/TeachersTab';
import { TuitionTab } from '../components/tabs/TuitionTab';
import { TimetableTab } from '../components/tabs/TimetableTab';
import { AttendanceTab } from '../components/tabs/AttendanceTab';
import { ReportsTab } from '../components/tabs/ReportsTab';
import { HomeworkTab } from '../components/tabs/HomeworkTab';
import { ExamsTab } from '../components/tabs/ExamsTab';
import { GamificationTab } from '../components/tabs/GamificationTab';

export default function EducationDashboard() {
  const { role } = useRole();
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');

  // Reset tab to overview when user changes role
  useEffect(() => {
    setCurrentTab('overview');
  }, [role]);

  const renderContent = () => {
    // Agar Boshqaruv paneli (overview) bo'lsa, har bir rolning shaxsiy dashboardini ko'rsatamiz
    if (currentTab === 'overview') {
      switch (role) {
        case 'edu_owner':
          return <OwnerView />;
        case 'edu_assistant_admin':
          return <AssistantAdminView />;
        case 'edu_operations_manager':
          return <OperationsManagerView />;
        case 'teacher':
          return <TeacherView />;
        case 'student':
          return <StudentView />;
        default:
          return <OwnerView />;
      }
    }

    // Foydalanuvchi qaysi bo'limga bossa, o'sha maxsus sahifa ochiladi
    switch (currentTab) {
      case 'students':
        return <StudentsTab />;
      case 'groups':
        return <GroupsTab />;
      case 'teachers':
        return <TeachersTab />;
      case 'tuition':
        return <TuitionTab />;
      case 'timetable':
        return <TimetableTab />;
      case 'attendance':
        return <AttendanceTab />;
      case 'reports':
        return <ReportsTab />;
      case 'homework':
        return <HomeworkTab />;
      case 'exams':
        return <ExamsTab />;
      case 'gamification':
        return <GamificationTab />;
      default:
        return <OwnerView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Header with Theme, Language, and Interactive Role Switcher */}
      <Header />

      {/* Main App Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Responsive Role-Scoped Sidebar */}
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

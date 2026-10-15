'use client';

import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Sidebar, NavTab } from '../components/Sidebar';
import { useRole } from '../context/RoleContext';
import { OwnerView } from '../components/OwnerView';
import { AssistantAdminView } from '../components/AssistantAdminView';
import { OperationsManagerView } from '../components/OperationsManagerView';
import { TeacherView } from '../components/TeacherView';
import { StudentView } from '../components/StudentView';

export default function EducationDashboard() {
  const { role } = useRole();
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');

  const renderRoleDashboard = () => {
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
            {renderRoleDashboard()}
          </div>
        </main>
      </div>
    </div>
  );
}

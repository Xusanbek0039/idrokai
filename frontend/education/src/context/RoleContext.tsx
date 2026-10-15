'use client';

import React, { createContext, useContext, useState } from 'react';

export type EducationRole =
  | 'edu_owner'
  | 'edu_assistant_admin'
  | 'edu_operations_manager'
  | 'teacher'
  | 'student';

export interface UserProfile {
  name: string;
  role: EducationRole;
  email: string;
  phone: string;
  avatarText: string;
}

const mockProfiles: Record<EducationRole, UserProfile> = {
  edu_owner: {
    name: 'Sanjar Rahimov',
    role: 'edu_owner',
    email: 'owner@registon.uz',
    phone: '+998 90 111 22 33',
    avatarText: 'SR',
  },
  edu_assistant_admin: {
    name: 'Aziza Karimova',
    role: 'edu_assistant_admin',
    email: 'admin@registon.uz',
    phone: '+998 93 222 33 44',
    avatarText: 'AK',
  },
  edu_operations_manager: {
    name: 'Dilshod Rustamov',
    role: 'edu_operations_manager',
    email: 'manager@registon.uz',
    phone: '+998 91 333 44 55',
    avatarText: 'DR',
  },
  teacher: {
    name: 'Temur Aliyev',
    role: 'teacher',
    email: 'temur.ielts@registon.uz',
    phone: '+998 90 999 00 11',
    avatarText: 'TA',
  },
  student: {
    name: 'Abdurashid Valiyev',
    role: 'student',
    email: 'abdurashid@gmail.com',
    phone: '+998 90 123 45 67',
    avatarText: 'AV',
  },
};

interface RoleContextType {
  role: EducationRole;
  setRole: (role: EducationRole) => void;
  user: UserProfile;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<EducationRole>('edu_owner');

  const user = mockProfiles[role];

  return (
    <RoleContext.Provider value={{ role, setRole, user }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within RoleProvider');
  }
  return context;
}

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { educationApi } from '../lib/api';

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
  title: string;
  permissionsBadge: string;
}

export const mockProfiles: Record<EducationRole, UserProfile> = {
  edu_owner: {
    name: 'Sanjar Rahimov',
    role: 'edu_owner',
    email: 'owner@registon.uz',
    phone: '+998 90 111 22 33',
    avatarText: 'SR',
    title: "Ta'sischi / Markaz Boshlig'i",
    permissionsBadge: "Super Boshqaruv (Barcha vakolatlar)",
  },
  edu_assistant_admin: {
    name: 'Aziza Karimova',
    role: 'edu_assistant_admin',
    email: 'admin@registon.uz',
    phone: '+998 93 222 33 44',
    avatarText: 'AK',
    title: "Yordamchi Administrator",
    permissionsBadge: "To'liq Operatsion Nazorat",
  },
  edu_operations_manager: {
    name: 'Dilshod Rustamov',
    role: 'edu_operations_manager',
    email: 'manager@registon.uz',
    phone: '+998 91 333 44 55',
    avatarText: 'DR',
    title: "Ish boshqaruvchi (Manager)",
    permissionsBadge: "Jadval va Xonalar Nazorati",
  },
  teacher: {
    name: 'Temur Aliyev',
    role: 'teacher',
    email: 'temur.ielts@registon.uz',
    phone: '+998 90 999 00 11',
    avatarText: 'TA',
    title: "Katta O'qituvchi (IELTS)",
    permissionsBadge: "O'z Guruhlari va Davomat",
  },
  student: {
    name: 'Abdurashid Valiyev',
    role: 'student',
    email: 'abdurashid@gmail.com',
    phone: '+998 90 123 45 67',
    avatarText: 'AV',
    title: "O'quvchi (IELTS Guruhi)",
    permissionsBadge: "Shaxsiy O'quvchi Portali",
  },
};

export interface AuthAccount {
  username: string;
  role: EducationRole;
  label: string;
  description: string;
}

export const demoAccounts: AuthAccount[] = [
  {
    username: 'owner',
    role: 'edu_owner',
    label: "Boshliq (Ta'sischi / Owner)",
    description: "Markazning barcha faoliyati, xodimlar, to'liq moliya, kassa va filiallar nazorati",
  },
  {
    username: 'admin',
    role: 'edu_assistant_admin',
    label: "Yordamchi Admin (Assistant Admin)",
    description: "Barcha o'quvchilar qabuli, to'lovlar, qarzdorliklar, guruhlar va davomatni to'liq nazorat qilish",
  },
  {
    username: 'manager',
    role: 'edu_operations_manager',
    label: "Ish boshqaruvchi (Manager)",
    description: "Dars jadvallari, o'quv xonalari bandligi, vaqtlar va xodimlar soatlari grafigi",
  },
  {
    username: 'teacher',
    role: 'teacher',
    label: "O'qituvchi (Teacher)",
    description: "O'z guruhlari davomati, dars jadvallari, uyga vazifalar, testlar va XP tangalar berish",
  },
  {
    username: 'student',
    role: 'student',
    label: "O'quvchi (Student)",
    description: "Mening darslarim, davomatim, to'lovlarim, uyga vazifalar va sovrinlar do'koni",
  },
];

interface RoleContextType {
  role: EducationRole;
  user: UserProfile;
  isAuthenticated: boolean;
  canControlEverything: boolean;
  backendConnected: boolean;
  login: (usernameOrRole: string, password?: string) => Promise<boolean>;
  logout: () => void;
  setRole: (role: EducationRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<EducationRole>('edu_owner');
  const [userProfile, setUserProfile] = useState<UserProfile>(mockProfiles['edu_owner']);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check local session
    try {
      const savedAuth = localStorage.getItem('idrok_edu_auth');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed.role && mockProfiles[parsed.role as EducationRole]) {
          setRoleState(parsed.role as EducationRole);
          if (parsed.user) {
            setUserProfile(parsed.user);
          } else {
            setUserProfile(mockProfiles[parsed.role as EducationRole]);
          }
          setIsAuthenticated(Boolean(parsed.isAuthenticated));
        }
      }
    } catch {
      // ignore
    }

    // 2. Check Backend Health
    educationApi.checkHealth().then((isHealthy) => {
      setBackendConnected(isHealthy);
    });
  }, []);

  const login = async (usernameOrRole: string, password?: string): Promise<boolean> => {
    const clean = usernameOrRole.trim().toLowerCase();

    // 1. Try Backend Django Login
    try {
      const res = await educationApi.login(clean, password);
      if (res && res.success && res.user) {
        const backendUser = res.user as UserProfile;
        const assignedRole = backendUser.role as EducationRole;
        setRoleState(assignedRole);
        setUserProfile(backendUser);
        setIsAuthenticated(true);
        setBackendConnected(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            'idrok_edu_auth',
            JSON.stringify({ role: assignedRole, user: backendUser, isAuthenticated: true })
          );
        }
        return true;
      }
    } catch {
      // Backend not yet reachable or errored, proceed to offline/mock fallback
    }

    // 2. Local Fallback Mapping
    let detectedRole: EducationRole | null = null;
    if (clean === 'owner' || clean === 'edu_owner' || clean.includes('sanjar')) {
      detectedRole = 'edu_owner';
    } else if (clean === 'admin' || clean === 'edu_assistant_admin' || clean.includes('aziza')) {
      detectedRole = 'edu_assistant_admin';
    } else if (clean === 'manager' || clean === 'edu_operations_manager' || clean.includes('dilshod')) {
      detectedRole = 'edu_operations_manager';
    } else if (clean === 'teacher' || clean.includes('temur')) {
      detectedRole = 'teacher';
    } else if (clean === 'student' || clean.includes('abdurashid')) {
      detectedRole = 'student';
    } else if (mockProfiles[clean as EducationRole]) {
      detectedRole = clean as EducationRole;
    }

    if (detectedRole) {
      setRoleState(detectedRole);
      const prof = mockProfiles[detectedRole];
      setUserProfile(prof);
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'idrok_edu_auth',
          JSON.stringify({ role: detectedRole, user: prof, isAuthenticated: true })
        );
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'idrok_edu_auth',
        JSON.stringify({ role, isAuthenticated: false })
      );
    }
  };

  const setRole = (newRole: EducationRole) => {
    setRoleState(newRole);
    const prof = mockProfiles[newRole];
    setUserProfile(prof);
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'idrok_edu_auth',
        JSON.stringify({ role: newRole, user: prof, isAuthenticated: true })
      );
    }
  };

  const user = userProfile || mockProfiles[role];
  const canControlEverything = role === 'edu_owner' || role === 'edu_assistant_admin';

  return (
    <RoleContext.Provider
      value={{
        role,
        user,
        isAuthenticated,
        canControlEverything,
        backendConnected,
        login,
        logout,
        setRole,
      }}
    >
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

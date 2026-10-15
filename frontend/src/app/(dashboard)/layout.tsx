'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { AuthUser, Company, UserRole } from '@/lib/api/types';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);

        const shopList = await api.companies.list();
        setCompanies(shopList);

        if (shopList.length > 0) {
          const savedShopId = localStorage.getItem('active_shop_id');
          const defaultShop = shopList.find(s => s.id === savedShopId) || shopList[0];
          setActiveCompanyId(defaultShop.id);
          localStorage.setItem('active_shop_id', defaultShop.id);
        }
      } catch (err) {
        // Not logged in or session expired
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [router]);

  const handleShopChange = (shopId: string) => {
    setActiveCompanyId(shopId);
    localStorage.setItem('active_shop_id', shopId);
    window.location.reload();
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Continue to login
    }
    router.push('/login');
  };

  const activeMembership = user?.memberships.find(m => m.company_id === activeCompanyId);
  const roleName: Record<UserRole, string> = {
    platform_super_admin: 'Super Admin',
    shop_owner: "Do'kon Egasi",
    shop_manager: 'Menejer',
    cashier: 'Kassir',
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <Link href="/debts" className="flex items-center gap-2">
            <span className="w-9 h-9 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold text-lg">
              IA
            </span>
            <span className="font-bold text-lg text-slate-800">IDROK AI</span>
          </Link>

          {/* Shop Switcher */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Faol do'kon
            </label>
            <select
              value={activeCompanyId}
              onChange={(e) => handleShopChange(e.target.value)}
              className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/debts"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              pathname === '/debts'
                ? 'bg-primary-50 text-primary-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>💳</span>
            <span>Nasiya / Kassa (POS)</span>
          </Link>

          <Link
            href="/customers"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              pathname === '/customers'
                ? 'bg-primary-50 text-primary-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>👥</span>
            <span>Mijozlar (Qarzdorlar)</span>
          </Link>

          <Link
            href="/reports"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              pathname === '/reports'
                ? 'bg-primary-50 text-primary-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>📊</span>
            <span>Moliyaviy hisobot</span>
          </Link>
        </nav>

        {/* User Profile & Role */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-slate-800 truncate">
              {user?.full_name || user?.email}
            </div>
            {activeMembership && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                {roleName[activeMembership.role] || activeMembership.role}
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-xs text-slate-500 hover:text-red-600 py-1 font-medium transition text-left"
          >
            Chiqish (Logout)
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

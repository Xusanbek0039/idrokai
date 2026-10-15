'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { DebtSummary, DebtCustomer } from '@/lib/api/types';

export default function DashboardOverviewPage() {
  const [shopId, setShopId] = useState<string>('');
  const [summary, setSummary] = useState<DebtSummary | null>(null);
  const [recentCustomers, setRecentCustomers] = useState<DebtCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem('active_shop_id') || '';
    setShopId(id);
    if (id) {
      loadData(id);
    }
  }, []);

  const loadData = async (companyId: string) => {
    setLoading(true);
    try {
      const [sumData, custData] = await Promise.all([
        api.debts.getSummary(companyId),
        api.debts.getCustomers(companyId, undefined, true),
      ]);
      setSummary(sumData);
      setRecentCustomers(custData.results.slice(0, 6));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-500/20 text-primary-400 border border-primary-500/30">
              Faol Do'kon
            </span>
            <span className="text-slate-400 text-xs">Real-time Kassa & Nasiya boshqaruvi</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Do'kon Boshqaruv Paneli (Dashboard)
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Mijozlar qarzdorligi, kassa tushumlari va qarz daftari monitoringi
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Link
            href="/debts"
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition shadow-sm flex items-center gap-2"
          >
            <span>+</span> Kassa / Nasiya (POS)
          </Link>
          <Link
            href="/customers"
            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-semibold transition"
          >
            Mijozlar ro'yxati
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Ko'rsatkichlar yuklanmoqda...</div>
      ) : summary ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Umumiy Qarz Miqdori
                </div>
                <div className="text-3xl font-extrabold text-red-600 mt-2">
                  {Number(summary.total_outstanding_debt).toLocaleString()} <span className="text-sm font-semibold text-slate-400">UZS</span>
                </div>
                <div className="text-xs text-red-500 font-semibold mt-1">
                  ● {summary.active_debtor_count} ta qarzdor mijoz
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-2xl font-bold">
                💳
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Bugungi Jami To'lovlar
                </div>
                <div className="text-3xl font-extrabold text-emerald-600 mt-2">
                  {Number(summary.today_collected_amount).toLocaleString()} <span className="text-sm font-semibold text-slate-400">UZS</span>
                </div>
                <div className="text-xs text-emerald-600 font-semibold mt-1">
                  ● Kassaga kelib tushgan to'lovlar
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-bold">
                💰
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Muddati O'tgan Qarzlar
                </div>
                <div className="text-3xl font-extrabold text-amber-600 mt-2">
                  {Number(summary.total_overdue_debt).toLocaleString()} <span className="text-sm font-semibold text-slate-400">UZS</span>
                </div>
                <div className="text-xs text-amber-600 font-semibold mt-1">
                  ● {summary.overdue_debtor_count} ta muddati o'tgan mijoz
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl font-bold">
                ⚠️
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Grid: Active Debtors & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Debtors Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Eng Katta Qarzga Ega Mijozlar</h2>
              <p className="text-xs text-slate-500">Muntazam nasiya olib turuvchi faol mijozlar</p>
            </div>
            <Link href="/customers" className="text-xs font-bold text-primary-600 hover:text-primary-700">
              Barchasini ko'rish →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentCustomers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Hozircha qarzdor mijozlar yo'q.</div>
            ) : (
              recentCustomers.map((c) => (
                <div key={c.id} className="p-4 px-6 flex justify-between items-center hover:bg-slate-50 transition">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{c.full_name}</div>
                    <div className="text-xs text-slate-500">{c.phone_number} {c.address ? `• ${c.address}` : ''}</div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <div className="text-sm font-extrabold text-red-600">
                        {Number(c.current_balance).toLocaleString()} UZS
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Limit: {Number(c.credit_limit).toLocaleString()} UZS
                      </div>
                    </div>
                    <Link
                      href="/debts"
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                    >
                      Kassa
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Shortcuts & Today's Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          {summary && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                To'lov Turlari Bo'yicha Tushum
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-sm">
                  <span className="font-medium text-slate-600">💵 Naqd pul:</span>
                  <span className="font-bold text-slate-900">{Number(summary.today_collections_by_method.cash).toLocaleString()} UZS</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-sm">
                  <span className="font-medium text-slate-600">💳 Bank kartasi:</span>
                  <span className="font-bold text-slate-900">{Number(summary.today_collections_by_method.card).toLocaleString()} UZS</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-sm">
                  <span className="font-medium text-slate-600">🏦 O'tkazma:</span>
                  <span className="font-bold text-slate-900">{Number(summary.today_collections_by_method.bank_transfer).toLocaleString()} UZS</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-base mb-1">Platform Super Admin</h3>
            <p className="text-xs text-primary-100 mb-4">
              Tashkilotlar va tizim modullarini boshqarish uchun markaziy admin panelga o'tish
            </p>
            <a
              href="http://127.0.0.1:8000/admin/"
              target="_blank"
              className="w-full inline-block text-center py-2.5 px-4 bg-white text-primary-800 rounded-xl text-xs font-bold shadow-sm hover:bg-primary-50 transition"
            >
              Django Super Admin Paneliga O'tish →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

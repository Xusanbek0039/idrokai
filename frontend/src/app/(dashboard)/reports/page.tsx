'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api/client';
import { DebtSummary } from '@/lib/api/types';

export default function ReportsPage() {
  const [shopId, setShopId] = useState<string>('');
  const [summary, setSummary] = useState<DebtSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem('active_shop_id') || '';
    setShopId(id);
    if (id) {
      loadSummary(id);
    }
  }, []);

  const loadSummary = async (companyId: string) => {
    setLoading(true);
    try {
      const data = await api.debts.getSummary(companyId);
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Moliyaviy hisobotlar</h1>
          <p className="text-sm text-slate-500">Do'konning umumiy qarz balansi va tushumlar hisoboti</p>
        </div>
        <button
          onClick={() => shopId && loadSummary(shopId)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition"
        >
          Yangilash (Refresh)
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Yuklanmoqda...</div>
      ) : summary ? (
        <div className="space-y-6">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Umumiy qarz miqdori
              </div>
              <div className="text-3xl font-extrabold text-red-600 mt-2">
                {Number(summary.total_outstanding_debt).toLocaleString()} UZS
              </div>
              <div className="text-xs text-slate-400 mt-2">
                {summary.active_debtor_count} ta faol qarzdor mijoz
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Bugungi jami to'lovlar
              </div>
              <div className="text-3xl font-extrabold text-emerald-600 mt-2">
                {Number(summary.today_collected_amount).toLocaleString()} UZS
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Kassaga tushgan barcha to'lovlar
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Muddati o'tgan qarzlar
              </div>
              <div className="text-3xl font-extrabold text-amber-600 mt-2">
                {Number(summary.total_overdue_debt).toLocaleString()} UZS
              </div>
              <div className="text-xs text-slate-400 mt-2">
                {summary.overdue_debtor_count} ta mijoz muddati o'tgan
              </div>
            </div>
          </div>

          {/* Today's breakdown */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Bugungi to'lovlar usullar bo'yicha taqsimoti
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 uppercase font-semibold">Naqd pul (Cash)</div>
                <div className="text-xl font-bold text-slate-800 mt-1">
                  {Number(summary.today_collections_by_method.cash).toLocaleString()} UZS
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 uppercase font-semibold">Bank kartasi (Card)</div>
                <div className="text-xl font-bold text-slate-800 mt-1">
                  {Number(summary.today_collections_by_method.card).toLocaleString()} UZS
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 uppercase font-semibold">O'tkazma (Bank Transfer)</div>
                <div className="text-xl font-bold text-slate-800 mt-1">
                  {Number(summary.today_collections_by_method.bank_transfer).toLocaleString()} UZS
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-sm text-slate-400">Hisobot ma'lumotlari mavjud emas.</div>
      )}
    </div>
  );
}

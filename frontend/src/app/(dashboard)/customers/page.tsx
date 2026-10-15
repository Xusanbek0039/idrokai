'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api/client';
import { DebtCustomer } from '@/lib/api/types';

export default function CustomersPage() {
  const [shopId, setShopId] = useState<string>('');
  const [customers, setCustomers] = useState<DebtCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Add customer modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState('500000.00');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('active_shop_id') || '';
    setShopId(id);
    if (id) {
      loadCustomers(id);
    }
  }, []);

  const loadCustomers = async (companyId: string, q?: string) => {
    setLoading(true);
    try {
      const res = await api.debts.getCustomers(companyId, q);
      setCustomers(res.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId) return;
    setSaving(true);
    setErrorMsg(null);

    try {
      await api.debts.createCustomer(shopId, {
        full_name: fullName,
        phone_number: phone,
        address,
        credit_limit: Number(creditLimit).toFixed(2),
        notes,
      });

      setIsModalOpen(false);
      setFullName('');
      setPhone('');
      setAddress('');
      setCreditLimit('500000.00');
      setNotes('');
      loadCustomers(shopId, search);
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mijozlar (Qarzdorlar ro'yxati)</h1>
          <p className="text-sm text-slate-500">Do'kon mijozlari profili va kredit limitlarini boshqarish</p>
        </div>
        <button
          onClick={() => {
            setErrorMsg(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition"
        >
          + Yangi mijoz qo'shish
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <input
            type="text"
            placeholder="Mijoz ismi yoki telefoni orqali izlash..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (shopId) loadCustomers(shopId, e.target.value);
            }}
            className="w-full max-w-sm px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Mijoz F.I.SH</th>
              <th className="px-6 py-3">Telefon</th>
              <th className="px-6 py-3">Manzil</th>
              <th className="px-6 py-3 text-right">Kredit limiti</th>
              <th className="px-6 py-3 text-right">Joriy qarz balansi</th>
              <th className="px-6 py-3 text-center">Holat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  Mijozlar mavjud emas.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-800">{c.full_name}</td>
                  <td className="px-6 py-4 text-slate-600">{c.phone_number}</td>
                  <td className="px-6 py-4 text-slate-500">{c.address || '—'}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-700">
                    {Number(c.credit_limit).toLocaleString()} UZS
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-red-600">
                    {Number(c.current_balance).toLocaleString()} UZS
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Yangi mijoz qo'shish</h3>

            {errorMsg && (
              <div className="p-3 mb-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">To'liq ism (F.I.SH)</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ali Valiyev"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon raqam</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998901234567"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kredit limiti (UZS)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  placeholder="500000.00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Manzil</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Chilonzor 9-dom, 12-xonadon"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

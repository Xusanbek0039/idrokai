'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api/client';
import { DebtCustomer, DebtRecord, DebtLedgerEntry, DecimalAmount } from '@/lib/api/types';

export default function DebtsPage() {
  const [shopId, setShopId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<DebtCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<DebtCustomer | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<DebtLedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer'>('cash');
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
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
      if (res.results.length > 0 && !selectedCustomer) {
        selectCustomer(companyId, res.results[0]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectCustomer = async (companyId: string, customer: DebtCustomer) => {
    setSelectedCustomer(customer);
    try {
      const ledger = await api.debts.getCustomerLedger(companyId, customer.id);
      setLedgerEntries(ledger);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (shopId) {
      loadCustomers(shopId, search);
    }
  };

  const handleCreateDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId || !selectedCustomer) return;
    setActionLoading(true);
    setErrorMsg(null);

    try {
      await api.debts.createDebt(shopId, {
        customer_id: selectedCustomer.id,
        amount: Number(amount).toFixed(2),
        description,
      });

      // Refresh customer and ledger
      const updatedCustomer = await api.debts.getCustomer(shopId, selectedCustomer.id);
      setSelectedCustomer(updatedCustomer);
      const ledger = await api.debts.getCustomerLedger(shopId, selectedCustomer.id);
      setLedgerEntries(ledger);

      setIsDebtModalOpen(false);
      setAmount('');
      setDescription('');
      loadCustomers(shopId, search);
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordRepayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId || !selectedCustomer) return;
    setActionLoading(true);
    setErrorMsg(null);

    try {
      await api.debts.recordRepayment(shopId, {
        customer_id: selectedCustomer.id,
        amount: Number(amount).toFixed(2),
        payment_method: paymentMethod,
        notes,
      });

      const updatedCustomer = await api.debts.getCustomer(shopId, selectedCustomer.id);
      setSelectedCustomer(updatedCustomer);
      const ledger = await api.debts.getCustomerLedger(shopId, selectedCustomer.id);
      setLedgerEntries(ledger);

      setIsRepayModalOpen(false);
      setAmount('');
      setNotes('');
      loadCustomers(shopId, search);
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kassa / Nasiya boshqaruvi</h1>
          <p className="text-sm text-slate-500">Mijoz qarzlarini yozish va to'lovlarni qabul qilish</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Customer Search & List */}
        <div className="col-span-12 lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[750px]">
          <form onSubmit={handleSearch} className="mb-4">
            <input
              type="text"
              placeholder="Ism yoki telefon raqam orqali izlash..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </form>

          <div className="flex-1 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-8 text-sm text-slate-400">Yuklanmoqda...</div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">Mijozlar topilmadi.</div>
            ) : (
              customers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => selectCustomer(shopId, c)}
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    selectedCustomer?.id === c.id
                      ? 'border-primary-500 bg-primary-50/50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{c.full_name}</div>
                      <div className="text-xs text-slate-500">{c.phone_number}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-red-600">
                        {Number(c.current_balance).toLocaleString()} UZS
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Limit: {Number(c.credit_limit).toLocaleString()} UZS
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Customer Details & Operations */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          {selectedCustomer ? (
            <>
              {/* Customer Balance Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedCustomer.full_name}</h2>
                    <p className="text-sm text-slate-500">{selectedCustomer.phone_number}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setErrorMsg(null);
                        setIsDebtModalOpen(true);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition"
                    >
                      + Nasiya yozish
                    </button>
                    <button
                      onClick={() => {
                        setErrorMsg(null);
                        setIsRepayModalOpen(true);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition"
                    >
                      ✓ To'lov olish
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">Joriy umumiy qarz</div>
                    <div className="text-2xl font-extrabold text-red-600 mt-1">
                      {Number(selectedCustomer.current_balance).toLocaleString()} UZS
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">Kredit limiti</div>
                    <div className="text-2xl font-extrabold text-slate-800 mt-1">
                      {Number(selectedCustomer.credit_limit).toLocaleString()} UZS
                    </div>
                  </div>
                </div>
              </div>

              {/* Immutable Financial Ledger Trail */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4">
                  Moliyaviy audit tarixi (Ledger)
                </h3>
                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                  {ledgerEntries.length === 0 ? (
                    <div className="py-6 text-center text-sm text-slate-400">Tranzaksiyalar mavjud emas.</div>
                  ) : (
                    ledgerEntries.map((l) => (
                      <div key={l.id} className="py-3 flex justify-between items-center text-sm">
                        <div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mr-2 ${
                              l.transaction_type === 'DEBT_ISSUED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {l.transaction_type === 'DEBT_ISSUED' ? 'Nasiya berildi' : "To'lov qilindi"}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(l.created_at).toLocaleString('uz')}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${l.transaction_type === 'DEBT_ISSUED' ? 'text-red-600' : 'text-emerald-600'}`}>
                            {l.transaction_type === 'DEBT_ISSUED' ? '+' : '-'}{Number(l.amount).toLocaleString()} UZS
                          </div>
                          <div className="text-xs text-slate-400">
                            Qoldiq: {Number(l.balance_after).toLocaleString()} UZS
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400">
              Mijozni tanlang.
            </div>
          )}
        </div>
      </div>

      {/* Debt Modal */}
      {isDebtModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Nasiya yozish</h3>
            <p className="text-sm text-slate-500 mb-4">{selectedCustomer?.full_name}</p>

            {errorMsg && (
              <div className="p-3 mb-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateDebt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Qarz summasi (UZS)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="150000.00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-base font-bold focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mahsulotlar tavsifi</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Un 50kg, Paxta yog'i 5L, Shakar 10kg..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsDebtModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                >
                  {actionLoading ? 'Yozilmoqda...' : 'Tasdiqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Repayment Modal */}
      {isRepayModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">To'lovni qabul qilish</h3>
            <p className="text-sm text-slate-500 mb-4">{selectedCustomer?.full_name}</p>

            {errorMsg && (
              <div className="p-3 mb-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRecordRepayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">To'lov summasi (UZS)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50000.00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-base font-bold focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">To'lov usuli</label>
                <select
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  <option value="cash">Naqd pul (Cash)</option>
                  <option value="card">Bank kartasi (Terminal / POS)</option>
                  <option value="bank_transfer">O'tkazma (Transfer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Izoh (ixtiyoriy)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Kassir qaydlari..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsRepayModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                >
                  {actionLoading ? 'Qabul qilinmoqda...' : "To'lovni tasdiqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

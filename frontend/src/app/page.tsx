import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
          IA
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
          IDROK AI
        </h1>
        <p className="text-slate-600 mb-6 font-medium">
          Shop Debt Management (Nasiya Savdo / Daftari)
        </p>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 text-left text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Database:</span>
            <span className="font-semibold text-slate-800">SQLite3 (WAL Mode)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Monetary Precision:</span>
            <span className="font-semibold text-slate-800">DecimalField (max_digits=12, decimal_places=2)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Transaction Safety:</span>
            <span className="font-semibold text-slate-800">Atomic + Idempotency Keys</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Roles Supported:</span>
            <span className="font-semibold text-slate-800">Super Admin, Owner, Manager, Cashier</span>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition"
          >
            Tizimga kirish (Login)
          </Link>
          <Link
            href="/debts"
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold transition"
          >
            Kassa / Nasiya (POS)
          </Link>
        </div>
      </div>
    </main>
  );
}

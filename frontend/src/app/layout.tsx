import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IDROK AI — Shop Debt Management',
  description: 'Multi-tenant shop debt tracking, repayment recording, and balance management.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className="min-h-screen bg-slate-50 antialiased text-slate-900">
        {children}
      </body>
    </html>
  );
}

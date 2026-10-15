import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import { RoleProvider } from '../context/RoleContext';

export const metadata: Metadata = {
  title: 'IDROK AI Education — O\'quv Markaz Boshqaruv Tizimi',
  description: 'O\'quv markazlari uchun universal avtomatlashtirish, qabul, davomat, to\'lovlar va LMS platformasi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <ThemeProvider>
          <LanguageProvider>
            <RoleProvider>
              {children}
            </RoleProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

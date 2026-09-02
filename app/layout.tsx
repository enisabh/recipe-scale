import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://enisabh.github.io/recipe-scale/'),
  title: 'Cal-Cook-Lator — Kalkulator Sukatan Resipi',
  description: 'Tampal resipi dan ubah sukatan bahan secara automatik untuk 1 hingga 500 orang.',
  openGraph: {
    title: 'Cal-Cook-Lator — Kalkulator Sukatan Resipi',
    description: 'Tampal resipi, pilih jumlah tetamu dan dapatkan sukatan baharu serta-merta.',
    images: [{ url: '/recipe-scale/og.png', width: 1200, height: 630, alt: 'Cal-Cook-Lator — Tampal, Skala, Siap' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cal-Cook-Lator — Kalkulator Sukatan Resipi',
    description: 'Tampal resipi, pilih jumlah tetamu dan dapatkan sukatan baharu serta-merta.',
    images: ['/recipe-scale/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ms">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter, Orbitron } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RAN FITNESS | Premium Fitness & CrossFit Training',
  description: 'Elite fitness, hybrid CrossFit conditioning, premium Aerofit equipment, personalized coaching, and transformation programs at RAN FITNESS.',
  keywords: 'Best Gym in Habsiguda, CrossFit Gym Habsiguda, Gym Near Me, Fitness Center Habsiguda, Zumba Classes Habsiguda, Ran Fitness Hyderabad',
  metadataBase: new URL('https://ranfitness.com'),
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-v3.ico', sizes: 'any' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-64x64.png', sizes: '64x64', type: 'image/png' },
      { url: '/icon-128x128.png', sizes: '128x128', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon-v3.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  openGraph: {
    title: 'RAN Fitness | Premium Gym & CrossFit Habsiguda',
    description: 'Transform your body at RAN Fitness Habsiguda. Professional Aerofit equipment, certified trainers, and customized training plans.',
    url: 'https://ranfitness.com',
    siteName: 'RAN Fitness',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/images/logo_circular_rebrand.png',
        width: 1024,
        height: 1024,
        alt: 'RAN Fitness Logo',
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RAN Fitness | Premium Gym Habsiguda',
    description: 'Professional Aerofit equipment and certified coaches. Join today!',
    images: ['/images/logo_circular_rebrand.png'],
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${orbitron.variable} h-full antialiased darkScroll dark`}
      style={{ scrollBehavior: 'smooth' }}
    >
      <body className="min-h-full flex flex-col bg-[#ffffff] text-[#171717] dark:bg-[#0a0a0a] dark:text-[#ededed] transition-colors duration-300 font-sans">
        {children}
      </body>
    </html>
  );
}

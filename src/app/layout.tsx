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
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png"
  },
  openGraph: {
    title: 'RAN Fitness | Premium Gym & CrossFit Habsiguda',
    description: 'Transform your body at RAN Fitness Habsiguda. Professional Aerofit equipment, certified trainers, and customized training plans.',
    url: 'https://ranfitness.com',
    siteName: 'RAN Fitness',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RAN Fitness | Premium Gym Habsiguda',
    description: 'Professional Aerofit equipment and certified coaches. Join today!',
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

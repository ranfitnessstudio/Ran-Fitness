import type { Metadata } from 'next';
import { Inter, Orbitron } from 'next/font/google';
import Script from 'next/script';
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
  title: 'RAN FITNESS | Premium Gym in Habsiguda Hyderabad',
  description: 'RAN FITNESS is a premium fitness and CrossFit gym in Habsiguda, Hyderabad. Expert trainers, transformation programs, strength training, cardio, and personalized fitness coaching.',
  keywords: 'Best Gym in Habsiguda, CrossFit Gym Habsiguda, Gym Near Me, Fitness Center Habsiguda, Zumba Classes Habsiguda, Ran Fitness Hyderabad, Premium Gym Habsiguda',
  metadataBase: new URL('https://ran-fitness.vercel.app'),
  alternates: {
    canonical: 'https://ran-fitness.vercel.app',
  },
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
    title: 'RAN FITNESS | Premium Gym in Habsiguda Hyderabad',
    description: 'RAN FITNESS is a premium fitness and CrossFit gym in Habsiguda, Hyderabad. Expert trainers, transformation programs, strength training, cardio, and personalized fitness coaching.',
    url: 'https://ran-fitness.vercel.app',
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
    title: 'RAN FITNESS | Premium Gym in Habsiguda Hyderabad',
    description: 'RAN FITNESS is a premium fitness and CrossFit gym in Habsiguda, Hyderabad. Expert trainers, transformation programs, strength training, cardio, and personalized fitness coaching.',
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
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Gym",
    "name": "RAN FITNESS",
    "image": "https://ran-fitness.vercel.app/images/logo_circular_rebrand.png",
    "@id": "https://ran-fitness.vercel.app/#gym",
    "url": "https://ran-fitness.vercel.app",
    "telephone": "+919666345644",
    "priceRange": "₹2000 - ₹5000",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Habsiguda Main Road, Near Metro Station",
      "addressLocality": "Habsiguda, Hyderabad",
      "addressRegion": "Telangana",
      "postalCode": "500007",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 17.4328,
      "longitude": 78.5441
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "05:00",
      "closes": "21:30"
    },
    "hasMap": "https://maps.app.goo.gl/rANFitnessMapUrl",
    "sameAs": [
      "https://www.instagram.com/ranfitness",
      "https://www.facebook.com/ranfitness"
    ]
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${orbitron.variable} h-full antialiased darkScroll dark`}
      style={{ scrollBehavior: 'smooth' }}
    >
      <head>
        {/* Local Business Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Conditional Google Tag Manager Script */}
        {gtmId && (
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');
              `,
            }}
          />
        )}
        {/* Conditional Google Analytics Script */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script
              id="ga-script"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col bg-[#ffffff] text-[#171717] dark:bg-[#0a0a0a] dark:text-[#ededed] transition-colors duration-300 font-sans">
        {/* Conditional Google Tag Manager (noscript) */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        {children}
      </body>
    </html>
  );
}

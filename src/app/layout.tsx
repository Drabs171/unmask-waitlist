import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// MotionProvider temporarily disabled while debugging client exception
// import MotionProvider from "@/components/providers/MotionProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "Unmask.life - Dating with Personality, Not Just Photos",
    template: "%s | Unmask.life"
  },
  description: "Join the waitlist for Unmask.life - the revolutionary dating app that prioritizes authentic conversations before revealing photos. Experience meaningful connections in the GenZ way.",
  keywords: [
    "dating app", 
    "authentic dating", 
    "GenZ dating", 
    "meaningful connections", 
    "conversation first dating",
    "personality over photos",
    "waitlist",
    "real connections",
    "genuine dating"
  ],
  authors: [{ name: "Unmask.life Team" }],
  creator: "Unmask.life",
  publisher: "Unmask.life",
  category: "Social",
  classification: "Dating & Relationships",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://unmask.life'),
  
  // Enhanced Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://unmask.life',
    title: 'Unmask.life - Dating with Personality, Not Just Photos',
    description: 'Join the waitlist for the revolutionary dating app that prioritizes authentic conversations before revealing photos. Be part of the GenZ dating revolution.',
    siteName: 'Unmask.life',
    images: [
      {
        url: '/images/og-image-main.png',
        width: 1200,
        height: 630,
        alt: 'Unmask - Authentic Dating Revolution',
        type: 'image/png',
      },
      {
        url: '/images/og-image-square.png',
        width: 1200,
        height: 1200,
        alt: 'Unmask - Dating with Personality',
        type: 'image/png',
      }
    ],
  },
  
  // Enhanced Twitter Card
  twitter: {
    card: 'summary_large_image',
    site: '@unmasklife',
    creator: '@unmasklife',
    title: 'Unmask.life - Dating with Personality, Not Just Photos',
    description: 'Join the waitlist for authentic dating that prioritizes personality over photos. The GenZ dating revolution starts here! 🎭✨',
    images: ['/images/twitter-card.png'],
  },
  
  // App-specific metadata
  applicationName: 'Unmask',
  referrer: 'origin-when-cross-origin',
  // colorScheme moved to viewport
  
  // Robots and indexing
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_SITE_VERIFICATION,
  },
  
  // Additional metadata (trimmed in dev)
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FF6B9D' },
    { media: '(prefers-color-scheme: dark)', color: '#FF6B9D' },
  ],
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className="scroll-smooth focus-within:scroll-auto" 
      suppressHydrationWarning
    >
      <head>
        {/* Core Icons and Manifest */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* PWA and Mobile Optimization */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Unmask" />
        <meta name="msapplication-TileColor" content="#FF6B9D" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
         {/* Security headers removed in development to avoid interfering with Next.js dev runtime */}
         <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* Performance Optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://connect.facebook.net" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//connect.facebook.net" />
        
        {/* Preload Critical Resources */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* In development, aggressively unregister any previously registered service workers */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then((regs) => {
                  regs.forEach((reg) => reg.unregister());
                });
                if (window.caches) {
                  caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
                }
              }
            `,
          }}
        />
        
         {/* Structured Data */}
         <script
           type="application/ld+json"
           dangerouslySetInnerHTML={{
             __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Unmask",
              "description": "Revolutionary dating app that prioritizes authentic conversations before revealing photos",
              "url": "https://unmask.life",
              "applicationCategory": "SocialNetworkingApplication",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              },
              "creator": {
                "@type": "Organization",
                "name": "Unmask.life",
                "url": "https://unmask.life"
              },
              "audience": {
                "@type": "Audience",
                "audienceType": "GenZ Singles"
              },
              "featureList": [
                "Conversation-first dating",
                "Authentic connections",
                "Personality over photos",
                "Meaningful relationships"
              ]
             })
           }}
         />
      </head>
      <body 
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        {/* Skip to main content link for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-accent text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-accent"
        >
          Skip to main content
        </a>
        
        {/* Main content wrapper */}
        <div id="main-content" className="min-h-screen">
          {/* Verified banner injected via window hook from /api/waitlist/verify redirect */}
          <div id="verified-banner-root" className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] hidden"></div>
          {children}
        </div>
        
        {/* Screen reader announcements */}
        <div 
          id="screen-reader-announcements" 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
        />
        
      </body>
    </html>
  );
}

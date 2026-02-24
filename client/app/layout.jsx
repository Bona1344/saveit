import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'SaveIt — Download Videos & Images',
  description:
    'Download videos and images from YouTube, Twitter/X, Instagram, TikTok, and Threads. Preview media info, choose quality, and download instantly.',
  keywords: ['video downloader', 'youtube downloader', 'tiktok download', 'instagram download', 'twitter video'],
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-neutral-950 text-white min-h-screen`}
      >
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e1e2e',
              color: '#e4e4e7',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#1e1e2e',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#1e1e2e',
              },
            },
          }}
        />

        {/* Adsterra Social Bar — loads on every page */}
        <Script
          src="https://pl28784034.effectivegatecpm.com/9d/79/31/9d7931633d5e7e6deaec3339ea5da9f0.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

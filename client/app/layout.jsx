import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
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
      </body>
    </html>
  );
}

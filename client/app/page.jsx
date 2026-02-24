'use client';

import { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import toast from 'react-hot-toast';
import {
  Youtube,
  Twitter,
  Instagram,
  Download,
  LinkIcon,
  Sparkles,
  ArrowDown,
} from 'lucide-react';
import UrlInput from '@/components/UrlInput';
import MediaCard, { MediaCardSkeleton } from '@/components/MediaCard';
import FormatList, { FormatListSkeleton } from '@/components/FormatList';
import { fetchInfo } from '@/lib/api';

export default function HomePage() {
  const [mediaInfo, setMediaInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  const handleFetchInfo = async (url) => {
    setIsLoading(true);
    setMediaInfo(null);
    setCurrentUrl(url);

    try {
      const info = await fetchInfo(url);
      setMediaInfo(info);
      toast.success(`Found: ${info.title}`);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch media info.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#1a0a2e] -z-10" />
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 pt-6 pb-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Download className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">SaveIt</span>
          </div>
          <Link
            href="/about"
            className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            About
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-4">
        <section className="max-w-4xl mx-auto pt-12 md:pt-20 pb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
            <Sparkles className="w-3 h-3" />
            Free &amp; Open Source
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4 tracking-tight">
            Download{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Anything.
            </span>
          </h1>

          <p className="text-neutral-400 text-lg md:text-xl max-w-lg mx-auto mb-8">
            YouTube, Twitter, Instagram, TikTok, Threads
          </p>

          {/* Platform Icons */}
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-10">
            <PlatformIcon name="YouTube" color="text-red-500">
              <Youtube className="w-6 h-6" />
            </PlatformIcon>
            <PlatformIcon name="Twitter" color="text-neutral-300">
              <Twitter className="w-6 h-6" />
            </PlatformIcon>
            <PlatformIcon name="Instagram" color="text-pink-500">
              <Instagram className="w-6 h-6" />
            </PlatformIcon>
            <PlatformIcon name="TikTok" color="text-cyan-400">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.78a8.28 8.28 0 0 0 4.76 1.51v-3.5a4.84 4.84 0 0 1-1-.1z" />
              </svg>
            </PlatformIcon>
            <PlatformIcon name="Threads" color="text-neutral-300">
              <svg className="w-6 h-6" viewBox="0 0 192 192" fill="currentColor">
                <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.745C82.2364 44.745 69.7731 51.1409 62.1019 62.6691L75.763 71.6691C81.6891 62.8409 90.5619 61.0891 97.2664 61.0891C97.3475 61.0891 97.4291 61.0891 97.5101 61.0897C105.223 61.1404 111.061 63.4847 114.903 68.0674C117.691 71.3687 119.591 75.8404 120.576 81.4124C114.391 80.3447 107.697 79.9237 100.603 80.1557C79.3791 80.8404 65.6564 92.2397 66.5564 107.975C67.0119 115.963 70.744 122.88 77.0819 127.609C82.4719 131.62 89.3819 133.694 96.5619 133.327C105.919 132.862 113.407 129.147 118.834 122.315C122.908 117.209 125.637 110.647 127.146 102.38C132.019 105.237 135.684 108.917 137.882 113.387C141.586 120.889 141.757 133.204 131.451 143.535C122.461 152.549 111.658 156.663 97.2219 156.77C81.2964 156.652 69.2364 151.972 61.3164 142.745C53.9619 134.179 50.0619 122.041 49.8919 106.993L49.8919 85.0074C50.0619 69.9587 53.9619 57.8211 61.3164 49.2547C69.2364 40.0281 81.2964 35.3481 97.2219 35.2301C113.257 35.3487 125.414 40.0761 133.502 49.3927C137.48 53.9764 140.465 59.5387 142.417 65.9507L156.038 62.2667C153.548 53.9787 149.69 46.7667 144.514 40.7967C133.883 28.4041 118.87 22.0321 97.2664 21.8961H97.1764C75.6564 22.0321 60.7419 28.3567 50.2619 40.6567C41.2064 51.2754 36.4419 65.7254 36.2419 83.1894L36.2419 108.812C36.4419 126.275 41.2064 140.725 50.2619 151.343C60.7419 163.643 75.6564 169.968 97.1764 170.104H97.2664C114.439 169.979 128.005 164.772 139.223 153.527C154.007 138.717 153.628 120.467 148.191 109.317C144.392 101.512 137.651 95.2787 128.788 91.0787" />
              </svg>
            </PlatformIcon>
          </div>

          {/* URL Input */}
          <UrlInput onSubmit={handleFetchInfo} isLoading={isLoading} />
        </section>

        {/* Media Info Section */}
        <section className="max-w-4xl mx-auto pb-8">
          {isLoading && (
            <>
              <MediaCardSkeleton />
              <FormatListSkeleton />
            </>
          )}

          {!isLoading && mediaInfo && (
            <>
              <MediaCard info={mediaInfo} />
              <FormatList formats={mediaInfo.formats} url={currentUrl} />
            </>
          )}
        </section>

        {/* How It Works */}
        <section className="max-w-4xl mx-auto py-16 border-t border-neutral-800/50">
          <h2 className="text-2xl font-bold text-white text-center mb-10">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StepCard
              number="1"
              title="Paste Link"
              description="Copy the video or post URL from any supported platform and paste it here."
              icon={<LinkIcon className="w-6 h-6" />}
            />
            <StepCard
              number="2"
              title="Choose Quality"
              description="Preview the media info and select your preferred video quality or audio format."
              icon={<Sparkles className="w-6 h-6" />}
            />
            <StepCard
              number="3"
              title="Download"
              description="Click download and your file will be ready in seconds. It's that simple."
              icon={<ArrowDown className="w-6 h-6" />}
            />
          </div>
        </section>

        {/* Native Banner Ad */}
        <section className="max-w-4xl mx-auto py-8">
          <div id="container-984d3f8515ec11bd4cb55312a7bcf113"></div>
          <Script
            async
            data-cfasync="false"
            src="https://pl28784046.effectivegatecpm.com/984d3f8515ec11bd4cb55312a7bcf113/invoke.js"
            strategy="afterInteractive"
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neutral-800/50 py-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-neutral-500">
            For personal use only. Respect copyright laws.
          </p>
          <p className="text-xs text-neutral-600 mt-1">
            SaveIt &copy; {new Date().getFullYear()} — Not affiliated with any platform.
          </p>
        </div>
      </footer>
    </div>
  );
}

function PlatformIcon({ children, name, color }) {
  return (
    <div className="group flex flex-col items-center gap-1">
      <div
        className={`w-12 h-12 rounded-xl bg-neutral-800/60 border border-neutral-700/40 flex items-center justify-center ${color} transition-all duration-300 group-hover:scale-110 group-hover:bg-neutral-700/60`}
      >
        {children}
      </div>
      <span className="text-[10px] text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
        {name}
      </span>
    </div>
  );
}

function StepCard({ number, title, description, icon }) {
  return (
    <div className="text-center p-6 rounded-2xl bg-neutral-800/30 border border-neutral-700/30 hover:border-neutral-600/40 transition-all duration-300">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 text-blue-400 mb-4">
        {icon}
      </div>
      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold mb-3 ml-2">
        {number}
      </div>
      <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
      <p className="text-neutral-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

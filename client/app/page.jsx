'use client';

import { useState } from 'react';
import Link from 'next/link';
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
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.73.716c-1.097-3.93-3.847-5.287-7.591-5.312-2.796.019-4.87.89-6.165 2.587-1.203 1.577-1.838 3.915-1.862 6.94v.011c.024 3.088.673 5.452 1.93 7.023 1.297 1.621 3.36 2.455 6.127 2.476 2.316-.016 4.078-.624 5.387-1.86 1.498-1.413 1.57-3.18 1.57-3.552 0-1.544-.43-2.746-1.278-3.573-.635-.618-1.512-1.006-2.594-1.16.115.623.17 1.266.156 1.92-.02.878-.17 1.684-.45 2.4a5.267 5.267 0 0 1-1.24 1.89c-.52.52-1.15.91-1.87 1.15-.73.24-1.54.36-2.4.36-1.93 0-3.42-.55-4.43-1.63-1.02-1.09-1.53-2.63-1.53-4.6 0-1.97.51-3.51 1.53-4.6 1.01-1.08 2.5-1.63 4.43-1.63 1.92 0 3.41.55 4.43 1.63.51.54.9 1.19 1.18 1.93l-2.4.84a3.42 3.42 0 0 0-.62-1.05c-.56-.59-1.42-.88-2.59-.88-1.17 0-2.03.3-2.59.88-.56.59-.84 1.49-.84 2.69s.28 2.09.84 2.68c.56.59 1.42.88 2.59.88.86 0 1.55-.17 2.06-.52.52-.35.82-.85.91-1.5H11.2v-2.32h5.88c.06.38.09.77.09 1.17 0 1.46-.3 2.72-.9 3.78a5.95 5.95 0 0 1-2.46 2.4c-1.04.56-2.28.84-3.71.84z" />
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

'use client';

import {
  Download,
  Shield,
  Zap,
  Globe,
  Heart,
  ArrowLeft,
  Youtube,
  Twitter,
  Instagram,
} from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';

export default function AboutPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#1a0a2e] -z-10" />

      {/* Header */}
      <header className="relative z-10 pt-6 pb-4 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Download className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">SaveIt</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="relative z-10 px-4 pb-16">
        <div className="max-w-3xl mx-auto pt-10 md:pt-16">
          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            About{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              SaveIt
            </span>
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed mb-12">
            SaveIt is a free, open-source media downloader that lets you save
            videos, images, and audio from your favorite social platforms — all
            from one simple interface.
          </p>

          {/* Features */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-6">Why SaveIt?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FeatureCard
                icon={<Zap className="w-5 h-5" />}
                title="Fast Downloads"
                description="Powered by yt-dlp, one of the fastest and most reliable download engines available."
              />
              <FeatureCard
                icon={<Shield className="w-5 h-5" />}
                title="Private & Secure"
                description="Everything runs locally on your machine. No data is sent to third-party servers."
              />
              <FeatureCard
                icon={<Globe className="w-5 h-5" />}
                title="Multi-Platform"
                description="Supports YouTube, Twitter/X, Instagram, TikTok, and Threads from one place."
              />
              <FeatureCard
                icon={<Heart className="w-5 h-5" />}
                title="Completely Free"
                description="No ads, no subscriptions, no hidden fees. Open-source and community-driven."
              />
            </div>
          </section>

          {/* Supported Platforms */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-6">
              Supported Platforms
            </h2>
            <div className="rounded-2xl bg-neutral-800/40 border border-neutral-700/40 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-700/40">
                    <th className="text-left text-neutral-400 font-medium px-5 py-3">
                      Platform
                    </th>
                    <th className="text-center text-neutral-400 font-medium px-3 py-3">
                      Videos
                    </th>
                    <th className="text-center text-neutral-400 font-medium px-3 py-3">
                      Images
                    </th>
                    <th className="text-center text-neutral-400 font-medium px-3 py-3">
                      Audio
                    </th>
                  </tr>
                </thead>
                <tbody className="text-neutral-300">
                  <PlatformRow name="YouTube" videos images={false} audio />
                  <PlatformRow name="Twitter / X" videos images audio />
                  <PlatformRow name="Instagram" videos images audio />
                  <PlatformRow name="TikTok" videos images={false} audio />
                  <PlatformRow name="Threads" videos images audio />
                </tbody>
              </table>
            </div>
          </section>

          {/* How It Works */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-4">How It Works</h2>
            <ol className="space-y-4 text-neutral-400 leading-relaxed">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  1
                </span>
                <span>
                  <strong className="text-white">Paste a link</strong> — Copy
                  the URL of any video, reel, tweet, or post from a supported
                  platform and paste it into the search bar.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  2
                </span>
                <span>
                  <strong className="text-white">Choose your quality</strong> —
                  Preview the title, thumbnail, and duration, then pick your
                  preferred format and resolution.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  3
                </span>
                <span>
                  <strong className="text-white">Download</strong> — Hit the
                  download button and your file will be processed and saved to
                  your device in seconds.
                </span>
              </li>
            </ol>
          </section>

          {/* Native Banner Ad */}
          <section className="mb-14">
            <div id="container-984d3f8515ec11bd4cb55312a7bcf113"></div>
            <Script
              async
              data-cfasync="false"
              src="https://pl28784046.effectivegatecpm.com/984d3f8515ec11bd4cb55312a7bcf113/invoke.js"
              strategy="lazyOnload"
            />
          </section>

          {/* Tech Stack */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-4">
              Built With
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                'Next.js 14',
                'Tailwind CSS',
                'Express.js',
                'yt-dlp',
                'FFmpeg',
                'Node.js',
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-800/60 border border-neutral-700/40 text-neutral-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* Legal Disclaimer */}
          <section className="rounded-2xl bg-neutral-800/30 border border-neutral-700/30 p-6">
            <h2 className="text-lg font-bold text-white mb-2">Disclaimer</h2>
            <p className="text-neutral-400 text-sm leading-relaxed">
              SaveIt is intended for personal use only. Users are responsible for
              ensuring they have the right to download content. Respect
              copyright laws and the terms of service of each platform. We do
              not host, store, or distribute any copyrighted material. Downloaded
              files are temporarily stored on your local machine and
              automatically deleted after 10 minutes.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neutral-800/50 py-6 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-neutral-500">
            For personal use only. Respect copyright laws.
          </p>
          <p className="text-xs text-neutral-600 mt-1">
            SaveIt &copy; {new Date().getFullYear()} — Not affiliated with any
            platform.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="rounded-xl bg-neutral-800/40 border border-neutral-700/30 p-5 hover:border-neutral-600/40 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
      <p className="text-neutral-400 text-xs leading-relaxed">{description}</p>
    </div>
  );
}

function PlatformRow({ name, videos, images, audio }) {
  const check = <span className="text-emerald-400">✓</span>;
  const dash = <span className="text-neutral-600">—</span>;

  return (
    <tr className="border-b border-neutral-700/20 last:border-0">
      <td className="px-5 py-3 font-medium">{name}</td>
      <td className="text-center px-3 py-3">{videos ? check : dash}</td>
      <td className="text-center px-3 py-3">{images ? check : dash}</td>
      <td className="text-center px-3 py-3">{audio ? check : dash}</td>
    </tr>
  );
}

'use client';

import clsx from 'clsx';

const platformConfig = {
  youtube: {
    label: 'YouTube',
    bgClass: 'bg-red-600/20',
    textClass: 'text-red-400',
    borderClass: 'border-red-500/30',
  },
  twitter: {
    label: 'Twitter / X',
    bgClass: 'bg-neutral-700/40',
    textClass: 'text-neutral-200',
    borderClass: 'border-neutral-500/30',
  },
  instagram: {
    label: 'Instagram',
    bgClass: 'bg-gradient-to-r from-purple-600/20 to-pink-500/20',
    textClass: 'text-pink-300',
    borderClass: 'border-pink-500/30',
  },
  tiktok: {
    label: 'TikTok',
    bgClass: 'bg-cyan-600/20',
    textClass: 'text-cyan-300',
    borderClass: 'border-cyan-500/30',
  },
  threads: {
    label: 'Threads',
    bgClass: 'bg-neutral-600/30',
    textClass: 'text-neutral-300',
    borderClass: 'border-neutral-500/30',
  },
  unknown: {
    label: 'Unknown',
    bgClass: 'bg-neutral-700/30',
    textClass: 'text-neutral-400',
    borderClass: 'border-neutral-600/30',
  },
};

export default function PlatformBadge({ platform }) {
  const config = platformConfig[platform] || platformConfig.unknown;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border',
        config.bgClass,
        config.textClass,
        config.borderClass
      )}
    >
      {config.label}
    </span>
  );
}

'use client';

import PlatformBadge from './PlatformBadge';
import { Clock, User } from 'lucide-react';

export default function MediaCard({ info }) {
  if (!info) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row gap-4 rounded-2xl bg-neutral-800/50 border border-neutral-700/40 p-4 backdrop-blur-sm shadow-xl">
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-full sm:w-48 md:w-56">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-700">
            {info.thumbnail ? (
              <img
                src={info.thumbnail}
                alt={info.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-500">
                <span className="text-3xl">🎬</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-center gap-2 min-w-0">
          <PlatformBadge platform={info.platform} />

          <h3 className="text-white font-semibold text-base leading-snug line-clamp-2">
            {info.title}
          </h3>

          <div className="flex items-center gap-4 text-sm text-neutral-400">
            {info.duration && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {info.duration}
              </span>
            )}
            {info.uploader && (
              <span className="flex items-center gap-1.5 truncate">
                <User className="w-3.5 h-3.5" />
                {info.uploader}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MediaCardSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto mt-6 animate-pulse">
      <div className="flex flex-col sm:flex-row gap-4 rounded-2xl bg-neutral-800/50 border border-neutral-700/40 p-4">
        <div className="flex-shrink-0 w-full sm:w-48 md:w-56">
          <div className="aspect-video rounded-xl bg-neutral-700" />
        </div>
        <div className="flex-1 flex flex-col justify-center gap-3">
          <div className="h-5 w-20 bg-neutral-700 rounded-full" />
          <div className="h-5 w-full bg-neutral-700 rounded" />
          <div className="h-5 w-3/4 bg-neutral-700 rounded" />
          <div className="h-4 w-32 bg-neutral-700 rounded" />
        </div>
      </div>
    </div>
  );
}

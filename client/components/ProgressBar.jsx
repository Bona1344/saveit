'use client';

import clsx from 'clsx';

export default function ProgressBar({ progress = 0 }) {
  const isComplete = progress >= 100;

  return (
    <div className="w-full mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-neutral-400">
          {isComplete ? 'Download complete!' : 'Downloading...'}
        </span>
        <span
          className={clsx(
            'text-xs font-semibold',
            isComplete ? 'text-emerald-400' : 'text-blue-400'
          )}
        >
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full h-2 bg-neutral-700/50 rounded-full overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500 ease-out',
            isComplete
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
              : 'bg-gradient-to-r from-blue-600 to-blue-400'
          )}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}

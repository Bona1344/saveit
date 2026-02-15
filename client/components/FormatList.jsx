'use client';

import { useState } from 'react';
import { Download, Music, Star, Loader2, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { startDownload, checkStatus, getFileDownloadUrl } from '@/lib/api';
import ProgressBar from './ProgressBar';

function formatFileSize(bytes) {
  if (!bytes) return 'Unknown size';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)} GB`;
  }
  return `${mb.toFixed(1)} MB`;
}

function FormatCard({ format, url, isBest }) {
  const [state, setState] = useState('idle'); // idle | starting | downloading | done
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    setState('starting');
    setProgress(0);

    try {
      const quality = format.format_id === 'audio-only' ? 'audio-only' : null;
      const result = await startDownload(url, format.format_id, quality);

      setState('downloading');

      const pollInterval = setInterval(async () => {
        try {
          const status = await checkStatus(result.jobId);

          if (status.status === 'done') {
            clearInterval(pollInterval);
            setProgress(100);
            setState('done');

            // Trigger file download
            const downloadUrl = getFileDownloadUrl(status.filename);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = status.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Download complete!');

            // Reset after 3 seconds
            setTimeout(() => {
              setState('idle');
              setProgress(0);
            }, 3000);
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            setState('idle');
            setProgress(0);
            toast.error(status.error || 'Download failed.');
          } else {
            setProgress(status.progress || 0);
          }
        } catch (err) {
          clearInterval(pollInterval);
          setState('idle');
          setProgress(0);
          toast.error('Error checking download status.');
        }
      }, 2000);
    } catch (err) {
      setState('idle');
      toast.error(err.message || 'Failed to start download.');
    }
  };

  const isAudio = format.format_id === 'audio-only';

  return (
    <div
      className={clsx(
        'relative flex flex-col rounded-xl border p-4 transition-all duration-300',
        'bg-neutral-800/40 backdrop-blur-sm hover:bg-neutral-800/60',
        isBest
          ? 'border-blue-500/50 ring-1 ring-blue-500/20'
          : 'border-neutral-700/40 hover:border-neutral-600/60',
        isAudio && 'border-purple-500/30'
      )}
    >
      {isBest && (
        <span className="absolute -top-2.5 left-3 flex items-center gap-1 bg-blue-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
          <Star className="w-3 h-3" />
          Recommended
        </span>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isAudio ? (
            <Music className="w-5 h-5 text-purple-400" />
          ) : (
            <div className="w-5 h-5 flex items-center justify-center text-blue-400 font-bold text-xs">
              {format.resolution === 'Best' ? '🔥' : format.resolution}
            </div>
          )}
          <div>
            <p className="text-white font-medium text-sm">{format.label}</p>
            <p className="text-neutral-500 text-xs">
              {format.ext.toUpperCase()}
              {format.filesize ? ` · ${formatFileSize(format.filesize)}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
          {format.hasVideo && (
            <span className="px-1.5 py-0.5 rounded bg-neutral-700/60 text-neutral-300">Video</span>
          )}
          {format.hasAudio && (
            <span className="px-1.5 py-0.5 rounded bg-neutral-700/60 text-neutral-300">Audio</span>
          )}
        </div>
      </div>

      {(state === 'downloading' || state === 'done') && (
        <ProgressBar progress={progress} />
      )}

      <button
        onClick={handleDownload}
        disabled={state !== 'idle'}
        className={clsx(
          'mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300',
          state === 'done'
            ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
            : state !== 'idle'
            ? 'bg-neutral-700/50 text-neutral-400 cursor-not-allowed'
            : isBest
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-md hover:shadow-blue-500/25'
            : 'bg-neutral-700/60 hover:bg-neutral-600/60 text-white'
        )}
      >
        {state === 'starting' && (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Starting...
          </>
        )}
        {state === 'downloading' && (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Downloading...
          </>
        )}
        {state === 'done' && (
          <>
            <CheckCircle className="w-4 h-4" />
            Complete
          </>
        )}
        {state === 'idle' && (
          <>
            <Download className="w-4 h-4" />
            Download
          </>
        )}
      </button>
    </div>
  );
}

export default function FormatList({ formats, url }) {
  if (!formats || formats.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 animate-fadeIn">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Download className="w-5 h-5 text-blue-400" />
        Choose Quality
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {formats.map((format, index) => (
          <FormatCard
            key={format.format_id}
            format={format}
            url={url}
            isBest={index === 0 && format.format_id === 'best'}
          />
        ))}
      </div>
    </div>
  );
}

export function FormatListSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto mt-6 animate-pulse">
      <div className="h-6 w-40 bg-neutral-700 rounded mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-neutral-700/40 bg-neutral-800/40 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-neutral-700 rounded" />
              <div>
                <div className="h-4 w-24 bg-neutral-700 rounded mb-1" />
                <div className="h-3 w-16 bg-neutral-700 rounded" />
              </div>
            </div>
            <div className="h-10 w-full bg-neutral-700 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

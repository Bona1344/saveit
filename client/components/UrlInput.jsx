'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ClipboardPaste, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function UrlInput({ onSubmit, isLoading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setError('');
    } catch {
      setError('Unable to access clipboard. Please paste manually.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmed = url.trim();

    if (!trimmed) {
      setError('Please enter a URL.');
      triggerShake();
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setError('Please enter a valid URL starting with http:// or https://');
      triggerShake();
      return;
    }

    onSubmit(trimmed);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div
        className={clsx(
          'relative flex items-center rounded-full border border-neutral-700/50 bg-neutral-800/70 backdrop-blur-sm shadow-lg transition-all duration-300',
          'focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20',
          shake && 'animate-shake',
          error && 'border-red-500/50'
        )}
      >
        <button
          type="button"
          onClick={handlePaste}
          className="flex-shrink-0 p-3 ml-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-700/50 transition-colors"
          title="Paste from clipboard"
        >
          <ClipboardPaste className="w-5 h-5" />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError('');
          }}
          placeholder="Paste a video or post link here..."
          className="flex-1 bg-transparent text-white placeholder-neutral-500 outline-none px-2 py-4 text-base"
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={isLoading}
          className={clsx(
            'flex-shrink-0 flex items-center gap-2 px-6 py-2.5 mr-1.5 rounded-full font-semibold text-sm transition-all duration-300',
            'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'shadow-md hover:shadow-blue-500/25'
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Fetching
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Fetch
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-400 text-center animate-fadeIn">
          {error}
        </p>
      )}
    </form>
  );
}

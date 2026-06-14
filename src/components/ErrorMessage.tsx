import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="grain flex min-h-screen items-center justify-center bg-paper px-[var(--shell-x)] text-ink">
      <div className="w-full max-w-md rounded-card border border-ink-line bg-paper-raised p-8 shadow-card">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-signal/10 text-signal">
          <AlertTriangle className="h-5 w-5" strokeWidth={1.9} />
        </div>
        <p className="eyebrow mt-6 text-signal">Data unavailable</p>
        <h2 className="mt-2 font-display text-2xl font-medium leading-tight">
          We couldn&rsquo;t load the records
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-mute">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex items-center gap-2 rounded-pill bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-transform duration-300 ease-editorial hover:-translate-y-0.5"
        >
          Try again
        </button>
      </div>
    </div>
  );
};

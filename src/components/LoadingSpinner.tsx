import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="grain flex min-h-screen flex-col items-center justify-center gap-6 bg-paper text-ink">
      <div className="relative h-12 w-12">
        <span className="absolute inset-0 rounded-full border border-ink-line" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand [animation-duration:0.9s]" />
      </div>
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-eyebrow text-ink-mute">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
        Querying public-health records
      </div>
    </div>
  );
};

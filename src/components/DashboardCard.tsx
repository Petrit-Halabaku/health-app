import React from 'react';

interface DashboardCardProps {
  title: string;
  kicker?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  kicker,
  action,
  children,
  className = '',
}) => {
  return (
    <section className={`overflow-hidden rounded-card border border-ink-line bg-paper-raised shadow-card ${className}`}>
      <div className="flex items-start justify-between gap-4 border-b border-ink-line px-5 py-4 sm:px-6 sm:py-5">
        <div className="min-w-0">
          {kicker && <p className="eyebrow mb-1.5">{kicker}</p>}
          <h2 className="font-display text-xl font-medium leading-tight text-ink">{title}</h2>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
};

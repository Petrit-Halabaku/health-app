import React from 'react';
import { Activity, Users, TrendingUp, type LucideIcon } from 'lucide-react';

type TabId = 'dashboard' | 'specific' | 'trends';

interface NavBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; Icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Mortality', Icon: Activity },
  { id: 'specific', label: 'Demographics', Icon: Users },
  { id: 'trends', label: 'Trends', Icon: TrendingUp },
];

export const NavBar: React.FC<NavBarProps> = ({ activeTab, onTabChange }) => {
  const listRef = React.useRef<HTMLDivElement>(null);
  const btnRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const [bar, setBar] = React.useState<{ left: number; width: number }>({ left: 0, width: 0 });

  const positionBar = React.useCallback(() => {
    const btn = btnRefs.current[activeTab];
    const list = listRef.current;
    if (!btn || !list) return;
    setBar({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [activeTab]);

  React.useLayoutEffect(() => {
    positionBar();
  }, [positionBar]);

  React.useEffect(() => {
    window.addEventListener('resize', positionBar);
    return () => window.removeEventListener('resize', positionBar);
  }, [positionBar]);

  return (
    <div className="border-t border-ink-line">
      <div className="mx-auto max-w-wide px-[var(--shell-x)]">
        <div
          ref={listRef}
          className="relative flex gap-1 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {TABS.map(({ id, label, Icon }) => {
            const active = id === activeTab;
            return (
              <button
                key={id}
                ref={(el) => (btnRefs.current[id] = el)}
                onClick={() => onTabChange(id)}
                aria-current={active ? 'page' : undefined}
                className={`group flex shrink-0 items-center gap-2.5 px-1 py-4 pr-6 text-sm transition-colors duration-300 ${
                  active ? 'text-ink' : 'text-ink-faint hover:text-ink-soft'
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-colors duration-300 ${
                    active ? 'text-brand' : 'text-ink-faint group-hover:text-ink-mute'
                  }`}
                  strokeWidth={1.9}
                />
                <span className="font-medium">{label}</span>
              </button>
            );
          })}
          <span
            className="pointer-events-none absolute -bottom-px h-[2px] bg-ink transition-all duration-500 ease-editorial"
            style={{ left: bar.left, width: bar.width }}
          />
        </div>
      </div>
    </div>
  );
};

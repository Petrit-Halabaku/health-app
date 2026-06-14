import React from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  label: string;
  placeholder?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options = [],
  value = [],
  onChange,
  label,
  placeholder = 'Select options...',
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter((item) => item !== option)
      : [...value, option];
    onChange(newValue);
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="eyebrow mb-2 block">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="relative w-full cursor-pointer rounded-lg border border-ink-line bg-paper px-3.5 py-2.5 text-left transition-colors duration-200 hover:border-ink-faint focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      >
        {value.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pr-7">
            {value.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded-pill bg-brand-wash px-2.5 py-0.5 text-xs font-medium text-brand-dark"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(item);
                }}
              >
                {item}
                <X className="h-3 w-3 opacity-60 transition-opacity hover:opacity-100" />
              </span>
            ))}
          </div>
        ) : (
          <span className="text-ink-faint">{placeholder}</span>
        )}
        <ChevronDown
          className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && options.length > 0 && (
        <div
          role="listbox"
          className="absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-ink-line bg-paper-raised shadow-float"
        >
          <div className="max-h-64 overflow-auto py-1">
            {options.map((option) => {
              const selected = value.includes(option);
              return (
                <div
                  key={option}
                  role="option"
                  aria-selected={selected}
                  className={`relative flex cursor-pointer select-none items-center justify-between py-2 pl-3.5 pr-3 text-sm transition-colors ${
                    selected ? 'bg-brand-wash text-brand-dark' : 'text-ink-soft hover:bg-paper-dim'
                  }`}
                  onClick={() => toggleOption(option)}
                >
                  <span className="truncate">{option}</span>
                  {selected && <Check className="h-4 w-4 shrink-0 text-brand" strokeWidth={2.2} />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

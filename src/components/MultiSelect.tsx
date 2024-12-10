import React from 'react';
import { Check, ChevronDown } from 'lucide-react';

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
  placeholder = 'Select options...'
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
      ? value.filter(item => item !== option)
      : [...value, option];
    onChange(newValue);
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div
        className="relative cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="min-h-[42px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
          {value.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {value.map(item => (
                <span
                  key={item}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                  onClick={e => {
                    e.stopPropagation();
                    toggleOption(item);
                  }}
                >
                  {item}
                  <button
                    type="button"
                    className="ml-1 inline-flex items-center"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </span>
      </div>
      {isOpen && options.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="max-h-60 overflow-auto py-1">
            {options.map(option => (
              <div
                key={option}
                className={`relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-blue-50 ${
                  value.includes(option) ? 'bg-blue-50' : ''
                }`}
                onClick={() => toggleOption(option)}
              >
                <span className="block truncate">{option}</span>
                {value.includes(option) && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <Check className="h-4 w-4 text-blue-600" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
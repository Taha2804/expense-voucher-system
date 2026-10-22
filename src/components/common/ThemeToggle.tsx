import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="relative flex items-center gap-1.5 h-9 px-2 rounded-xl border transition-all duration-300 focus:outline-hidden focus:ring-2 focus:ring-neutral-400 group overflow-hidden bg-neutral-100 hover:bg-neutral-200/80 border-neutral-200 text-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-800 dark:text-neutral-200 shadow-2xs cursor-pointer"
    >
      {/* Animated icon container */}
      <div className="relative w-6 h-6 flex items-center justify-center">
        {/* Sun Icon */}
        <div
          className={`absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isDark
              ? 'opacity-0 rotate-90 scale-50 pointer-events-none'
              : 'opacity-100 rotate-0 scale-100 text-amber-500'
          }`}
        >
          <Sun className="w-4 h-4 stroke-[2.2]" />
        </div>

        {/* Moon Icon */}
        <div
          className={`absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isDark
              ? 'opacity-100 rotate-0 scale-100 text-sky-400'
              : 'opacity-0 -rotate-90 scale-50 pointer-events-none'
          }`}
        >
          <Moon className="w-4 h-4 stroke-[2.2]" />
        </div>
      </div>

      {/* Label (hidden on small screens, visible on md+) */}
      <span className="hidden sm:inline-block text-[11px] font-semibold pr-1.5 select-none transition-colors">
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  );
};

"use client";

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  theme?: 'light' | 'dark';
  onToggle?: (newTheme: 'light' | 'dark') => void;
}

const updateThemeOnDom = (newTheme: 'light' | 'dark') => {
  if (typeof window === 'undefined') return;
  const root = window.document.documentElement;
  if (newTheme === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
};

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme: propTheme, onToggle }) => {
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>('dark');
  
  const activeTheme = propTheme !== undefined ? propTheme : localTheme;

  // Retrieve stored theme from localStorage after mounting
  useEffect(() => {
    const storedTheme = localStorage.getItem('ran_fitness_color_theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setLocalTheme(storedTheme);
    }
  }, []);

  // Keep DOM in sync with the active theme
  useEffect(() => {
    updateThemeOnDom(activeTheme);
  }, [activeTheme]);

  const handleToggle = () => {
    const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
    if (onToggle) {
      onToggle(newTheme);
    } else {
      setLocalTheme(newTheme);
      localStorage.setItem('ran_fitness_color_theme', newTheme);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 text-zinc-800 dark:text-yellow-400 hover:scale-105 hover:bg-zinc-200 dark:hover:bg-zinc-800/80 transition-all focus:outline-none cursor-pointer"
      aria-label="Toggle dark mode"
    >
      {activeTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

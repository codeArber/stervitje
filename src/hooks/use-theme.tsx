import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface UseTheme {
  theme: Theme;
  toggleTheme: () => void;
}

const useTheme = (): UseTheme => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get the theme from local storage or default to 'light'
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      return storedTheme;
    }

    // Check for OS preference if no theme is stored
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  });

  useEffect(() => {
    // Update the 'html' class and local storage whenever the theme changes
    const html = window.document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light'); // Optional: remove if you don't explicitly add 'light' class
    } else {
      html.classList.remove('dark');
      html.classList.add('light'); // Optional: explicitly add 'light' class
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
};

export default useTheme;
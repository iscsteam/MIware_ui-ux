"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  // Force light theme and override all possible dark theme sources
  useEffect(() => {
    const forcedTheme: Theme = "light";
    
    // Clear any existing theme preferences
    localStorage.removeItem("theme");
    localStorage.setItem("theme", forcedTheme);
    
    // Set initial theme state
    setTheme(forcedTheme);
    
    // Remove dark class and add light class
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    
    // Override CSS color-scheme property to prevent browser dark theme
    document.documentElement.style.colorScheme = "light";
    
    // Set data attribute for additional CSS targeting
    document.documentElement.setAttribute("data-theme", "light");
    
    // Override meta theme-color for mobile browsers
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', '#ffffff'); // Light theme color
    
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      document.documentElement.style.colorScheme = "dark";
      document.documentElement.setAttribute("data-theme", "dark");
      
      // Update meta theme-color for dark mode
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#000000');
      }
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.style.colorScheme = "light";
      document.documentElement.setAttribute("data-theme", "light");
      
      // Update meta theme-color for light mode
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#ffffff');
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
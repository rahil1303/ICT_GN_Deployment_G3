import { createContext, useContext, useEffect, useState } from "react";
import { useTTS } from "../services/ttsService";
import { useVibration } from "../hooks/useVibration";

interface AccessibilityContextType {
  theme: 'high-contrast' | 'dark';
  setTheme: (theme: 'high-contrast' | 'dark') => void;
  announceToUser: (message: string, priority?: 'polite' | 'assertive') => void;
  vibratePattern: (pattern: number | number[]) => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<'high-contrast' | 'dark'>('high-contrast');
  const [speechRate, setSpeechRateState] = useState(1.0);
  const [language, setLanguageState] = useState('en');
  
  const { speak } = useTTS();
  const { vibrate } = useVibration();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove('high-contrast', 'dark');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  const setTheme = (newTheme: 'high-contrast' | 'dark') => {
    setThemeState(newTheme);
    const messages = {
      'high-contrast': 'Theme changed to high contrast',
      'dark': 'Theme changed to dark mode'
    };
    announceToUser(messages[newTheme]);
  };

  const announceToUser = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Update ARIA live region
    const liveRegion = document.getElementById(priority === 'assertive' ? 'urgent-announcements' : 'polite-announcements');
    if (liveRegion) {
      liveRegion.textContent = message;
      // Clear after announcement to allow repeated messages
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }

    // Also use TTS
    speak(message, { rate: speechRate, lang: language });
  };

  const vibratePattern = (pattern: number | number[]) => {
    vibrate(pattern);
  };

  const setSpeechRate = (rate: number) => {
    setSpeechRateState(rate);
    announceToUser(`Speech rate set to ${rate}`);
  };

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    const messages = {
      'en': 'Language changed to English',
      'es': 'Idioma cambiado a Español',
      'fr': 'Langue changée en Français'
    };
    announceToUser(messages[lang as keyof typeof messages] || 'Language changed', 'assertive');
  };

  return (
    <AccessibilityContext.Provider value={{
      theme,
      setTheme,
      announceToUser,
      vibratePattern,
      speechRate,
      setSpeechRate,
      language,
      setLanguage
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

import { Button } from "@/components/ui/button";
import { useAccessibility } from "../contexts/AccessibilityContext";

const languages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useAccessibility();

  return (
    <div role="group" aria-label="Language selection" className="flex gap-2">
      {languages.map((lang) => {
        const isActive = language === lang.code;
        
        return (
          <Button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`touch-target px-3 py-1 rounded font-medium text-sm transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-yellow-300 text-black hover:bg-yellow-400'
            }`}            
            aria-pressed={isActive}
            aria-label={`Switch to ${lang.label}`}
          >
            {lang.label}
          </Button>
        );
      })}
    </div>
  );
}

import { User, Ticket, Bus, Route, CheckCircle, Bell, HelpCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useTranslation } from "../utils/i18n";

const navigationItems = [
  { id: 'account', path: '/account', icon: User, labelKey: 'nav.account' },
  { id: 'tickets', path: '/tickets', icon: Ticket, labelKey: 'nav.tickets' },
  { id: 'boarding', path: '/boarding', icon: Bus, labelKey: 'nav.boarding' },
  { id: 'plan', path: '/plan', icon: Route, labelKey: 'nav.plan' },
  { id: 'validation', path: '/validation', icon: CheckCircle, labelKey: 'nav.validation' },
  { id: 'alerts', path: '/alerts', icon: Bell, labelKey: 'nav.alerts' },
  { id: 'support', path: '/support', icon: HelpCircle, labelKey: 'nav.support' },
  { id: 'settings', path: '/settings', icon: Settings, labelKey: 'nav.settings' },
];

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const { announceToUser, language } = useAccessibility();
  const { t } = useTranslation(language);

  const handleTabClick = (path: string, label: string) => {
    setLocation(path);
    announceToUser(`Switched to ${label}`);
  };

  return (
    <nav className="border-b-2 border-border p-4" role="navigation" aria-label="Main navigation">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2" role="tablist">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const label = t(item.labelKey);
            const isActive = location === item.path || (location === '/' && item.path === '/account');
            
            return (
              <Button
                key={item.id}
                onClick={() => handleTabClick(item.path, label)}
                className={`nav-tab touch-target p-4 border-2 rounded-lg font-medium text-center h-auto flex flex-col items-center transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-transparent text-foreground border-border hover:bg-primary hover:text-primary-foreground'
                }`}
                role="tab"
                aria-selected={isActive}
                aria-label={label}
              >
                <Icon className="text-xl mb-2" aria-hidden="true" />
                <span className="text-sm">{label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

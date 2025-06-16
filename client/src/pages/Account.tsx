import { useState } from "react";
import { User, CreditCard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useTranslation } from "../utils/i18n";
import { useVoice } from "../hooks/useVoice";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

export default function Account() {
  const { announceToUser, vibratePattern, language } = useAccessibility();
  const { t } = useTranslation(language);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null);

  const { startListening, isListening } = useVoice({
    onResult: (transcript) => {
      if (activeVoiceField) {
        setFormData(prev => ({
          ...prev,
          [activeVoiceField]: transcript
        }));
        announceToUser(`${activeVoiceField} set to ${transcript}`);
        setActiveVoiceField(null);
      }
    }
  });

  // Fetch user profile
  const { data: userProfile } = useQuery({
    queryKey: ['/api/users/profile'],
    enabled: false // Enable when we have authentication
  });

  // Fetch active passes
  const { data: passes } = useQuery({
    queryKey: ['/api/passes'],
    enabled: false
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: typeof formData) => {
      const response = await apiRequest('POST', '/api/users/register', userData);
      return response.json();
    },
    onSuccess: () => {
      announceToUser('Account registered successfully');
      vibratePattern(200);
    },
    onError: () => {
      announceToUser('Registration failed. Please try again.');
      vibratePattern([100, 100, 100]);
    }
  });

  const handleVoiceInput = (fieldName: string) => {
    setActiveVoiceField(fieldName);
    announceToUser(`Speak your ${fieldName}`);
    startListening();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  return (
    <section aria-labelledby="account-heading">
      <h2 id="account-heading" className="text-3xl font-bold mb-6 flex items-center">
        <User className="mr-3" aria-hidden="true" />
        {t('account.title')}
      </h2>

      {/* Registration Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('account.register')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="block font-medium mb-2">
                {t('account.fullName')}
              </Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="flex-1 p-3 border-2 border-border rounded text-foreground bg-input"
                  placeholder="John Doe"
                  aria-describedby="fullName-help"
                />
                <Button
                  type="button"
                  onClick={() => handleVoiceInput('fullName')}
                  className="touch-target px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90"
                  aria-label="Speak your full name"
                  disabled={isListening && activeVoiceField === 'fullName'}
                >
                  <User aria-hidden="true" />
                </Button>
              </div>
              <div id="fullName-help" className="text-sm mt-1 text-muted-foreground">
                Press the microphone button to speak your name, or type it manually
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="block font-medium mb-2">
                {t('account.email')}
              </Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="flex-1 p-3 border-2 border-border rounded text-foreground bg-input"
                  placeholder="john@example.com"
                  aria-describedby="email-help"
                />
                <Button
                  type="button"
                  onClick={() => handleVoiceInput('email')}
                  className="touch-target px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90"
                  aria-label="Speak your email address"
                  disabled={isListening && activeVoiceField === 'email'}
                >
                  <User aria-hidden="true" />
                </Button>
              </div>
              <div id="email-help" className="text-sm mt-1 text-muted-foreground">
                Press the microphone button to speak your email, or type it manually
              </div>
            </div>

            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full touch-target py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 focus-visible"
            >
              <Plus className="mr-2" aria-hidden="true" />
              {registerMutation.isPending ? t('common.loading') : t('account.register.button')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Pass Wallet */}
      <Card>
        <CardHeader>
          <CardTitle>{t('account.passes')}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Active Pass Example */}
          <div className="border-2 border-green-600 rounded-lg p-4 mb-4 bg-green-50 dark:bg-green-900/20">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{t('account.monthlyPass')}</h4>
                <p className="text-muted-foreground">Valid until January 31, 2024</p>
                <p className="text-sm text-muted-foreground">Zones 1-3 | All transit types</p>
              </div>
              <Button
                className="touch-target px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                aria-label="Activate monthly pass for boarding"
                onClick={() => {
                  announceToUser('Monthly pass activated');
                  vibratePattern(200);
                }}
              >
                <CreditCard className="mr-2" aria-hidden="true" />
                {t('account.activate')}
              </Button>
            </div>
          </div>

          {/* Purchase New Pass */}
          <div className="border-2 border-border rounded-lg p-4">
            <h4 className="font-semibold mb-3">{t('account.purchase')}</h4>
            <div className="grid gap-3">
              <Button
                variant="outline"
                className="text-left p-4 border-2 border-border rounded hover:border-primary hover:bg-accent/10 focus-visible h-auto"
              >
                <div className="flex justify-between items-center w-full">
                  <div>
                    <h5 className="font-medium">Weekly Pass</h5>
                    <p className="text-sm text-muted-foreground">7 days | All zones</p>
                  </div>
                  <span className="font-bold text-lg">$25.00</span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="text-left p-4 border-2 border-border rounded hover:border-primary hover:bg-accent/10 focus-visible h-auto"
              >
                <div className="flex justify-between items-center w-full">
                  <div>
                    <h5 className="font-medium">Monthly Pass</h5>
                    <p className="text-sm text-muted-foreground">30 days | All zones</p>
                  </div>
                  <span className="font-bold text-lg">$95.00</span>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

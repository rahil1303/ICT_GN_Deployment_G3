import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Volume2, Smartphone, Shield, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useTranslation } from "../utils/i18n";
import { useVibration } from "../hooks/useVibration";
import { useTTS } from "../services/ttsService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

export default function Settings() {
  const { 
    announceToUser, 
    vibratePattern, 
    language, 
    setLanguage,
    theme,
    setTheme,
    speechRate,
    setSpeechRate
  } = useAccessibility();
  const { t } = useTranslation(language);
  const { vibrate, isSupported: vibrationSupported } = useVibration();
  const { speak } = useTTS();

  const [localSettings, setLocalSettings] = useState({
    autoReadAlerts: true,
    vibrationEnabled: true,
    vibrationIntensity: 2,
    locationEnabled: true,
    autoRequestAssistance: false,
    assistanceNote: 'I use a white cane and may need guidance to the door.',
    useMockData: true,
    simulateAssistance: false,
    simulateValidation: false
  });

  // Fetch user settings
  const { data: userSettings } = useQuery({
    queryKey: ['/api/settings'],
    enabled: false
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<typeof localSettings>) => {
      const response = await apiRequest('PATCH', '/api/settings', settings);
      return response.json();
    },
    onSuccess: () => {
      announceToUser('Settings saved successfully');
      vibratePattern(200);
    },
    onError: () => {
      announceToUser('Failed to save settings. Please try again.');
      vibratePattern([100, 100, 100]);
    }
  });

  const handleThemeChange = (newTheme: 'high-contrast' | 'dark') => {
    setTheme(newTheme);
    const messages = {
      'high-contrast': 'Theme changed to high contrast',
      'dark': 'Theme changed to dark mode'
    };
    announceToUser(messages[newTheme]);
  };

  const handleSpeechRateChange = (value: number[]) => {
    const rate = value[0];
    setSpeechRate(rate);
  };

  const testSpeechRate = () => {
    speak('This is a test of the current speech rate setting', { rate: speechRate });
  };

  const testVibration = () => {
    const intensityPatterns = {
      1: [100],
      2: [200],
      3: [300]
    };
    vibrate(intensityPatterns[localSettings.vibrationIntensity as keyof typeof intensityPatterns]);
    announceToUser('Vibration test completed');
  };

  const handleSettingChange = (key: keyof typeof localSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    updateSettingsMutation.mutate({ [key]: value });
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all stored data? This cannot be undone.')) {
      // Clear IndexedDB and localStorage
      indexedDB.deleteDatabase('transitaccess');
      localStorage.clear();
      announceToUser('All stored data has been cleared');
      vibratePattern([200, 100, 200]);
    }
  };

  const replayOnboarding = () => {
    announceToUser('Welcome to TransitAccess. This is the onboarding tutorial replay. To register, press the Account tab. To plan a journey, press Plan Journey. Use the Voice Command button for hands-free navigation.');
    vibratePattern(200);
  };

  return (
    <section aria-labelledby="settings-heading">
      <h2 id="settings-heading" className="text-3xl font-bold mb-6 flex items-center">
        <SettingsIcon className="mr-3" aria-hidden="true" />
        Settings & Personalization
      </h2>

      {/* Accessibility Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Accessibility Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Selection */}
          <div>
            <h4 className="font-medium mb-3">Visual Theme</h4>
            <div className="grid gap-2">
              <label className={`flex items-center p-3 border-2 rounded cursor-pointer hover:bg-accent/10 transition-colors ${
                theme === 'high-contrast' ? 'border-primary bg-accent/10' : 'border-border'
              }`}>
                <input
                  type="radio"
                  name="theme"
                  value="high-contrast"
                  checked={theme === 'high-contrast'}
                  onChange={() => handleThemeChange('high-contrast')}
                  className="mr-3 touch-target"
                />
                <span>High Contrast (Black on Yellow) {theme === 'high-contrast' ? '- Current' : ''}</span>
              </label>
              <label className={`flex items-center p-3 border-2 rounded cursor-pointer hover:bg-accent/10 transition-colors ${
                theme === 'dark' ? 'border-primary bg-accent/10' : 'border-border'
              }`}>
                <input
                  type="radio"
                  name="theme"
                  value="dark-mode"
                  checked={theme === 'dark'}
                  onChange={() => handleThemeChange('dark')}
                  className="mr-3 touch-target"
                />
                <span>Dark Mode (Yellow on Black)</span>
              </label>
            </div>
          </div>

          {/* Speech Settings */}
          <div>
            <h4 className="font-medium mb-3 flex items-center">
              <Volume2 className="mr-2" aria-hidden="true" />
              Text-to-Speech
            </h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="speech-rate" className="block font-medium mb-2">
                  Speech Rate: {speechRate}x
                </Label>
                <div className="flex items-center gap-4">
                  <span className="text-sm">Slow</span>
                  <Slider
                    id="speech-rate"
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={[speechRate]}
                    onValueChange={handleSpeechRateChange}
                    className="flex-1"
                    aria-label="Speech rate slider"
                  />
                  <span className="text-sm">Fast</span>
                </div>
                <Button
                  onClick={testSpeechRate}
                  className="mt-2 touch-target px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90"
                >
                  <Volume2 className="mr-2" aria-hidden="true" />
                  Test Speech Rate
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-read-alerts"
                  checked={localSettings.autoReadAlerts}
                  onCheckedChange={(checked) => 
                    handleSettingChange('autoReadAlerts', !!checked)
                  }
                  className="touch-target"
                />
                <Label htmlFor="auto-read-alerts">Automatically read alerts aloud</Label>
              </div>
            </div>
          </div>

          {/* Vibration Settings */}
          {vibrationSupported && (
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <Smartphone className="mr-2" aria-hidden="true" />
                Haptic Feedback
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vibration-enabled"
                    checked={localSettings.vibrationEnabled}
                    onCheckedChange={(checked) => 
                      handleSettingChange('vibrationEnabled', !!checked)
                    }
                    className="touch-target"
                  />
                  <Label htmlFor="vibration-enabled">Enable vibration feedback</Label>
                </div>

                {localSettings.vibrationEnabled && (
                  <div>
                    <Label htmlFor="vibration-intensity" className="block font-medium mb-2">
                      Vibration Intensity: {localSettings.vibrationIntensity}
                    </Label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">Light</span>
                      <Slider
                        id="vibration-intensity"
                        min={1}
                        max={3}
                        step={1}
                        value={[localSettings.vibrationIntensity]}
                        onValueChange={(value) => 
                          handleSettingChange('vibrationIntensity', value[0])
                        }
                        className="flex-1"
                        aria-label="Vibration intensity slider"
                      />
                      <span className="text-sm">Strong</span>
                    </div>
                    <Button
                      onClick={testVibration}
                      className="mt-2 touch-target px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90"
                    >
                      <Smartphone className="mr-2" aria-hidden="true" />
                      Test Vibration
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assistance Preferences */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Boarding Assistance Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="assistance-note" className="block font-medium mb-2">
              Personal Assistance Note
            </Label>
            <Textarea
              id="assistance-note"
              rows={3}
              value={localSettings.assistanceNote}
              onChange={(e) => handleSettingChange('assistanceNote', e.target.value)}
              className="w-full p-3 border-2 border-border rounded text-foreground bg-input"
              placeholder="e.g., I use a wheelchair, I need extra time to board, etc."
            />
            <p className="text-sm text-muted-foreground mt-1">
              This note will be shared with drivers when you request assistance
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-request-assistance"
              checked={localSettings.autoRequestAssistance}
              onCheckedChange={(checked) => 
                handleSettingChange('autoRequestAssistance', !!checked)
              }
              className="touch-target"
            />
            <Label htmlFor="auto-request-assistance">
              Automatically request assistance when boarding is detected
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Data */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2" aria-hidden="true" />
            Privacy & Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Location Services</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Location access is used for automatic check-in/out, vehicle detection, and journey planning.
            </p>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="location-enabled"
                checked={localSettings.locationEnabled}
                onCheckedChange={(checked) => 
                  handleSettingChange('locationEnabled', !!checked)
                }
                className="touch-target"
              />
              <Label htmlFor="location-enabled">Allow location access</Label>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Data Storage</h4>
            <Button
              onClick={clearAllData}
              variant="destructive"
              className="touch-target px-4 py-2 rounded focus-visible"
            >
              <Trash2 className="mr-2" aria-hidden="true" />
              Clear All Stored Data
            </Button>
            <p className="text-sm text-muted-foreground mt-1">
              This will remove all saved routes, tickets, and preferences
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Development Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Development & Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="use-mock-data"
              checked={localSettings.useMockData}
              onCheckedChange={(checked) => 
                handleSettingChange('useMockData', !!checked)
              }
              className="touch-target"
            />
            <Label htmlFor="use-mock-data">Use mock GTFS data (for testing)</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="simulate-assistance"
              checked={localSettings.simulateAssistance}
              onCheckedChange={(checked) => 
                handleSettingChange('simulateAssistance', !!checked)
              }
              className="touch-target"
            />
            <Label htmlFor="simulate-assistance">Simulate boarding assistance responses</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="simulate-validation"
              checked={localSettings.simulateValidation}
              onCheckedChange={(checked) => 
                handleSettingChange('simulateValidation', !!checked)
              }
              className="touch-target"
            />
            <Label htmlFor="simulate-validation">Simulate missed validation scenarios</Label>
          </div>

          <Button
            onClick={replayOnboarding}
            className="touch-target px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 focus-visible"
          >
            <RotateCcw className="mr-2" aria-hidden="true" />
            Replay Onboarding Tutorial
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

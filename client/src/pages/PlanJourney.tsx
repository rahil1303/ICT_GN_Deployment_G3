import { useState } from "react";
import { Route, Mic, Search, Bookmark, List, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useTranslation } from "../utils/i18n";
import { useVoice } from "../hooks/useVoice";
import { useMutation, useQuery } from "@tanstack/react-query";
import { transitService, type JourneyOption } from "../services/transitService";

export default function PlanJourney() {
  const { announceToUser, vibratePattern, language } = useAccessibility();
  const { t } = useTranslation(language);
  const [formData, setFormData] = useState({
    from: 'Current Location',
    to: '',
    date: '',
    time: '',
  });
  const [preferences, setPreferences] = useState({
    lowFloor: false,
    fewerTransfers: false,
    wheelchair: false,
  });
  const [routeOptions, setRouteOptions] = useState<JourneyOption[]>([]);
  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null);

  const { startListening, isListening } = useVoice({
    onResult: (transcript) => {
      if (activeVoiceField) {
        if (activeVoiceField === 'voice-planning') {
          handleVoicePlanning(transcript);
        } else {
          setFormData(prev => ({
            ...prev,
            [activeVoiceField]: transcript
          }));
          announceToUser(`${activeVoiceField} set to ${transcript}`);
        }
        setActiveVoiceField(null);
      }
    }
  });

  // Plan journey mutation
  const planJourneyMutation = useMutation({
    mutationFn: async (planData: any) => {
      return await transitService.planJourney(planData);
    },
    onSuccess: (routes) => {
      setRouteOptions(routes);
      announceToUser(`Found ${routes.length} route options`);
      vibratePattern(200);
    },
    onError: () => {
      announceToUser('Journey planning failed. Please try again.');
      vibratePattern([100, 100, 100]);
    }
  });

  const handleVoicePlanning = (transcript: string) => {
    // Parse voice command like "Plan journey from home to hospital at 10 AM tomorrow"
    const lowerTranscript = transcript.toLowerCase();
    
    let from = 'Current Location';
    let to = '';
    let time = '';
    
    // Extract "from" location
    const fromMatch = lowerTranscript.match(/from\s+([^to]+)(?:\s+to)/);
    if (fromMatch) {
      from = fromMatch[1].trim();
    }
    
    // Extract "to" location
    const toMatch = lowerTranscript.match(/to\s+([^at]+)(?:\s+at|$)/);
    if (toMatch) {
      to = toMatch[1].trim();
    }
    
    // Extract time
    const timeMatch = lowerTranscript.match(/at\s+(.+)/);
    if (timeMatch) {
      time = timeMatch[1].trim();
    }
    
    setFormData(prev => ({ ...prev, from, to, time }));
    announceToUser(`Planning journey from ${from} to ${to}${time ? ` at ${time}` : ''}`);
    
    // Auto-submit if we have destination
    if (to) {
      handlePlanJourney({ from, to, time, preferences });
    }
  };

  const handleVoiceInput = (fieldName: string) => {
    setActiveVoiceField(fieldName);
    if (fieldName === 'voice-planning') {
      announceToUser('Describe your journey. Say something like "Plan journey from home to hospital at 10 AM tomorrow"');
    } else {
      announceToUser(`Speak your ${fieldName}`);
    }
    startListening();
  };

  const handlePlanJourney = (planData?: any) => {
    const data = planData || {
      from: formData.from,
      to: formData.to,
      time: formData.time,
      date: formData.date,
      preferences
    };
    
    if (!data.to) {
      announceToUser('Please enter a destination');
      return;
    }
    
    planJourneyMutation.mutate(data);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePlanJourney();
  };

  const saveRoute = (routeId: number) => {
    announceToUser(`Route ${routeId} saved for later use`);
    vibratePattern(100);
  };

  const viewRouteDetails = (routeId: number) => {
    const route = routeOptions.find(r => r.id === routeId);
    if (route) {
      const details = route.steps.map(step => 
        `${step.mode} ${step.route} from ${step.from} to ${step.to}, ${step.duration} minutes`
      ).join('. ');
      announceToUser(`Route details: ${details}`);
    }
  };

  return (
    <section aria-labelledby="plan-heading">
      <h2 id="plan-heading" className="text-3xl font-bold mb-6 flex items-center">
        <Route className="mr-3" aria-hidden="true" />
        {t('nav.plan')}
      </h2>

      {/* Trip Wizard */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Plan Your Trip</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Voice Trip Planning */}
          <div className="border-2 border-accent rounded-lg p-4 mb-4 bg-accent/10">
            <h4 className="font-semibold mb-2">Voice Trip Planning</h4>
            <Button
              onClick={() => handleVoiceInput('voice-planning')}
              disabled={isListening || planJourneyMutation.isPending}
              className={`touch-target px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 focus-visible mb-2 ${
                isListening && activeVoiceField === 'voice-planning' ? 'voice-recording' : ''
              }`}
            >
              <Mic className="mr-2" aria-hidden="true" />
              Plan Trip by Voice
            </Button>
            <p className="text-sm text-muted-foreground">
              Say something like "Plan journey from home to hospital at 10 AM tomorrow"
            </p>
          </div>

          {/* Manual Trip Planning */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="from-location" className="block font-medium mb-2">From</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  id="from-location"
                  value={formData.from}
                  onChange={(e) => setFormData(prev => ({ ...prev, from: e.target.value }))}
                  className="flex-1 p-3 border-2 border-border rounded text-foreground bg-input"
                  placeholder="Current location"
                />
                <Button
                  type="button"
                  onClick={() => handleVoiceInput('from')}
                  className="touch-target px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90"
                  aria-label="Speak starting location"
                >
                  <Mic aria-hidden="true" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="to-location" className="block font-medium mb-2">To</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  id="to-location"
                  value={formData.to}
                  onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                  className="flex-1 p-3 border-2 border-border rounded text-foreground bg-input"
                  placeholder="Enter destination"
                />
                <Button
                  type="button"
                  onClick={() => handleVoiceInput('to')}
                  className="touch-target px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90"
                  aria-label="Speak destination"
                >
                  <Mic aria-hidden="true" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="departure-date" className="block font-medium mb-2">Date</Label>
                <Input
                  type="date"
                  id="departure-date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-3 border-2 border-border rounded text-foreground bg-input"
                />
              </div>
              <div>
                <Label htmlFor="departure-time" className="block font-medium mb-2">Time</Label>
                <Input
                  type="time"
                  id="departure-time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full p-3 border-2 border-border rounded text-foreground bg-input"
                />
              </div>
            </div>

            {/* Accessibility Preferences */}
            <div>
              <h4 className="font-medium mb-2">Accessibility Preferences</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="low-floor"
                    checked={preferences.lowFloor}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, lowFloor: !!checked }))
                    }
                    className="touch-target"
                  />
                  <Label htmlFor="low-floor">Low-floor vehicles only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fewer-transfers"
                    checked={preferences.fewerTransfers}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, fewerTransfers: !!checked }))
                    }
                    className="touch-target"
                  />
                  <Label htmlFor="fewer-transfers">Minimize transfers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="wheelchair"
                    checked={preferences.wheelchair}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, wheelchair: !!checked }))
                    }
                    className="touch-target"
                  />
                  <Label htmlFor="wheelchair">Wheelchair accessible</Label>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={planJourneyMutation.isPending}
              className="w-full touch-target py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 focus-visible"
            >
              <Search className="mr-2" aria-hidden="true" />
              {planJourneyMutation.isPending ? 'Finding Routes...' : 'Find Routes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Journey Options */}
      {routeOptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Route Options</CardTitle>
          </CardHeader>
          <CardContent>
            {routeOptions.map((route) => (
              <div 
                key={route.id}
                className="border-2 border-border rounded-lg p-4 mb-4 hover:border-primary hover:bg-accent/10 focus-within:border-primary"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{route.summary}</h4>
                    <p className="text-muted-foreground">
                      {route.duration} minutes | {route.transfers} transfer{route.transfers !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-muted-foreground">{route.accessibility}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{route.departureTime}</p>
                    <p className="text-sm text-muted-foreground">Arrives {route.arrivalTime}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => viewRouteDetails(route.id)}
                    variant="outline"
                    className="touch-target px-4 py-2 rounded focus-visible"
                    aria-label={`View detailed steps for route ${route.id}`}
                  >
                    <List className="mr-2" aria-hidden="true" />
                    Details
                  </Button>
                  <Button
                    onClick={() => saveRoute(route.id)}
                    className="touch-target px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 focus-visible"
                    aria-label={`Save route ${route.id} for later use`}
                  >
                    <Bookmark className="mr-2" aria-hidden="true" />
                    Save Route
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </section>
  );
}

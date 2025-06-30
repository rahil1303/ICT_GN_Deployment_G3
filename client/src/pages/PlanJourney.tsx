import { useState, useEffect } from "react";
import { Route, Mic, Search, Bookmark, List, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

// Mock hooks and services for demo
const useAccessibility = () => ({
  announceToUser: (text) => {
    console.log('Announce:', text);
    // Add text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  },
  vibratePattern: (pattern) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
    console.log('Vibrate:', pattern);
  },
  language: 'en'
});

const useTranslation = (lang) => ({
  t: (key) => key === 'nav.plan' ? 'Plan Journey' : key
});

const useVoice = ({ onResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const startListening = () => {
    setIsListening(true);

    // Play start beep sound
    playBeep(800, 100);

    // Simulate voice recognition
    setTimeout(() => {
      setIsListening(false);
      setIsProcessing(true);

      setTimeout(() => {
        setIsProcessing(false);
        onResult("Enter destination");
        // Vibrate when ready for next input
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }
      }, 1500);
    }, 3000);
  };

  return { startListening, isListening, isProcessing };
};

// Audio context for beep sounds
const playBeep = (frequency, duration) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (error) {
    console.log('Audio not supported');
  }
};

const useMutation = ({ mutationFn, onSuccess, onError }) => ({
  mutate: async (data) => {
    try {
      const result = await mutationFn(data);
      onSuccess(result);
    } catch (error) {
      onError(error);
    }
  },
  isPending: false
});

// Mock user's familiar routes
// In a real app, this would come from a backend or local storage
const userFamiliarRoutes = [
  {
    id: 1, // Matches a route ID from transitService.planJourney
    summary: "Bus 12 → Metro Blue Line",
    timesUsed: 5,
  },
  {
    id: 3,
    summary: "Metro Red Line direct",
    timesUsed: 2,
  },
];

const transitService = {
  planJourney: async (data) => {
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate various route options, some matching familiar routes
    const allRoutes = [
      {
        id: 1,
        summary: "Bus 12 → Metro Blue Line",
        duration: 35,
        transfers: 1,
        accessibility: "Wheelchair accessible",
        departureTime: "2:30 PM",
        arrivalTime: "3:05 PM",
        steps: [
          { mode: "Bus", route: "12", from: "Current Location", to: "Metro Station", duration: 15 },
          { mode: "Metro", route: "Blue Line", from: "Metro Station", to: "Destination", duration: 20 }
        ]
      },
      {
        id: 2,
        summary: "Bus 32 → Walk",
        duration: 45,
        transfers: 1,
        accessibility: "Limited accessibility",
        departureTime: "2:15 PM",
        arrivalTime: "3:00 PM",
        steps: [
          { mode: "Bus", route: "32", from: "Current Location", to: "Park", duration: 25 },
          { mode: "Walk", route: "N/A", from: "Park", to: "Destination", duration: 20 }
        ]
      },
      {
        id: 3,
        summary: "Metro Red Line direct",
        duration: 20,
        transfers: 0,
        accessibility: "Wheelchair accessible",
        departureTime: "2:40 PM",
        arrivalTime: "3:00 PM",
        steps: [
          { mode: "Metro", route: "Red Line", from: "Current Location", to: "Destination", duration: 20 }
        ]
      },
      {
        id: 4,
        summary: "Bus 15 Express",
        duration: 30,
        transfers: 0,
        accessibility: "Wheelchair accessible",
        departureTime: "2:25 PM",
        arrivalTime: "2:55 PM",
        steps: [
          { mode: "Bus", route: "15 Express", from: "Current Location", to: "Destination", duration: 30 }
        ]
      },
    ];

    // Augment routes with familiar data if preference is enabled
    let augmentedRoutes = allRoutes.map(route => {
      const familiarMatch = userFamiliarRoutes.find(
        (familiar) => familiar.id === route.id && familiar.summary === route.summary
      );
      return {
        ...route,
        isFamiliar: !!familiarMatch && data.preferences?.preferFamiliarRoutes, // Only mark familiar if preference is on
        timesUsed: familiarMatch ? familiarMatch.timesUsed : 0,
      };
    });

    // If 'preferFamiliarRoutes' is checked, sort them to the top
    if (data.preferences?.preferFamiliarRoutes) {
      augmentedRoutes.sort((a, b) => {
        if (a.isFamiliar && !b.isFamiliar) return -1; // a comes before b
        if (!a.isFamiliar && b.isFamiliar) return 1;  // b comes before a
        // For familiar routes, sort by timesUsed descending
        if (a.isFamiliar && b.isFamiliar) return b.timesUsed - a.timesUsed;
        return 0; // Maintain original order for non-familiar routes or if no preference
      });
    }

    return augmentedRoutes;
  }
};

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
    preferFamiliarRoutes: false, // New preference state
  });
  const [routeOptions, setRouteOptions] = useState([]);
  const [activeVoiceField, setActiveVoiceField] = useState(null);

  const { startListening, isListening, isProcessing } = useVoice({
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
    mutationFn: async (planData) => {
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

  const handleVoicePlanning = (transcript) => {
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

  const handleVoiceInput = (fieldName) => {
    setActiveVoiceField(fieldName);
    if (fieldName === 'voice-planning') {
      announceToUser('Listening to voice command. ');
    } else if (fieldName === 'from') {
      announceToUser('Listening to voice command. Speak your starting location');
    } else if (fieldName === 'to') {
      announceToUser('Listening to voice command. Speak your destination');
    } else {
      announceToUser(`Listening to voice command. Speak your ${fieldName}`);
    }
    startListening();
  };

  const handlePlanJourney = (planData) => {
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

  const handleSubmit = () => {
    handlePlanJourney();
  };

  const saveRoute = (routeId) => {
    announceToUser(`Route ${routeId} saved for later use`);
    vibratePattern(100);
  };

  const viewRouteDetails = (routeId) => {
    const route = routeOptions.find(r => r.id === routeId);
    if (route) {
      const details = route.steps.map(step =>
        `${step.mode} ${step.route} from ${step.from} to ${step.to}, ${step.duration} minutes`
      ).join('. ');
      announceToUser(`Route details: ${details}`);
    }
  };

  // Voice status indicator component
  const VoiceStatusIndicator = ({ isActive, isProcessing, fieldName }) => {
    if (!isActive && !isProcessing) return null;

    return (
      <div className="flex items-center justify-center mt-2 p-2 rounded-lg bg-yellow-100 border border-yellow-300">
        {isListening && (
          <div className="flex items-center text-foreground">
            <div className="animate-pulse mr-2">🎤</div>
            <span className="font-medium">Listening...</span>
            <div className="ml-2 flex space-x-1">
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        )}
        {isProcessing && (
          <div className="flex items-center text-foreground">
            <div className="animate-spin mr-2">⏳</div>
            <span className="font-medium">Processing...</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <section aria-labelledby="plan-heading">
      <h2 id="plan-heading" className="text-3xl font-bold mb-6 flex items-center">
        <Route className="mr-3" aria-hidden="true" />
        {t('nav.plan')}
      </h2>

      {/* Trip Wizard */}
      <Card className="mb-6 bg-accent/10">
        <CardHeader>
          <CardTitle className="text-foreground">Plan Your Trip</CardTitle>
        </CardHeader>
        <CardContent className="bg-accent/10">{/* Voice Trip Planning */}
          <div className="border-2 border-accent rounded-lg p-4 mb-4 bg-accent/10">
            <h4 className="font-semibold mb-2 text-foreground">Voice Trip Planning</h4>
            <Button
              onClick={() => handleVoiceInput('voice-planning')}
              disabled={isListening || isProcessing || planJourneyMutation.isPending}
              className={`touch-target px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus-visible mb-2 transition-all duration-200 ${
                (isListening && activeVoiceField === 'voice-planning') || (isProcessing && activeVoiceField === 'voice-planning') ? 'ring-4 ring-accent' : ''
              }`}
            >
              <Mic className="mr-2" aria-hidden="true" />
              Plan Trip by Voice
            </Button>
            <VoiceStatusIndicator
              isActive={isListening && activeVoiceField === 'voice-planning'}
              isProcessing={isProcessing && activeVoiceField === 'voice-planning'}
              fieldName="voice-planning"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Say something like "Plan journey from home to hospital at 10 AM tomorrow"
            </p>
          </div>

          {/* Manual Trip Planning */}
          <div className="space-y-4">
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
                  disabled={isListening || isProcessing}
                  className={`touch-target px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-all duration-200 ${
                    (isListening && activeVoiceField === 'from') || (isProcessing && activeVoiceField === 'from') ? 'ring-4 ring-accent' : ''
                  }`}
                  aria-label="Speak starting location"
                >
                  <Mic aria-hidden="true" />
                </Button>
              </div>
              <VoiceStatusIndicator
                isActive={isListening && activeVoiceField === 'from'}
                isProcessing={isProcessing && activeVoiceField === 'from'}
                fieldName="from"
              />
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
                  disabled={isListening || isProcessing}
                  className={`touch-target px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-all duration-200 ${
                    (isListening && activeVoiceField === 'to') || (isProcessing && activeVoiceField === 'to') ? 'ring-4 ring-accent' : ''
                  }`}
                  aria-label="Speak destination"
                >
                  <Mic aria-hidden="true" />
                </Button>
              </div>
              <VoiceStatusIndicator
                isActive={isListening && activeVoiceField === 'to'}
                isProcessing={isProcessing && activeVoiceField === 'to'}
                fieldName="to"
              />
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
                {/* New: Prefer familiar routes checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="prefer-familiar"
                    checked={preferences.preferFamiliarRoutes}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, preferFamiliarRoutes: !!checked }))
                    }
                    className="touch-target"
                  />
                  <Label htmlFor="prefer-familiar">Prefer familiar routes I've used before</Label>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={planJourneyMutation.isPending}
              className="w-full touch-target py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 focus-visible"
            >
              <Search className="mr-2" aria-hidden="true" />
              {planJourneyMutation.isPending ? 'Finding Routes...' : 'Find Routes'}
            </Button>
          </div>
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
                    <h4 className="font-semibold text-lg flex items-center">
                      {route.summary}
                      {route.isFamiliar && ( // Display familiar badge
                        <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center">
                          👍 Familiar Route
                        </span>
                      )}
                    </h4>
                    <p className="text-muted-foreground">
                      {route.duration} minutes | {route.transfers} transfer{route.transfers !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-muted-foreground">{route.accessibility}</p>
                    {route.isFamiliar && route.timesUsed > 0 && ( // Display times used
                      <p className="text-sm text-muted-foreground mt-1">
                        You've successfully used this route {route.timesUsed} time{route.timesUsed !== 1 ? 's' : ''}
                      </p>
                    )}
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
                    className="touch-target px-4 py-2 rounded focus-visible border-border text-foreground hover:bg-accent/10"
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
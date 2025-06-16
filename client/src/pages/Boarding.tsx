import { useState, useEffect } from "react";
import { Bus, Search, Hand, MapPin, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useTranslation } from "../utils/i18n";
import { useVoice } from "../hooks/useVoice";
import { useGeolocation } from "../hooks/useGeolocation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { transitService } from "../services/transitService";

export default function Boarding() {
  const { announceToUser, vibratePattern, language } = useAccessibility();
  const { t } = useTranslation(language);
  const [destination, setDestination] = useState('');
  const [selectedJourney, setSelectedJourney] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState('');
  const [assistanceRequested, setAssistanceRequested] = useState(false);

  const { getCurrentPosition, position } = useGeolocation();

  const { startListening, isListening } = useVoice({
    onResult: (transcript) => {
      setDestination(transcript);
      announceToUser(`Destination set to ${transcript}`);
    }
  });

  // Mock saved journeys
  const savedJourneys = [
    { id: 'home-to-hospital', description: 'Home to General Hospital' },
    { id: 'home-to-mall', description: 'Home to Shopping Mall' },
  ];

  // Request boarding assistance mutation
  const assistanceMutation = useMutation({
    mutationFn: async () => {
      return await transitService.requestBoardingAssistance({
        routeId: '19',
        stopId: 'main-street',
        assistanceNote: 'Visually impaired user needs boarding assistance'
      });
    },
    onSuccess: (data) => {
      announceToUser(t('boarding.assistance.requested'));
      vibratePattern([100, 50, 100]);
      setAssistanceRequested(true);
      
      // Simulate driver acknowledgment after 2 seconds
      setTimeout(() => {
        announceToUser('Driver acknowledged. Please wait at the front of the bus stop.');
      }, 2000);
    },
    onError: () => {
      announceToUser('Failed to request assistance. Please try again.');
      vibratePattern([100, 100, 100]);
    }
  });

  // Real-time vehicle detection
  const { data: vehicleData, refetch: refetchVehicles } = useQuery({
    queryKey: ['/api/transit/realtime/19'],
    enabled: false,
    refetchInterval: isDetecting ? 5000 : false
  });

  const startVehicleDetection = () => {
    if (!position) {
      getCurrentPosition();
      announceToUser('Please allow location access to detect vehicles');
      return;
    }

    setIsDetecting(true);
    setDetectionStatus(t('boarding.detecting'));
    announceToUser(t('boarding.detecting'));
    vibratePattern(200);
    
    // Start polling for vehicles
    refetchVehicles();
    
    // Simulate vehicle detection after 3 seconds
    setTimeout(() => {
      setDetectionStatus('Bus 19 detected - arriving in 2 minutes!');
      announceToUser('Bus 19 detected. Arriving in 2 minutes.');
      vibratePattern([200, 100, 200]);
    }, 3000);
  };

  const stopVehicleDetection = () => {
    setIsDetecting(false);
    setDetectionStatus('');
    announceToUser('Vehicle detection stopped');
  };

  const handleVoiceDestination = () => {
    announceToUser('Speak your destination');
    startListening();
  };

  const selectSavedJourney = (journey: any) => {
    setSelectedJourney(journey.id);
    setDestination(journey.description);
    announceToUser(`Selected journey: ${journey.description}`);
  };

  const confirmVehicle = (vehicleId: string) => {
    announceToUser(`Confirmed vehicle ${vehicleId}. This is your bus.`);
    vibratePattern([200, 100, 200]);
    setIsDetecting(false);
  };

  const requestBoardingAssistance = () => {
    assistanceMutation.mutate();
  };

  return (
    <section aria-labelledby="boarding-heading">
      <h2 id="boarding-heading" className="text-3xl font-bold mb-6 flex items-center">
        <Bus className="mr-3" aria-hidden="true" />
        {t('boarding.title')}
      </h2>

      {/* Journey Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Your Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="destination" className="block font-medium mb-2">
              Where are you going?
            </Label>
            <div className="flex gap-2">
              <Input
                type="text"
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="flex-1 p-3 border-2 border-border rounded text-foreground bg-input"
                placeholder="Enter destination or say it aloud"
              />
              <Button
                type="button"
                onClick={handleVoiceDestination}
                disabled={isListening}
                className={`touch-target px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90 ${
                  isListening ? 'voice-recording' : ''
                }`}
                aria-label="Speak your destination"
              >
                <Mic aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* Saved Journeys */}
          <div className="mb-4">
            <h4 className="font-medium mb-2">Recent Journeys</h4>
            <div className="grid gap-2">
              {savedJourneys.map((journey) => (
                <Button
                  key={journey.id}
                  variant="outline"
                  onClick={() => selectSavedJourney(journey)}
                  className={`text-left p-3 border-2 rounded hover:border-primary hover:bg-accent/10 focus-visible touch-target ${
                    selectedJourney === journey.id ? 'border-primary bg-accent/10' : 'border-border'
                  }`}
                >
                  <MapPin className="mr-2 inline" aria-hidden="true" />
                  <span>{journey.description}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Detection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Detect My Bus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <Button
              onClick={isDetecting ? stopVehicleDetection : startVehicleDetection}
              className={`touch-target px-8 py-4 rounded-lg text-xl font-semibold focus-visible ${
                isDetecting 
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                  : 'bg-accent text-accent-foreground hover:bg-accent/90'
              }`}
              aria-label={isDetecting ? "Stop vehicle detection" : "Start detecting approaching buses"}
            >
              <Search className="mr-3" aria-hidden="true" />
              {isDetecting ? 'Stop Detection' : t('boarding.detect')}
            </Button>
          </div>

          {/* Detection Status */}
          <div 
            className="p-4 border-2 border-border rounded-lg bg-card" 
            aria-live="polite"
            role="status"
          >
            <p className="text-center">
              {detectionStatus || "Press \"Start Detection\" to begin monitoring for your bus"}
            </p>
          </div>

          {/* Real-time Updates */}
          {isDetecting && (
            <div className="mt-4 space-y-2">
              {/* Example approaching vehicle */}
              <div className="p-3 border-2 border-yellow-500 rounded bg-yellow-50 dark:bg-yellow-900/20">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">Bus 19 - Downtown Express</h4>
                    <p className="text-sm text-muted-foreground">Arriving in 3 minutes</p>
                  </div>
                  <Button
                    onClick={() => confirmVehicle('19')}
                    className="touch-target px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    aria-label="This is my bus"
                  >
                    <Bus className="mr-2" aria-hidden="true" />
                    My Bus
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Boarding Assistance */}
      <Card>
        <CardHeader>
          <CardTitle>Request Boarding Assistance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            If you need help boarding the vehicle, request assistance and the driver will be notified.
          </p>

          <Button
            onClick={requestBoardingAssistance}
            disabled={assistanceMutation.isPending || assistanceRequested}
            className="w-full touch-target py-4 bg-destructive text-destructive-foreground rounded-lg text-xl font-semibold hover:bg-destructive/90 focus-visible"
            aria-label="Request boarding assistance from driver"
          >
            <Hand className="mr-3" aria-hidden="true" />
            {assistanceMutation.isPending 
              ? 'Requesting Assistance...' 
              : assistanceRequested 
                ? 'Assistance Requested' 
                : 'Request Boarding Assistance'
            }
          </Button>

          {/* Assistance Status */}
          {assistanceRequested && (
            <div className="mt-4 p-4 border-2 border-green-600 rounded-lg bg-green-50 dark:bg-green-900/20" 
                 aria-live="assertive"
                 role="alert">
              <p className="text-center font-medium">
                Driver has been notified. Please wait at the front of the bus stop.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

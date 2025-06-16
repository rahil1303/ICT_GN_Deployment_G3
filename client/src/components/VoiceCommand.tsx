import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoice } from "../hooks/useVoice";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useLocation } from "wouter";

export default function VoiceCommand() {
  const [, setLocation] = useLocation();
  const { announceToUser, vibratePattern } = useAccessibility();
  
  const { isListening, startListening, stopListening, isSupported } = useVoice({
    onResult: (transcript) => {
      handleVoiceCommand(transcript.toLowerCase());
    },
    onError: (error) => {
      console.error('Voice recognition error:', error);
    }
  });

  const handleVoiceCommand = (command: string) => {
    if (command.includes('account') || command.includes('go to account') || command.includes('profile')) {
      setLocation('/account');
      announceToUser('Opening Account page');
    } else if (command.includes('plan journey') || command.includes('plan trip') || command.includes('route') || command.includes('journey')) {
      setLocation('/plan-journey');
      announceToUser('Opening Journey Planning page');
    } else if (command.includes('tickets') || command.includes('buy ticket') || command.includes('purchase')) {
      setLocation('/tickets');
      announceToUser('Opening Tickets page');
    } else if (command.includes('boarding') || command.includes('assistance') || command.includes('help boarding')) {
      setLocation('/boarding');
      announceToUser('Opening Boarding Assistance page');
    } else if (command.includes('validation') || command.includes('check in') || command.includes('validate')) {
      setLocation('/validation');
      announceToUser('Opening Validation page');
    } else if (command.includes('alerts') || command.includes('notifications') || command.includes('news')) {
      setLocation('/alerts');
      announceToUser('Opening Alerts page');
    } else if (command.includes('support') || command.includes('help') || command.includes('contact')) {
      setLocation('/support');
      announceToUser('Opening Support page');
    } else if (command.includes('settings') || command.includes('preferences') || command.includes('configure')) {
      setLocation('/settings');
      announceToUser('Opening Settings page');
    } else if (command.includes('home') || command.includes('main') || command.includes('dashboard')) {
      setLocation('/');
      announceToUser('Returning to main page');
    } else {
      announceToUser('Command not recognized. Try saying: go to tickets, plan journey, boarding assistance, or settings');
    }
    
    vibratePattern(100);
  };

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      onClick={handleClick}
      className={`touch-target px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus-visible ${
        isListening ? 'voice-recording' : ''
      }`}
      aria-label={
        isListening 
          ? "Stop listening for voice commands" 
          : "Activate voice command. Say commands like 'Go to Account' or 'Plan journey'"
      }
    >
      {isListening ? (
        <MicOff className="mr-2" aria-hidden="true" />
      ) : (
        <Mic className="mr-2" aria-hidden="true" />
      )}
      <span>{isListening ? 'Listening...' : 'Voice Command'}</span>
    </Button>
  );
}

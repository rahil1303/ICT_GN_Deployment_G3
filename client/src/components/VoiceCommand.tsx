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
    if (command.includes('account') || command.includes('go to account')) {
      setLocation('/account');
      announceToUser('Navigated to Account');
    } else if (command.includes('plan journey') || command.includes('plan trip')) {
      setLocation('/plan');
      announceToUser('Navigated to Plan Journey');
    } else if (command.includes('tickets') || command.includes('buy ticket')) {
      setLocation('/tickets');
      announceToUser('Navigated to Tickets');
    } else if (command.includes('boarding') || command.includes('assistance')) {
      setLocation('/boarding');
      announceToUser('Navigated to Boarding');
    } else if (command.includes('validation') || command.includes('check in')) {
      setLocation('/validation');
      announceToUser('Navigated to Validation');
    } else if (command.includes('alerts') || command.includes('notifications')) {
      setLocation('/alerts');
      announceToUser('Navigated to Alerts');
    } else if (command.includes('support') || command.includes('help')) {
      setLocation('/support');
      announceToUser('Navigated to Support');
    } else if (command.includes('settings') || command.includes('preferences')) {
      setLocation('/settings');
      announceToUser('Navigated to Settings');
    } else {
      announceToUser('Command not recognized. Try saying "Go to Account" or "Plan Journey"');
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

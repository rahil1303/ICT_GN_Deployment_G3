import { useState, useRef, useCallback } from "react";
import { useAccessibility } from "../contexts/AccessibilityContext";

interface UseVoiceOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
  language?: string;
}

export function useVoice({
  onResult,
  onError,
  continuous = false,
  language = 'en-US'
}: UseVoiceOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { announceToUser, language: contextLanguage } = useAccessibility();

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      const error = 'Speech recognition not supported in this browser';
      announceToUser(error);
      onError?.(error);
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = continuous;
      recognition.interimResults = false;
      recognition.lang = contextLanguage === 'es' ? 'es-ES' : contextLanguage === 'fr' ? 'fr-FR' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        announceToUser('Listening for voice command');
      };

      recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        setTranscript(transcript);
        announceToUser(`You said: ${transcript}`);
        onResult?.(transcript);
      };

      recognition.onerror = (event) => {
        const error = `Speech recognition error: ${event.error}`;
        announceToUser('Sorry, I did not catch that. Please try again.');
        onError?.(error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      const errorMessage = 'Failed to start speech recognition';
      announceToUser(errorMessage);
      onError?.(errorMessage);
    }
  }, [continuous, contextLanguage, onResult, onError, announceToUser]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported
  };
}

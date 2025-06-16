import { useState } from "react";
import { HelpCircle, Phone, MessageCircle, Mail, Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useTranslation } from "../utils/i18n";
import { useVoice } from "../hooks/useVoice";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

export default function Support() {
  const { announceToUser, vibratePattern, language } = useAccessibility();
  const { t } = useTranslation(language);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [feedbackData, setFeedbackData] = useState({
    type: '',
    message: ''
  });
  const [voiceQuery, setVoiceQuery] = useState('');

  const { startListening, isListening } = useVoice({
    onResult: (transcript) => {
      if (voiceQuery === 'help') {
        handleVoiceHelp(transcript);
      } else {
        setFeedbackData(prev => ({ ...prev, message: transcript }));
        announceToUser('Voice message recorded');
      }
      setVoiceQuery('');
    }
  });

  // Submit feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: async (data: typeof feedbackData) => {
      const response = await apiRequest('POST', '/api/feedback', data);
      return response.json();
    },
    onSuccess: () => {
      announceToUser('Feedback submitted successfully. Thank you for your input.');
      vibratePattern(200);
      setFeedbackData({ type: '', message: '' });
    },
    onError: () => {
      announceToUser('Failed to submit feedback. Please try again.');
      vibratePattern([100, 100, 100]);
    }
  });

  const handleVoiceHelp = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('boarding') || lowerQuery.includes('assistance')) {
      announceToUser('To request boarding assistance, go to the Boarding tab and press the Request Boarding Assistance button. The driver will be notified to help you board the vehicle.');
    } else if (lowerQuery.includes('ticket') || lowerQuery.includes('buy')) {
      announceToUser('To buy a ticket, go to the Tickets tab. You can purchase single ride tickets or day passes using voice commands or the regular interface.');
    } else if (lowerQuery.includes('voice') || lowerQuery.includes('command')) {
      announceToUser('Use the Voice Command button in the header to navigate between tabs. Say things like "Go to Account" or "Plan Journey" to navigate quickly.');
    } else {
      announceToUser('I found several help topics. Please be more specific about what you need help with, such as boarding assistance, buying tickets, or using voice commands.');
    }
  };

  const startVoiceHelp = () => {
    setVoiceQuery('help');
    announceToUser('Ask your question about using TransitAccess');
    startListening();
  };

  const startVoiceFeedback = () => {
    setVoiceQuery('feedback');
    announceToUser('Record your feedback message');
    startListening();
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackData.type || !feedbackData.message) {
      announceToUser('Please select feedback type and enter your message');
      return;
    }
    feedbackMutation.mutate(feedbackData);
  };

  const callSupport = () => {
    announceToUser('Opening phone to call 1-800-TRANSIT');
    // In a real app, this would use tel: protocol
    window.location.href = 'tel:1-800-TRANSIT';
  };

  const startChat = () => {
    announceToUser('Starting live chat support');
    // Mock chat functionality
  };

  const emailSupport = () => {
    announceToUser('Opening email to support@transitaccess.com');
    window.location.href = 'mailto:support@transitaccess.com';
  };

  const faqCategories = [
    {
      id: 'boarding',
      title: 'Boarding & Assistance',
      description: 'How to get help boarding vehicles',
      answers: [
        'Tap the "Request Boarding Assistance" button on the Boarding tab',
        'The driver will be notified automatically',
        'Wait at the front of the bus stop for assistance'
      ]
    },
    {
      id: 'tickets',
      title: 'Tickets & Passes',
      description: 'Purchasing and using tickets',
      answers: [
        'Use the Tickets tab to purchase single rides or day passes',
        'Voice commands: "Single ride ticket" or "Day pass"',
        'Tickets are stored digitally and can be validated automatically'
      ]
    },
    {
      id: 'app',
      title: 'Using This App',
      description: 'Voice commands and accessibility features',
      answers: [
        'Use the Voice Command button to navigate: "Go to Account"',
        'Voice input available for forms and searches',
        'All features work with screen readers'
      ]
    }
  ];

  return (
    <section aria-labelledby="support-heading">
      <h2 id="support-heading" className="text-3xl font-bold mb-6 flex items-center">
        <HelpCircle className="mr-3" aria-hidden="true" />
        Support & Feedback
      </h2>

      {/* Quick Help */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Help</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Voice Help Search */}
          <div className="border-2 border-accent rounded-lg p-4 mb-4 bg-accent/10">
            <h4 className="font-semibold mb-2">Ask for Help by Voice</h4>
            <Button
              onClick={startVoiceHelp}
              disabled={isListening}
              className={`touch-target px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 focus-visible mb-2 ${
                isListening && voiceQuery === 'help' ? 'voice-recording' : ''
              }`}
            >
              <Mic className="mr-2" aria-hidden="true" />
              {isListening && voiceQuery === 'help' ? 'Listening...' : 'Ask a Question'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Say something like "How do I request boarding assistance?" or "How to buy a ticket?"
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="grid gap-3">
            {faqCategories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                onClick={() => {
                  setSelectedCategory(selectedCategory === category.id ? null : category.id);
                  announceToUser(`${selectedCategory === category.id ? 'Collapsed' : 'Expanded'} ${category.title} help section`);
                }}
                className="text-left p-4 border-2 border-border rounded hover:border-primary hover:bg-accent/10 focus-visible touch-target h-auto justify-start"
              >
                <div>
                  <h4 className="font-medium">{category.title}</h4>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </Button>
            ))}
          </div>

          {/* Expanded FAQ Content */}
          {selectedCategory && (
            <div className="mt-4 p-4 border-2 border-accent rounded-lg bg-accent/10">
              {faqCategories.find(cat => cat.id === selectedCategory)?.answers.map((answer, index) => (
                <p key={index} className="mb-2 last:mb-0">• {answer}</p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Button
              onClick={callSupport}
              className="touch-target p-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus-visible h-auto justify-start"
            >
              <Phone className="mr-3" aria-hidden="true" />
              Call Support: 1-800-TRANSIT
            </Button>

            <Button
              onClick={startChat}
              className="touch-target p-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus-visible h-auto justify-start"
            >
              <MessageCircle className="mr-3" aria-hidden="true" />
              Start Live Chat
            </Button>

            <Button
              onClick={emailSupport}
              className="touch-target p-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus-visible h-auto justify-start"
            >
              <Mail className="mr-3" aria-hidden="true" />
              Send Email: support@transitaccess.com
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Form */}
      <Card>
        <CardHeader>
          <CardTitle>Send Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div>
              <Label htmlFor="feedback-type" className="block font-medium mb-2">
                Feedback Type
              </Label>
              <Select
                value={feedbackData.type}
                onValueChange={(value) => setFeedbackData(prev => ({ ...prev, type: value }))}
                required
              >
                <SelectTrigger className="w-full p-3 border-2 border-border rounded text-foreground bg-input">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="accessibility">Accessibility Issue</SelectItem>
                  <SelectItem value="general">General Feedback</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="feedback-message" className="block font-medium mb-2">
                Your Message
              </Label>
              <div className="relative">
                <Textarea
                  id="feedback-message"
                  rows={4}
                  value={feedbackData.message}
                  onChange={(e) => setFeedbackData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full p-3 border-2 border-border rounded text-foreground bg-input pr-12"
                  placeholder="Describe your feedback or issue..."
                  required
                />
                <Button
                  type="button"
                  onClick={startVoiceFeedback}
                  disabled={isListening}
                  className={`absolute top-2 right-2 touch-target p-2 bg-accent text-accent-foreground rounded hover:bg-accent/90 ${
                    isListening && voiceQuery === 'feedback' ? 'voice-recording' : ''
                  }`}
                  aria-label="Record voice message"
                >
                  <Mic aria-hidden="true" />
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={feedbackMutation.isPending}
              className="w-full touch-target py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 focus-visible"
            >
              <Send className="mr-2" aria-hidden="true" />
              {feedbackMutation.isPending ? 'Sending...' : 'Send Feedback'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

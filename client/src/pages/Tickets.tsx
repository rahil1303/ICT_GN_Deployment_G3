import { useState } from "react";
import { Ticket, Mic, CheckCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useTranslation } from "../utils/i18n";
import { useVoice } from "../hooks/useVoice";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

export default function Tickets() {
  const { announceToUser, vibratePattern, language } = useAccessibility();
  const { t } = useTranslation(language);
  const [selectedTicketType, setSelectedTicketType] = useState<string | null>(null);
  // State to manage the visibility of cash top-up locations
  const [showTopUpLocations, setShowTopUpLocations] = useState(false); 
  // Mock cash balance for demonstration
  const [cashBalance, setCashBalance] = useState(0.00); 

  const { startListening, isListening } = useVoice({
    onResult: (transcript) => {
      handleVoicePurchase(transcript.toLowerCase());
    }
  });

  // Fetch active tickets
  const { data: activeTickets, refetch: refetchTickets } = useQuery({
    queryKey: ['/api/tickets/active'],
    enabled: false
  });

  // Purchase ticket mutation
  const purchaseTicketMutation = useMutation({
    mutationFn: async (ticketData: any) => {
      // Simulate deducting from cash balance if applicable (for demo purposes)
      if (ticketData.paymentMethod === 'cash') {
        if (cashBalance * 100 < ticketData.price) {
          throw new Error("Insufficient cash balance");
        }
        setCashBalance(prev => (prev * 100 - ticketData.price) / 100);
      }
      const response = await apiRequest('POST', '/api/tickets', ticketData);
      return response.json();
    },
    onSuccess: (data) => {
      announceToUser(`Ticket purchased successfully. Ticket ID: ${data.ticket.ticketId}`);
      vibratePattern(200);
      refetchTickets();
    },
    onError: (error) => {
      let errorMessage = 'Ticket purchase failed. Please try again.';
      if (error.message === "Insufficient cash balance") {
        errorMessage = 'Insufficient cash balance. Please top up or use a card.';
      }
      announceToUser(errorMessage);
      vibratePattern([100, 100, 100]);
    }
  });

  // Validate ticket mutation
  const validateTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await apiRequest('POST', `/api/tickets/${ticketId}/validate`);
      return response.json();
    },
    onSuccess: () => {
      announceToUser(t('tickets.validated'));
      vibratePattern(200);
      refetchTickets();
    },
    onError: () => {
      announceToUser('Ticket validation failed. Please try again.');
      vibratePattern([100, 100, 100]);
    }
  });

  const handleVoicePurchase = (transcript: string) => {
    let ticketType = 'single';
    let price = 350; // $3.50 in cents
    let paymentMethod = 'card'; // Default payment method

    if (transcript.includes('day pass') || transcript.includes('daily')) {
      ticketType = 'day';
      price = 1200; // $12.00 in cents
    }

    if (transcript.includes('with cash') || transcript.includes('using cash')) {
      paymentMethod = 'cash';
    } else if (transcript.includes('with card') || transcript.includes('using card')) {
      paymentMethod = 'card';
    }

    const validUntil = new Date();
    if (ticketType === 'day') {
      validUntil.setHours(23, 59, 59, 999);
    } else {
      validUntil.setMinutes(validUntil.getMinutes() + 90); // 90 minutes for single ride
    }

    purchaseTicketMutation.mutate({
      type: ticketType,
      price,
      validUntil: validUntil.toISOString(),
      paymentMethod // Include payment method
    });
  };

  const handleTicketPurchase = (type: string, price: number, paymentMethod: string = 'card') => {
    const validUntil = new Date();
    if (type === 'day') {
      validUntil.setHours(23, 59, 59, 999);
    } else {
      validUntil.setMinutes(validUntil.getMinutes() + 90);
    }

    purchaseTicketMutation.mutate({
      type,
      price,
      validUntil: validUntil.toISOString(),
      paymentMethod // Pass payment method to mutation
    });
  };

  const handleValidateTicket = (ticketId: string) => {
    validateTicketMutation.mutate(ticketId);
  };

  const handleNotifyValidator = () => {
    announceToUser('Validator notified of digital ticket');
    vibratePattern([100, 50, 100]);
  };

  const handleAddCashValue = () => {
    setShowTopUpLocations(prev => !prev); // Toggle visibility
    if (!showTopUpLocations) {
      announceToUser('Top up cash at Central Station, Airport, City Hall');
    }
  };

  return (
    <section aria-labelledby="tickets-heading">
      <h2 id="tickets-heading" className="text-3xl font-bold mb-6 flex items-center">
        <Ticket className="mr-3" aria-hidden="true" />
        {t('tickets.title')}
      </h2>

      {/* Ticket Purchase */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('tickets.purchase')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => handleTicketPurchase('single', 350)}
              className="text-left p-4 border-2 border-border rounded hover:border-primary hover:bg-accent/10 focus-visible touch-target h-auto"
            >
              <div className="flex justify-between items-center w-full">
                <div>
                  <h4 className="font-medium">{t('tickets.single')}</h4>
                  <p className="text-sm text-muted-foreground">Valid for 90 minutes | Zone 1</p>
                </div>
                <span className="font-bold text-lg">$3.50</span>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleTicketPurchase('day', 1200)}
              className="text-left p-4 border-2 border-border rounded hover:border-primary hover:bg-accent/10 focus-visible touch-target h-auto"
            >
              <div className="flex justify-between items-center w-full">
                <div>
                  <h4 className="font-medium">{t('tickets.day')}</h4>
                  <p className="text-sm text-muted-foreground">Valid until midnight | All zones</p>
                </div>
                <span className="font-bold text-lg">$12.00</span>
              </div>
            </Button>

            {/* New Cash Balance Box */}
            <Card className="border-2 border-border rounded-lg p-4 bg-background">
              <CardContent className="p-0 flex justify-between items-center">
                <span className="font-semibold text-lg text-foreground">💰 Cash Balance: ${cashBalance.toFixed(2)}</span>
                <Button
                  onClick={handleAddCashValue}
                  variant="outline"
                  className="touch-target px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                  ➕ Add Cash Value
                </Button>
              </CardContent>
              {showTopUpLocations && (
                <p className="text-sm text-muted-foreground mt-2">
                  Top up cash at: **Central Station, Airport, City Hall**
                </p>
              )}
            </Card>

          </div>

          {/* Voice Purchase Option */}
          <div className="border-2 border-accent rounded-lg p-4 mb-4 bg-accent/10">
            <h4 className="font-semibold mb-2">Voice Purchase</h4>
            <Button
              onClick={() => {
                announceToUser('Listening for ticket order');
                startListening();
              }}
              disabled={isListening || purchaseTicketMutation.isPending}
              className={`touch-target px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 focus-visible ${
                isListening ? 'voice-recording' : ''
              }`}
            >
              <Mic className="mr-2" aria-hidden="true" />
              {isListening ? 'Listening...' : 'Speak Your Order'}
            </Button>
            <p className="text-sm mt-2 text-muted-foreground">
            Say something like <strong>'single ticket with cash'</strong> or <strong>'day pass with card'</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Your Active Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Example Active Ticket */}
          <div className="border-2 border-green-600 rounded-lg p-4 mb-4 bg-green-50 dark:bg-green-900/20">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold">Single Ride Ticket</h4>
                <p className="text-muted-foreground">Valid until 3:45 PM today</p>
                <p className="text-sm text-muted-foreground">
                  Ticket ID: <span className="font-mono">ABC123</span>
                </p>
              </div>
              <div className="text-right space-y-2">
                <Button
                  onClick={() => handleValidateTicket('ABC123')}
                  disabled={validateTicketMutation.isPending}
                  className="touch-target px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 block"
                  aria-label="Validate ticket now"
                >
                  <CheckCircle className="mr-2" aria-hidden="true" />
                  {t('tickets.validate')}
                </Button>
                <Button
                  onClick={handleNotifyValidator}
                  className="touch-target px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90"
                  aria-label="Notify validator about digital ticket"
                >
                  <Bell className="mr-2" aria-hidden="true" />
                  {t('tickets.notify')}
                </Button>
              </div>
            </div>
          </div>

          {/* Show message if no active tickets */}
          {(!activeTickets || activeTickets.tickets?.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <Ticket className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No active tickets. Purchase a ticket above to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
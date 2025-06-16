import { useState } from "react";
import { CheckCircle, AlertTriangle, Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useTranslation } from "../utils/i18n";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

interface ValidationEvent {
  id: number;
  eventType: string;
  location: string;
  timestamp: string;
  routeInfo: string;
}

export default function Validation() {
  const { announceToUser, vibratePattern, language } = useAccessibility();
  const { t } = useTranslation(language);
  const [showExceptionForm, setShowExceptionForm] = useState(false);
  const [exceptionData, setExceptionData] = useState({
    date: '',
    route: '',
    reason: ''
  });
  const [currentJourney] = useState({
    route: 'Bus 19 - Downtown Express',
    checkInTime: '2:15 PM',
    stop: 'Main Street Station'
  });

  // Fetch validation history
  const { data: validationHistory } = useQuery({
    queryKey: ['/api/validation-events'],
    enabled: false
  });

  // Check out mutation
  const checkOutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/validation-events', {
        eventType: 'check_out',
        location: 'Hospital District',
        routeInfo: currentJourney.route
      });
      return response.json();
    },
    onSuccess: () => {
      announceToUser('Checked out at Hospital District');
      vibratePattern(200);
    },
    onError: () => {
      announceToUser('Check out failed. Please try again.');
      vibratePattern([100, 100, 100]);
    }
  });

  // Exception report mutation
  const exceptionMutation = useMutation({
    mutationFn: async (data: typeof exceptionData) => {
      const response = await apiRequest('POST', '/api/validation-events', {
        eventType: 'exception',
        location: data.route,
        routeInfo: `${data.route} - ${data.reason}`
      });
      return response.json();
    },
    onSuccess: () => {
      announceToUser('Exception report submitted successfully');
      vibratePattern(200);
      setShowExceptionForm(false);
      setExceptionData({ date: '', route: '', reason: '' });
    },
    onError: () => {
      announceToUser('Failed to submit exception report. Please try again.');
      vibratePattern([100, 100, 100]);
    }
  });

  const handleCheckOut = () => {
    checkOutMutation.mutate();
  };

  const handleReportException = () => {
    setShowExceptionForm(true);
    announceToUser('Opening exception report form');
  };

  const handleSubmitException = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exceptionData.date || !exceptionData.route || !exceptionData.reason) {
      announceToUser('Please fill in all required fields');
      return;
    }
    exceptionMutation.mutate(exceptionData);
  };

  const handleCancelException = () => {
    setShowExceptionForm(false);
    setExceptionData({ date: '', route: '', reason: '' });
    announceToUser('Exception report cancelled');
  };

  // Mock journey history
  const journeyHistory = [
    {
      id: 1,
      date: 'January 15, 2024',
      route: 'Bus 19: Main Street → Hospital District',
      times: '2:15 PM - 2:45 PM',
      status: 'validated',
      statusText: '✓ Validated Successfully'
    },
    {
      id: 2,
      date: 'January 14, 2024',
      route: 'Tram 5: Hospital → Shopping Mall',
      times: '10:30 AM - 11:00 AM',
      status: 'exception',
      statusText: '⚠ Exception Reported - Pending Review'
    }
  ];

  return (
    <section aria-labelledby="validation-heading">
      <h2 id="validation-heading" className="text-3xl font-bold mb-6 flex items-center">
        <CheckCircle className="mr-3" aria-hidden="true" />
        Check-in / Check-out & Exceptions
      </h2>

      {/* Current Journey Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-green-600 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-lg flex items-center">
                  <CheckCircle className="mr-2 text-green-600" aria-hidden="true" />
                  Checked In
                </h4>
                <p className="text-muted-foreground">{currentJourney.route}</p>
                <p className="text-sm text-muted-foreground">
                  Checked in at {currentJourney.checkInTime}
                </p>
                <p className="text-sm text-muted-foreground">
                  Boarded at: {currentJourney.stop}
                </p>
              </div>
              <Button
                onClick={handleCheckOut}
                disabled={checkOutMutation.isPending}
                className="touch-target px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 focus-visible"
                aria-label="Check out and end current journey"
              >
                <LogOut className="mr-2" aria-hidden="true" />
                {checkOutMutation.isPending ? 'Checking Out...' : 'Check Out'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exception Reporting */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Report Validation Issue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Did you board without being able to validate your ticket? Report it here.
          </p>

          <Button
            onClick={handleReportException}
            disabled={showExceptionForm}
            className="w-full touch-target py-4 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 focus-visible mb-4"
            aria-label="Report missed validation for this trip"
          >
            <AlertTriangle className="mr-2" aria-hidden="true" />
            Report Missed Validation
          </Button>

          {/* Exception Form */}
          {showExceptionForm && (
            <div className="border-2 border-orange-500 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20">
              <h4 className="font-semibold mb-3">Exception Details</h4>
              <form onSubmit={handleSubmitException} className="space-y-4">
                <div>
                  <Label htmlFor="exception-date" className="block font-medium mb-2">
                    Date of Journey
                  </Label>
                  <Input
                    type="date"
                    id="exception-date"
                    value={exceptionData.date}
                    onChange={(e) => setExceptionData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-3 border-2 border-border rounded text-foreground bg-input"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="exception-route" className="block font-medium mb-2">
                    Route/Vehicle
                  </Label>
                  <Input
                    type="text"
                    id="exception-route"
                    value={exceptionData.route}
                    onChange={(e) => setExceptionData(prev => ({ ...prev, route: e.target.value }))}
                    className="w-full p-3 border-2 border-border rounded text-foreground bg-input"
                    placeholder="Bus 19 - Downtown Express"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="exception-reason" className="block font-medium mb-2">
                    Reason
                  </Label>
                  <Select
                    value={exceptionData.reason}
                    onValueChange={(value) => setExceptionData(prev => ({ ...prev, reason: value }))}
                    required
                  >
                    <SelectTrigger className="w-full p-3 border-2 border-border rounded text-foreground bg-input">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="validator-broken">Validator was broken</SelectItem>
                      <SelectItem value="unable-to-reach">Could not reach validator</SelectItem>
                      <SelectItem value="assistance-needed">Needed assistance but none available</SelectItem>
                      <SelectItem value="other">Other reason</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={exceptionMutation.isPending}
                    className="flex-1 touch-target py-3 bg-primary text-primary-foreground rounded hover:bg-primary/90 focus-visible"
                  >
                    <AlertTriangle className="mr-2" aria-hidden="true" />
                    {exceptionMutation.isPending ? 'Submitting...' : 'Submit Report'}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancelException}
                    variant="outline"
                    className="touch-target px-4 py-3 rounded focus-visible"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Journey History */}
      <Card>
        <CardHeader>
          <CardTitle>Journey History</CardTitle>
        </CardHeader>
        <CardContent>
          {journeyHistory.map((journey) => (
            <div 
              key={journey.id}
              className={`border-2 rounded-lg p-4 mb-3 hover:bg-accent/10 ${
                journey.status === 'exception' ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20' : 'border-border'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold flex items-center">
                    {journey.status === 'validated' ? (
                      <CheckCircle className="mr-2 text-green-600" aria-hidden="true" />
                    ) : (
                      <Clock className="mr-2 text-orange-600" aria-hidden="true" />
                    )}
                    {journey.date}
                  </h4>
                  <p className="text-muted-foreground">{journey.route}</p>
                  <p className="text-sm text-muted-foreground">{journey.times}</p>
                  <span 
                    className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                      journey.status === 'validated' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                    }`}
                  >
                    {journey.statusText}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {journeyHistory.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No journey history available.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

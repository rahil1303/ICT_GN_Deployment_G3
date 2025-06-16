import { useState } from "react";
import { Bell, X, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useTranslation } from "../utils/i18n";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

interface Alert {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function Alerts() {
  const { announceToUser, vibratePattern, language } = useAccessibility();
  const { t } = useTranslation(language);
  const [alertSettings, setAlertSettings] = useState({
    serviceDisruptions: true,
    passExpiry: true,
    journeyReminders: false,
    emergencyAlerts: true,
  });

  // Fetch user alerts
  const { data: alertsData, refetch: refetchAlerts } = useQuery({
    queryKey: ['/api/alerts'],
    enabled: false
  });

  // Dismiss alert mutation
  const dismissAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const response = await apiRequest('PATCH', `/api/alerts/${alertId}/read`);
      return response.json();
    },
    onSuccess: () => {
      announceToUser('Alert dismissed');
      vibratePattern(100);
      refetchAlerts();
    },
    onError: () => {
      announceToUser('Failed to dismiss alert');
      vibratePattern([100, 100, 100]);
    }
  });

  const handleAlertSettingChange = (setting: keyof typeof alertSettings, value: boolean) => {
    setAlertSettings(prev => ({ ...prev, [setting]: value }));
    announceToUser(`${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} alerts ${value ? 'enabled' : 'disabled'}`);
  };

  const dismissAlert = (alertId: number) => {
    dismissAlertMutation.mutate(alertId);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'service_disruption':
        return <AlertTriangle className="h-5 w-5" aria-hidden="true" />;
      case 'pass_expiry':
        return <Bell className="h-5 w-5" aria-hidden="true" />;
      case 'journey_reminder':
        return <Info className="h-5 w-5" aria-hidden="true" />;
      case 'emergency':
        return <AlertTriangle className="h-5 w-5" aria-hidden="true" />;
      default:
        return <Info className="h-5 w-5" aria-hidden="true" />;
    }
  };

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'service_disruption':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      case 'pass_expiry':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200';
      case 'journey_reminder':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
      case 'emergency':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200';
    }
  };

  // Mock recent alerts
  const recentAlerts = [
    {
      id: 1,
      type: 'service_disruption',
      title: 'Service Disruption - Bus 19',
      message: 'Delays of 15-20 minutes due to traffic incident on Main Street. Consider alternative routes.',
      time: '2 hours ago',
      isRead: false
    },
    {
      id: 2,
      type: 'pass_expiry',
      title: 'Pass Expiry Reminder',
      message: 'Your monthly pass expires in 3 days. Renew now to avoid interruption.',
      time: '1 day ago',
      isRead: false
    },
    {
      id: 3,
      type: 'journey_reminder',
      title: 'Journey Reminder',
      message: 'Don\'t forget: Doctor appointment trip to General Hospital at 2:00 PM today.',
      time: '30 minutes ago',
      isRead: false
    }
  ];

  return (
    <section aria-labelledby="alerts-heading">
      <h2 id="alerts-heading" className="text-3xl font-bold mb-6 flex items-center">
        <Bell className="mr-3" aria-hidden="true" />
        Notifications & Alerts
      </h2>

      {/* Alert Preferences */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Alert Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="service-disruptions"
                checked={alertSettings.serviceDisruptions}
                onCheckedChange={(checked) => 
                  handleAlertSettingChange('serviceDisruptions', !!checked)
                }
                className="mt-1 touch-target"
              />
              <div className="flex-1">
                <Label htmlFor="service-disruptions" className="font-medium cursor-pointer">
                  Service Disruptions
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about delays and cancellations on your saved routes
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="pass-expiry"
                checked={alertSettings.passExpiry}
                onCheckedChange={(checked) => 
                  handleAlertSettingChange('passExpiry', !!checked)
                }
                className="mt-1 touch-target"
              />
              <div className="flex-1">
                <Label htmlFor="pass-expiry" className="font-medium cursor-pointer">
                  Pass Expiry Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Reminders when your transit pass is about to expire
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="journey-reminders"
                checked={alertSettings.journeyReminders}
                onCheckedChange={(checked) => 
                  handleAlertSettingChange('journeyReminders', !!checked)
                }
                className="mt-1 touch-target"
              />
              <div className="flex-1">
                <Label htmlFor="journey-reminders" className="font-medium cursor-pointer">
                  Journey Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Reminders for upcoming scheduled trips
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="emergency-alerts"
                checked={alertSettings.emergencyAlerts}
                onCheckedChange={(checked) => 
                  handleAlertSettingChange('emergencyAlerts', !!checked)
                }
                className="mt-1 touch-target"
              />
              <div className="flex-1">
                <Label htmlFor="emergency-alerts" className="font-medium cursor-pointer">
                  Emergency Alerts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Critical safety and weather alerts affecting transit
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-l-4 p-4 mb-4 ${getAlertStyles(alert.type)}`}
              role="alert"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold flex items-center mb-2">
                    {getAlertIcon(alert.type)}
                    <span className="ml-2">{alert.title}</span>
                  </h4>
                  <p className="mb-2">{alert.message}</p>
                  <p className="text-sm opacity-75">{alert.time}</p>
                </div>
                <Button
                  onClick={() => dismissAlert(alert.id)}
                  variant="ghost"
                  size="sm"
                  className="touch-target p-2 hover:bg-black/10 dark:hover:bg-white/10"
                  aria-label={`Dismiss alert: ${alert.title}`}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}

          {recentAlerts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No recent alerts. You're all caught up!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

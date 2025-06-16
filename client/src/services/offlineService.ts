import { storageService } from './storageService';

interface PendingOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineService {
  private syncInProgress = false;
  private maxRetries = 3;
  private syncQueue: PendingOperation[] = [];

  async init() {
    await storageService.init();
    this.loadPendingOperations();
    
    // Listen for online events
    window.addEventListener('online', () => {
      this.syncWhenOnline();
    });

    // Periodic sync when online
    setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.syncWhenOnline();
      }
    }, 30000); // Every 30 seconds
  }

  private async loadPendingOperations() {
    try {
      const pending = await storageService.getPendingSync('operations');
      this.syncQueue = pending || [];
    } catch (error) {
      console.error('Failed to load pending operations:', error);
    }
  }

  private async savePendingOperations() {
    try {
      await storageService.storePendingSync('operations', this.syncQueue);
    } catch (error) {
      console.error('Failed to save pending operations:', error);
    }
  }

  async queueOperation(type: 'CREATE' | 'UPDATE' | 'DELETE', endpoint: string, data: any) {
    const operation: PendingOperation = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      endpoint,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.syncQueue.push(operation);
    await this.savePendingOperations();

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.syncWhenOnline();
    }

    return operation.id;
  }

  private async syncWhenOnline() {
    if (this.syncInProgress || !navigator.onLine || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;

    try {
      const operations = [...this.syncQueue];
      const successfulOperations: string[] = [];

      for (const operation of operations) {
        try {
          await this.executeOperation(operation);
          successfulOperations.push(operation.id);
        } catch (error) {
          operation.retryCount++;
          if (operation.retryCount >= this.maxRetries) {
            console.error('Operation failed after max retries:', operation, error);
            successfulOperations.push(operation.id); // Remove failed operations
          }
        }
      }

      // Remove successful operations from queue
      this.syncQueue = this.syncQueue.filter(op => !successfulOperations.includes(op.id));
      await this.savePendingOperations();

    } finally {
      this.syncInProgress = false;
    }
  }

  private async executeOperation(operation: PendingOperation) {
    const headers = {
      'Content-Type': 'application/json',
      'x-user-id': '1' // Default user for demo
    };

    let url = operation.endpoint;
    let options: RequestInit = { headers };

    switch (operation.type) {
      case 'CREATE':
        options.method = 'POST';
        options.body = JSON.stringify(operation.data);
        break;
      case 'UPDATE':
        options.method = 'PATCH';
        options.body = JSON.stringify(operation.data);
        break;
      case 'DELETE':
        options.method = 'DELETE';
        break;
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Enhanced offline data management
  async storeTicketOffline(ticket: any) {
    await storageService.store('tickets', ticket);
    if (!navigator.onLine) {
      await this.queueOperation('CREATE', '/api/tickets', ticket);
    }
  }

  async storeJourneyOffline(journey: any) {
    await storageService.store('journeys', journey);
    if (!navigator.onLine) {
      await this.queueOperation('CREATE', '/api/journeys', journey);
    }
  }

  async storeValidationEventOffline(event: any) {
    await storageService.store('validationEvents', event);
    if (!navigator.onLine) {
      await this.queueOperation('CREATE', '/api/validation-events', event);
    }
  }

  async storeFeedbackOffline(feedback: any) {
    await storageService.store('feedback', feedback);
    if (!navigator.onLine) {
      await this.queueOperation('CREATE', '/api/feedback', feedback);
    }
  }

  async updateSettingsOffline(settings: any) {
    await storageService.store('settings', settings);
    if (!navigator.onLine) {
      await this.queueOperation('UPDATE', '/api/settings', settings);
    }
  }

  // Get offline data with fallbacks
  async getOfflineTickets() {
    try {
      return await storageService.getAll('tickets');
    } catch (error) {
      console.error('Failed to get offline tickets:', error);
      return [];
    }
  }

  async getOfflineJourneys() {
    try {
      return await storageService.getAll('journeys');
    } catch (error) {
      console.error('Failed to get offline journeys:', error);
      return [];
    }
  }

  async getOfflineValidationEvents() {
    try {
      return await storageService.getAll('validationEvents');
    } catch (error) {
      console.error('Failed to get offline validation events:', error);
      return [];
    }
  }

  async getOfflineSettings() {
    try {
      const settings = await storageService.get('settings', 'user-settings');
      return settings || {
        autoReadAlerts: true,
        vibrationEnabled: true,
        vibrationIntensity: 2,
        locationEnabled: true,
        autoRequestAssistance: false,
        assistanceNote: '',
        useMockData: true
      };
    } catch (error) {
      console.error('Failed to get offline settings:', error);
      return null;
    }
  }

  getPendingOperationsCount() {
    return this.syncQueue.length;
  }

  isOnline() {
    return navigator.onLine;
  }
}

export const offlineService = new OfflineService();
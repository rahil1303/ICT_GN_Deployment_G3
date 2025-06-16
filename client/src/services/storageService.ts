export interface StoredData {
  tickets: any[];
  journeys: any[];
  validationEvents: any[];
  feedback: any[];
  settings: any;
}

class StorageService {
  private dbName = 'transitaccess';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('tickets')) {
          const ticketsStore = db.createObjectStore('tickets', { keyPath: 'id', autoIncrement: true });
          ticketsStore.createIndex('userId', 'userId', { unique: false });
        }

        if (!db.objectStoreNames.contains('journeys')) {
          const journeysStore = db.createObjectStore('journeys', { keyPath: 'id', autoIncrement: true });
          journeysStore.createIndex('userId', 'userId', { unique: false });
        }

        if (!db.objectStoreNames.contains('validationEvents')) {
          const eventsStore = db.createObjectStore('validationEvents', { keyPath: 'id', autoIncrement: true });
          eventsStore.createIndex('userId', 'userId', { unique: false });
        }

        if (!db.objectStoreNames.contains('feedback')) {
          const feedbackStore = db.createObjectStore('feedback', { keyPath: 'id', autoIncrement: true });
          feedbackStore.createIndex('userId', 'userId', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'userId' });
        }
      };
    });
  }

  async store(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get(storeName: string, key: any): Promise<any> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAll(storeName: string): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async delete(storeName: string, key: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Utility methods for offline sync
  async storePendingSync(type: string, data: any): Promise<void> {
    const storeName = `pending_${type}`;
    if (!this.db?.objectStoreNames.contains(storeName)) {
      // Create store if it doesn't exist
      await this.init();
    }
    await this.store(storeName, { ...data, timestamp: Date.now() });
  }

  async getPendingSync(type: string): Promise<any[]> {
    const storeName = `pending_${type}`;
    try {
      return await this.getAll(storeName);
    } catch {
      return [];
    }
  }

  async clearPendingSync(type: string): Promise<void> {
    const storeName = `pending_${type}`;
    try {
      await this.clear(storeName);
    } catch {
      // Store might not exist, ignore
    }
  }
}

export const storageService = new StorageService();

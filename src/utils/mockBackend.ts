/**
 * Mock Backend API using IndexedDB for persistent storage
 * Provides all Flask backend functionality client-side
 */

interface Note {
  id: string;
  content: string;
  color: string;
  x: number;
  y: number;
  author: string;
  timestamp: string;
  reactions: Array<{ emoji: string; author: string; timestamp: string }>;
  photos?: string[];
}

interface Photo {
  id: string;
  filename: string;
  url: string;
  caption: string;
  tags: string[];
  uploaded_by: string;
  uploaded_at: string;
  likes: Array<{ author: string; timestamp: string }>;
}

interface Chore {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  category: string;
  created_at: string;
  completed_at?: string;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  paid_by: string;
  split_between: string[];
  date: string;
  description?: string;
  receipt_url?: string;
  created_at: string;
}

interface CheckIn {
  id: string;
  week_of: string;
  author: string;
  mood: number;
  stress_level: number;
  satisfaction: number;
  highlights?: string;
  concerns?: string;
  suggestions?: string;
  created_at: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  type?: string;
  created_by: string;
  attendees?: string[];
  location?: string;
  created_at: string;
  google_event_id?: string;
}

interface AuthStatus {
  authenticated: boolean;
  user_email?: string;
  expires_at?: string;
}

class MockBackendAPI {
  private dbName = 'RoommateApp';
  private version = 3; // Increment version to force schema update
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB().then(() => {
      // Add a small delay to ensure DB is fully ready
      setTimeout(() => {
        this.initSampleData();
      }, 100);
    }).catch(error => {
      console.error('❌ Failed to initialize IndexedDB:', error);
    });
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        console.log('🗄️ Upgrading IndexedDB schema...');

        // Create all required object stores
        const stores = [
          'notes',
          'photos', 
          'chores',
          'expenses',
          'checkins',
          'calendar_events',
          'auth_status',
          'generic_data'
        ];

        stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            console.log(`📦 Creating object store: ${storeName}`);
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });

        console.log('✅ IndexedDB schema upgrade complete');
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    return this.db!;
  }

  private async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  private async add<T>(storeName: string, item: T): Promise<T> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(item);
    });
  }

  private async update<T>(storeName: string, item: T): Promise<T> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(item);
    });
  }

  private async delete(storeName: string, id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Reset database (for debugging)
  async resetDatabase(): Promise<void> {
    try {
      if (this.db) {
        this.db.close();
        this.db = null;
      }
      
      // Delete the database
      const deleteRequest = indexedDB.deleteDatabase(this.dbName);
      
      return new Promise((resolve, reject) => {
        deleteRequest.onerror = () => reject(deleteRequest.error);
        deleteRequest.onsuccess = () => {
          console.log('🗑️ Database reset successfully');
          resolve();
        };
        deleteRequest.onblocked = () => {
          console.warn('Database deletion blocked, close all tabs and try again');
          resolve(); // Don't fail, just continue
        };
      });
    } catch (error) {
      console.error('Failed to reset database:', error);
      throw error;
    }
  }

  // Health Check
  async healthCheck() {
    await this.ensureDB();
    return {
      status: 'healthy',
      message: 'Mock backend running with IndexedDB',
      timestamp: new Date().toISOString(),
      database: 'IndexedDB',
      tables: ['notes', 'photos', 'chores', 'expenses', 'checkins', 'calendar_events', 'auth_status']
    };
  }

  // Notes API
  async getNotes(): Promise<Note[]> {
    return await this.getAll<Note>('notes');
  }

  async createNote(noteData: Omit<Note, 'id' | 'timestamp'>): Promise<Note> {
    const note: Note = {
      ...noteData,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      reactions: []
    };
    return await this.add('notes', note);
  }

  async updateNote(id: string, noteData: Partial<Note>): Promise<Note> {
    const notes = await this.getNotes();
    const existingNote = notes.find(n => n.id === id);
    if (!existingNote) throw new Error('Note not found');

    const updatedNote = { ...existingNote, ...noteData };
    return await this.update('notes', updatedNote);
  }

  async deleteNote(id: string): Promise<void> {
    return await this.delete('notes', id);
  }

  async addReaction(id: string, emoji: string, author: string): Promise<Note> {
    const notes = await this.getNotes();
    const note = notes.find(n => n.id === id);
    if (!note) throw new Error('Note not found');

    // Remove existing reaction from this author for this emoji
    note.reactions = note.reactions.filter(r => !(r.emoji === emoji && r.author === author));
    
    // Add new reaction
    note.reactions.push({
      emoji,
      author,
      timestamp: new Date().toISOString()
    });

    return await this.update('notes', note);
  }

  // Photos API
  async getPhotos(): Promise<Photo[]> {
    return await this.getAll<Photo>('photos');
  }

  async uploadPhoto(file: File, caption: string = '', tags: string[] = [], uploadedBy: string = 'User'): Promise<Photo> {
    // Convert file to base64 for storage
    const base64 = await this.fileToBase64(file);
    
    const photo: Photo = {
      id: this.generateId(),
      filename: file.name,
      url: base64,
      caption,
      tags,
      uploaded_by: uploadedBy,
      uploaded_at: new Date().toISOString(),
      likes: []
    };

    return await this.add('photos', photo);
  }

  async deletePhoto(id: string): Promise<void> {
    return await this.delete('photos', id);
  }

  async togglePhotoLike(id: string, author: string): Promise<Photo> {
    const photos = await this.getPhotos();
    const photo = photos.find(p => p.id === id);
    if (!photo) throw new Error('Photo not found');

    const existingLike = photo.likes.find(l => l.author === author);
    if (existingLike) {
      // Remove like
      photo.likes = photo.likes.filter(l => l.author !== author);
    } else {
      // Add like
      photo.likes.push({
        author,
        timestamp: new Date().toISOString()
      });
    }

    return await this.update('photos', photo);
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Chores API
  async getChores(): Promise<Chore[]> {
    return await this.getAll<Chore>('chores');
  }

  async createChore(choreData: Omit<Chore, 'id' | 'created_at'>): Promise<Chore> {
    const chore: Chore = {
      ...choreData,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };
    return await this.add('chores', chore);
  }

  async updateChore(id: string, choreData: Partial<Chore>): Promise<Chore> {
    const chores = await this.getChores();
    const existingChore = chores.find(c => c.id === id);
    if (!existingChore) throw new Error('Chore not found');

    const updatedChore = { ...existingChore, ...choreData };
    if (choreData.status === 'completed' && !updatedChore.completed_at) {
      updatedChore.completed_at = new Date().toISOString();
    }

    return await this.update('chores', updatedChore);
  }

  async deleteChore(id: string): Promise<void> {
    return await this.delete('chores', id);
  }

  // Expenses API
  async getExpenses(): Promise<Expense[]> {
    return await this.getAll<Expense>('expenses');
  }

  async createExpense(expenseData: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
    const expense: Expense = {
      ...expenseData,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };
    return await this.add('expenses', expense);
  }

  async updateExpense(id: string, expenseData: Partial<Expense>): Promise<Expense> {
    const expenses = await this.getExpenses();
    const existingExpense = expenses.find(e => e.id === id);
    if (!existingExpense) throw new Error('Expense not found');

    const updatedExpense = { ...existingExpense, ...expenseData };
    return await this.update('expenses', updatedExpense);
  }

  async deleteExpense(id: string): Promise<void> {
    return await this.delete('expenses', id);
  }

  // Check-ins API
  async getCheckIns(): Promise<CheckIn[]> {
    return await this.getAll<CheckIn>('checkins');
  }

  async createCheckIn(checkinData: Omit<CheckIn, 'id' | 'created_at'>): Promise<CheckIn> {
    const checkin: CheckIn = {
      ...checkinData,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };
    return await this.add('checkins', checkin);
  }

  // Calendar API
  async getCalendarEvents(params?: { view?: string; start_date?: string; end_date?: string }): Promise<CalendarEvent[]> {
    const allEvents = await this.getAll<CalendarEvent>('calendar_events');
    
    if (!params) return allEvents;

    // Filter by date range if provided
    if (params.start_date && params.end_date) {
      const startDate = new Date(params.start_date);
      const endDate = new Date(params.end_date);
      
      return allEvents.filter(event => {
        const eventStart = new Date(event.start_date);
        return eventStart >= startDate && eventStart <= endDate;
      });
    }

    return allEvents;
  }

  async createCalendarEvent(eventData: Omit<CalendarEvent, 'id' | 'created_at'>): Promise<CalendarEvent> {
    const event: CalendarEvent = {
      ...eventData,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };
    return await this.add('calendar_events', event);
  }

  async updateCalendarEvent(id: string, eventData: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const events = await this.getCalendarEvents();
    const existingEvent = events.find(e => e.id === id);
    if (!existingEvent) throw new Error('Calendar event not found');

    const updatedEvent = { ...existingEvent, ...eventData };
    return await this.update('calendar_events', updatedEvent);
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    return await this.delete('calendar_events', id);
  }

  // Google Calendar Authentication API (Mock)
  async getGoogleAuthStatus(): Promise<AuthStatus> {
    try {
      await this.ensureDB();
      const authData = await this.getAll<AuthStatus & { id: string }>('auth_status');
      if (authData.length > 0) {
        return {
          authenticated: authData[0].authenticated,
          user_email: authData[0].user_email,
          expires_at: authData[0].expires_at
        };
      }
    } catch (error) {
      console.warn('Auth status store not accessible yet:', error);
    }
    
    return {
      authenticated: false
    };
  }

  async getGoogleAuthUrl(): Promise<{ auth_url: string; state: string }> {
    // Simulate Google OAuth URL generation
    const state = this.generateId();
    return {
      auth_url: `https://accounts.google.com/oauth/authorize?client_id=mock&redirect_uri=http://localhost:3000/auth/callback&scope=calendar&state=${state}`,
      state
    };
  }

  async setGoogleAuthStatus(authenticated: boolean, userEmail?: string): Promise<AuthStatus> {
    const authStatus: AuthStatus & { id: string } = {
      id: 'google_auth',
      authenticated,
      user_email: userEmail,
      expires_at: authenticated ? new Date(Date.now() + 3600000).toISOString() : undefined // 1 hour
    };

    return await this.update('auth_status', authStatus);
  }

  async getGoogleCalendarEvents(): Promise<CalendarEvent[]> {
    // Return mock Google Calendar events
    return [
      {
        id: 'google-1',
        title: '🏠 Monthly House Meeting',
        description: 'Discuss house matters, expenses, and upcoming events',
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // 1 hour later
        type: 'meeting',
        created_by: 'Google Calendar',
        attendees: ['nick@example.com', 'alex@example.com', 'landon@example.com'],
        location: 'Living Room',
        created_at: new Date().toISOString(),
        google_event_id: 'google_cal_event_1'
      },
      {
        id: 'google-2',
        title: '🐕 Kepler Vet Appointment',
        description: 'Annual checkup and vaccinations',
        start_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
        end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(), // 1.5 hours later
        type: 'appointment',
        created_by: 'Google Calendar',
        attendees: ['landon@example.com'],
        location: 'Pet Clinic',
        created_at: new Date().toISOString(),
        google_event_id: 'google_cal_event_2'
      }
    ];
  }

  async syncGoogleCalendar(): Promise<{ synced: number; message: string }> {
    // Simulate syncing with Google Calendar
    const googleEvents = await this.getGoogleCalendarEvents();
    let syncedCount = 0;

    for (const event of googleEvents) {
      try {
        // Check if event already exists
        const existingEvents = await this.getCalendarEvents();
        const exists = existingEvents.some(e => e.google_event_id === event.google_event_id);
        
        if (!exists) {
          await this.createCalendarEvent(event);
          syncedCount++;
        }
      } catch (error) {
        console.warn('Failed to sync event:', event.title, error);
      }
    }

    return {
      synced: syncedCount,
      message: `Successfully synced ${syncedCount} events from Google Calendar`
    };
  }

  // Initialize sample data
  private async initSampleData(): Promise<void> {
    try {
      console.log('🌱 Initializing sample data...');
      
      // Ensure database is ready
      await this.ensureDB();
      
      // Check if data already exists
      let notes: Note[] = [];
      let events: CalendarEvent[] = [];
      
      try {
        notes = await this.getNotes();
      } catch (error) {
        console.warn('Notes store not ready yet, will try again...');
        notes = [];
      }
      
      try {
        events = await this.getCalendarEvents();
      } catch (error) {
        console.warn('Calendar events store not ready yet, will try again...');
        events = [];
      }
      
      // Only add sample data if collections are empty
      if (notes.length === 0) {
        console.log('📝 Creating sample notes...');
        try {
          await this.createNote({
            content: '🎉 Welcome to our roommate dashboard! This is where we can leave notes for each other.',
            color: '#8B5CF6',
            x: 50,
            y: 50,
            author: 'Nick',
            photos: []
          });
          
          await this.createNote({
            content: '🐕 Kepler needs his walks at 7am and 6pm daily. Thanks for helping out!',
            color: '#10B981',
            x: 300,
            y: 200,
            author: 'Landon',
            photos: []
          });
          
          console.log('✅ Sample notes created');
        } catch (error) {
          console.warn('Failed to create sample notes:', error);
        }
      }

      if (events.length === 0) {
        console.log('📅 Creating sample calendar events...');
        try {
          const today = new Date();
          
          // Add some sample events
          await this.createCalendarEvent({
            title: '🏠 Weekly House Meeting',
            description: 'Discuss house matters, chores, and expenses',
            start_date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
            end_date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // 1 hour later
            type: 'meeting',
            created_by: 'Nick',
            attendees: ['nick@example.com', 'alex@example.com', 'landon@example.com'],
            location: 'Living Room'
          });

          await this.createCalendarEvent({
            title: '🧹 Deep Clean Day',
            description: 'Monthly deep cleaning of common areas',
            start_date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
            end_date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 4 hours later
            type: 'chore',
            created_by: 'Alex',
            attendees: ['nick@example.com', 'alex@example.com', 'landon@example.com'],
            location: 'Whole House'
          });
          
          console.log('✅ Sample calendar events created');
        } catch (error) {
          console.warn('Failed to create sample calendar events:', error);
        }
      }

      // Initialize auth status as not authenticated
      try {
        const authStatus = await this.getGoogleAuthStatus();
        if (!authStatus.authenticated) {
          await this.setGoogleAuthStatus(false);
        }
        console.log('✅ Auth status initialized');
      } catch (error) {
        console.warn('Failed to initialize auth status:', error);
      }

      console.log('🎉 Sample data initialization complete');

    } catch (error) {
      console.error('❌ Failed to initialize sample data:', error);
    }
  }

  // Generic data storage functions
  async loadData<T = any>(key: string): Promise<T | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['generic_data'], 'readonly');
      const store = transaction.objectStore('generic_data');
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };
    });
  }

  async saveData<T = any>(key: string, data: T): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['generic_data'], 'readwrite');
      const store = transaction.objectStore('generic_data');
      const request = store.put({
        id: key,
        data: data,
        updated_at: new Date().toISOString()
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Export data
  async exportAllData() {
    const notes = await this.getNotes();
    const photos = await this.getPhotos();
    const chores = await this.getChores();
    const expenses = await this.getExpenses();
    const checkins = await this.getCheckIns();
    const events = await this.getCalendarEvents();

    return {
      notes,
      photos: photos.map(p => ({ ...p, url: '[BASE64_DATA]' })), // Don't export full base64
      chores,
      expenses,
      checkins,
      calendar_events: events,
      exported_at: new Date().toISOString(),
      version: '1.0.0'
    };
  }
}

// Create singleton instance
export const mockBackend = new MockBackendAPI();

// Export mock API that matches the original Flask API structure
export const mockAPI = {
  healthCheck: () => mockBackend.healthCheck(),
  
  // Notes
  notes: {
    getAll: () => mockBackend.getNotes(),
    create: (data: any) => mockBackend.createNote(data),
    update: (id: string, data: any) => mockBackend.updateNote(id, data),
    delete: (id: string) => mockBackend.deleteNote(id),
    addReaction: (id: string, emoji: string, author: string) => mockBackend.addReaction(id, emoji, author)
  },

  // Photos
  photos: {
    getAll: () => mockBackend.getPhotos(),
    upload: (file: File, caption?: string, tags?: string[], uploadedBy?: string) => 
      mockBackend.uploadPhoto(file, caption, tags, uploadedBy),
    delete: (id: string) => mockBackend.deletePhoto(id),
    toggleLike: (id: string, author: string) => mockBackend.togglePhotoLike(id, author)
  },

  // Chores
  chores: {
    getAll: () => mockBackend.getChores(),
    create: (data: any) => mockBackend.createChore(data),
    update: (id: string, data: any) => mockBackend.updateChore(id, data),
    delete: (id: string) => mockBackend.deleteChore(id)
  },

  // Expenses
  expenses: {
    getAll: () => mockBackend.getExpenses(),
    create: (data: any) => mockBackend.createExpense(data),
    update: (id: string, data: any) => mockBackend.updateExpense(id, data),
    delete: (id: string) => mockBackend.deleteExpense(id)
  },

  // Check-ins
  checkins: {
    getAll: () => mockBackend.getCheckIns(),
    create: (data: any) => mockBackend.createCheckIn(data)
  },

  // Calendar
  calendar: {
    getEvents: (params?: any) => mockBackend.getCalendarEvents(params),
    create: (data: any) => mockBackend.createCalendarEvent(data),
    update: (id: string, data: any) => mockBackend.updateCalendarEvent(id, data),
    delete: (id: string) => mockBackend.deleteCalendarEvent(id)
  },

  // Google Calendar Auth
  auth: {
    google: {
      getStatus: () => mockBackend.getGoogleAuthStatus(),
      getAuthUrl: () => mockBackend.getGoogleAuthUrl(),
      setStatus: (authenticated: boolean, email?: string) => mockBackend.setGoogleAuthStatus(authenticated, email)
    }
  },

  // Google Calendar
  googleCalendar: {
    getEvents: () => mockBackend.getGoogleCalendarEvents(),
    sync: () => mockBackend.syncGoogleCalendar()
  },

  // Export
  export: () => mockBackend.exportAllData(),

  // Debug
  reset: () => mockBackend.resetDatabase()
};

// Export individual functions for convenience
export const loadData = <T = any>(key: string): Promise<T | null> => mockBackend.loadData<T>(key);
export const saveData = <T = any>(key: string, data: T): Promise<void> => mockBackend.saveData<T>(key, data);
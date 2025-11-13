/**
 * API utility using IndexedDB-based mock backend
 * Provides full backend functionality client-side with persistent data
 */

import { mockAPI } from './mockBackend';

// Simulate network delay for realistic experience
const simulateNetworkDelay = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms));

// Generic API request function that uses the mock backend
async function apiRequest(endpoint: string, options: RequestInit = {}, data?: any) {
  console.log(`🌐 Mock API Request: ${options.method || 'GET'} ${endpoint}`);
  
  // Simulate network delay
  await simulateNetworkDelay();

  try {
    // Route to appropriate mock API endpoint
    const method = options.method || 'GET';
    const result = await routeToMockAPI(endpoint, method, data);
    
    console.log(`✅ Mock API Response for ${endpoint}:`, result);
    return result;
  } catch (error) {
    console.error(`❌ Mock API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Route requests to the appropriate mock API methods
async function routeToMockAPI(endpoint: string, method: string, data?: any) {
  // Health check
  if (endpoint === '/health') {
    return await mockAPI.healthCheck();
  }

  // Notes endpoints
  if (endpoint === '/notes') {
    if (method === 'GET') return await mockAPI.notes.getAll();
    if (method === 'POST') return await mockAPI.notes.create(data);
  }
  
  if (endpoint.startsWith('/notes/')) {
    const id = endpoint.split('/')[2];
    if (endpoint.endsWith('/react')) {
      const noteId = endpoint.split('/')[2];
      return await mockAPI.notes.addReaction(noteId, data.emoji, data.author);
    } else {
      if (method === 'PUT') return await mockAPI.notes.update(id, data);
      if (method === 'DELETE') return await mockAPI.notes.delete(id);
    }
  }

  // Photos endpoints
  if (endpoint === '/photos') {
    if (method === 'GET') return await mockAPI.photos.getAll();
    if (method === 'POST') {
      // Handle FormData for photo uploads
      if (data instanceof FormData) {
        const file = data.get('photo') as File;
        const caption = data.get('caption') as string || '';
        const tags = data.get('tags') ? (data.get('tags') as string).split(',') : [];
        const uploadedBy = data.get('uploaded_by') as string || 'User';
        return await mockAPI.photos.upload(file, caption, tags, uploadedBy);
      }
    }
  }

  if (endpoint.startsWith('/photos/')) {
    const id = endpoint.split('/')[2];
    if (endpoint.endsWith('/like')) {
      const photoId = endpoint.split('/')[2];
      return await mockAPI.photos.toggleLike(photoId, data.author);
    } else {
      if (method === 'DELETE') return await mockAPI.photos.delete(id);
    }
  }

  // Chores endpoints
  if (endpoint === '/chores') {
    if (method === 'GET') return await mockAPI.chores.getAll();
    if (method === 'POST') return await mockAPI.chores.create(data);
  }

  if (endpoint.startsWith('/chores/')) {
    const id = endpoint.split('/')[2];
    if (method === 'PUT') return await mockAPI.chores.update(id, data);
    if (method === 'DELETE') return await mockAPI.chores.delete(id);
  }

  // Expenses endpoints
  if (endpoint === '/expenses') {
    if (method === 'GET') return await mockAPI.expenses.getAll();
    if (method === 'POST') return await mockAPI.expenses.create(data);
  }

  if (endpoint.startsWith('/expenses/')) {
    const id = endpoint.split('/')[2];
    if (method === 'PUT') return await mockAPI.expenses.update(id, data);
    if (method === 'DELETE') return await mockAPI.expenses.delete(id);
  }

  // Check-ins endpoints
  if (endpoint === '/checkins') {
    if (method === 'GET') return await mockAPI.checkins.getAll();
    if (method === 'POST') return await mockAPI.checkins.create(data);
  }

  // Calendar endpoints
  if (endpoint.startsWith('/calendar/events')) {
    if (method === 'GET') {
      // Parse query parameters
      const url = new URL(`http://dummy.com${endpoint}`);
      const params: any = {};
      if (url.searchParams.has('view')) params.view = url.searchParams.get('view');
      if (url.searchParams.has('start_date')) params.start_date = url.searchParams.get('start_date');
      if (url.searchParams.has('end_date')) params.end_date = url.searchParams.get('end_date');
      
      return await mockAPI.calendar.getEvents(params);
    }
    if (method === 'POST') return await mockAPI.calendar.create(data);
    
    // Handle specific event ID endpoints
    const parts = endpoint.split('/');
    if (parts.length > 3) {
      const eventId = parts[3];
      if (method === 'PUT') return await mockAPI.calendar.update(eventId, data);
      if (method === 'DELETE') return await mockAPI.calendar.delete(eventId);
    }
  }

  // Google Auth endpoints
  if (endpoint === '/auth/google/status') {
    return await mockAPI.auth.google.getStatus();
  }

  if (endpoint === '/auth/google') {
    return await mockAPI.auth.google.getAuthUrl();
  }

  // Google Calendar endpoints
  if (endpoint === '/calendar/google/events') {
    return await mockAPI.googleCalendar.getEvents();
  }

  if (endpoint === '/calendar/google/create') {
    if (method === 'POST') {
      // For now, just create in local calendar
      return await mockAPI.calendar.create(data);
    }
  }

  if (endpoint === '/calendar/sync') {
    if (method === 'POST') {
      return await mockAPI.googleCalendar.sync();
    }
  }

  // Export endpoint
  if (endpoint === '/export') {
    return await mockAPI.export();
  }

  throw new Error(`Unknown endpoint: ${endpoint}`);
}

// ===== NOTES API =====

export const notesAPI = {
  // Get all notes
  getAll: async () => {
    return await apiRequest('/notes');
  },

  // Create a new note
  create: async (noteData: {
    content: string;
    color: string;
    x: number;
    y: number;
    author: string;
    photos?: string[];
  }) => {
    return await apiRequest('/notes', {
      method: 'POST',
    }, noteData);
  },

  // Update a note
  update: async (noteId: string, noteData: any) => {
    return await apiRequest(`/notes/${noteId}`, {
      method: 'PUT',
    }, noteData);
  },

  // Delete a note
  delete: async (noteId: string) => {
    return await apiRequest(`/notes/${noteId}`, {
      method: 'DELETE',
    });
  },

  // Add or toggle reaction
  addReaction: async (noteId: string, emoji: string, author: string) => {
    return await apiRequest(`/notes/${noteId}/react`, {
      method: 'POST',
    }, { emoji, author });
  },
};

// ===== PHOTOS API =====

export const photosAPI = {
  // Get all photos
  getAll: async () => {
    return await apiRequest('/photos');
  },

  // Upload a photo
  upload: async (photoData: {
    photo: File;
    caption: string;
    uploadedBy: string;
    tags: string[];
  }) => {
    const formData = new FormData();
    formData.append('photo', photoData.photo);
    formData.append('caption', photoData.caption);
    formData.append('uploaded_by', photoData.uploadedBy);
    formData.append('tags', photoData.tags.join(','));

    return await apiRequest('/photos', {
      method: 'POST',
    }, formData);
  },

  // Delete a photo
  delete: async (photoId: string) => {
    return await apiRequest(`/photos/${photoId}`, {
      method: 'DELETE',
    });
  },

  // Toggle like on photo
  toggleLike: async (photoId: string, author: string) => {
    return await apiRequest(`/photos/${photoId}/like`, {
      method: 'POST',
    }, { author });
  },
};

// ===== CHORES API =====

export const choresAPI = {
  // Get all chores
  getAll: async () => {
    return await apiRequest('/chores');
  },

  // Create a new chore
  create: async (choreData: {
    title: string;
    description?: string;
    assigned_to: string;
    due_date?: string;
    status?: 'pending' | 'in_progress' | 'completed';
    category?: string;
  }) => {
    return await apiRequest('/chores', {
      method: 'POST',
    }, choreData);
  },

  // Update a chore
  update: async (choreId: string, choreData: any) => {
    return await apiRequest(`/chores/${choreId}`, {
      method: 'PUT',
    }, choreData);
  },

  // Delete a chore
  delete: async (choreId: string) => {
    return await apiRequest(`/chores/${choreId}`, {
      method: 'DELETE',
    });
  },

  // Mark chore as completed
  markCompleted: async (choreId: string) => {
    return await apiRequest(`/chores/${choreId}`, {
      method: 'PUT',
    }, { status: 'completed' });
  },
};

// ===== EXPENSES API =====

export const expensesAPI = {
  // Get all expenses
  getAll: async () => {
    return await apiRequest('/expenses');
  },

  // Create a new expense
  create: async (expenseData: {
    title: string;
    amount: number;
    category: string;
    paid_by: string;
    split_between: string[];
    date: string;
    description?: string;
  }) => {
    return await apiRequest('/expenses', {
      method: 'POST',
    }, expenseData);
  },

  // Update an expense
  update: async (expenseId: string, expenseData: any) => {
    return await apiRequest(`/expenses/${expenseId}`, {
      method: 'PUT',
    }, expenseData);
  },

  // Delete an expense
  delete: async (expenseId: string) => {
    return await apiRequest(`/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  },
};

// ===== CHECKINS API =====

export const checkinsAPI = {
  // Get all check-ins
  getAll: async () => {
    return await apiRequest('/checkins');
  },

  // Create a new check-in
  create: async (checkinData: {
    week_of: string;
    author: string;
    mood: number;
    stress_level: number;
    satisfaction: number;
    highlights?: string;
    concerns?: string;
    suggestions?: string;
  }) => {
    return await apiRequest('/checkins', {
      method: 'POST',
    }, checkinData);
  },
};

// ===== CALENDAR API =====

export const calendarAPI = {
  // Get all calendar events
  getAll: async (params?: {
    view?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await apiRequest(`/calendar/events${queryParams}`);
  },

  // Create a new calendar event
  create: async (eventData: {
    title: string;
    description?: string;
    start_date: string;
    end_date?: string;
    type?: string;
    created_by: string;
    attendees?: string[];
    location?: string;
  }) => {
    return await apiRequest('/calendar/events', {
      method: 'POST',
    }, eventData);
  },

  // Update a calendar event
  update: async (eventId: string, eventData: any) => {
    return await apiRequest(`/calendar/events/${eventId}`, {
      method: 'PUT',
    }, eventData);
  },

  // Delete a calendar event
  delete: async (eventId: string) => {
    return await apiRequest(`/calendar/events/${eventId}`, {
      method: 'DELETE',
    });
  },
};

// ===== GOOGLE CALENDAR API =====

export const googleCalendarAPI = {
  // Get Google OAuth URL
  getAuthUrl: async () => {
    return await apiRequest('/auth/google');
  },

  // Check Google authentication status
  getAuthStatus: async () => {
    return await apiRequest('/auth/google/status');
  },

  // Get Google Calendar events
  getEvents: async () => {
    return await apiRequest('/calendar/google/events');
  },

  // Create event in Google Calendar
  createEvent: async (eventData: {
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    location?: string;
    attendees?: string[];
  }) => {
    return await apiRequest('/calendar/google/create', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  // Sync with Google Calendar
  sync: async () => {
    return await apiRequest('/calendar/sync', {
      method: 'POST',
    });
  },
};

// ===== HEALTH CHECK =====

export const healthAPI = {
  check: async () => {
    return await apiRequest('/health');
  },
};

// ===== DATA EXPORT =====

export const dataAPI = {
  export: async () => {
    const response = await apiRequest('/export');
    return response;
  },
};

// ===== UTILITY FUNCTIONS =====

export const utils = {
  // Test connection to mock backend
  testConnection: async () => {
    try {
      console.log('🔍 Testing mock backend connection...');
      const result = await healthAPI.check();
      console.log('✅ Mock backend connection successful:', result);
      return true;
    } catch (error) {
      console.error('❌ Mock backend connection failed:', error);
      return false;
    }
  },

  // Handle API errors with user-friendly messages
  handleError: (error: any) => {
    if (error.message.includes('HTTP 404')) {
      return 'Requested resource not found.';
    } else if (error.message.includes('HTTP 413')) {
      return 'File too large. Please choose a smaller file.';
    } else if (error.message.includes('HTTP 500')) {
      return 'Server error. Please try again later.';
    } else {
      return error.message || 'An unexpected error occurred.';
    }
  },
};

export default {
  notes: notesAPI,
  photos: photosAPI,
  chores: choresAPI,
  expenses: expensesAPI,
  checkins: checkinsAPI,
  calendar: calendarAPI,
  googleCalendar: googleCalendarAPI,
  health: healthAPI,
  data: dataAPI,
  utils,
};
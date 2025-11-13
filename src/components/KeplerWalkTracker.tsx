import React, { useState, useEffect } from 'react';
import {
  Dog,
  Clock,
  User,
  Edit2,
  Check,
  X,
  Calendar,
  TrendingUp,
  Plus,
  MapPin,
  Timer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getOnboardingData } from '../utils/onboarding';

// Helper functions for date formatting
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// Walk entry interface
export interface WalkEntry {
  id: string;
  date: string; // ISO date string
  time: string; // Time in format "HH:MM"
  walkedBy: string;
  duration?: number; // in minutes
  notes?: string;
  scheduledTime?: string; // The original scheduled time (e.g., "7:00 AM")
  location?: string;
}

// Scheduled walk times
const SCHEDULED_WALKS = [
  { id: 'morning', time: '7:00 AM', label: 'Morning Walk' },
  { id: 'afternoon', time: '3:00 PM', label: 'Afternoon Walk' },
  { id: 'evening', time: '8:00 PM', label: 'Evening Walk' },
];

const STORAGE_KEY = 'kepler-walk-logs';
const DEFAULT_ROOMMATES = ['Nick', 'Alex', 'Landon', 'You']; // Fallback if onboarding data not available

export function KeplerWalkTracker() {
  const [walks, setWalks] = useState<WalkEntry[]>([]);
  const [roommates, setRoommates] = useState<string[]>(DEFAULT_ROOMMATES);
  const [isLogging, setIsLogging] = useState(false);
  const [editingWalk, setEditingWalk] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [newWalk, setNewWalk] = useState({
    time: formatTime(new Date()),
    walkedBy: '',
    duration: '',
    notes: '',
    scheduledTime: '',
    location: '',
  });

  // Load roommate names from onboarding data
  useEffect(() => {
    const onboardingData = getOnboardingData();
    if (onboardingData && onboardingData.roommates.length > 0) {
      const names = onboardingData.roommates.map(r => r.name).filter(n => n);
      if (names.length > 0) {
        setRoommates(names);
      }
    }
  }, []);

  // Load walks from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setWalks(parsed);
      } catch (error) {
        console.error('Error loading walk logs:', error);
      }
    }
  }, []);

  // Save walks to localStorage
  useEffect(() => {
    if (walks.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(walks));
    }
  }, [walks]);

  // Get today's walks
  const todaysWalks = walks.filter((walk) =>
    isToday(new Date(walk.date))
  );

  // Get walks from previous days (last 7 days)
  const previousWalks = walks
    .filter((walk) => !isToday(new Date(walk.date)))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 21); // Last 3 weeks of walks

  // Check which scheduled walks have been completed
  const getScheduledWalkStatus = () => {
    return SCHEDULED_WALKS.map((scheduled) => {
      const completed = todaysWalks.find(
        (walk) => walk.scheduledTime === scheduled.time
      );
      return {
        ...scheduled,
        completed: !!completed,
        actualWalk: completed,
      };
    });
  };

  const scheduledWalkStatus = getScheduledWalkStatus();

  // Handle logging a new walk
  const handleLogWalk = () => {
    if (!newWalk.walkedBy) {
      alert('Please select who walked Kepler');
      return;
    }

    const walkEntry: WalkEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      time: newWalk.time,
      walkedBy: newWalk.walkedBy,
      duration: newWalk.duration ? parseInt(newWalk.duration) : undefined,
      notes: newWalk.notes || undefined,
      scheduledTime: newWalk.scheduledTime || undefined,
      location: newWalk.location || undefined,
    };

    setWalks((prev) => [walkEntry, ...prev]);
    
    // Reset form
    setNewWalk({
      time: formatTime(new Date()),
      walkedBy: '',
      duration: '',
      notes: '',
      scheduledTime: '',
      location: '',
    });
    setIsLogging(false);
  };

  // Handle editing a walk
  const handleEditWalk = (walkId: string, updates: Partial<WalkEntry>) => {
    setWalks((prev) =>
      prev.map((walk) =>
        walk.id === walkId ? { ...walk, ...updates } : walk
      )
    );
    setEditingWalk(null);
  };

  // Handle deleting a walk
  const handleDeleteWalk = (walkId: string) => {
    if (confirm('Are you sure you want to delete this walk entry?')) {
      setWalks((prev) => prev.filter((walk) => walk.id !== walkId));
    }
  };

  // Quick log for scheduled walks
  const quickLogScheduledWalk = (scheduledTime: string, label: string) => {
    setNewWalk({
      time: formatTime(new Date()),
      walkedBy: '',
      duration: '15',
      notes: '',
      scheduledTime: scheduledTime,
      location: '',
    });
    setIsLogging(true);
  };

  // Glassmorphism style
  const glassStyle = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl p-6 shadow-xl border-l-4 border-teal-500" style={glassStyle}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/20 rounded-xl">
              <Dog className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="text-xl text-gray-800">Kepler's Daily Walks</h3>
              <p className="text-sm text-gray-600">
                {todaysWalks.length} walk{todaysWalks.length !== 1 ? 's' : ''} logged today
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLogging(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Log a Walk
          </button>
        </div>
      </div>

      {/* Scheduled Walks Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scheduledWalkStatus.map((walk) => (
          <div
            key={walk.id}
            className={`rounded-xl p-4 shadow-lg transition-all duration-200 ${
              walk.completed
                ? 'bg-green-50/50 border-2 border-green-300'
                : 'bg-white/50 border-2 border-gray-200'
            }`}
            style={glassStyle}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${walk.completed ? 'text-green-600' : 'text-gray-500'}`} />
                <span className="text-sm text-gray-700">{walk.time}</span>
              </div>
              {walk.completed ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
              )}
            </div>
            <h4 className={`mb-2 ${walk.completed ? 'text-green-800' : 'text-gray-700'}`}>
              {walk.label}
            </h4>
            {walk.completed && walk.actualWalk ? (
              <div className="text-xs text-gray-600 space-y-1">
                <p className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {walk.actualWalk.walkedBy}
                </p>
                <p className="flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  {walk.actualWalk.time}
                </p>
              </div>
            ) : (
              <button
                onClick={() => quickLogScheduledWalk(walk.time, walk.label)}
                className="mt-2 w-full px-3 py-1 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600 transition-colors"
              >
                Quick Log
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Log Walk Form */}
      {isLogging && (
        <div className="rounded-2xl p-6 shadow-xl border-2 border-teal-400" style={glassStyle}>
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg text-gray-800">Log a Walk</h4>
            <button
              onClick={() => setIsLogging(false)}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Time of Walk</label>
              <input
                type="time"
                value={newWalk.time}
                onChange={(e) => setNewWalk({ ...newWalk, time: e.target.value })}
                className="w-full px-4 py-2 bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Who Walked Kepler? *</label>
              <select
                value={newWalk.walkedBy}
                onChange={(e) => setNewWalk({ ...newWalk, walkedBy: e.target.value })}
                className="w-full px-4 py-2 bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Select roommate</option>
                {roommates.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Duration (minutes)</label>
              <input
                type="number"
                value={newWalk.duration}
                onChange={(e) => setNewWalk({ ...newWalk, duration: e.target.value })}
                placeholder="15"
                className="w-full px-4 py-2 bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Scheduled For</label>
              <select
                value={newWalk.scheduledTime}
                onChange={(e) => setNewWalk({ ...newWalk, scheduledTime: e.target.value })}
                className="w-full px-4 py-2 bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Custom/Unscheduled</option>
                {SCHEDULED_WALKS.map((walk) => (
                  <option key={walk.id} value={walk.time}>
                    {walk.label} ({walk.time})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Location (optional)</label>
              <input
                type="text"
                value={newWalk.location}
                onChange={(e) => setNewWalk({ ...newWalk, location: e.target.value })}
                placeholder="e.g., Park, Around the block"
                className="w-full px-4 py-2 bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Notes (optional)</label>
              <input
                type="text"
                value={newWalk.notes}
                onChange={(e) => setNewWalk({ ...newWalk, notes: e.target.value })}
                placeholder="Any observations..."
                className="w-full px-4 py-2 bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleLogWalk}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              Save Walk
            </button>
            <button
              onClick={() => setIsLogging(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Today's Walks Log */}
      {todaysWalks.length > 0 && (
        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <h4 className="text-lg text-gray-800 mb-4">Today's Walk Log</h4>
          <div className="space-y-3">
            {todaysWalks
              .sort((a, b) => {
                // Sort by time (most recent first)
                const timeA = a.time.split(':').map(Number);
                const timeB = b.time.split(':').map(Number);
                return timeB[0] * 60 + timeB[1] - (timeA[0] * 60 + timeA[1]);
              })
              .map((walk) => (
                <WalkLogEntry
                  key={walk.id}
                  walk={walk}
                  onEdit={handleEditWalk}
                  onDelete={handleDeleteWalk}
                  editingWalk={editingWalk}
                  setEditingWalk={setEditingWalk}
                  roommates={roommates}
                />
              ))}
          </div>
        </div>
      )}

      {/* Walk History */}
      <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center justify-between w-full mb-4"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-700" />
            <h4 className="text-lg text-gray-800">Walk History</h4>
            <span className="text-sm text-gray-600">({previousWalks.length} recent walks)</span>
          </div>
          {showHistory ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {showHistory && (
          <div className="space-y-4 mt-4">
            {previousWalks.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No previous walks logged yet</p>
            ) : (
              previousWalks.map((walk) => (
                <div key={walk.id} className="p-4 bg-white/30 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">
                      {formatDate(new Date(walk.date))}
                    </span>
                    <span className="text-xs text-gray-600">{walk.time}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{walk.walkedBy}</span>
                    </div>
                    {walk.duration && (
                      <div className="flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        <span>{walk.duration} min</span>
                      </div>
                    )}
                    {walk.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{walk.location}</span>
                      </div>
                    )}
                  </div>
                  {walk.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">{walk.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl p-4 shadow-lg bg-gradient-to-br from-purple-100 to-purple-50" style={glassStyle}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-purple-700">This Week</span>
          </div>
          <p className="text-2xl text-purple-800">
            {walks.filter((w) => {
              const walkDate = new Date(w.date);
              const today = new Date();
              const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
              return walkDate >= weekAgo;
            }).length}
          </p>
          <p className="text-xs text-purple-600 mt-1">walks logged</p>
        </div>

        <div className="rounded-xl p-4 shadow-lg bg-gradient-to-br from-teal-100 to-teal-50" style={glassStyle}>
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-teal-600" />
            <span className="text-sm text-teal-700">Most Active</span>
          </div>
          <p className="text-2xl text-teal-800">
            {(() => {
              const counts: Record<string, number> = {};
              walks.forEach((w) => {
                counts[w.walkedBy] = (counts[w.walkedBy] || 0) + 1;
              });
              const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
              return sorted[0]?.[0] || 'N/A';
            })()}
          </p>
          <p className="text-xs text-teal-600 mt-1">this month</p>
        </div>

        <div className="rounded-xl p-4 shadow-lg bg-gradient-to-br from-blue-100 to-blue-50" style={glassStyle}>
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700">Avg Duration</span>
          </div>
          <p className="text-2xl text-blue-800">
            {(() => {
              const withDuration = walks.filter((w) => w.duration);
              if (withDuration.length === 0) return 'N/A';
              const avg =
                withDuration.reduce((sum, w) => sum + (w.duration || 0), 0) /
                withDuration.length;
              return Math.round(avg);
            })()}
          </p>
          <p className="text-xs text-blue-600 mt-1">minutes</p>
        </div>
      </div>
    </div>
  );
}

// Walk Log Entry Component
function WalkLogEntry({
  walk,
  onEdit,
  onDelete,
  editingWalk,
  setEditingWalk,
  roommates,
}: {
  walk: WalkEntry;
  onEdit: (id: string, updates: Partial<WalkEntry>) => void;
  onDelete: (id: string) => void;
  editingWalk: string | null;
  setEditingWalk: (id: string | null) => void;
  roommates: string[];
}) {
  const [editForm, setEditForm] = useState({
    time: walk.time,
    walkedBy: walk.walkedBy,
    duration: walk.duration?.toString() || '',
    notes: walk.notes || '',
    location: walk.location || '',
  });

  const isEditing = editingWalk === walk.id;

  const handleSaveEdit = () => {
    onEdit(walk.id, {
      time: editForm.time,
      walkedBy: editForm.walkedBy,
      duration: editForm.duration ? parseInt(editForm.duration) : undefined,
      notes: editForm.notes || undefined,
      location: editForm.location || undefined,
    });
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-blue-50/50 rounded-lg border-2 border-blue-300">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-700 mb-1">Time</label>
            <input
              type="time"
              value={editForm.time}
              onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
              className="w-full px-3 py-1 bg-white border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">Who</label>
            <select
              value={editForm.walkedBy}
              onChange={(e) => setEditForm({ ...editForm, walkedBy: e.target.value })}
              className="w-full px-3 py-1 bg-white border border-gray-300 rounded text-sm"
            >
              {roommates.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">Duration (min)</label>
            <input
              type="number"
              value={editForm.duration}
              onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
              className="w-full px-3 py-1 bg-white border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={editForm.location}
              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              className="w-full px-3 py-1 bg-white border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-xs text-gray-700 mb-1">Notes</label>
          <input
            type="text"
            value={editForm.notes}
            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
            className="w-full px-3 py-1 bg-white border border-gray-300 rounded text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSaveEdit}
            className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            <Check className="w-3 h-3" />
            Save
          </button>
          <button
            onClick={() => setEditingWalk(null)}
            className="flex items-center gap-1 px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
          >
            <X className="w-3 h-3" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border hover:border-teal-300 transition-colors ${
      walk.scheduledTime 
        ? 'bg-green-50/50 border-green-200' 
        : 'bg-white/30 border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-1 rounded text-sm ${
              walk.scheduledTime 
                ? 'bg-green-100 text-green-700' 
                : 'bg-teal-100 text-teal-700'
            }`}>
              {walk.time}
            </span>
            {walk.scheduledTime && (
              <span className="text-xs px-2 py-1 bg-green-200/50 text-green-700 rounded">
                Scheduled: {walk.scheduledTime}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{walk.walkedBy}</span>
            </div>
            {walk.duration && (
              <div className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                <span>{walk.duration} min</span>
              </div>
            )}
            {walk.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{walk.location}</span>
              </div>
            )}
          </div>
          {walk.notes && (
            <p className="text-sm text-gray-600 mt-2 italic">{walk.notes}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditingWalk(walk.id)}
            className="p-2 hover:bg-blue-100 rounded transition-colors"
          >
            <Edit2 className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => onDelete(walk.id)}
            className="p-2 hover:bg-red-100 rounded transition-colors"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare,
  Plus,
  Pin,
  Clock,
  User,
  Edit3,
  Trash2,
  Send,
  AlertCircle,
  Info,
  Heart,
  CheckCircle,
  X,
  Wifi,
  WifiOff
} from 'lucide-react';
import { notesAPI, utils } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface Note {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  type: 'general' | 'urgent' | 'reminder' | 'kepler' | 'chore';
  pinned: boolean;
  reactions: { [emoji: string]: string[] };
}

export function NotesBoard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [newNote, setNewNote] = useState<Partial<Note>>({
    type: 'general',
    author: 'Landon',
    pinned: false,
    reactions: {}
  });

  const residents = ['Nick', 'Alex', 'Landon'];
  const noteTypes = [
    { value: 'general', label: 'General', color: 'blue' },
    { value: 'urgent', label: 'Urgent', color: 'red' },
    { value: 'reminder', label: 'Reminder', color: 'yellow' },
    { value: 'kepler', label: 'Kepler', color: 'purple' },
    { value: 'chore', label: 'Chore', color: 'green' }
  ];

  // Glassmorphism styles
  const glassStyle = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
  };

  useEffect(() => {
    loadNotes();
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const isConnected = await utils.testConnection();
    setConnected(isConnected);
    if (!isConnected) {
      toast.error('Backend not connected. Please start the Flask server.');
    }
  };

  const loadNotes = async () => {
    try {
      setLoading(true);
      const fetchedNotes = await notesAPI.getAll();
      setNotes(fetchedNotes);
      setConnected(true);
      
      // Add welcome note if none exist
      if (fetchedNotes.length === 0) {
        await createWelcomeNote();
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
      setConnected(false);
      toast.error(utils.handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const createWelcomeNote = async () => {
    try {
      await notesAPI.create({
        title: 'Welcome to the House Notes Board! 🏠',
        content: 'This is where we can leave messages for each other, share updates, and keep everyone in the loop. Feel free to pin important messages and use different note types to organize our communication.',
        author: 'System',
        type: 'general',
        pinned: true,
      });
      await loadNotes(); // Refresh the list
    } catch (error) {
      console.error('Failed to create welcome note:', error);
    }
  };

  const addNote = async () => {
    if (newNote.title && newNote.content) {
      try {
        await notesAPI.create({
          title: newNote.title,
          content: newNote.content,
          author: newNote.author || 'Landon',
          type: newNote.type || 'general',
          pinned: newNote.pinned || false,
        });
        
        await loadNotes(); // Refresh the list
        setNewNote({
          type: 'general',
          author: 'Landon',
          pinned: false,
          reactions: {}
        });
        setShowAddNote(false);
        toast.success('Note created successfully!');
      } catch (error) {
        console.error('Failed to create note:', error);
        toast.error(utils.handleError(error));
      }
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      await notesAPI.delete(noteId);
      await loadNotes(); // Refresh the list
      toast.success('Note deleted successfully!');
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast.error(utils.handleError(error));
    }
  };

  const togglePin = async (noteId: string) => {
    try {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        await notesAPI.update(noteId, { ...note, pinned: !note.pinned });
        await loadNotes(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to toggle pin:', error);
      toast.error(utils.handleError(error));
    }
  };

  const addReaction = async (noteId: string, emoji: string, author: string) => {
    try {
      await notesAPI.addReaction(noteId, emoji, author);
      await loadNotes(); // Refresh the list
    } catch (error) {
      console.error('Failed to add reaction:', error);
      toast.error(utils.handleError(error));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'reminder': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'kepler': return <Heart className="w-4 h-4 text-purple-600" />;
      case 'chore': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'border-red-500 bg-red-50/30';
      case 'reminder': return 'border-yellow-500 bg-yellow-50/30';
      case 'kepler': return 'border-purple-500 bg-purple-50/30';
      case 'chore': return 'border-green-500 bg-green-50/30';
      default: return 'border-blue-500 bg-blue-50/30';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
              House Notes Board
            </h1>
            {connected ? (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                <Wifi className="w-3 h-3" />
                Connected
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                <WifiOff className="w-3 h-3" />
                Offline
              </div>
            )}
          </div>
          <p className="text-gray-600 mt-1">Leave messages, updates, and reminders for everyone.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadNotes}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-gray-700 rounded-xl hover:bg-white/20 transition-all duration-200"
            title="Refresh notes"
          >
            <Clock className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowAddNote(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            disabled={!connected}
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {noteTypes.map(type => {
          const count = notes.filter(n => n.type === type.value).length;
          return (
            <div key={type.value} className="rounded-xl p-4 shadow-lg" style={glassStyle}>
              <div className="flex items-center gap-2 mb-2">
                {getTypeIcon(type.value)}
                <span className="text-sm text-gray-700 capitalize">{type.label}</span>
              </div>
              <div className="text-2xl text-gray-800">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-2xl p-8 shadow-xl text-center" style={glassStyle}>
          <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notes...</p>
        </div>
      )}

      {/* Notes Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedNotes.map(note => (
          <div
            key={note.id}
            className={`rounded-2xl p-6 shadow-xl border-l-4 relative ${getTypeColor(note.type)}`}
            style={glassStyle}
          >
            {/* Pin indicator */}
            {note.pinned && (
              <div className="absolute top-4 right-4">
                <Pin className="w-4 h-4 text-orange-600 fill-current" />
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getTypeIcon(note.type)}
                <span className="text-xs text-gray-600 capitalize">{note.type}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => togglePin(note.id)}
                  className={`p-1 rounded hover:bg-white/10 transition-colors ${
                    note.pinned ? 'text-orange-600' : 'text-gray-400'
                  }`}
                >
                  <Pin className="w-3 h-3" />
                </button>
                {note.author !== 'System' && (
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1 rounded hover:bg-white/10 transition-colors text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <h3 className="text-gray-800 mb-2">{note.title}</h3>
            <p className="text-sm text-gray-700 mb-4 whitespace-pre-wrap">{note.content}</p>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <User className="w-3 h-3" />
                <span>{note.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>{formatTimestamp(note.timestamp)}</span>
              </div>
            </div>

            {/* Reactions */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
              <div className="flex gap-1">
                {['👍', '❤️', '😊', '👏'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => addReaction(note.id, emoji, 'Current User')}
                    className="text-lg hover:scale-110 transition-transform"
                    title={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {Object.entries(note.reactions).map(([emoji, users]) => (
                  <div
                    key={emoji}
                    className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full text-xs"
                    title={`${users.join(', ')} reacted with ${emoji}`}
                  >
                    <span>{emoji}</span>
                    <span className="text-gray-600">{users.length}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          ))}
        </div>
      )}


      {/* Empty State */}
      {!loading && notes.length === 0 && (
        <div className="rounded-2xl p-8 shadow-xl text-center" style={glassStyle}>
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg text-gray-600 mb-2">No notes yet</h3>
          <p className="text-gray-500 mb-4">Start the conversation by adding your first note!</p>
          <button
            onClick={() => setShowAddNote(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
          >
            Add First Note
          </button>
        </div>
      )}

      {/* Add Note Modal */}
      {showAddNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 shadow-xl max-w-md w-full" style={glassStyle}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg text-gray-800">Add New Note</h3>
              <button
                onClick={() => setShowAddNote(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newNote.title || ''}
                  onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="What's this note about?"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Message</label>
                <textarea
                  value={newNote.content || ''}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  placeholder="Write your message here..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Type</label>
                  <select
                    value={newNote.type}
                    onChange={(e) => setNewNote(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {noteTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Author</label>
                  <select
                    value={newNote.author}
                    onChange={(e) => setNewNote(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {residents.map(resident => (
                      <option key={resident} value={resident}>{resident}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pin-note"
                  checked={newNote.pinned || false}
                  onChange={(e) => setNewNote(prev => ({ ...prev, pinned: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <label htmlFor="pin-note" className="text-sm text-gray-700">
                  Pin this note (keep at top)
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={addNote}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
              >
                <Send className="w-4 h-4" />
                Post Note
              </button>
              <button
                onClick={() => setShowAddNote(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
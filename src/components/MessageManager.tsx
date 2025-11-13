import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Users, 
  Settings, 
  Trash2, 
  Plus, 
  BarChart3, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Heart,
  X
} from 'lucide-react';
import { messageSystem } from '../utils/messageSystem';

interface Message {
  id: string;
  from: string;
  email: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'heart';
  timestamp: Date;
  dismissed?: boolean;
}

export function MessageManager() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<any>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMessage, setNewMessage] = useState({
    from: 'Nick',
    message: '',
    type: 'info' as Message['type']
  });

  // Glassmorphism styles
  const glassStyle = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
  };

  const loadData = () => {
    setMessages(messageSystem.getMessages());
    setStats(messageSystem.getStats());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddMessage = () => {
    if (!newMessage.message.trim()) return;

    const emailMap: Record<string, string> = {
      'Nick': 'nick@example.com',
      'Alex': 'alex@example.com',
      'Landon': 'landon@example.com'
    };

    messageSystem.addMessage(
      newMessage.from,
      emailMap[newMessage.from],
      newMessage.message,
      newMessage.type
    );

    setNewMessage({ from: 'Nick', message: '', type: 'info' });
    setShowAddForm(false);
    loadData();
  };

  const handleDismissMessage = (messageId: string) => {
    messageSystem.dismissMessage(messageId);
    loadData();
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all messages?')) {
      messageSystem.clearAllMessages();
      loadData();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'heart': return <Heart className="w-4 h-4 text-pink-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'heart': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-2xl bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
            Message Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage dashboard messages from approved roommates
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Message
          </button>
          <button
            onClick={() => messageSystem.simulateIncomingMessage()}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Simulate Email
          </button>
        </div>
      </div>

      {/* Add Message Form */}
      {showAddForm && (
        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-gray-800 dark:text-gray-200">Add New Message</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">From</label>
              <select
                value={newMessage.from}
                onChange={(e) => setNewMessage({ ...newMessage, from: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Nick">Nick</option>
                <option value="Alex">Alex</option>
                <option value="Landon">Landon</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <select
                value={newMessage.type}
                onChange={(e) => setNewMessage({ ...newMessage, type: e.target.value as Message['type'] })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="heart">Heart</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Message</label>
              <textarea
                value={newMessage.message}
                onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                placeholder="Enter your message..."
                rows={3}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddMessage}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Message
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <div>
              <h3 className="text-2xl text-gray-800 dark:text-gray-200">{stats.total || 0}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Messages</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <div className="flex items-center gap-3">
            <Mail className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-2xl text-gray-800 dark:text-gray-200">{stats.active || 0}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Messages</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-2xl text-gray-800 dark:text-gray-200">{stats.dismissed || 0}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Dismissed</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-teal-600" />
            <div>
              <h3 className="text-2xl text-gray-800 dark:text-gray-200">3</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Approved Senders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Approved Senders */}
      <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
        <h3 className="text-lg text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          Approved Email Accounts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50/30 border border-green-200/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">N</span>
              </div>
              <div>
                <h4 className="text-gray-800 dark:text-gray-200">Nick</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">nick@example.com</p>
                <p className="text-xs text-green-600">
                  {stats.bySender?.Nick || 0} messages sent
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50/30 border border-blue-200/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">A</span>
              </div>
              <div>
                <h4 className="text-gray-800 dark:text-gray-200">Alex</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">alex@example.com</p>
                <p className="text-xs text-blue-600">
                  {stats.bySender?.Alex || 0} messages sent
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-teal-50/30 border border-teal-200/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">L</span>
              </div>
              <div>
                <h4 className="text-gray-800 dark:text-gray-200">Landon</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">landon@example.com</p>
                <p className="text-xs text-teal-600">
                  {stats.bySender?.Landon || 0} messages sent
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message History */}
      <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Message History
          </h3>
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-3 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No messages yet. Add a message or simulate an incoming email!
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg border ${
                  message.dismissed ? 'opacity-50' : ''
                } ${getTypeColor(message.type)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    {getTypeIcon(message.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{message.from}</span>
                        <span className="text-sm opacity-70">
                          {message.timestamp.toLocaleString()}
                        </span>
                        {message.dismissed && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            Dismissed
                          </span>
                        )}
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                  {!message.dismissed && (
                    <button
                      onClick={() => handleDismissMessage(message.id)}
                      className="p-1 hover:bg-black/10 rounded transition-colors"
                      title="Dismiss message"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
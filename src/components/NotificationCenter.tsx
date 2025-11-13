import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  X, 
  Check, 
  CheckCheck, 
  Trash2, 
  Settings, 
  Calendar,
  DollarSign,
  Heart,
  Users,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  Notification, 
  NotificationSettings,
  getNotifications, 
  getUnreadNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  clearAllNotifications,
  updateNotificationSettings,
  getNotificationSettings,
  triggerTestNotification
} from '../utils/notifications';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>('all');
  const [settings, setSettings] = useState<NotificationSettings>({
    desktopNotifications: true,
    emailNotifications: false,
    choreReminders: true,
    expenseAlerts: true,
    keplerCareAlerts: true,
    meetingReminders: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });

  // Glassmorphism styles
  const glassStyle = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
  };

  useEffect(() => {
    loadNotifications();
    // Load settings
    const loadedSettings = getNotificationSettings();
    if (loadedSettings) {
      setSettings(loadedSettings);
    }
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = () => {
    const allNotifications = getNotifications();
    const unread = getUnreadNotifications();
    setNotifications(allNotifications);
    setUnreadCount(unread.length);
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    loadNotifications();
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotification(id);
    loadNotifications();
  };

  const handleClearAll = () => {
    clearAllNotifications();
    loadNotifications();
  };

  const handleSettingsUpdate = (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    updateNotificationSettings(updatedSettings);
  };

  const getNotificationIcon = (notification: Notification) => {
    const iconClass = "w-4 h-4 flex-shrink-0";
    
    switch (notification.category) {
      case 'chore':
        return <CheckCircle className={`${iconClass} text-blue-600`} />;
      case 'expense':
        return <DollarSign className={`${iconClass} text-green-600`} />;
      case 'kepler':
        return <Heart className={`${iconClass} text-red-600`} />;
      case 'meeting':
        return <Calendar className={`${iconClass} text-purple-600`} />;
      default:
        return <Info className={`${iconClass} text-gray-600`} />;
    }
  };

  const getNotificationColor = (notification: Notification) => {
    switch (notification.type) {
      case 'error':
        return 'border-red-300 bg-red-50/30';
      case 'warning':
        return 'border-yellow-300 bg-yellow-50/30';
      case 'success':
        return 'border-green-300 bg-green-50/30';
      case 'reminder':
        return 'border-blue-300 bg-blue-50/30';
      default:
        return 'border-gray-300 bg-gray-50/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg text-gray-800">Notification Settings</h4>
        <button
          onClick={() => triggerTestNotification()}
          className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Test
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-gray-800">Desktop Notifications</h5>
            <p className="text-sm text-gray-600">Show notifications on your desktop</p>
          </div>
          <input
            type="checkbox"
            checked={settings?.desktopNotifications || false}
            onChange={(e) => handleSettingsUpdate({ desktopNotifications: e.target.checked })}
            className="w-4 h-4 text-purple-600 rounded"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-gray-800">Chore Reminders</h5>
            <p className="text-sm text-gray-600">Get reminded about upcoming chores</p>
          </div>
          <input
            type="checkbox"
            checked={settings?.choreReminders || false}
            onChange={(e) => handleSettingsUpdate({ choreReminders: e.target.checked })}
            className="w-4 h-4 text-purple-600 rounded"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-gray-800">Expense Alerts</h5>
            <p className="text-sm text-gray-600">Get alerted about high spending</p>
          </div>
          <input
            type="checkbox"
            checked={settings?.expenseAlerts || false}
            onChange={(e) => handleSettingsUpdate({ expenseAlerts: e.target.checked })}
            className="w-4 h-4 text-purple-600 rounded"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-gray-800">Kepler Care Alerts</h5>
            <p className="text-sm text-gray-600">Reminders for pet care tasks</p>
          </div>
          <input
            type="checkbox"
            checked={settings?.keplerCareAlerts || false}
            onChange={(e) => handleSettingsUpdate({ keplerCareAlerts: e.target.checked })}
            className="w-4 h-4 text-purple-600 rounded"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-gray-800">Meeting Reminders</h5>
            <p className="text-sm text-gray-600">House meeting notifications</p>
          </div>
          <input
            type="checkbox"
            checked={settings?.meetingReminders || false}
            onChange={(e) => handleSettingsUpdate({ meetingReminders: e.target.checked })}
            className="w-4 h-4 text-purple-600 rounded"
          />
        </div>

        <div className="border-t border-white/20 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-gray-800">Quiet Hours</h5>
            <input
              type="checkbox"
              checked={settings?.quietHours?.enabled || false}
              onChange={(e) => handleSettingsUpdate({ 
                quietHours: { ...settings.quietHours, enabled: e.target.checked }
              })}
              className="w-4 h-4 text-purple-600 rounded"
            />
          </div>
          
          {settings?.quietHours?.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={settings?.quietHours?.start || '22:00'}
                  onChange={(e) => handleSettingsUpdate({ 
                    quietHours: { ...settings.quietHours, start: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={settings?.quietHours?.end || '08:00'}
                  onChange={(e) => handleSettingsUpdate({ 
                    quietHours: { ...settings.quietHours, end: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg hover:bg-white/20 transition-all duration-200"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-6 h-6 text-purple-600" />
        ) : (
          <Bell className="w-6 h-6 text-gray-600" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div 
          className="absolute right-0 top-16 w-96 max-h-96 rounded-2xl shadow-xl border border-white/30 z-50 overflow-hidden"
          style={glassStyle}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg text-gray-800">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  activeTab === 'all' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-600 hover:bg-white/20'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  activeTab === 'unread' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-600 hover:bg-white/20'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  activeTab === 'settings' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-600 hover:bg-white/20'
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {activeTab === 'settings' ? (
              <div className="p-4">
                {renderSettings()}
              </div>
            ) : (
              <>
                {/* Action Buttons */}
                {filteredNotifications.length > 0 && (
                  <div className="p-3 border-b border-white/20 flex gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="flex items-center gap-1 px-2 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCheck className="w-3 h-3" />
                        Mark All Read
                      </button>
                    )}
                    <button
                      onClick={handleClearAll}
                      className="flex items-center gap-1 px-2 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear All
                    </button>
                  </div>
                )}

                {/* Notifications List */}
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600">
                      {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {filteredNotifications.slice(0, 20).map(notification => (
                      <div
                        key={notification.id}
                        className={`p-3 hover:bg-white/5 transition-colors ${
                          !notification.read ? 'bg-purple-50/10' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2">
                            {getNotificationIcon(notification)}
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h5 className={`text-sm text-gray-800 ${!notification.read ? 'font-medium' : ''}`}>
                                {notification.title}
                              </h5>
                              <span className="text-xs text-gray-500 flex-shrink-0">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            {notification.dueDate && (
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3 text-orange-600" />
                                <span className="text-xs text-orange-600">
                                  Due: {new Date(notification.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1 hover:bg-white/20 rounded transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-3 h-3 text-green-600" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="p-1 hover:bg-white/20 rounded transition-colors"
                              title="Delete"
                            >
                              <X className="w-3 h-3 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
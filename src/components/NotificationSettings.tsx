import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  Clock, 
  Mail, 
  Smartphone, 
  Volume2, 
  VolumeX,
  Zap,
  CheckCircle,
  AlertTriangle,
  Settings,
  Calendar,
  DollarSign,
  Heart,
  Users
} from 'lucide-react';
import { 
  NotificationSettings as NotificationSettingsType,
  getNotificationSettings,
  updateNotificationSettings,
  triggerTestNotification
} from '../utils/notifications';
import { 
  configureEmailService,
  isEmailServiceReady,
  getEmailServiceStatus,
  EMAIL_CONFIG_TEMPLATE,
  EMAIL_SETUP_INSTRUCTIONS
} from '../utils/emailReminders';

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettingsType>(getNotificationSettings());
  const [emailConfig, setEmailConfig] = useState(EMAIL_CONFIG_TEMPLATE);
  const [showEmailSetup, setShowEmailSetup] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);

  // Glassmorphism styles
  const glassStyle = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
  };

  useEffect(() => {
    setSettings(getNotificationSettings());
  }, []);

  const handleSettingChange = (key: keyof NotificationSettingsType, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateNotificationSettings(newSettings);
  };

  const handleQuietHoursChange = (key: 'enabled' | 'start' | 'end', value: any) => {
    const newQuietHours = { ...settings.quietHours, [key]: value };
    handleSettingChange('quietHours', newQuietHours);
  };

  const handleTestNotification = () => {
    triggerTestNotification();
  };

  const handleEmailConfigSave = () => {
    configureEmailService(emailConfig);
    setShowEmailSetup(false);
    setTestEmailSent(true);
    setTimeout(() => setTestEmailSent(false), 3000);
  };

  const NotificationToggle = ({ 
    icon, 
    title, 
    description, 
    enabled, 
    onChange,
    color = 'purple'
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    enabled: boolean;
    onChange: (value: boolean) => void;
    color?: string;
  }) => (
    <div className="flex items-center justify-between p-4 rounded-xl border border-white/20" style={glassStyle}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${color}-100/30`}>
          {icon}
        </div>
        <div>
          <h4 className="text-gray-800">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
      </label>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl text-gray-800">Notification Settings</h2>
      </div>

      {/* Notification Status Overview */}
      <div className="rounded-xl p-6 shadow-lg" style={glassStyle}>
        <h3 className="text-lg text-gray-800 mb-4">Notification Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50/30 rounded-lg border border-green-200/30">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="text-green-800">Desktop</h4>
            <p className="text-sm text-green-700">
              {settings.desktopNotifications ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <div className="text-center p-4 bg-blue-50/30 rounded-lg border border-blue-200/30">
            <Mail className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="text-blue-800">Email</h4>
            <p className="text-sm text-blue-700">
              {isEmailServiceReady() ? 'Configured' : 'Not Configured'}
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50/30 rounded-lg border border-purple-200/30">
            <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="text-purple-800">Quiet Hours</h4>
            <p className="text-sm text-purple-700">
              {settings.quietHours.enabled ? 'Active' : 'Disabled'}
            </p>
          </div>
        </div>
      </div>

      {/* General Notification Settings */}
      <div className="rounded-xl p-6 shadow-lg" style={glassStyle}>
        <h3 className="text-lg text-gray-800 mb-4">General Settings</h3>
        <div className="space-y-4">
          <NotificationToggle
            icon={<BellRing className="w-6 h-6 text-purple-600" />}
            title="Desktop Notifications"
            description="Show notifications on your desktop when the app is running"
            enabled={settings.desktopNotifications}
            onChange={(value) => handleSettingChange('desktopNotifications', value)}
            color="purple"
          />
          
          <NotificationToggle
            icon={<Mail className="w-6 h-6 text-blue-600" />}
            title="Email Notifications"
            description="Send important reminders via email"
            enabled={settings.emailNotifications}
            onChange={(value) => handleSettingChange('emailNotifications', value)}
            color="blue"
          />
        </div>
      </div>

      {/* Category-Specific Settings */}
      <div className="rounded-xl p-6 shadow-lg" style={glassStyle}>
        <h3 className="text-lg text-gray-800 mb-4">Notification Categories</h3>
        <div className="space-y-4">
          <NotificationToggle
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
            title="Chore Reminders"
            description="Get notified about upcoming chores and tasks"
            enabled={settings.choreReminders}
            onChange={(value) => handleSettingChange('choreReminders', value)}
            color="green"
          />
          
          <NotificationToggle
            icon={<DollarSign className="w-6 h-6 text-yellow-600" />}
            title="Expense Alerts"
            description="Notifications about spending patterns and bill reminders"
            enabled={settings.expenseAlerts}
            onChange={(value) => handleSettingChange('expenseAlerts', value)}
            color="yellow"
          />
          
          <NotificationToggle
            icon={<Heart className="w-6 h-6 text-red-600" />}
            title="Kepler Care Alerts"
            description="Reminders for pet care tasks and schedules"
            enabled={settings.keplerCareAlerts}
            onChange={(value) => handleSettingChange('keplerCareAlerts', value)}
            color="red"
          />
          
          <NotificationToggle
            icon={<Calendar className="w-6 h-6 text-indigo-600" />}
            title="Meeting Reminders"
            description="House meeting and important date notifications"
            enabled={settings.meetingReminders}
            onChange={(value) => handleSettingChange('meetingReminders', value)}
            color="indigo"
          />
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="rounded-xl p-6 shadow-lg" style={glassStyle}>
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-6 h-6 text-orange-600" />
          <h3 className="text-lg text-gray-800">Quiet Hours</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-gray-800">Enable Quiet Hours</h4>
              <p className="text-sm text-gray-600">Pause notifications during specified times</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.quietHours.enabled}
                onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>

          {settings.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-orange-50/30 rounded-lg border border-orange-200/30">
              <div>
                <label className="block text-sm text-orange-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={settings.quietHours.start}
                  onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-orange-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={settings.quietHours.end}
                  onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email Configuration */}
      <div className="rounded-xl p-6 shadow-lg" style={glassStyle}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg text-gray-800">Email Configuration</h3>
          </div>
          <button
            onClick={() => setShowEmailSetup(!showEmailSetup)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            {showEmailSetup ? 'Hide Setup' : 'Configure'}
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            {isEmailServiceReady() ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            )}
            <span className="text-gray-700">
              Email service is {isEmailServiceReady() ? 'configured and ready' : 'not configured'}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Configure EmailJS to enable email reminders and notifications.
          </p>
        </div>

        {showEmailSetup && (
          <div className="space-y-4 p-4 bg-blue-50/30 rounded-lg border border-blue-200/30">
            <div>
              <label className="block text-sm text-blue-700 mb-1">Service ID</label>
              <input
                type="text"
                value={emailConfig.serviceId}
                onChange={(e) => setEmailConfig({ ...emailConfig, serviceId: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your EmailJS Service ID"
              />
            </div>
            <div>
              <label className="block text-sm text-blue-700 mb-1">Template ID</label>
              <input
                type="text"
                value={emailConfig.templateId}
                onChange={(e) => setEmailConfig({ ...emailConfig, templateId: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your EmailJS Template ID"
              />
            </div>
            <div>
              <label className="block text-sm text-blue-700 mb-1">Public Key</label>
              <input
                type="text"
                value={emailConfig.publicKey}
                onChange={(e) => setEmailConfig({ ...emailConfig, publicKey: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your EmailJS Public Key"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleEmailConfigSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Save Configuration
              </button>
              {testEmailSent && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Configuration saved!</span>
                </div>
              )}
            </div>
            <div className="text-sm text-blue-700 bg-blue-100/50 p-3 rounded-lg">
              <h5 className="font-medium mb-2">Setup Instructions:</h5>
              <pre className="text-xs whitespace-pre-wrap">{EMAIL_SETUP_INSTRUCTIONS}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Test Notifications */}
      <div className="rounded-xl p-6 shadow-lg" style={glassStyle}>
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6 text-green-600" />
          <h3 className="text-lg text-gray-800">Test Notifications</h3>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleTestNotification}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <BellRing className="w-4 h-4" />
            Test Desktop Notification
          </button>
          
          <button
            onClick={() => {
              // Test email would go here in real implementation
              setTestEmailSent(true);
              setTimeout(() => setTestEmailSent(false), 3000);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={!isEmailServiceReady()}
          >
            <Mail className="w-4 h-4" />
            Test Email
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mt-3">
          Use these buttons to test your notification settings and make sure everything is working properly.
        </p>
      </div>
    </div>
  );
}
import { localStorageUtil } from './localStorage';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'reminder';
  category: 'chore' | 'expense' | 'kepler' | 'meeting' | 'general';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface NotificationSettings {
  desktopNotifications: boolean;
  emailNotifications: boolean;
  choreReminders: boolean;
  expenseAlerts: boolean;
  keplerCareAlerts: boolean;
  meetingReminders: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

class NotificationManager {
  private notifications: Notification[] = [];
  private settings: NotificationSettings;

  constructor() {
    this.loadNotifications();
    this.loadSettings();
    this.requestPermission();
    this.setupScheduledChecks();
  }

  // Load existing notifications from storage
  private loadNotifications() {
    this.notifications = localStorageUtil.getDataByKey('notifications') || [];
  }

  // Load notification settings
  private loadSettings() {
    this.settings = localStorageUtil.getDataByKey('notificationSettings') || {
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
    };
  }

  // Request desktop notification permission
  private async requestPermission() {
    if ('Notification' in window && this.settings.desktopNotifications) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Setup scheduled checks for notifications
  private setupScheduledChecks() {
    // Check every 15 minutes for due items
    setInterval(() => {
      this.checkChoreReminders();
      this.checkKeplerCareReminders();
      this.checkMeetingReminders();
      this.checkExpenseAlerts();
    }, 15 * 60 * 1000); // 15 minutes

    // Initial check
    setTimeout(() => {
      this.checkChoreReminders();
      this.checkKeplerCareReminders();
      this.checkMeetingReminders();
      this.checkExpenseAlerts();
    }, 5000); // 5 seconds after initialization
  }

  // Check if we're in quiet hours
  private isQuietHours(): boolean {
    if (!this.settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = this.settings.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = this.settings.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Spans midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  // Create a new notification
  public createNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): string {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    this.notifications.unshift(newNotification);
    this.saveNotifications();

    // Show desktop notification if enabled and not in quiet hours
    if (this.settings.desktopNotifications && !this.isQuietHours()) {
      this.showDesktopNotification(newNotification);
    }

    return newNotification.id;
  }

  // Show desktop notification
  private showDesktopNotification(notification: Notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const desktopNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        badge: '/favicon.ico'
      });

      desktopNotification.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          // Could navigate to specific page if needed
        }
        this.markAsRead(notification.id);
        desktopNotification.close();
      };

      // Auto-close after 10 seconds
      setTimeout(() => {
        desktopNotification.close();
      }, 10000);
    }
  }

  // Check for chore reminders
  private checkChoreReminders() {
    if (!this.settings.choreReminders) return;

    const chores = localStorageUtil.getDataByKey('choreCompletions') || {};
    const today = new Date().toDateString();

    // Mock chore data - in real app, this would come from actual chore tracking
    const choreSchedule = [
      { name: 'Kitchen cleanup', assignee: 'Landon', frequency: 'daily' },
      { name: 'Bathroom cleaning', frequency: 'weekly', dueDay: 'Sunday' },
      { name: 'Trash & recycling', assignee: 'Nick/Alex', frequency: 'weekly', dueDay: 'Monday' }
    ];

    choreSchedule.forEach(chore => {
      const lastCompleted = chores[chore.name];
      const shouldRemind = this.shouldRemindChore(chore, lastCompleted);
      
      if (shouldRemind) {
        this.createNotification({
          title: 'Chore Reminder',
          message: `Don't forget: ${chore.name} is due today!`,
          type: 'reminder',
          category: 'chore',
          priority: 'medium',
          actionUrl: '/chores'
        });
      }
    });
  }

  // Check for Kepler care reminders
  private checkKeplerCareReminders() {
    if (!this.settings.keplerCareAlerts) return;

    const now = new Date();
    const hour = now.getHours();
    const lastKeplerCheck = localStorageUtil.getDataByKey('lastKeplerCheck') || '';
    const today = now.toDateString();

    // Don't remind more than once per day for each task
    if (lastKeplerCheck === today) return;

    // Morning walk reminder (7 AM)
    if (hour === 7) {
      this.createNotification({
        title: 'Kepler Care Reminder',
        message: 'Time for Kepler\'s morning walk! 🐕',
        type: 'reminder',
        category: 'kepler',
        priority: 'high',
        actionUrl: '/kepler'
      });
    }

    // Evening walk reminder (8 PM)
    if (hour === 20) {
      this.createNotification({
        title: 'Kepler Care Reminder',
        message: 'Don\'t forget Kepler\'s evening walk! 🌙',
        type: 'reminder',
        category: 'kepler',
        priority: 'high',
        actionUrl: '/kepler'
      });
    }

    // Save that we've checked today
    localStorageUtil.saveData('lastKeplerCheck', today);
  }

  // Check for meeting reminders
  private checkMeetingReminders() {
    if (!this.settings.meetingReminders) return;

    const now = new Date();
    const firstSunday = this.getFirstSundayOfMonth(now);
    const daysDiff = Math.ceil((firstSunday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Remind 3 days before, 1 day before, and day of
    if ([3, 1, 0].includes(daysDiff)) {
      const message = daysDiff === 0 
        ? 'House meeting is today!' 
        : `House meeting in ${daysDiff} day${daysDiff === 1 ? '' : 's'}`;

      this.createNotification({
        title: 'House Meeting Reminder',
        message,
        type: 'reminder',
        category: 'meeting',
        priority: daysDiff === 0 ? 'high' : 'medium',
        actionUrl: '/chores'
      });
    }
  }

  // Check for expense alerts
  private checkExpenseAlerts() {
    if (!this.settings.expenseAlerts) return;

    const expenses = localStorageUtil.getDataByKey('expenses') || [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyExpenses = expenses.filter((expense: any) => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    const monthlyTotal = monthlyExpenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);

    // Alert if monthly spending exceeds $1000
    if (monthlyTotal > 1000) {
      const lastAlert = localStorageUtil.getDataByKey('lastExpenseAlert') || '';
      const today = new Date().toDateString();

      if (lastAlert !== today) {
        this.createNotification({
          title: 'Expense Alert',
          message: `Monthly expenses have reached $${monthlyTotal.toFixed(2)}`,
          type: 'warning',
          category: 'expense',
          priority: 'medium',
          actionUrl: '/expenses'
        });
        localStorageUtil.saveData('lastExpenseAlert', today);
      }
    }
  }

  // Helper function to determine if chore reminder is needed
  private shouldRemindChore(chore: any, lastCompleted: string): boolean {
    const now = new Date();
    const today = now.toDateString();

    if (!lastCompleted) return true;

    const lastCompletedDate = new Date(lastCompleted);
    
    if (chore.frequency === 'daily') {
      return lastCompletedDate.toDateString() !== today;
    }

    if (chore.frequency === 'weekly' && chore.dueDay) {
      const dueDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(chore.dueDay);
      return now.getDay() === dueDay && lastCompletedDate.toDateString() !== today;
    }

    return false;
  }

  // Get first Sunday of current month
  private getFirstSundayOfMonth(date: Date): Date {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const daysUntilSunday = (7 - firstDay.getDay()) % 7;
    return new Date(firstDay.getTime() + daysUntilSunday * 24 * 60 * 60 * 1000);
  }

  // Get all notifications
  public getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Get unread notifications
  public getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  // Mark notification as read
  public markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  // Mark all notifications as read
  public markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  }

  // Delete notification
  public deleteNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotifications();
  }

  // Clear all notifications
  public clearAllNotifications(): void {
    this.notifications = [];
    this.saveNotifications();
  }

  // Update settings
  public updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    localStorageUtil.saveData('notificationSettings', this.settings);
  }

  // Get current settings
  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Save notifications to storage
  private saveNotifications(): void {
    localStorageUtil.saveData('notifications', this.notifications);
  }

  // Manual trigger for testing
  public triggerTestNotification(): void {
    this.createNotification({
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working.',
      type: 'info',
      category: 'general',
      priority: 'low'
    });
  }
}

// Create singleton instance
export const notificationManager = new NotificationManager();

// Export utility functions
export const createNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => 
  notificationManager.createNotification(notification);

export const getNotifications = () => notificationManager.getNotifications();
export const getUnreadNotifications = () => notificationManager.getUnreadNotifications();
export const markAsRead = (id: string) => notificationManager.markAsRead(id);
export const markAllAsRead = () => notificationManager.markAllAsRead();
export const deleteNotification = (id: string) => notificationManager.deleteNotification(id);
export const clearAllNotifications = () => notificationManager.clearAllNotifications();
export const updateNotificationSettings = (settings: Partial<NotificationSettings>) => 
  notificationManager.updateSettings(settings);
export const getNotificationSettings = () => notificationManager.getSettings();
export const triggerTestNotification = () => notificationManager.triggerTestNotification();
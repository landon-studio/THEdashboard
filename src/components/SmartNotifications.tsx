import React, { useEffect } from 'react';
import { 
  createNotification, 
  updateNotificationSettings,
  getNotificationSettings 
} from '../utils/notifications';
import { 
  sendChoreReminder,
  sendKeplerCareReminder,
  sendMeetingReminder,
  sendExpenseAlert,
  ROOMMATE_EMAILS
} from '../utils/emailReminders';
import { localStorageUtil } from '../utils/localStorage';

// This component runs in the background to create smart notifications
// based on calendar events, due dates, and other triggers
export function SmartNotifications() {
  useEffect(() => {
    const checkForSmartNotifications = () => {
      checkCalendarIntegration();
      checkUpcomingDeadlines();
      checkExpensePatterns();
      checkKeplerCareSchedule();
    };

    // Check every 30 minutes
    const interval = setInterval(checkForSmartNotifications, 30 * 60 * 1000);
    
    // Initial check after 5 seconds
    setTimeout(checkForSmartNotifications, 5000);

    return () => clearInterval(interval);
  }, []);

  const checkCalendarIntegration = () => {
    const calendarEvents = localStorageUtil.getDataByKey('calendarEvents') || [];
    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    calendarEvents.forEach((event: any) => {
      const eventDate = new Date(event.start);
      
      // 1 hour before events
      if (eventDate <= inOneHour && eventDate > now) {
        if (event.summary?.toLowerCase().includes('meeting') || 
            event.summary?.toLowerCase().includes('house')) {
          createNotification({
            title: 'Upcoming Meeting',
            message: `${event.summary} starts in 1 hour`,
            type: 'reminder',
            category: 'meeting',
            priority: 'high',
            dueDate: event.start
          });
        }
      }

      // Day before events
      if (eventDate <= tomorrow && eventDate > inOneHour) {
        if (event.summary?.toLowerCase().includes('rent') ||
            event.summary?.toLowerCase().includes('bills')) {
          createNotification({
            title: 'Bill Reminder',
            message: `Don't forget: ${event.summary} is due tomorrow`,
            type: 'warning',
            category: 'expense',
            priority: 'high',
            dueDate: event.start
          });
        }
      }
    });
  };

  const checkUpcomingDeadlines = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hour = now.getHours();

    // Sunday evening - prepare for the week
    if (dayOfWeek === 0 && hour === 18) {
      createNotification({
        title: 'Week Preparation',
        message: 'Time to plan the upcoming week! Check your schedule and chores.',
        type: 'reminder',
        category: 'general',
        priority: 'medium'
      });
    }

    // Friday afternoon - weekly check-in reminder
    if (dayOfWeek === 5 && hour === 15) {
      createNotification({
        title: 'Weekly Check-in Time',
        message: 'Consider doing your weekly roommate check-in this weekend.',
        type: 'reminder',
        category: 'general',
        priority: 'medium'
      });
    }

    // First of the month - expense review
    if (now.getDate() === 1 && hour === 9) {
      createNotification({
        title: 'Monthly Expense Review',
        message: 'Review last month\'s expenses and plan your budget for this month.',
        type: 'info',
        category: 'expense',
        priority: 'medium'
      });
    }
  };

  const checkExpensePatterns = () => {
    const expenses = localStorageUtil.getDataByKey('expenses') || [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Get this month's expenses
    const monthlyExpenses = expenses.filter((expense: any) => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });

    const monthlyTotal = monthlyExpenses.reduce((sum: number, expense: any) => 
      sum + expense.amount, 0);

    // Alert if spending is unusually high
    const lastAlertKey = `monthlySpendingAlert_${currentMonth}_${currentYear}`;
    const lastAlert = localStorageUtil.getDataByKey(lastAlertKey);
    
    if (monthlyTotal > 800 && !lastAlert) {
      createNotification({
        title: 'High Monthly Spending',
        message: `Monthly expenses have reached $${monthlyTotal.toFixed(2)}. Consider reviewing your budget.`,
        type: 'warning',
        category: 'expense',
        priority: 'medium'
      });
      
      localStorageUtil.saveData(lastAlertKey, new Date().toISOString());
    }

    // Check for uneven expense splitting
    const personTotals = monthlyExpenses.reduce((acc: any, expense: any) => {
      acc[expense.paidBy] = (acc[expense.paidBy] || 0) + expense.amount;
      return acc;
    }, {});

    const totals = Object.values(personTotals) as number[];
    const maxTotal = Math.max(...totals);
    const minTotal = Math.min(...totals);
    
    if (maxTotal > 0 && (maxTotal - minTotal) > 200) {
      const unevenAlertKey = `unevenExpenseAlert_${currentMonth}_${currentYear}`;
      const lastUnevenAlert = localStorageUtil.getDataByKey(unevenAlertKey);
      
      if (!lastUnevenAlert) {
        createNotification({
          title: 'Uneven Expense Distribution',
          message: 'Expenses are significantly uneven this month. Consider settling balances.',
          type: 'info',
          category: 'expense',
          priority: 'low'
        });
        
        localStorageUtil.saveData(unevenAlertKey, new Date().toISOString());
      }
    }
  };

  const checkKeplerCareSchedule = () => {
    const dailyTasks = localStorageUtil.getDataByKey('keplerDailyTasks') || [];
    const now = new Date();
    const hour = now.getHours();
    const today = now.toDateString();

    // Check if tasks are completed for today
    const todaysCompletions = localStorageUtil.getDataByKey(`keplerTasks_${today}`) || {};

    // Morning walk reminder (7:30 AM)
    if (hour === 7 && new Date().getMinutes() >= 30) {
      if (!todaysCompletions.morningWalk) {
        createNotification({
          title: 'Kepler Morning Walk',
          message: 'Time for Kepler\'s morning walk! 🐕',
          type: 'reminder',
          category: 'kepler',
          priority: 'high'
        });
      }
    }

    // Lunch feeding reminder (12:00 PM)
    if (hour === 12) {
      if (!todaysCompletions.lunchFeeding) {
        createNotification({
          title: 'Kepler Lunch Time',
          message: 'Don\'t forget to feed Kepler! 🍽️',
          type: 'reminder',
          category: 'kepler',
          priority: 'high'
        });
      }
    }

    // Evening walk reminder (8:00 PM)
    if (hour === 20) {
      if (!todaysCompletions.eveningWalk) {
        createNotification({
          title: 'Kepler Evening Walk',
          message: 'Time for Kepler\'s evening walk! 🌙',
          type: 'reminder',
          category: 'kepler',
          priority: 'high'
        });
      }
    }
  };

  const checkWeatherAlerts = () => {
    // Mock weather check - in real app, you'd integrate with weather API
    const now = new Date();
    const hour = now.getHours();
    
    // Example: Morning weather alert for dog walks
    if (hour === 7) {
      // Simulate checking weather
      const isRainy = Math.random() < 0.3; // 30% chance of rain
      
      if (isRainy) {
        createNotification({
          title: 'Weather Alert',
          message: 'It might rain today. Consider adjusting Kepler\'s walk schedule.',
          type: 'info',
          category: 'kepler',
          priority: 'low'
        });
      }
    }
  };

  const sendPersonalizedReminders = async () => {
    const settings = getNotificationSettings();
    if (!settings.emailNotifications) return;

    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();

    // Sunday evening email summaries
    if (dayOfWeek === 0 && hour === 19) {
      const weeklyData = generateWeeklySummary();
      
      // Send to each roommate
      Object.entries(ROOMMATE_EMAILS).forEach(async ([name, email]) => {
        try {
          await sendMeetingReminder(
            email, 
            name, 
            'Weekly summary and upcoming week preparation'
          );
        } catch (error) {
          console.error(`Failed to send email to ${name}:`, error);
        }
      });
    }
  };

  const generateWeeklySummary = () => {
    const expenses = localStorageUtil.getDataByKey('expenses') || [];
    const checkins = localStorageUtil.getDataByKey('checkins') || [];
    
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const weeklyExpenses = expenses.filter((e: any) => 
      new Date(e.date) >= weekStart
    );
    
    return {
      totalExpenses: weeklyExpenses.reduce((sum: number, e: any) => sum + e.amount, 0),
      expenseCount: weeklyExpenses.length,
      recentCheckin: checkins.length > 0 ? checkins[checkins.length - 1] : null,
      upcomingTasks: [
        'Weekly house meeting (if scheduled)',
        'Monthly expense review',
        'Kepler care coordination'
      ]
    };
  };

  // This component doesn't render anything visible
  return null;
}

// Helper function to trigger manual smart notifications (for testing)
export const triggerSmartNotifications = () => {
  createNotification({
    title: 'Smart Notification Test',
    message: 'This is a test of the smart notification system.',
    type: 'info',
    category: 'general',
    priority: 'low'
  });
};

// Export calendar integration hook for other components
export const useCalendarNotifications = () => {
  useEffect(() => {
    const handleCalendarSync = () => {
      const lastSync = localStorageUtil.getDataByKey('lastCalendarSync');
      const now = new Date().toISOString();
      
      if (lastSync) {
        createNotification({
          title: 'Calendar Synced',
          message: 'Your calendar has been updated with the latest events.',
          type: 'success',
          category: 'general',
          priority: 'low'
        });
      }
      
      localStorageUtil.saveData('lastCalendarSync', now);
    };

    // Listen for calendar sync events
    window.addEventListener('calendarSynced', handleCalendarSync);
    
    return () => {
      window.removeEventListener('calendarSynced', handleCalendarSync);
    };
  }, []);
};
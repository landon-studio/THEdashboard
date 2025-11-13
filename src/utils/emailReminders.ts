// EmailJS configuration for sending email reminders
// Note: This requires EmailJS service setup and API keys

interface EmailReminderConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

interface EmailTemplate {
  to_email: string;
  to_name: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  due_date?: string;
}

class EmailReminderService {
  private config: EmailReminderConfig | null = null;
  private isConfigured = false;

  // Initialize EmailJS configuration
  public configure(config: EmailReminderConfig): void {
    this.config = config;
    this.isConfigured = true;
    
    // In a real implementation, you would initialize EmailJS here:
    // emailjs.init(config.publicKey);
  }

  // Send a reminder email
  public async sendReminder(template: EmailTemplate): Promise<boolean> {
    if (!this.isConfigured || !this.config) {
      console.warn('EmailJS not configured. Email reminder not sent.');
      return false;
    }

    try {
      // Mock implementation - in real app, you would use EmailJS:
      // const result = await emailjs.send(
      //   this.config.serviceId,
      //   this.config.templateId,
      //   template,
      //   this.config.publicKey
      // );

      // For demo purposes, just log the email that would be sent
      console.log('📧 Email reminder would be sent:', {
        to: template.to_email,
        subject: template.subject,
        message: template.message,
        category: template.category,
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Failed to send email reminder:', error);
      return false;
    }
  }

  // Send chore reminder email
  public async sendChoreReminder(
    recipientEmail: string, 
    recipientName: string, 
    choreName: string, 
    dueDate: string
  ): Promise<boolean> {
    const template: EmailTemplate = {
      to_email: recipientEmail,
      to_name: recipientName,
      subject: `Chore Reminder: ${choreName}`,
      message: `Hi ${recipientName},\n\nThis is a friendly reminder that "${choreName}" is due on ${dueDate}.\n\nPlease make sure to complete this task on time.\n\nThanks!\nRoommate Management System`,
      category: 'chore',
      priority: 'medium',
      due_date: dueDate
    };

    return this.sendReminder(template);
  }

  // Send expense alert email
  public async sendExpenseAlert(
    recipientEmail: string, 
    recipientName: string, 
    amount: number, 
    category: string
  ): Promise<boolean> {
    const template: EmailTemplate = {
      to_email: recipientEmail,
      to_name: recipientName,
      subject: `Expense Alert: High Spending in ${category}`,
      message: `Hi ${recipientName},\n\nYour spending in the "${category}" category has reached $${amount.toFixed(2)} this month.\n\nYou might want to review your expenses and adjust your budget accordingly.\n\nBest regards,\nRoommate Management System`,
      category: 'expense',
      priority: 'medium'
    };

    return this.sendReminder(template);
  }

  // Send Kepler care reminder email
  public async sendKeplerCareReminder(
    recipientEmail: string, 
    recipientName: string, 
    taskName: string, 
    time: string
  ): Promise<boolean> {
    const template: EmailTemplate = {
      to_email: recipientEmail,
      to_name: recipientName,
      subject: `Kepler Care Reminder: ${taskName}`,
      message: `Hi ${recipientName},\n\nThis is a reminder for Kepler's care schedule:\n\nTask: ${taskName}\nTime: ${time}\n\nPlease make sure Kepler gets the care he needs!\n\n🐕 Woof!\nRoommate Management System`,
      category: 'kepler',
      priority: 'high'
    };

    return this.sendReminder(template);
  }

  // Send meeting reminder email
  public async sendMeetingReminder(
    recipientEmail: string, 
    recipientName: string, 
    meetingDate: string
  ): Promise<boolean> {
    const template: EmailTemplate = {
      to_email: recipientEmail,
      to_name: recipientName,
      subject: 'House Meeting Reminder',
      message: `Hi ${recipientName},\n\nThis is a reminder about our upcoming house meeting scheduled for ${meetingDate}.\n\nPlease make sure to attend so we can discuss any house matters and maintain good communication.\n\nSee you there!\nRoommate Management System`,
      category: 'meeting',
      priority: 'medium',
      due_date: meetingDate
    };

    return this.sendReminder(template);
  }

  // Send weekly summary email
  public async sendWeeklySummary(
    recipientEmail: string, 
    recipientName: string, 
    summary: {
      completedChores: number;
      totalExpenses: number;
      upcomingTasks: string[];
      keplerCareScore: number;
    }
  ): Promise<boolean> {
    const template: EmailTemplate = {
      to_email: recipientEmail,
      to_name: recipientName,
      subject: 'Weekly Roommate Summary',
      message: `Hi ${recipientName},\n\nHere's your weekly summary:\n\n✅ Completed Chores: ${summary.completedChores}\n💰 Total Expenses: $${summary.totalExpenses.toFixed(2)}\n🐕 Kepler Care Score: ${summary.keplerCareScore}%\n\nUpcoming Tasks:\n${summary.upcomingTasks.map(task => `• ${task}`).join('\n')}\n\nHave a great week!\nRoommate Management System`,
      category: 'summary',
      priority: 'low'
    };

    return this.sendReminder(template);
  }

  // Check if service is configured
  public isReady(): boolean {
    return this.isConfigured;
  }

  // Get configuration status
  public getStatus(): { configured: boolean; hasApiKey: boolean } {
    return {
      configured: this.isConfigured,
      hasApiKey: this.config?.publicKey ? true : false
    };
  }
}

// Create singleton instance
export const emailReminderService = new EmailReminderService();

// Export utility functions
export const configureEmailService = (config: EmailReminderConfig) => 
  emailReminderService.configure(config);

export const sendChoreReminder = (email: string, name: string, chore: string, due: string) =>
  emailReminderService.sendChoreReminder(email, name, chore, due);

export const sendExpenseAlert = (email: string, name: string, amount: number, category: string) =>
  emailReminderService.sendExpenseAlert(email, name, amount, category);

export const sendKeplerCareReminder = (email: string, name: string, task: string, time: string) =>
  emailReminderService.sendKeplerCareReminder(email, name, task, time);

export const sendMeetingReminder = (email: string, name: string, date: string) =>
  emailReminderService.sendMeetingReminder(email, name, date);

export const sendWeeklySummary = (email: string, name: string, summary: any) =>
  emailReminderService.sendWeeklySummary(email, name, summary);

export const isEmailServiceReady = () => emailReminderService.isReady();
export const getEmailServiceStatus = () => emailReminderService.getStatus();

// Email configuration template for setup
export const EMAIL_CONFIG_TEMPLATE = {
  serviceId: 'YOUR_EMAILJS_SERVICE_ID',
  templateId: 'YOUR_EMAILJS_TEMPLATE_ID', 
  publicKey: 'YOUR_EMAILJS_PUBLIC_KEY'
};

// Instructions for setup
export const EMAIL_SETUP_INSTRUCTIONS = `
To enable email reminders:

1. Sign up for EmailJS (https://www.emailjs.com/)
2. Create a new service (Gmail, Outlook, etc.)
3. Create an email template with the following variables:
   - {{to_name}}
   - {{subject}}
   - {{message}}
   - {{category}}
   - {{priority}}
   - {{due_date}}
4. Get your Service ID, Template ID, and Public Key
5. Configure the service using configureEmailService()

Example template:
Subject: {{subject}}

{{message}}

Category: {{category}}
Priority: {{priority}}
Due Date: {{due_date}}
`;

// Mock email addresses for demo (replace with real emails)
export const ROOMMATE_EMAILS = {
  'Nick': 'nick@example.com',
  'Alex': 'alex@example.com', 
  'Landon': 'landon@example.com'
};
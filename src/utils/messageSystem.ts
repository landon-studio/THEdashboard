// Message system for roommate dashboard
// Simulates receiving messages from approved email accounts

interface Message {
  id: string;
  from: string;
  email: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'heart';
  timestamp: Date;
  dismissed?: boolean;
}

interface ApprovedSender {
  email: string;
  name: string;
}

export class MessageSystem {
  private static instance: MessageSystem;
  private approvedSenders: ApprovedSender[] = [
    { email: 'nick@example.com', name: 'Nick' },
    { email: 'alex@example.com', name: 'Alex' },
    { email: 'landon@example.com', name: 'Landon' }
  ];

  private constructor() {}

  static getInstance(): MessageSystem {
    if (!MessageSystem.instance) {
      MessageSystem.instance = new MessageSystem();
    }
    return MessageSystem.instance;
  }

  // Validate if email is approved
  isApprovedSender(email: string): boolean {
    return this.approvedSenders.some(sender => 
      sender.email.toLowerCase() === email.toLowerCase()
    );
  }

  // Get sender name from email
  getSenderName(email: string): string {
    const sender = this.approvedSenders.find(s => 
      s.email.toLowerCase() === email.toLowerCase()
    );
    return sender?.name || email;
  }

  // Add a new message (simulates receiving from email)
  addMessage(
    from: string, 
    email: string, 
    message: string, 
    type: Message['type'] = 'info'
  ): boolean {
    if (!this.isApprovedSender(email)) {
      console.warn(`Rejected message from unauthorized email: ${email}`);
      return false;
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from: this.getSenderName(email),
      email,
      message,
      type,
      timestamp: new Date()
    };

    // Get existing messages
    const existingMessages = this.getMessages();
    const updatedMessages = [newMessage, ...existingMessages];

    // Keep only last 50 messages to prevent storage overflow
    const limitedMessages = updatedMessages.slice(0, 50);

    // Save to localStorage
    localStorage.setItem('dashboardMessages', JSON.stringify(limitedMessages));

    console.log(`✅ Message added from ${from}: ${message}`);
    return true;
  }

  // Get all messages
  getMessages(): Message[] {
    try {
      const stored = localStorage.getItem('dashboardMessages');
      if (!stored) return [];
      
      return JSON.parse(stored).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }

  // Get active (non-dismissed) messages
  getActiveMessages(): Message[] {
    return this.getMessages().filter(msg => !msg.dismissed);
  }

  // Dismiss a message
  dismissMessage(messageId: string): boolean {
    const messages = this.getMessages();
    const updatedMessages = messages.map(msg => 
      msg.id === messageId ? { ...msg, dismissed: true } : msg
    );
    
    localStorage.setItem('dashboardMessages', JSON.stringify(updatedMessages));
    return true;
  }

  // Clear all messages
  clearAllMessages(): void {
    localStorage.removeItem('dashboardMessages');
  }

  // Simulate receiving messages (for testing)
  simulateIncomingMessage(): void {
    const testMessages = [
      { 
        from: 'Nick', 
        email: 'nick@example.com', 
        message: '🏠 House meeting scheduled for Sunday at 3 PM. Pizza will be provided!', 
        type: 'info' as const 
      },
      { 
        from: 'Alex', 
        email: 'alex@example.com', 
        message: '🎉 Great job everyone on keeping the kitchen clean this week!', 
        type: 'success' as const 
      },
      { 
        from: 'Landon', 
        email: 'landon@example.com', 
        message: '🐕 Kepler needs his medication at 6 PM today - it\'s in the kitchen cabinet.', 
        type: 'warning' as const 
      },
      { 
        from: 'Nick', 
        email: 'nick@example.com', 
        message: '❤️ Thanks for being such awesome roommates. This system is working great!', 
        type: 'heart' as const 
      },
      { 
        from: 'Alex', 
        email: 'alex@example.com', 
        message: '🔧 Maintenance fixed the AC! Temperature should be more comfortable now.', 
        type: 'success' as const 
      },
      { 
        from: 'Landon', 
        email: 'landon@example.com', 
        message: '🛒 Added some items to the grocery list. Let me know if you need anything else!', 
        type: 'info' as const 
      }
    ];

    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
    this.addMessage(randomMessage.from, randomMessage.email, randomMessage.message, randomMessage.type);
  }

  // Email integration simulation
  // In a real implementation, this would connect to an email service
  processIncomingEmail(fromEmail: string, subject: string, body: string): boolean {
    if (!this.isApprovedSender(fromEmail)) {
      return false;
    }

    // Simple parsing - look for message type in subject
    let messageType: Message['type'] = 'info';
    const subjectLower = subject.toLowerCase();
    
    if (subjectLower.includes('urgent') || subjectLower.includes('important')) {
      messageType = 'warning';
    } else if (subjectLower.includes('success') || subjectLower.includes('done')) {
      messageType = 'success';
    } else if (subjectLower.includes('error') || subjectLower.includes('problem')) {
      messageType = 'error';
    } else if (subjectLower.includes('love') || subjectLower.includes('thanks') || subjectLower.includes('appreciate')) {
      messageType = 'heart';
    }

    // Extract the actual message (first line of body, or subject if body is empty)
    const message = body.trim() || subject;
    
    return this.addMessage(this.getSenderName(fromEmail), fromEmail, message, messageType);
  }

  // Get message statistics
  getStats() {
    const messages = this.getMessages();
    const active = messages.filter(msg => !msg.dismissed);
    
    return {
      total: messages.length,
      active: active.length,
      dismissed: messages.length - active.length,
      byType: {
        info: messages.filter(msg => msg.type === 'info').length,
        success: messages.filter(msg => msg.type === 'success').length,
        warning: messages.filter(msg => msg.type === 'warning').length,
        error: messages.filter(msg => msg.type === 'error').length,
        heart: messages.filter(msg => msg.type === 'heart').length,
      },
      bySender: this.approvedSenders.reduce((acc, sender) => {
        acc[sender.name] = messages.filter(msg => msg.email === sender.email).length;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

// Export singleton instance
export const messageSystem = MessageSystem.getInstance();

// Global function for easy access in console
if (typeof window !== 'undefined') {
  (window as any).messageSystem = messageSystem;
}
import React, { useState, useEffect } from 'react';
import { X, Mail, AlertCircle, Info, CheckCircle, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  from: string;
  email: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'heart';
  timestamp: Date;
  dismissed?: boolean;
}

interface MessageBannerProps {
  className?: string;
}

export function MessageBanner({ className = "" }: MessageBannerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Approved email accounts
  const approvedEmails = [
    { email: 'nick@example.com', name: 'Nick' },
    { email: 'alex@example.com', name: 'Alex' },
    { email: 'landon@example.com', name: 'Landon' }
  ];

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('dashboardMessages');
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      const activeMesages = parsedMessages.filter((msg: Message) => !msg.dismissed);
      setMessages(activeMesages);
    }

    // Add some demo messages for testing
    const demoMessages: Message[] = [
      {
        id: 'demo-1',
        from: 'Nick',
        email: 'nick@example.com',
        message: '🎉 Welcome to our new roommate dashboard! Hope this helps us stay organized.',
        type: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
      {
        id: 'demo-2',
        from: 'Alex',
        email: 'alex@example.com',
        message: '📅 Don\'t forget about our monthly house meeting this Sunday!',
        type: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      }
    ];

    // Only add demo messages if no saved messages exist
    if (!savedMessages) {
      setMessages(demoMessages);
      localStorage.setItem('dashboardMessages', JSON.stringify(demoMessages));
    }
  }, []);

  // Auto-rotate messages every 8 seconds if there are multiple
  useEffect(() => {
    if (messages.length > 1) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [messages.length]);

  const dismissMessage = (messageId: string) => {
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    setMessages(updatedMessages);
    
    // Update localStorage to mark message as dismissed
    const allMessages = JSON.parse(localStorage.getItem('dashboardMessages') || '[]');
    const updatedAllMessages = allMessages.map((msg: Message) => 
      msg.id === messageId ? { ...msg, dismissed: true } : msg
    );
    localStorage.setItem('dashboardMessages', JSON.stringify(updatedAllMessages));
    
    // Adjust current index if needed
    if (currentMessageIndex >= updatedMessages.length) {
      setCurrentMessageIndex(0);
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'heart':
        return <Heart className="w-5 h-5 text-pink-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getMessageStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50/90 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-50/90 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'error':
        return 'bg-red-50/90 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'heart':
        return 'bg-pink-50/90 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-800 dark:text-pink-200';
      default:
        return 'bg-blue-50/90 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
    }
  };

  // Function to simulate receiving a new message (for testing)
  const addTestMessage = () => {
    const testMessages = [
      { from: 'Landon', email: 'landon@example.com', message: '🐕 Kepler had a great walk today! He made a new friend at the park.', type: 'heart' as const },
      { from: 'Nick', email: 'nick@example.com', message: '🛒 Added groceries to the shared list - let me know if you need anything else!', type: 'info' as const },
      { from: 'Alex', email: 'alex@example.com', message: '⚠️ Heads up - maintenance will be here tomorrow morning to fix the AC.', type: 'warning' as const },
      { from: 'Landon', email: 'landon@example.com', message: '✅ All caught up on dishes and kitchen is clean! Thanks for keeping things tidy everyone.', type: 'success' as const }
    ];
    
    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
    const newMessage: Message = {
      id: `test-${Date.now()}`,
      ...randomMessage,
      timestamp: new Date()
    };
    
    const updatedMessages = [newMessage, ...messages];
    setMessages(updatedMessages);
    localStorage.setItem('dashboardMessages', JSON.stringify(updatedMessages));
  };

  if (messages.length === 0) {
    return null;
  }

  const currentMessage = messages[currentMessageIndex];

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMessage.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`relative rounded-xl border backdrop-blur-md shadow-lg ${getMessageStyles(currentMessage.type)}`}
          style={{
            backdropFilter: 'blur(16px)',
            background: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex items-center gap-4 p-4">
            <div className="flex items-center gap-3 flex-1">
              {getMessageIcon(currentMessage.type)}
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 opacity-70" />
                <span className="text-sm font-medium">{currentMessage.from}</span>
                <span className="text-xs opacity-70">
                  {currentMessage.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            
            <div className="flex-1 flex justify-center">
              <p className="text-sm text-center">{currentMessage.message}</p>
            </div>
            
            <div className="flex items-center gap-2">
              {messages.length > 1 && (
                <div className="flex items-center gap-1">
                  {messages.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentMessageIndex 
                          ? 'bg-current opacity-100' 
                          : 'bg-current opacity-30'
                      }`}
                    />
                  ))}
                </div>
              )}
              
              <button
                onClick={() => dismissMessage(currentMessage.id)}
                className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
                title="Dismiss message"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Test button - remove in production */}
      <button
        onClick={addTestMessage}
        className="absolute -bottom-12 right-0 px-3 py-1 text-xs bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors opacity-50 hover:opacity-100"
        title="Add test message (dev only)"
      >
        + Test Message
      </button>
    </div>
  );
}
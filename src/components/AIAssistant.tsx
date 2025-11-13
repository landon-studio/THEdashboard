import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mic,
  MicOff,
  Sparkles,
  Calendar,
  Dog,
  CheckSquare,
  MessageSquare,
  TrendingUp,
  User,
  LayoutDashboard,
  Settings,
  Camera,
  Key,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { initializeGemini, getGeminiService, executeFunctionCall } from "../utils/geminiApi";

interface Message {
  id: string;
  type: "user" | "assistant";
  text: string;
  timestamp: Date;
}

interface AIAssistantProps {
  onNavigate?: (screen: string) => void;
}

export default function AIAssistant({
  onNavigate,
}: AIAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] =
    useState("");
  const [assistantState, setAssistantState] = useState<
    "idle" | "listening" | "thinking" | "speaking"
  >("idle");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; delay: number }>
  >([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [useRealAI, setUseRealAI] = useState(false);

  // Check for speech recognition support and show welcome message
  useEffect(() => {
    const supported =
      "webkitSpeechRecognition" in window ||
      "SpeechRecognition" in window;
    setSpeechSupported(supported);

    // Check if first time using AI Assistant
    const hasSeenTutorial = localStorage.getItem(
      "aiAssistantTutorialSeen",
    );
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }

    // Check for saved API key
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
      setGeminiApiKey(savedApiKey);
      setUseRealAI(true);
      initializeGemini(savedApiKey);
    }

    // Show welcome message
    const onboardingData = JSON.parse(
      localStorage.getItem("onboardingData") || "{}",
    );
    const currentUser = onboardingData.name || "there";
    const hour = new Date().getHours();
    let greeting = "Hello";

    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";

    const welcomeMessage: Message = {
      id: "welcome",
      type: "assistant",
      text: `${greeting}, ${currentUser}! I'm your AI assistant. ${useRealAI ? "Powered by Google Gemini." : "Using rule-based responses."} How can I help you manage your home today?`,
      timestamp: new Date(),
    };

    setMessages([welcomeMessage]);
  }, []);

  // Initialize particles for background animation
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  // Initialize Web Speech API
  useEffect(() => {
    if (
      "webkitSpeechRecognition" in window ||
      "SpeechRecognition" in window
    ) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i++
        ) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setCurrentTranscript(
          interimTranscript || finalTranscript,
        );

        if (finalTranscript) {
          handleVoiceCommand(finalTranscript);
          setCurrentTranscript("");
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setAssistantState("idle");
      };

      recognition.onend = () => {
        if (isListening) {
          recognition.start();
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  // Generate contextual suggestions based on time and data
  useEffect(() => {
    const updateSuggestions = () => {
      const hour = new Date().getHours();
      const contextualSuggestions = [];

      if (hour >= 6 && hour < 10) {
        contextualSuggestions.push("Log Kepler's morning walk");
      } else if (hour >= 12 && hour < 14) {
        contextualSuggestions.push(
          "Log Kepler's afternoon walk",
        );
      } else if (hour >= 17 && hour < 20) {
        contextualSuggestions.push("Log Kepler's evening walk");
      }

      contextualSuggestions.push(
        "Show today's schedule",
        "What are my chores?",
        "View analytics",
      );

      setSuggestions(contextualSuggestions.slice(0, 4));
    };

    updateSuggestions();
    // Update suggestions every hour
    const interval = setInterval(updateSuggestions, 3600000);
    return () => clearInterval(interval);
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setAssistantState("idle");
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      setAssistantState("listening");
    }
  };

  const handleVoiceCommand = async (command: string) => {
    const lowerCommand = command.toLowerCase();

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: command,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setAssistantState("thinking");

    // Use Gemini AI if available, otherwise use rule-based responses
    if (useRealAI) {
      try {
        const geminiService = getGeminiService();
        if (geminiService) {
          const result = await geminiService.sendMessage(command);
          
          // Execute any function calls
          if (result.functionCalls && result.functionCalls.length > 0) {
            for (const functionCall of result.functionCalls) {
              await executeFunctionCall(functionCall, onNavigate);
            }
          }

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: "assistant",
            text: result.text,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setAssistantState("speaking");
          speakResponse(result.text);

          setTimeout(() => {
            setAssistantState(isListening ? "listening" : "idle");
          }, 2000);
          return;
        }
      } catch (error) {
        console.error('Gemini API error:', error);
        // Fall back to rule-based responses
      }
    }

    // Rule-based fallback
    setTimeout(() => {
      const response = processCommand(lowerCommand);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        text: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setAssistantState("speaking");

      // Speak the response
      speakResponse(response);

      setTimeout(() => {
        setAssistantState(isListening ? "listening" : "idle");
      }, 2000);
    }, 500);
  };

  const processCommand = (command: string): string => {
    // Get roommate data
    const onboardingData = JSON.parse(
      localStorage.getItem("onboardingData") || "{}",
    );
    const currentUser = onboardingData.name || "there";

    // Walk logging
    if (
      command.includes("log") &&
      (command.includes("walk") || command.includes("kepler"))
    ) {
      if (command.includes("morning")) {
        logWalk("morning");
        return `Got it! I've logged Kepler's morning walk for you, ${currentUser}.`;
      } else if (command.includes("afternoon")) {
        logWalk("afternoon");
        return `Perfect! Kepler's afternoon walk has been logged.`;
      } else if (command.includes("evening")) {
        logWalk("evening");
        return `All set! Evening walk logged for Kepler.`;
      } else {
        logWalk("custom");
        return `Walk logged successfully! Kepler must be happy!`;
      }
    }

    // Schedule/Calendar
    if (
      command.includes("schedule") ||
      command.includes("calendar") ||
      command.includes("today")
    ) {
      const events = getTodaysEvents();
      if (onNavigate) {
        onNavigate("calendar");
      }
      if (events.length === 0) {
        return `You have no events scheduled for today, ${currentUser}. Enjoy your free time!`;
      }
      return `You have ${events.length} event${events.length > 1 ? "s" : ""} today: ${events.join(", ")}`;
    }

    // Chores
    if (command.includes("chore") || command.includes("task")) {
      if (onNavigate) {
        onNavigate("chores");
      }
      return `Opening your chores list now. Let me know if you need help with anything!`;
    }

    // Kepler care
    if (
      command.includes("kepler") &&
      !command.includes("walk")
    ) {
      if (onNavigate) {
        onNavigate("kepler");
      }
      return `Opening Kepler's care dashboard. She's lucky to have you!`;
    }

    // House rules
    if (command.includes("rule") || command.includes("house")) {
      if (onNavigate) {
        onNavigate("rules");
      }
      return `Showing house rules. Let's keep the peace!`;
    }

    // Analytics
    if (
      command.includes("analytics") ||
      command.includes("stats") ||
      command.includes("insight")
    ) {
      if (onNavigate) {
        onNavigate("analytics");
      }
      return `Here are your household analytics. Looking good!`;
    }

    // Check-ins
    if (
      command.includes("check-in") ||
      command.includes("check in") ||
      command.includes("weekly")
    ) {
      if (onNavigate) {
        onNavigate("checkins");
      }
      return `Opening weekly check-ins. Communication is key!`;
    }

    // Expenses
    if (
      command.includes("expense") ||
      command.includes("money") ||
      command.includes("bill")
    ) {
      if (onNavigate) {
        onNavigate("expenses");
      }
      return `Showing expense tracker. Let's keep things fair!`;
    }

    // Notes
    if (
      command.includes("note") ||
      command.includes("reminder")
    ) {
      if (onNavigate) {
        onNavigate("notes");
      }
      return `Opening notes board. What's on your mind?`;
    }

    // Photos
    if (
      command.includes("photo") ||
      command.includes("picture") ||
      command.includes("gallery")
    ) {
      if (onNavigate) {
        onNavigate("photos");
      }
      return `Opening photo gallery. Memories are precious!`;
    }

    // Traditional dashboard
    if (
      command.includes("traditional") ||
      command.includes("old dashboard")
    ) {
      if (onNavigate) {
        onNavigate("traditional");
      }
      return `Switching to traditional dashboard view.`;
    }

    // Greeting
    if (
      command.includes("hello") ||
      command.includes("hi ") ||
      command.includes("hey")
    ) {
      const greetings = [
        `Hey ${currentUser}! How can I help you today?`,
        `Hello! Ready to make your day easier?`,
        `Hi there! What can I do for you?`,
      ];
      return greetings[
        Math.floor(Math.random() * greetings.length)
      ];
    }

    // Help
    if (
      command.includes("help") ||
      command.includes("what can you do")
    ) {
      return `I can help you log Kepler's walks, check your schedule, view chores, access house rules, check analytics, manage expenses, and navigate the entire dashboard. Just ask!`;
    }

    // Default
    return `I'm processing "${command}". Try asking me to log a walk, check your schedule, or show your chores!`;
  };

  const logWalk = (type: string) => {
    const walks = JSON.parse(
      localStorage.getItem("keplerWalks") || "[]",
    );
    const onboardingData = JSON.parse(
      localStorage.getItem("onboardingData") || "{}",
    );

    const timeMap: { [key: string]: string } = {
      morning: "08:00",
      afternoon: "13:00",
      evening: "18:00",
      custom: new Date().toTimeString().slice(0, 5),
    };

    const newWalk = {
      id: Date.now().toString(),
      roommate: onboardingData.name || "Unknown",
      time: timeMap[type] || timeMap.custom,
      date: new Date().toISOString().split("T")[0],
      duration: 20,
      location: "Neighborhood",
      notes: `Logged via AI Assistant`,
      scheduledTime:
        type !== "custom" ? timeMap[type] : undefined,
    };

    walks.push(newWalk);
    localStorage.setItem("keplerWalks", JSON.stringify(walks));
    window.dispatchEvent(new Event("storage"));
  };

  const getTodaysEvents = (): string[] => {
    // Get calendar events from localStorage
    const events = JSON.parse(
      localStorage.getItem("calendarEvents") || "[]",
    );
    const today = new Date().toISOString().split("T")[0];
    return events
      .filter((e: any) => e.date?.startsWith(today))
      .map((e: any) => e.title)
      .slice(0, 3);
  };

  const speakResponse = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleVoiceCommand(suggestion);
  };

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem("aiAssistantTutorialSeen", "true");
  };

  const saveApiKey = () => {
    if (geminiApiKey && geminiApiKey.trim() !== '') {
      localStorage.setItem('geminiApiKey', geminiApiKey);
      setUseRealAI(true);
      initializeGemini(geminiApiKey);
      setShowApiKeyInput(false);
      
      // Show confirmation message
      const confirmMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        text: 'Great! I\'m now powered by Google Gemini AI. I can understand natural language much better and help you with more complex tasks!',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, confirmMessage]);
    }
  };

  const removeApiKey = () => {
    localStorage.removeItem('geminiApiKey');
    setGeminiApiKey('');
    setUseRealAI(false);
    setShowApiKeyInput(false);
    
    const confirmMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      text: 'Switched back to rule-based responses. You can add your Gemini API key anytime to enable AI features.',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, confirmMessage]);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-8 overflow-hidden">
      {/* Tutorial Overlay */}
      {showTutorial && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeTutorial}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-[#676767]/95 via-[#8B8B8B]/95 to-[#A88D7D]/95 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#E8A587] to-[#C99A82] rounded-2xl flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl text-white">
                  Welcome to Your AI Assistant
                </h2>
                <p className="text-purple-200">
                  Your smart home management companion
                </p>
              </div>
            </div>

            <div className="space-y-4 text-white">
              <div className="flex items-start gap-3">
                <Mic className="w-6 h-6 text-[#E8A587] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mb-1">Voice Control</h3>
                  <p className="text-sm text-[#D9D5D0]">
                    Click "Start Voice Control" and speak
                    naturally. Try saying "Log Kepler's morning
                    walk" or "Show my schedule"
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare className="w-6 h-6 text-[#C99A82] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mb-1">Quick Actions</h3>
                  <p className="text-sm text-[#D9D5D0]">
                    Click any suggestion button for instant
                    actions without using your voice
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <TrendingUp className="w-6 h-6 text-[#A88D7D] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mb-1">Smart Navigation</h3>
                  <p className="text-sm text-[#D9D5D0]">
                    Ask to see chores, calendar, analytics, or
                    any other section of your dashboard
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Dog className="w-6 h-6 text-[#D4A895] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mb-1">Kepler Care</h3>
                  <p className="text-sm text-[#D9D5D0]">
                    Quickly log walks, check feeding times, and
                    manage Kepler's care with simple voice
                    commands
                  </p>
                </div>
              </div>
            </div>

            {!speechSupported && (
              <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
                <p className="text-yellow-200 text-sm">
                  ⚠️ Voice recognition is not supported in your
                  browser. You can still use the quick action
                  buttons!
                </p>
              </div>
            )}

            <Button
              onClick={closeTutorial}
              className="w-full mt-6 bg-gradient-to-r from-[#E8A587] to-[#C99A82] hover:from-[#D4A895] hover:to-[#B89181] text-white py-6"
            >
              Get Started
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-[#E8A587]/30 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + particle.delay,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl">
        {/* Central AI Orb */}
        <div className="flex flex-col items-center justify-center mb-12">
          <motion.div
            className="relative"
            animate={{
              scale:
                assistantState === "listening"
                  ? [1, 1.05, 1]
                  : 1,
            }}
            transition={{
              duration: 2,
              repeat:
                assistantState === "listening" ? Infinity : 0,
            }}
          >
            {/* Outer Ring */}
            <motion.div
              className="absolute inset-0 w-64 h-64 rounded-full bg-gradient-to-r from-[#E8A587]/20 via-[#C99A82]/20 to-[#A88D7D]/20 blur-xl"
              animate={{
                rotate: 360,
                scale:
                  assistantState === "listening"
                    ? [1, 1.2, 1]
                    : 1,
              }}
              transition={{
                rotate: {
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                },
                scale: { duration: 2, repeat: Infinity },
              }}
            />

            {/* Middle Ring */}
            <motion.div
              className="absolute inset-8 rounded-full bg-gradient-to-br from-[#E8A587]/30 via-[#C99A82]/30 to-[#A88D7D]/30 blur-lg"
              animate={{
                rotate: -360,
                opacity:
                  assistantState === "thinking"
                    ? [0.3, 0.7, 0.3]
                    : 0.5,
              }}
              transition={{
                rotate: {
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear",
                },
                opacity: { duration: 1.5, repeat: Infinity },
              }}
            />

            {/* Core Orb */}
            <motion.div
              className="relative w-64 h-64 rounded-full bg-gradient-to-br from-[#E8A587] via-[#C99A82] to-[#A88D7D] flex items-center justify-center backdrop-blur-xl shadow-2xl"
              style={{
                boxShadow:
                  "0 0 60px rgba(232, 165, 135, 0.4), 0 0 100px rgba(201, 154, 130, 0.3)",
              }}
              animate={{
                boxShadow:
                  assistantState === "listening"
                    ? [
                        "0 0 60px rgba(232, 165, 135, 0.4), 0 0 100px rgba(201, 154, 130, 0.3)",
                        "0 0 80px rgba(232, 165, 135, 0.6), 0 0 120px rgba(201, 154, 130, 0.5)",
                        "0 0 60px rgba(232, 165, 135, 0.4), 0 0 100px rgba(201, 154, 130, 0.3)",
                      ]
                    : "0 0 60px rgba(232, 165, 135, 0.4), 0 0 100px rgba(201, 154, 130, 0.3)",
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              {/* Voice Wave Visualization */}
              {isListening && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-full h-1 bg-white/30 rounded-full"
                      style={{
                        width: `${30 + i * 15}%`,
                      }}
                      animate={{
                        scaleX: [1, 1.5, 1],
                        opacity: [0.3, 0.7, 0.3],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Icon */}
              <motion.div
                animate={{
                  rotate:
                    assistantState === "thinking" ? 360 : 0,
                }}
                transition={{
                  duration: 2,
                  repeat:
                    assistantState === "thinking"
                      ? Infinity
                      : 0,
                  ease: "linear",
                }}
              >
                <Sparkles
                  className="w-24 h-24 text-white"
                  strokeWidth={1.5}
                />
              </motion.div>
            </motion.div>

            {/* Status Indicator */}
            <motion.div
              className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-white text-sm capitalize">
                {assistantState}
              </p>
            </motion.div>

            {/* Orbiting Elements */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-6 h-6 bg-gradient-to-br from-[#E8A587] to-[#C99A82] rounded-full shadow-lg"
                style={{
                  top: "50%",
                  left: "50%",
                }}
                animate={{
                  x: [
                    0,
                    Math.cos((i * 120 * Math.PI) / 180) * 150,
                    0,
                  ],
                  y: [
                    0,
                    Math.sin((i * 120 * Math.PI) / 180) * 150,
                    0,
                  ],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "linear",
                }}
              >
                <div className="w-full h-full rounded-full bg-white/30 animate-ping" />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Current Transcript */}
        <AnimatePresence>
          {currentTranscript && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mb-8"
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 inline-block">
                <p className="text-white text-lg">
                  {currentTranscript}
                </p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice Control Button */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <Button
            onClick={toggleListening}
            size="lg"
            className={`relative overflow-hidden px-8 py-6 text-lg ${
              isListening
                ? "bg-gradient-to-r from-[#C77A5F] to-[#D4A895] hover:from-[#B86B50] hover:to-[#C99A82]"
                : "bg-gradient-to-r from-[#E8A587] to-[#C99A82] hover:from-[#D4A895] hover:to-[#B89181]"
            }`}
            disabled={!speechSupported}
          >
            <motion.div
              animate={{
                scale: isListening ? [1, 1.2, 1] : 1,
              }}
              transition={{
                duration: 1.5,
                repeat: isListening ? Infinity : 0,
              }}
            >
              {isListening ? (
                <MicOff className="w-6 h-6 mr-2" />
              ) : (
                <Mic className="w-6 h-6 mr-2" />
              )}
            </motion.div>
            {isListening
              ? "Stop Listening"
              : speechSupported
                ? "Start Voice Control"
                : "Voice Not Supported"}
          </Button>

          <Button
            onClick={() => setShowTutorial(true)}
            variant="outline"
            size="lg"
            className="bg-white/5 backdrop-blur-md border-white/20 hover:bg-white/10 text-white px-6 py-6"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Help
          </Button>

          <Button
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            variant="outline"
            size="lg"
            className={`backdrop-blur-md border-white/20 hover:bg-white/10 text-white px-6 py-6 ${
              useRealAI ? 'bg-green-500/20 border-green-500/30' : 'bg-white/5'
            }`}
          >
            <Key className="w-5 h-5 mr-2" />
            {useRealAI ? 'AI Active' : 'Enable AI'}
          </Button>
        </div>

        {/* API Key Configuration */}
        <AnimatePresence>
          {showApiKeyInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 flex justify-center"
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 max-w-xl w-full">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-white text-lg mb-2">Google Gemini AI Configuration</h3>
                    <p className="text-purple-200 text-sm mb-4">
                      {useRealAI ? 
                        'AI is currently active. You can update or remove your API key below.' :
                        'Add your Google Gemini API key to enable advanced AI features with natural language understanding.'
                      }
                    </p>
                  </div>
                  
                  {!useRealAI && (
                    <>
                      <div className="space-y-2">
                        <label className="text-white text-sm">API Key</label>
                        <Input
                          type="password"
                          placeholder="Enter your Gemini API key"
                          value={geminiApiKey}
                          onChange={(e) => setGeminiApiKey(e.target.value)}
                          className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                        />
                      </div>
                      
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                        <p className="text-blue-200 text-xs">
                          <strong>Get your free API key:</strong><br/>
                          1. Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a><br/>
                          2. Click "Create API Key"<br/>
                          3. Copy and paste it here<br/>
                          <em className="text-blue-300 mt-1 block">Free tier: 60 requests/minute, 1,500/day</em>
                        </p>
                      </div>

                      <Button
                        onClick={saveApiKey}
                        className="w-full bg-gradient-to-r from-[#E8A587] to-[#C99A82] hover:from-[#D4A895] hover:to-[#B89181] text-white"
                        disabled={!geminiApiKey || geminiApiKey.trim() === ''}
                      >
                        Save & Enable AI
                      </Button>
                    </>
                  )}

                  {useRealAI && (
                    <div className="space-y-4">
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-green-400" />
                        <div>
                          <p className="text-green-200">AI is active and ready!</p>
                          <p className="text-green-300 text-xs">Using Google Gemini for intelligent responses</p>
                        </div>
                      </div>

                      <Button
                        onClick={removeApiKey}
                        variant="outline"
                        className="w-full bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-200"
                      >
                        Disable AI & Remove Key
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-6 mb-8"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20 px-4 py-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-400" />
              <span className="text-white text-sm">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md border-white/20 px-4 py-2">
            <div className="flex items-center gap-2">
              <Dog className="w-4 h-4 text-orange-400" />
              <span className="text-white text-sm">
                {
                  JSON.parse(
                    localStorage.getItem("keplerWalks") || "[]",
                  ).filter(
                    (w: any) =>
                      w.date ===
                      new Date().toISOString().split("T")[0],
                  ).length
                }{" "}
                walks today
              </span>
            </div>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md border-white/20 px-4 py-2">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-green-400" />
              <span className="text-white text-sm">
                {messages.length} interactions
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Quick Suggestions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                onClick={() =>
                  handleSuggestionClick(suggestion)
                }
                variant="outline"
                className="w-full h-auto py-4 bg-white/5 backdrop-blur-md border-white/20 hover:bg-white/10 text-white"
              >
                <div className="flex items-center gap-2">
                  {suggestion.includes("walk") && (
                    <Dog className="w-4 h-4" />
                  )}
                  {suggestion.includes("schedule") && (
                    <Calendar className="w-4 h-4" />
                  )}
                  {suggestion.includes("chore") && (
                    <CheckSquare className="w-4 h-4" />
                  )}
                  {suggestion.includes("rule") && (
                    <MessageSquare className="w-4 h-4" />
                  )}
                  <span className="text-sm">{suggestion}</span>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Message History */}
        <AnimatePresence>
          {messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 max-h-96 overflow-y-auto"
            >
              {messages.slice(-6).map((message) => (
                <motion.div
                  key={message.id}
                  initial={{
                    opacity: 0,
                    x: message.type === "user" ? 20 : -20,
                  }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <Card
                    className={`max-w-md p-4 ${
                      message.type === "user"
                        ? "bg-purple-500/20 backdrop-blur-md border-purple-500/30"
                        : "bg-teal-500/20 backdrop-blur-md border-teal-500/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {message.type === "assistant" && (
                        <Sparkles className="w-5 h-5 text-teal-400 flex-shrink-0 mt-1" />
                      )}
                      {message.type === "user" && (
                        <User className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                      )}
                      <p className="text-white">
                        {message.text}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
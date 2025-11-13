import React, { useState } from "react";
import {
  AppProvider,
  useAppContext,
} from "./contexts/AppContext";
import { ErrorBoundary, ComponentErrorBoundary } from "./components/ErrorBoundary";
import { Onboarding } from "./components/Onboarding";
import { Sidebar } from "./components/Sidebar";
import { MessageBanner } from "./components/MessageBanner";
import { NotificationCenter } from "./components/NotificationCenter";
import { SmartNotifications } from "./components/SmartNotifications";
import AIAssistant from "./components/AIAssistant";
import { Dashboard } from "./components/Dashboard";
import AnalyticsView from "./components/AnalyticsDashboard";
import { WeeklyCheckins } from "./components/WeeklyCheckins";
import { HouseRules } from "./components/HouseRules";
import { KeplerCare } from "./components/KeplerCare";
import { ChoresAndCommunication } from "./components/ChoresAndCommunication";
import { SharedCalendar } from "./components/SharedCalendar";
import { ExpenseTracker } from "./components/ExpenseTracker";
import { NotesBoard } from "./components/NotesBoard";
import { PhotoGallery } from "./components/PhotoGallery";
import { Settings } from "./components/Settings";

import { Toaster } from "./components/ui/toaster";

function AppContent() {
  const { isOnboardingComplete, completeOnboarding } =
    useAppContext();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show onboarding if not completed
  if (!isOnboardingComplete) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <ComponentErrorBoundary>
            <AIAssistant onNavigate={setActiveTab} />
          </ComponentErrorBoundary>
        );
      case "traditional":
        return (
          <ComponentErrorBoundary>
            <Dashboard />
          </ComponentErrorBoundary>
        );
      case "analytics":
        return (
          <ComponentErrorBoundary>
            <AnalyticsView />
          </ComponentErrorBoundary>
        );
      case "checkins":
        return (
          <ComponentErrorBoundary>
            <WeeklyCheckins />
          </ComponentErrorBoundary>
        );
      case "rules":
        return (
          <ComponentErrorBoundary>
            <HouseRules />
          </ComponentErrorBoundary>
        );
      case "kepler":
        return (
          <ComponentErrorBoundary>
            <KeplerCare />
          </ComponentErrorBoundary>
        );
      case "chores":
        return (
          <ComponentErrorBoundary>
            <ChoresAndCommunication />
          </ComponentErrorBoundary>
        );
      case "calendar":
        return (
          <ComponentErrorBoundary>
            <SharedCalendar />
          </ComponentErrorBoundary>
        );
      case "expenses":
        return (
          <ComponentErrorBoundary>
            <ExpenseTracker />
          </ComponentErrorBoundary>
        );
      case "notes":
        return (
          <ComponentErrorBoundary>
            <NotesBoard />
          </ComponentErrorBoundary>
        );
      case "photos":
        return (
          <ComponentErrorBoundary>
            <PhotoGallery />
          </ComponentErrorBoundary>
        );
      case "settings":
        return (
          <ComponentErrorBoundary>
            <Settings />
          </ComponentErrorBoundary>
        );
      default:
        return (
          <ComponentErrorBoundary>
            <AIAssistant onNavigate={setActiveTab} />
          </ComponentErrorBoundary>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8E4DF] via-[#F5F3F0] to-[#E8E4DF] dark:from-gray-900 dark:via-[#3A3A3A] dark:to-[#4A4A4A] transition-colors duration-500">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 opacity-20 dark:opacity-15 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#E8A587] dark:bg-[#C99A82] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4A895] dark:bg-[#A88D7D] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#C99A82] dark:bg-[#B89181] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 transition-transform duration-300 ease-out`}
        >
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setSidebarOpen(false);
            }}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 transition-all duration-300">
          {/* Mobile Header */}
          <div className="lg:hidden mb-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-3 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-xl shadow-lg hover:bg-white/20 dark:hover:bg-black/30 transform hover:scale-105 transition-all duration-200"
            >
              <svg
                className="w-6 h-6 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <NotificationCenter />
          </div>

          {/* Desktop Header with Notifications */}
          <div className="hidden lg:flex justify-end mb-4">
            <NotificationCenter />
          </div>

          {/* Message Banner */}
          <MessageBanner className="mb-6" />

          <div className="animate-fade-in">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary level="app">
      <AppProvider>
        <AppContent />
        <SmartNotifications />
        <Toaster />
      </AppProvider>
    </ErrorBoundary>
  );
}
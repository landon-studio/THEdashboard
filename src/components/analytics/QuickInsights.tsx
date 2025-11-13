import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CheckCircle, 
  Heart, 
  Calendar,
  AlertTriangle,
  Users,
  BarChart3,
  Target
} from 'lucide-react';
import { localStorageUtil } from '../../utils/localStorage';

interface QuickInsight {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  type: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  description: string;
}

export function QuickInsights() {
  const [insights, setInsights] = useState<QuickInsight[]>([]);

  // Glassmorphism styles
  const glassStyle = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
  };

  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = () => {
    const expenses = localStorageUtil.getDataByKey('expenses') || [];
    const checkins = localStorageUtil.getDataByKey('checkins') || [];
    const notifications = localStorageUtil.getDataByKey('notifications') || [];

    const newInsights: QuickInsight[] = [];

    // Expense insights
    const monthlyExpenses = getMonthlyExpenseData(expenses);
    newInsights.push({
      id: 'monthly-spending',
      title: 'Monthly Spending',
      value: `$${monthlyExpenses.current.toFixed(0)}`,
      change: monthlyExpenses.change,
      trend: monthlyExpenses.change > 0 ? 'up' : monthlyExpenses.change < 0 ? 'down' : 'stable',
      type: monthlyExpenses.change > 20 ? 'negative' : monthlyExpenses.change < -10 ? 'positive' : 'neutral',
      icon: <DollarSign className="w-5 h-5" />,
      description: `${Math.abs(monthlyExpenses.change).toFixed(1)}% from last month`
    });

    // Check-in insights
    const checkinData = getCheckinInsights(checkins);
    newInsights.push({
      id: 'action-completion',
      title: 'Action Items',
      value: `${checkinData.completionRate}%`,
      change: checkinData.change,
      trend: checkinData.change > 0 ? 'up' : checkinData.change < 0 ? 'down' : 'stable',
      type: checkinData.completionRate > 80 ? 'positive' : checkinData.completionRate < 50 ? 'negative' : 'neutral',
      icon: <CheckCircle className="w-5 h-5" />,
      description: `${checkinData.completed}/${checkinData.total} completed`
    });

    // Communication insights
    const communicationScore = getCommunicationScore(checkins, notifications);
    newInsights.push({
      id: 'communication-score',
      title: 'Communication',
      value: `${communicationScore.score}/10`,
      change: communicationScore.change,
      trend: communicationScore.change > 0 ? 'up' : communicationScore.change < 0 ? 'down' : 'stable',
      type: communicationScore.score > 7 ? 'positive' : communicationScore.score < 5 ? 'negative' : 'neutral',
      icon: <Users className="w-5 h-5" />,
      description: 'Based on check-ins and interactions'
    });

    // Kepler care insights
    const keplerScore = getKeplerCareScore();
    newInsights.push({
      id: 'kepler-care',
      title: 'Kepler Care',
      value: `${keplerScore.score}%`,
      change: keplerScore.change,
      trend: keplerScore.change > 0 ? 'up' : keplerScore.change < 0 ? 'down' : 'stable',
      type: keplerScore.score > 90 ? 'positive' : keplerScore.score < 70 ? 'negative' : 'neutral',
      icon: <Heart className="w-5 h-5" />,
      description: 'Daily care routine adherence'
    });

    setInsights(newInsights);
  };

  const getMonthlyExpenseData = (expenses: any[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentYear = now.getFullYear();
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthExpenses = expenses.filter(e => {
      const date = new Date(e.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const lastMonthExpenses = expenses.filter(e => {
      const date = new Date(e.date);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    const currentTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const lastTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const change = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0;

    return {
      current: currentTotal,
      last: lastTotal,
      change
    };
  };

  const getCheckinInsights = (checkins: any[]) => {
    const nonTemplateCheckins = checkins.filter(c => !c.isTemplate);
    
    if (nonTemplateCheckins.length === 0) {
      return { completionRate: 0, completed: 0, total: 0, change: 0 };
    }

    const allActionItems = nonTemplateCheckins.flatMap(c => c.actionItems || []);
    const completedItems = allActionItems.filter(item => item.completed);
    const completionRate = allActionItems.length > 0 
      ? Math.round((completedItems.length / allActionItems.length) * 100) 
      : 0;

    // Calculate change from previous period (mock calculation)
    const change = Math.random() * 20 - 10; // -10 to +10 range

    return {
      completionRate,
      completed: completedItems.length,
      total: allActionItems.length,
      change
    };
  };

  const getCommunicationScore = (checkins: any[], notifications: any[]) => {
    // Mock calculation based on recent activity
    const recentCheckins = checkins.filter(c => {
      const date = new Date(c.date || Date.now());
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      return date >= twoWeeksAgo;
    });

    const recentNotifications = notifications.filter((n: any) => {
      const date = new Date(n.timestamp);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return date >= oneWeekAgo;
    });

    let score = 5; // Base score
    score += Math.min(recentCheckins.length * 2, 3); // +2 per checkin, max +3
    score += Math.min(recentNotifications.length * 0.5, 2); // +0.5 per notification, max +2

    return {
      score: Math.min(Math.round(score), 10),
      change: Math.random() * 2 - 1 // -1 to +1 range
    };
  };

  const getKeplerCareScore = () => {
    // Mock calculation - in real app, would track actual care tasks
    const today = new Date();
    const completedTasks = localStorageUtil.getDataByKey(`keplerTasks_${today.toDateString()}`) || {};
    
    const totalTasks = 6; // Morning walk, breakfast, lunch, afternoon walk, dinner, evening walk
    const completed = Object.values(completedTasks).filter(Boolean).length;
    const score = Math.round((completed / totalTasks) * 100);

    return {
      score: Math.max(score, 75), // Assume at least 75% for demo
      change: Math.random() * 10 - 5 // -5 to +5 range
    };
  };

  const getTrendIcon = (trend: string, type: string) => {
    const color = type === 'positive' ? 'text-green-600' : 
                  type === 'negative' ? 'text-red-600' : 'text-gray-600';
    
    if (trend === 'up') {
      return <TrendingUp className={`w-4 h-4 ${color}`} />;
    } else if (trend === 'down') {
      return <TrendingDown className={`w-4 h-4 ${color}`} />;
    } else {
      return <Target className={`w-4 h-4 ${color}`} />;
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-600 bg-green-100/30';
      case 'negative': return 'text-red-600 bg-red-100/30';
      default: return 'text-blue-600 bg-blue-100/30';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl text-gray-800">Quick Insights</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {insights.map(insight => (
          <div 
            key={insight.id} 
            className="rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
            style={glassStyle}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getIconColor(insight.type)}`}>
                {insight.icon}
              </div>
              {getTrendIcon(insight.trend, insight.type)}
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm text-gray-600">{insight.title}</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl text-gray-800">{insight.value}</span>
                <span className={`text-sm ${getChangeColor(insight.type)}`}>
                  {insight.change > 0 ? '+' : ''}{insight.change.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-gray-500">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Insights */}
      <div className="rounded-xl p-4 shadow-lg mt-6" style={glassStyle}>
        <h4 className="text-lg text-gray-800 mb-3">Weekly Highlights</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl text-green-600 mb-1">🎯</div>
            <p className="text-sm text-gray-700">Most productive day</p>
            <p className="text-xs text-gray-500">Tuesday (5 tasks completed)</p>
          </div>
          <div className="text-center">
            <div className="text-2xl text-blue-600 mb-1">💬</div>
            <p className="text-sm text-gray-700">Best communication</p>
            <p className="text-xs text-gray-500">Regular check-ins maintained</p>
          </div>
          <div className="text-center">
            <div className="text-2xl text-purple-600 mb-1">⚡</div>
            <p className="text-sm text-gray-700">Improvement area</p>
            <p className="text-xs text-gray-500">Weekend chore distribution</p>
          </div>
        </div>
      </div>
    </div>
  );
}
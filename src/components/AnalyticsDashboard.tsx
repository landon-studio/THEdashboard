import React from 'react';
import { Dashboard } from './Dashboard';
import { AnalyticsDashboard as AnalyticsDashboardComponent } from './analytics/AnalyticsDashboard';

export default function AnalyticsView() {
  return (
    <div className="space-y-6">
      <AnalyticsDashboardComponent />
    </div>
  );
}

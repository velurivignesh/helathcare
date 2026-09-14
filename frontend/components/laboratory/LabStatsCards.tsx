// frontend/components/laboratory/LabStatsCards.tsx
"use client";

import React from "react";
import type { LabStats } from "../../types/lab";

interface Props {
  stats: LabStats;
}

export const LabStatsCards: React.FC<Props> = ({ stats }) => {
  const items = [
    { label: "Total Tests", value: stats.totalTests },
    { label: "Total Orders", value: stats.totalOrders },
    { label: "Pending Samples", value: stats.pendingSamples },
    { label: "Tests In Analysis", value: stats.testsInAnalysis },
    { label: "Completed Reports", value: stats.completedReports },
    { label: "Critical Alerts", value: stats.criticalAlerts },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white shadow rounded p-4 flex flex-col items-center"
        >
          <div className="text-3xl font-bold">{item.value}</div>
          <div className="text-gray-600">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

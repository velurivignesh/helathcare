// frontend/components/laboratory/LaboratoryDashboard.tsx
"use client";

import React from "react";
import { useLabDashboard } from "../../hooks/useLabDashboard";
import { LabStatsCards } from "./LabStatsCards";
import Link from "next/link";

export const LaboratoryDashboard: React.FC = () => {
  const { stats, loading, error } = useLabDashboard();

  if (loading) {
    return <div className="p-4">Loading laboratory dashboard...</div>;
  }
  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error loading dashboard: {error.message}
      </div>
    );
  }
  if (!stats) {
    return <div className="p-4">No statistics available.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <LabStatsCards stats={stats} />

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Link
          href="/laboratory/orders/new"
          className="bg-indigo-600 text-white py-2 px-4 rounded text-center hover:bg-indigo-700"
        >
          New Lab Order
        </Link>
        <Link
          href="/laboratory/samples/collect"
          className="bg-green-600 text-white py-2 px-4 rounded text-center hover:bg-green-700"
        >
          Collect Sample
        </Link>
        <Link
          href="/laboratory/results/enter"
          className="bg-yellow-600 text-white py-2 px-4 rounded text-center hover:bg-yellow-700"
        >
          Enter Result
        </Link>
        <Link
          href="/laboratory/results/critical"
          className="bg-red-600 text-white py-2 px-4 rounded text-center hover:bg-red-700"
        >
          Critical Results
        </Link>
        <Link
          href="/laboratory/tests"
          className="bg-blue-600 text-white py-2 px-4 rounded text-center hover:bg-blue-700"
        >
          Test Catalog
        </Link>
        <Link
          href="/laboratory/reports"
          className="bg-purple-600 text-white py-2 px-4 rounded text-center hover:bg-purple-700"
        >
          Lab Reports
        </Link>
      </div>
    </div>
  );
};

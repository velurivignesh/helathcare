// frontend/components/laboratory/LabStatusBadge.tsx
import React from "react";

interface LabStatusBadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  collected: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  critical: "bg-red-100 text-red-800",
};

export const LabStatusBadge: React.FC<LabStatusBadgeProps> = ({ status }) => {
  const lower = status.toLowerCase();
  const colorClass = statusColors[lower] ?? "bg-gray-100 text-gray-800";
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${colorClass}`}> {status} </span>
  );
};

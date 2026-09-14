// frontend/components/laboratory/LabOrderPriorityBadge.tsx

"use client";

import React from "react";

/** Badge that displays the order priority. */
export const LabOrderPriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const normalized = priority?.toLowerCase() ?? "unknown";
  let className = "bg-gray-100 text-gray-800";
  let label = priority ?? "Unknown";
  switch (normalized) {
    case "routine":
      className = "bg-green-100 text-green-800";
      label = "Routine";
      break;
    case "urgent":
      className = "bg-yellow-100 text-yellow-800";
      label = "Urgent";
      break;
    case "stat":
      className = "bg-red-100 text-red-800";
      label = "Stat";
      break;
    default:
      break;
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  );
};

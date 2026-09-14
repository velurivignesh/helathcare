// frontend/app/laboratory/page.tsx
"use client"

import React, { useState } from "react"
import { LaboratoryDashboard } from "@/components/laboratory/LaboratoryDashboard"
import { LabCategoryManager } from "@/components/laboratory/LabCategoryManager";
import { LabOrderManager } from "@/components/laboratory/LabOrderManager";

export default function LaboratoryHome() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <LaboratoryDashboard />
      case "categories":
        return <LabCategoryManager />
      case "orders":
        return <LabOrderManager />
      default:
        return <LaboratoryDashboard />
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Laboratory Management</h1>
      <nav className="border-b">
        <ul className="flex space-x-4">
          <li>
            <button
              className={`px-3 py-2 ${activeTab === "dashboard" ? "border-b-2 border-indigo-600" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </button>
          </li>
          <li>
            <button
              className={`px-3 py-2 ${activeTab === "categories" ? "border-b-2 border-indigo-600" : ""}`}
              onClick={() => setActiveTab("categories")}
            >
              Categories
            </button>
          </li>
          <li>
            <button
              className={`px-3 py-2 ${activeTab === "orders" ? "border-b-2 border-indigo-600" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              Orders
            </button>
          </li>
        </ul>
      </nav>
      {renderTab()}
    </div>
  )
}

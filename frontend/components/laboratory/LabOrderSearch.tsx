// frontend/components/laboratory/LabOrderSearch.tsx

"use client"

import React, { useState, useEffect } from "react"

interface Props {
  onSearch: (term: string) => void
}

/** Search input with debounce for orders */
export const LabOrderSearch: React.FC<Props> = ({ onSearch }) => {
  const [value, setValue] = useState("")
  const [debounced, setDebounced] = useState(value)

  // debounce 300ms
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), 300)
    return () => clearTimeout(handler)
  }, [value])

  useEffect(() => {
    onSearch(debounced)
  }, [debounced, onSearch])

  return (
    <input
      type="text"
      placeholder="Search orders…"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="border rounded px-3 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  )
}

export default LabOrderSearch

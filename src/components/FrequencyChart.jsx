import { useState } from 'react'

function FrequencyChart({ data }) {
  const [sortBy, setSortBy] = useState('frequency') // 'number' or 'frequency'
  
  if (!data || Object.keys(data).length === 0) {
    return <div className="text-gray-500">No frequency data available</div>
  }

  // Convert data to array and sort
  const sortedData = Object.entries(data)
    .map(([number, frequency]) => ({ number: parseInt(number), frequency }))
    .sort((a, b) => {
      if (sortBy === 'number') {
        return a.number - b.number
      } else {
        return b.frequency - a.frequency // Descending by frequency
      }
    })

  const maxFrequency = Math.max(...sortedData.map(item => item.frequency))

  return (
    <div>
      {/* Sort Controls */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Sort by:</label>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="frequency">Frequency</option>
          <option value="number">Number</option>
        </select>
      </div>

      {/* Chart */}
      <div className="space-y-2">
        {sortedData.map(({ number, frequency }) => (
          <div key={number} className="flex items-center gap-3">
            <div className="w-8 text-sm font-medium text-gray-700">
              {number}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div 
                className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-2"
                style={{ width: `${(frequency / maxFrequency) * 100}%` }}
              >
                <span className="text-white text-xs font-medium">
                  {frequency}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FrequencyChart 
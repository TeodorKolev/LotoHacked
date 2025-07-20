import { useState } from 'react'

function DrawsTable({ data }) {
  const [showCount, setShowCount] = useState(50)
  const [highlightNumber, setHighlightNumber] = useState('')
  const [showSpecial, setShowSpecial] = useState(false)
  
  // Check if this is KENO data (has 20 numbers) early for initial state
  const isKenoDataInitial = data && data.some(draw => draw.b_20 !== undefined)
  
  // For KENO, don't show date by default; for others, show date by default
  const [showDate, setShowDate] = useState(!isKenoDataInitial)
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="text-gray-500">No draws data available</div>
  }

  // Filter data based on show count
  const displayData = showCount === 'all' ? data : data.slice(0, showCount)

  // Check if a number should be highlighted
  const shouldHighlight = (number) => {
    if (!highlightNumber) return false
    return number.toString() === highlightNumber.toString()
  }

  // Get special number(s) - prioritize spcials array if it exists and is not empty
  const getSpecialNumbers = (draw) => {
    // Check if spcials array exists and is not empty
    if (draw.spcials && Array.isArray(draw.spcials) && draw.spcials.length > 0) {
      return draw.spcials
    }
    
    // Fall back to special field
    if (draw.special !== undefined && draw.special !== null) {
      return [draw.special]
    }
    
    return []
  }

  // Check if this is KENO data (has 20 numbers)
  const isKenoData = data.some(draw => draw.b_20 !== undefined)
  
  // Get all unique numbers for the select dropdown
  const getAllNumbers = () => {
    const numbers = new Set()
    data.forEach(draw => {
      // Add main numbers
      if (isKenoData) {
        // KENO has 20 numbers
        for (let i = 1; i <= 20; i++) {
          const num = draw[`b_${i}`]
          if (num !== undefined && num !== null) {
            numbers.add(num)
          }
        }
      } else {
        // Standard lottery has 5 numbers
        [draw.b_1, draw.b_2, draw.b_3, draw.b_4, draw.b_5].forEach(num => {
          if (num !== undefined && num !== null) {
            numbers.add(num)
          }
        })
      }
      
      // Add special numbers (only for non-KENO lotteries)
      if (!isKenoData) {
        const specialNumbers = getSpecialNumbers(draw)
        specialNumbers.forEach(num => {
          if (num !== undefined && num !== null) {
            numbers.add(num)
          }
        })
      }
    })
    return Array.from(numbers).sort((a, b) => a - b)
  }

  const allNumbers = getAllNumbers()

  return (
    <div>
      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Show:</label>
          <select 
            value={showCount} 
            onChange={(e) => setShowCount(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Highlight:</label>
          <select
            value={highlightNumber}
            onChange={(e) => setHighlightNumber(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select number</option>
            {allNumbers.map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          {!isKenoData && (
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={showSpecial}
                onChange={(e) => setShowSpecial(e.target.checked)}
                className="rounded"
              />
              Special
            </label>
          )}
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={showDate}
              onChange={(e) => setShowDate(e.target.checked)}
              className="rounded"
            />
            Date
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto" id="draws-table">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {isKenoData ? (
                // KENO - 20 numbers
                Array.from({ length: 20 }, (_, i) => (
                  <th key={`b_${i + 1}`} className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    B{i + 1}
                  </th>
                ))
              ) : (
                // Standard lottery - 5 numbers
                ['B1', 'B2', 'B3', 'B4', 'B5'].map(header => (
                  <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))
              )}
              {showSpecial && !isKenoData && (
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Special
                </th>
              )}
              {showDate && (
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de tirage
                </th>
              )}
            </tr>
          </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
          {displayData.map((draw, index) => {
            const specialNumbers = getSpecialNumbers(draw)
            const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            
            return (
              <tr key={index} className={`${rowBg} hover:bg-gray-100`}>
                {isKenoData ? (
                  // KENO - 20 numbers
                  Array.from({ length: 20 }, (_, i) => {
                    const ballNum = i + 1
                    const value = draw[`b_${ballNum}`]
                    return (
                      <td 
                        key={`b_${ballNum}`}
                        className={`px-2 py-1 whitespace-nowrap text-xs text-center ${
                          shouldHighlight(value) ? 'bg-yellow-300 font-bold text-black' : ''
                        }`}
                      >
                        {value || '-'}
                      </td>
                    )
                  })
                ) : (
                  // Standard lottery - 5 numbers
                  ['b_1', 'b_2', 'b_3', 'b_4', 'b_5'].map(field => (
                    <td 
                      key={field}
                      className={`px-3 py-1 whitespace-nowrap text-xs text-center ${
                        shouldHighlight(draw[field]) ? 'bg-yellow-300 font-bold text-black' : ''
                      }`}
                    >
                      {draw[field] || '-'}
                    </td>
                  ))
                )}
                {showSpecial && !isKenoData && (
                  <td className="px-3 py-1 whitespace-nowrap text-xs text-center text-black">
                    {specialNumbers.length > 0 ? (
                      <div className="flex gap-1 justify-center">
                        {specialNumbers.map((num, idx) => (
                          <span
                            key={idx}
                            className={`${
                              shouldHighlight(num) ? 'bg-yellow-300 font-bold text-black px-1 rounded' : ''
                            }`}
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                )}
                {showDate && (
                  <td className="px-3 py-1 whitespace-nowrap text-xs text-gray-500">
                    {draw.date_de_tirage || draw.draw_date || draw.date || 'N/A'}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
        </table>
      </div>
    </div>
  )
}

export default DrawsTable 
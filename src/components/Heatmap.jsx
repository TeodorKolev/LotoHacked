function Heatmap({ data, drawsData, maxNumber = 49 }) {
  if (!data) {
    return <div className="text-gray-500">No heatmap data available</div>
  }

  // Generate all numbers from 1 to maxNumber
  const numbers = Array.from({ length: maxNumber }, (_, i) => i + 1)

  // Calculate frequency for different draw counts
  const calculateFrequency = (lastN) => {
    if (!drawsData || !Array.isArray(drawsData)) return {}
    
    const freq = {}
    const draws = drawsData.slice(0, lastN)
    
    draws.forEach(draw => {
      // Handle different data structures
      const mainNumbers = []
      if (draw.numbers && Array.isArray(draw.numbers)) {
        mainNumbers.push(...draw.numbers)
      } else if (draw.b_1 !== undefined) {
        [draw.b_1, draw.b_2, draw.b_3, draw.b_4, draw.b_5].forEach(num => {
          if (num !== undefined && num !== null) {
            mainNumbers.push(num)
          }
        })
      }
      
      mainNumbers.forEach(num => {
        freq[num] = (freq[num] || 0) + 1
      })
    })
    
    return freq
  }

  const heatmaps = [
    { title: 'Heatmap of last 5 draws', data: calculateFrequency(5) },
    { title: 'Heatmap of last 15 draws', data: calculateFrequency(15) },
    { title: 'Heatmap of last 50 draws', data: calculateFrequency(50) }
  ]

  const getIntensity = (value, maxVal) => {
    if (!value || maxVal === 0) return 0
    return value / maxVal
  }

  const getBackgroundColor = (number, freqData) => {
    const value = freqData[number.toString()] || 0
    const maxVal = Math.max(...Object.values(freqData))
    const intensity = getIntensity(value, maxVal)
    
    // Interpolate between white (255,255,255) and dark green (0,66,24)
    const r = Math.round(255 * (1 - intensity))
    const g = Math.round(255 * (1 - intensity) + 66 * intensity)
    const b = Math.round(255 * (1 - intensity) + 24 * intensity)
    
    return `rgb(${r}, ${g}, ${b})`
  }

  const getTextColor = (number, freqData) => {
    const value = freqData[number.toString()] || 0
    const maxVal = Math.max(...Object.values(freqData))
    const intensity = getIntensity(value, maxVal)
    
    // Use white text for darker backgrounds (intensity > 0.5)
    return intensity > 0.5 ? 'white' : 'black'
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {heatmaps.map((heatmap, index) => (
        <div key={index}>
          <h3 className="text-sm font-medium text-gray-700 mb-1">{heatmap.title}</h3>
          
          {/* Scrollable container for small screens */}
          <div className="overflow-x-auto">
            {/* Numbers row */}
            <div className="flex gap-px mb-px min-w-max">
              {numbers.map((number) => {
                const value = heatmap.data[number.toString()] || 0
                return (
                  <div
                    key={number}
                    className="w-6 h-5 flex items-center justify-center text-xs font-bold rounded-sm flex-shrink-0"
                    style={{ 
                      backgroundColor: getBackgroundColor(number, heatmap.data),
                      color: getTextColor(number, heatmap.data)
                    }}
                    title={`Number ${number}: ${value} times`}
                  >
                    {number}
                  </div>
                )
              })}
            </div>
            
            {/* Values row */}
            <div className="flex gap-px mb-1 min-w-max">
              {numbers.map((number) => {
                const value = heatmap.data[number.toString()] || 0
                return (
                  <div
                    key={`value-${number}`}
                    className="w-6 h-4 flex items-center justify-center text-xs text-gray-700 flex-shrink-0"
                  >
                    {value}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Heatmap 
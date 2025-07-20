function PatternAnalysis({ data }) {
  if (!data) {
    return <div className="text-gray-500">No pattern data available</div>
  }

  const patternColors = {
    'green': '#8de5a1',
    'yellow': '#ffd92f',
    'red': '#f77189',
    'purple': '#bb83f4',
    'blue': '#3ba3ec',
    'orange': '#ff9500',
    'pink': '#ff69b4'
  }

  // Convert to array and sort by count
  const patterns = Object.entries(data)
    .map(([pattern, count]) => ({ pattern, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Show top 10 patterns

  return (
    <div className="pattern-squares">
      {patterns.map(({ pattern, count }, index) => {
        const colors = pattern.split('-').map(c => patternColors[c] || '#eee')
        return (
          <div key={index} className="pattern-square-row">
            <div className="flex">
              {colors.map((color, colorIndex) => (
                <div 
                  key={colorIndex}
                  className="pattern-square" 
                  style={{ background: color }}
                ></div>
              ))}
            </div>
            <span className="ml-2 text-xs text-gray-700 font-medium">
              {count} times
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default PatternAnalysis 
function PatternPrediction({ data }) {
  if (!data) {
    return <div className="text-gray-500">No pattern prediction data available</div>
  }

  const patternColors = {
    'green': '#8de5a1',
    'yellow': '#ffd92f',
    'red': '#f77189',
    'purple': '#bb83f4',
    'blue': '#3ba3ec'
  }

  // Handle both string and object formats
  let patternString = ''
  if (typeof data === 'string') {
    patternString = data
  } else if (typeof data === 'object' && Object.keys(data).length > 0) {
    // If it's an object, take the first (most frequent) pattern
    const patterns = Object.entries(data)
      .map(([pattern, frequency]) => ({ pattern, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
    patternString = patterns[0]?.pattern || ''
  }

  if (!patternString) {
    return <div className="text-gray-500">No pattern prediction available</div>
  }

  // Split the pattern into colors
  const colors = patternString.split('-').map(c => patternColors[c] || '#eee')

  return (
    <div className="pattern-squares">
      <div className="pattern-square-row">
        <div className="flex">
          {colors.map((color, colorIndex) => (
            <div 
              key={colorIndex}
              className="pattern-square" 
              style={{ background: color }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PatternPrediction 
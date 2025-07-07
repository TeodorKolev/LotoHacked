function HotColdNumbers({ data }) {
  if (!data || (!data.hot && !data.cold)) {
    return <div className="text-gray-500">No hot/cold data available</div>
  }

  const hotNumbers = data.hot || []
  const coldNumbers = data.cold || []

  const renderNumbers = (numbers, isHot) => {
    if (!numbers || numbers.length === 0) {
      return <div className="text-gray-500">No data available</div>
    }

    return (
      <div className="flex flex-wrap gap-2">
        {numbers.map((item, index) => {
          const number = typeof item === 'object' ? item.number : item
          const frequency = typeof item === 'object' ? item.frequency : null
          
          return (
            <div
              key={index}
              className={`w-12 h-12 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-lg ${
                isHot ? 'bg-gradient-to-br from-red-500 to-red-600' : 
                'bg-gradient-to-br from-blue-500 to-blue-600'
              }`}
            >
              <div className="text-lg leading-none">{number}</div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Hot Numbers */}
      <div>
        <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
          Hot Numbers
        </h3>
        {renderNumbers(hotNumbers, true)}
      </div>

      {/* Cold Numbers */}
      <div>
        <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center">
          Cold Numbers
        </h3>
        {renderNumbers(coldNumbers, false)}
      </div>
    </div>
  )
}

export default HotColdNumbers 
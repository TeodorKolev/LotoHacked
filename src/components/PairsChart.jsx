function PairsChart({ data }) {
  if (!data) {
    return <div className="text-gray-500">No pairs data available</div>
  }

  // Convert to array and sort by frequency
  const pairs = Object.entries(data)
    .map(([pair, frequency]) => ({ pair, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 15) // Show top 15 pairs (was 10)

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Number Pair
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Frequency
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {pairs.map(({ pair, frequency }, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {pair}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {frequency}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PairsChart 
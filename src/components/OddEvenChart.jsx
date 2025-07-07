function OddEvenChart({ data }) {
  if (!data) {
    return <div className="text-gray-500">No odd/even data available</div>
  }

  // Convert to array and sort by count
  const entries = Object.entries(data)
    .map(([pattern, count]) => ({ pattern, count }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Pattern</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Count</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {entries.map(({ pattern, count }, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-3 py-2 text-gray-900">
                {pattern.replace(/_/g, ' ')}
              </td>
              <td className="px-3 py-2 font-semibold text-gray-900">
                {count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default OddEvenChart 
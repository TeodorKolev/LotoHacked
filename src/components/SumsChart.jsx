function SumsChart({ data }) {
  if (!data) {
    return <div className="text-gray-500">No sums data available</div>
  }

  // Convert to array and sort by count (descending)
  const entries = Object.entries(data)
    .map(([sum, count]) => ({ sum: parseInt(sum), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Show top 10 sums

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Sum</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Count</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {entries.map(({ sum, count }, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-3 py-2 text-gray-900">
                {sum}
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

export default SumsChart 
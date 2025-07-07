function ConsecutiveChart({ data }) {
  if (!data) {
    return <div className="text-gray-500">No consecutive data available</div>
  }

  // Convert to array and sort by consecutive count
  const entries = Object.entries(data)
    .map(([consecutive, count]) => ({ consecutive: parseInt(consecutive), count }))
    .sort((a, b) => a.consecutive - b.consecutive)

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Consecutive</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Count</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {entries.map(({ consecutive, count }, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-3 py-2 text-gray-900">
                {consecutive}
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

export default ConsecutiveChart 
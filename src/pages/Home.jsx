import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_BASE = 'https://cq3inxhgff.execute-api.eu-west-1.amazonaws.com'

function Home() {
  const [lotteries, setLotteries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLotteries = async () => {
      try {
        const response = await axios.get(`${API_BASE}/lottery`)
        setLotteries(response.data)
      } catch (err) {
        setError('Failed to load lotteries')
        console.error('Error fetching lotteries:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLotteries()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Loto Hacked Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Select a lottery to view detailed analytics and insights
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lotteries.map((lottery) => (
          <Link
            key={lottery.name}
            to={`/analytics/${lottery.name}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {lottery.display_name || lottery.name}
              </h3>
              <p className="text-gray-600 mb-4">
                {lottery.description || 'Lottery pattern analysis'}
              </p>
              {lottery.last_draw_date && (
                <p className="text-sm text-gray-500">
                  Last draw: {lottery.last_draw_date}
                </p>
              )}
              <div className="mt-4 inline-flex items-center text-indigo-600 font-medium">
                View Analytics
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {lotteries.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg">No lotteries available</div>
        </div>
      )}
    </div>
  )
}

export default Home 
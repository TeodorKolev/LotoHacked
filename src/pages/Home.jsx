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

  const getLotteryDisplayName = (lottery) => {
    const names = {
      'euromillions': 'EuroMillions',
      'fdj-loto': 'FDJ Loto'
    }
    return names[lottery.name] || lottery.display_name || lottery.name
  }

  const getLotteryDescription = (lottery) => {
    const descriptions = {
      'euromillions': 'European Multi-National Lottery',
      'fdj-loto': 'French National Lottery'
    }
    return descriptions[lottery.name] || lottery.description || 'Lottery pattern analysis'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 flex justify-center items-center">
        <div className="text-red-600 text-xl bg-white rounded-lg p-8 shadow-lg">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Main Content */}
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
              The Scientific Way to Win
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced analytics and insights for smarter lottery strategies
            </p>
          </div>

          {/* Lottery Cards */}
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {lotteries.map((lottery) => {
              return (
                <div
                  key={lottery.name}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  {/* Lottery Info */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {getLotteryDisplayName(lottery)}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 text-base">
                    {getLotteryDescription(lottery)}
                  </p>

                  {/* Last Draw Box */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                    <p className="text-gray-500 text-sm mb-1">Last Draw</p>
                    <p className="text-gray-900 text-lg font-semibold">
                      {formatDate(lottery.last_draw_date)}
                    </p>
                  </div>

                  {/* View Analytics Button */}
                  <Link
                    to={`/analytics/${lottery.name}`}
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    View Analytics →
                  </Link>
                </div>
              )
            })}
          </div>

          {/* No lotteries message */}
          {lotteries.length === 0 && !loading && (
            <div className="text-center py-8">
              <div className="text-gray-600 text-lg bg-white rounded-lg p-8 max-w-md mx-auto shadow-lg">
                No lotteries available
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home 
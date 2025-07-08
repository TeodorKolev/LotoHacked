import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import HotColdNumbers from '../components/HotColdNumbers'
import FrequencyChart from '../components/FrequencyChart'
import PatternAnalysis from '../components/PatternAnalysis'
import PatternPrediction from '../components/PatternPrediction'
import OddEvenChart from '../components/OddEvenChart'
import LowHighChart from '../components/LowHighChart'
import ConsecutiveChart from '../components/ConsecutiveChart'
import SumsChart from '../components/SumsChart'
import PairsChart from '../components/PairsChart'
import DrawsTable from '../components/DrawsTable'
import Heatmap from '../components/Heatmap'

function Analytics() {
  const { name } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log(`Fetching data for: ${name}`) // Debug log
        const response = await axios.get(
          `https://cq3inxhgff.execute-api.eu-west-1.amazonaws.com/${name}/all`
        )
        
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          console.log('API Response received:', response.data) // Debug log
          setData(response.data)
          setLoading(false)
        }
      } catch (err) {
        // Only handle error if component is still mounted
        if (isMountedRef.current) {
          console.error('API Error:', err) // Debug log
          setError(err.message)
          setLoading(false)
        }
      }
    }

    if (name) {
      isMountedRef.current = true
      fetchData()
    }

    // Cleanup function
    return () => {
      isMountedRef.current = false
    }
  }, [name])

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>
  if (!data) return <div className="text-center py-8">No data available</div>

  return (
    <div className="container mx-auto px-4 py-4">
      {/* Recent Draws - moved to top */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Draws</h2>
          <DrawsTable data={data.draws} />
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Heatmaps</h2>
          <Heatmap data={data.frequency_count} drawsData={data.draws} />
        </div>
      </div>

      {/* Hot/Cold Numbers */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Hot & Cold Numbers</h2>
          <HotColdNumbers data={data.hot_cold} />
        </div>
      </div>

      {/* Pattern Analysis */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Pattern Analysis</h2>
          <PatternAnalysis data={data.pattern_counts} />
        </div>
      </div>

      {/* Pattern Prediction */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Pattern Prediction</h2>
          <PatternPrediction data={data.pattern_prediction} />
        </div>
      </div>

      {/* Statistical Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Odd/Even Distribution</h2>
          <OddEvenChart data={data.odd_even} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Low/High Distribution</h2>
          <LowHighChart data={data.low_high} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Consecutive Numbers</h2>
          <ConsecutiveChart data={data.consecutive_count} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Sum Analysis</h2>
          <SumsChart data={data.sums} />
        </div>
      </div>

      {/* Pairs Analysis */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Number Pairs</h2>
          <PairsChart data={data.pairs_count} />
        </div>
      </div>

      {/* Number Frequency Chart - moved to bottom */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Number Frequency</h2>
          <FrequencyChart data={data.frequency_count} />
        </div>
      </div>
    </div>
  )
}

export default Analytics 
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3">
            <div className="text-2xl">🎲</div>
            <span className="text-2xl font-bold text-gray-800">Loto Hacked</span>
          </Link>
          <div className="flex space-x-8">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-lg"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 
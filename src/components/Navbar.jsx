import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-blue-700 shadow-lg border-b border-blue-800">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3">
            <div className="text-2xl">🎲</div>
            <span className="text-2xl font-bold text-amber-300">Loto Hacked</span>
          </Link>
          <div className="flex space-x-8">
            <Link 
              to="/" 
              className="text-white hover:text-amber-300 transition-colors font-medium text-lg"
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
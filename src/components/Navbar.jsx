import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
          🎲 Loto Hacked
          </Link>
          <div className="flex space-x-4">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-indigo-600 transition-colors"
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
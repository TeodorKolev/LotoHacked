import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Analytics from './pages/Analytics'
import Navbar from './components/Navbar'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analytics/:name" element={<Analytics />} />
        </Routes>
      </main>
              <footer className="bg-slate-900 text-white py-12 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2025 Loto Hacked. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App 
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-16 fade-in">
          <h1 className="text-6xl font-black text-white mb-4">
            RoadSense <span className="text-gradient">Timișoara</span>
          </h1>
          <p className="text-xl text-gray-400 text-balance">
            Smart pothole detection system powered by AI
          </p>
        </div>

        {/* Demo Card */}
        <div className="glass-card p-8 mb-8 hover:border-primary/30 transition-all duration-300">
          <h2 className="text-3xl font-bold text-white mb-4">
            🎨 Tailwind CSS is Working!
          </h2>
          <p className="text-gray-300 mb-6">
            This is a demo page showing that Tailwind CSS has been properly configured with custom utilities and components.
          </p>

          {/* Counter Demo */}
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setCount(count - 1)} className="btn-secondary px-8">
              -
            </button>
            <span className="text-4xl font-bold text-primary min-w-[100px] text-center">
              {count}
            </span>
            <button onClick={() => setCount(count + 1)} className="btn-primary px-8">
              +
            </button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-primary/30 transition-all">
              <div className="text-2xl mb-2">📱</div>
              <h3 className="font-semibold text-white mb-1">Mobile App</h3>
              <p className="text-sm text-gray-400">React Native + Sensors</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-primary/30 transition-all">
              <div className="text-2xl mb-2">🌐</div>
              <h3 className="font-semibold text-white mb-1">Backend API</h3>
              <p className="text-sm text-gray-400">Node.js + MongoDB</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-primary/30 transition-all">
              <div className="text-2xl mb-2">🖥️</div>
              <h3 className="font-semibold text-white mb-1">Dashboard</h3>
              <p className="text-sm text-gray-400">React + Mapbox</p>
            </div>
          </div>
        </div>

        {/* Buttons Demo */}
        <div className="flex gap-4 justify-center">
          <button className="btn-primary">
            Primary Button
          </button>
          <button className="btn-secondary">
            Secondary Button
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>uni-Hackathon Project • Team: Vukasin, Nemanja, Teodora</p>
        </div>
      </div>
    </div>
  )
}

export default App

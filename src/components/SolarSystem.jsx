import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

function SolarSystem() {
    const navigate = useNavigate()

    return (
        <div className="w-full h-screen bg-black overflow-hidden relative">
            {/* Embed */}
            <iframe
                src="https://www.solarsystemscope.com/iframe"
                width="100%"
                height="100%"
                className="absolute top-0 left-0 z-0"
                style={{
                    minWidth: '500px',
                    minHeight: '400px',
                    border: 'none'
                }}
                title="Solar System Scope Interactive Visualizer"
                allow="accelerometer; gyroscope"
            />

            {/* Dashboard  */}
            <div className="absolute top-6 left-6 z-50 pointer-events-auto">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-lg px-4 py-2 hover:bg-cyan-500/20 transition-all shadow-xl"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                    <ChevronLeft className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm font-medium tracking-wide text-white">DASHBOARD</span>
                </button>
            </div>

            {/* Title Header */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <h1
                    className="text-3xl font-bold text-white tracking-wider"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >

                </h1>
            </div>

            {/* Attribute */}
            <div className="absolute bottom-4 right-4 z-50 pointer-events-none">
                <p
                    className="text-xs text-white/60 tracking-wide"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                    Visualization powered by Solar System Scope
                </p>
            </div>
        </div>
    )
}

export default SolarSystem

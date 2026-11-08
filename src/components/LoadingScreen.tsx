function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-tower-dark">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 mx-auto border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading Echocity...</p>
      </div>
    </div>
  )
}

export default LoadingScreen

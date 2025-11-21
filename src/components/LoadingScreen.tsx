import './LoadingScreen.css'

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="spinner"></div>
        <h2 className="loading-text">ROHRNETZ Beil GmbH</h2>
        <p className="loading-subtext">PDF Formular Generator wird geladen...</p>
      </div>
    </div>
  )
}

export default LoadingScreen


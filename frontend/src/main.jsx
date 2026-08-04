import React from 'react'
import ReactDOM from 'react-dom/client'
import DonorDashboard from './components/DonorDashboard'
import './index.css' // <--- Add this line

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DonorDashboard />
  </React.StrictMode>,
)
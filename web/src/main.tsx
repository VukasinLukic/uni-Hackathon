import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MockAuthProvider } from './components/auth/MockAuthProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MockAuthProvider>
        <App />
      </MockAuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

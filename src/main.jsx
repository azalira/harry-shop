import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext' // 1. Importation du CartProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider> {/* 2. On enveloppe App avec le panier */}
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
)
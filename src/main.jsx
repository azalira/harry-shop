import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { Toaster } from 'sonner'

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: "'Poppins', system-ui, sans-serif",
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              border: '2px solid black',
              borderRadius: '0',
              boxShadow: '6px 6px 0px 0px rgba(0,0,0,0.15)',
              padding: '14px 18px',
            },
          }}
        />
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
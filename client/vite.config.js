import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_REACT_APP_API_URL': JSON.stringify(
      process.env.NODE_ENV === 'production' 
        ? 'https://api.socrates.fikra.solutions/api/v1'
        : (process.env.VITE_REACT_APP_API_URL || 'http://localhost:4016/api/v1')
    )
  }
})

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import ErrorBoundary from './shared/components/ui/ErrorBoundary.tsx'

import { ThemeProvider } from './shared/context/ThemeContext.tsx'
import { SoundProvider } from './shared/context/SoundContext.tsx'


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <SoundProvider>
          <App />
        </SoundProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

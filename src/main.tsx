import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DogMachineProvider } from './contexts/Dog/DogMachineProvider.tsx'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <DogMachineProvider>
      <App />
    </DogMachineProvider>
  </StrictMode>,
)

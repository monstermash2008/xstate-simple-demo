import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DogMachineProvider } from './contexts/Dog/DogMachineProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DogMachineProvider>
      <App />
    </DogMachineProvider>
  </StrictMode>,
)

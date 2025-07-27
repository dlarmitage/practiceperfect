import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './tailwind.css' // Import Tailwind CSS
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'

// Register service worker with improved update handling
// We need to explicitly use this value to avoid unused variable warning
export const updateSW = registerSW({
  // Check for updates every hour
  // This helps ensure the app stays up-to-date even when kept open for long periods
  immediate: true,
  // Using registerSW options that are actually supported
  onRegistered(registration: ServiceWorkerRegistration | undefined) {
    
    
    // Check if there's a waiting service worker
    if (registration?.waiting) {

    }
    
    // Set up periodic update checks
    setInterval(() => {
      registration?.update().catch(console.error)
    }, 60 * 60 * 1000) // Check every hour
  },
  onNeedRefresh() {
    // Instead of using confirm, we'll use our UpdateNotification component
    // The component will handle the UI and the update process
    
    // We don't call updateSW(true) here because our component will handle it
  },
  onOfflineReady() {
    
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

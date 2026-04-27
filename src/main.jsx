import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './styles/main.css'

// Clerk publishable key — exposed to the client by design (the secret key
// stays server-side via Vercel env vars). Loaded from VITE_CLERK_PUBLISHABLE_KEY
// which is set in Vercel project env vars for Production. If the key is
// missing we fail loud at startup so it's obvious during dev.
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY — check Vercel env vars.')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      // After sign-in/sign-up succeeds, Clerk redirects back to the app root.
      // App.jsx handles routing from there based on the user's role and
      // linked athletes (admin -> AthleteGrid, family -> their athlete profile).
      afterSignInUrl="/"
      afterSignUpUrl="/"
      // Where to send users when they hit a gated page without auth.
      signInUrl="/sign-in"
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
)

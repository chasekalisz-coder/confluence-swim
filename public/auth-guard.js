// ============================================================
// auth-guard.js
// ============================================================
// Drop-in auth gate for the standalone HTML tool pages
// (test-ai.html, sprint.html, technique.html, workout.html,
//  meetprep.html, pace.html).
//
// These tools live outside the React app, so the React-side
// <ClerkProvider> doesn't reach them. This script loads Clerk's
// vanilla JS SDK from their CDN and bounces any unauthenticated
// visitor to /sign-in. Authenticated users continue to the page
// as normal.
//
// Usage: include this script as the FIRST script tag in <head>:
//   <script src="/auth-guard.js"></script>
//
// The script hides the page (display:none on body) until auth is
// verified to prevent unauth content flashing on screen during
// the Clerk init handshake (~200ms typical).
// ============================================================

(function () {
  'use strict'

  // The Clerk publishable key. Same value as VITE_CLERK_PUBLISHABLE_KEY
  // used by the React app — publishable keys are safe to ship in client
  // code by design (they identify the Clerk frontend instance, not the
  // sensitive operations key).
  var PUBLISHABLE_KEY = 'pk_test_c2hhcnAtaG9uZXliZWUtNTcuY2xlcmsuYWNjb3VudHMuZGV2JA'

  // Sentinel URL — where to bounce unauthenticated users. Same path as
  // the React app's sign-in route so the experience is unified.
  var SIGN_IN_URL = '/sign-in'

  // Hide the page contents until auth resolves. Using a style block
  // injected at document head time so it applies before any body
  // contents render. Restored to 'visible' once the auth check passes.
  var hideStyle = document.createElement('style')
  hideStyle.id = 'auth-guard-hide'
  hideStyle.textContent = 'html, body { visibility: hidden !important; }'
  document.documentElement.appendChild(hideStyle)

  // Safety: if Clerk fails to load or hangs for any reason, fall back
  // to bouncing to sign-in after 8 seconds rather than leaving the user
  // staring at a blank page. Cleared once auth resolves.
  // Bumped from 5s to 8s — on slower connections / cold-start CDN, the
  // Clerk vanilla JS bundle takes 4-5s to actually initialize.
  console.log('[auth-guard] script start, path:', window.location.pathname)
  var failsafeBounce = setTimeout(function () {
    console.warn('[auth-guard] Clerk did not initialize within 8s, bouncing to sign-in.')
    redirectToSignIn()
  }, 8000)

  function redirectToSignIn() {
    var current = window.location.pathname + window.location.search
    var redirectParam = encodeURIComponent(current)
    window.location.href = SIGN_IN_URL + '?redirect_url=' + redirectParam
  }

  function reveal() {
    var el = document.getElementById('auth-guard-hide')
    if (el) el.remove()
  }

  // Load Clerk's vanilla JS SDK from their CDN, then init it.
  // The CDN URL is derived from the publishable key — Clerk hosts a
  // tenant-specific JS bundle keyed off the publishable key.
  function loadClerk() {
    // The frontend domain comes embedded in the publishable key (base64
    // payload). Clerk's official approach is to point the script at
    // their CDN with the publishable key as a data attribute and let it
    // resolve everything internally.
    var script = document.createElement('script')
    script.async = true
    // The Clerk JS bundle URL pattern. Their docs show using a CDN URL
    // like https://<frontend-api>/npm/@clerk/clerk-js@latest/dist/clerk.browser.js
    // but the simpler approach is the official CDN at clerk.com.
    // Frontend API host is encoded in the publishable key — we derive it.
    var frontendApi = parseFrontendApi(PUBLISHABLE_KEY)
    script.src = 'https://' + frontendApi + '/npm/@clerk/clerk-js@5/dist/clerk.browser.js'
    console.log('[auth-guard] Loading Clerk from:', script.src)
    script.setAttribute('data-clerk-publishable-key', PUBLISHABLE_KEY)
    script.crossOrigin = 'anonymous'
    script.onload = onClerkScriptLoaded
    script.onerror = function () {
      console.error('[auth-guard] Failed to load Clerk script from', script.src)
    }
    document.head.appendChild(script)
  }

  // The publishable key is base64-encoded JSON-ish that contains the
  // frontend API hostname. Decoding gives us the host to load Clerk from.
  // Format: "pk_test_<base64>" or "pk_live_<base64>"
  function parseFrontendApi(key) {
    try {
      var b64 = key.replace(/^pk_(test|live)_/, '')
      // Strip trailing '$' which Clerk uses as a terminator
      b64 = b64.replace(/\$$/, '')
      // base64 decode → "sharp-honeybee-57.clerk.accounts.dev"
      var decoded = atob(b64)
      return decoded
    } catch (e) {
      console.error('[auth-guard] Could not parse publishable key:', e)
      return 'clerk.accounts.dev' // fallback, won't actually work but won't crash
    }
  }

  function onClerkScriptLoaded() {
    console.log('[auth-guard] Clerk script loaded, window.Clerk =', !!window.Clerk)
    if (!window.Clerk) {
      console.error('[auth-guard] Clerk script loaded but window.Clerk is missing')
      return
    }
    window.Clerk.load({})
      .then(function () {
        console.log('[auth-guard] Clerk.load() resolved, user =', !!window.Clerk.user)
        clearTimeout(failsafeBounce)
        if (!window.Clerk.user) {
          console.warn('[auth-guard] No user session — bouncing to sign-in')
          redirectToSignIn()
          return
        }
        // Authenticated. Check role-based access for this specific tool.
        // Pages can opt-out of admin-only by setting <html data-allow-family="true">
        // — pace.html does this since it's part of the family Analysis flow.
        // All other tools are admin-only by default.
        var allowFamily = document.documentElement.getAttribute('data-allow-family') === 'true'

        // Temporary email allowlist mirroring the same fallback in App.jsx —
        // Clerk's dev-instance metadata editor is silently failing to persist
        // role values, so we identify the admin by primary email until that's
        // resolved. Keep this in sync with ADMIN_EMAILS in src/App.jsx.
        var ADMIN_EMAILS = ['chasekalisz@yahoo.com']
        var userEmail = ''
        try {
          userEmail = (window.Clerk.user.primaryEmailAddress &&
            window.Clerk.user.primaryEmailAddress.emailAddress || '').toLowerCase()
        } catch (e) {}
        var isAllowlistAdmin = ADMIN_EMAILS.indexOf(userEmail) !== -1

        var metaRole = (window.Clerk.user.publicMetadata &&
          window.Clerk.user.publicMetadata.role) || ''
        var isAdmin = isAllowlistAdmin || metaRole === 'admin'

        console.log('[auth-guard] email:', userEmail,
          '| isAllowlistAdmin:', isAllowlistAdmin,
          '| metaRole:', metaRole,
          '| isAdmin:', isAdmin,
          '| allowFamily:', allowFamily)

        if (!isAdmin && !allowFamily) {
          // Family user trying to access an admin-only tool — bounce them
          // back to the app root, which routes them to their athlete profile.
          console.warn('[auth-guard] Not admin, no family override — bouncing to /')
          window.location.href = '/'
          return
        }
        // Authorized — let the page render.
        reveal()
      })
      .catch(function (err) {
        console.error('[auth-guard] Clerk load failed:', err)
        clearTimeout(failsafeBounce)
        redirectToSignIn()
      })
  }

  // Kick off the load as soon as this script runs. Doesn't wait for
  // DOMContentLoaded — we want auth to be in flight while the rest of
  // the page parses.
  loadClerk()
})()

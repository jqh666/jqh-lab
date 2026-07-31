const TRACKER_SESSION_KEY = 'jqh_data_session_id'

function getSessionId() {
  const existing = localStorage.getItem(TRACKER_SESSION_KEY)
  if (existing) return existing

  const sessionId = window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  localStorage.setItem(TRACKER_SESSION_KEY, sessionId)
  return sessionId
}

function detectDevice() {
  const width = window.innerWidth || 0
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

function detectBrowser() {
  const ua = navigator.userAgent
  if (ua.includes('Edg/')) return 'Edge'
  if (ua.includes('Chrome/')) return 'Chrome'
  if (ua.includes('Firefox/')) return 'Firefox'
  if (ua.includes('Safari/')) return 'Safari'
  return 'Other'
}

function readUserRole(fallbackRole) {
  if (fallbackRole) return fallbackRole
  if (localStorage.getItem('jqh_token')) return 'admin'
  if (localStorage.getItem('jqh_guest') === 'true') return 'guest'
  return 'visitor'
}

export function trackEvent(eventType, payload = {}) {
  if (!eventType || import.meta.env.VITE_TRACKING_ENABLED === 'false') return

  const body = {
    eventType,
    pagePath: window.location.pathname,
    pageTitle: document.title,
    referrer: document.referrer,
    userRole: readUserRole(payload.userRole),
    deviceType: detectDevice(),
    browser: detectBrowser(),
    sessionId: getSessionId(),
    ...payload,
  }

  try {
    fetch('/api/data/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // Analytics should never break the user flow.
  }
}

export function trackPageView(path, title, userRole) {
  trackEvent('page_view', {
    pagePath: path,
    pageTitle: title,
    userRole,
  })
}

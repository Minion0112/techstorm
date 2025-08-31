"use client"

export function showMatrixLoader(durationMs = 1200) {
  try {
    const event = new CustomEvent("matrix:show", { detail: { durationMs } })
    window.dispatchEvent(event)
  } catch (e) {
    // no-op if window is unavailable (SSR) or CustomEvent not supported
  }
}

// Optional: specific semantic trigger for team joins
export function notifyTeamJoined(durationMs = 1400) {
  try {
    const event = new CustomEvent("team:joined", { detail: { durationMs } })
    window.dispatchEvent(event)
  } catch (e) {}
}

export function setMatrixLoaderPending() {
  try {
    localStorage.setItem("matrix_loader_pending", "1")
  } catch {
    // ignore storage errors
  }
}

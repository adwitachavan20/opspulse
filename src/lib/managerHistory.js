// src/lib/managerHistory.js
// Logs manager activity to sessionStorage so owner can review it

const HISTORY_KEY = 'ops_manager_history'
const MAX_ENTRIES = 100

export function logManagerActivity(type, detail) {
  try {
    const existing = getManagerHistory()
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type,   // 'login' | 'logout' | 'scenario_change' | 'alert_resolved' | 'data_upload' | 'war_room' | 'pdf_export'
      detail, // free-form string
    }
    const updated = [entry, ...existing].slice(0, MAX_ENTRIES)
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  } catch (_) {}
}

export function getManagerHistory() {
  try {
    return JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]')
  } catch (_) {
    return []
  }
}

export function clearManagerHistory() {
  sessionStorage.removeItem(HISTORY_KEY)
}
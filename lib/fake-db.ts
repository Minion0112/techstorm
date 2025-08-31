"use client"

export type User = {
  id: string
  name: string
  email: string
  avatar?: string
}

export type Profile = {
  userId: string
  handle: string
  bio?: string
}

export type Team = {
  id: string
  name: string
  code: string
  members: string[] // userIds
  createdAt: number
}

export type AppState = {
  user: User | null
  profile: Profile | null
  teams: Record<string, Team>
  memberships: Record<string, string[]> // userId -> teamIds
}

const STORAGE_KEY = "team_creator_state_v1"

function blank(): AppState {
  return { user: null, profile: null, teams: {}, memberships: {} }
}

function load(): AppState {
  if (typeof window === "undefined") return blank()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return blank()
    const parsed = JSON.parse(raw)
    return {
      user: parsed.user ?? null,
      profile: parsed.profile ?? null,
      teams: parsed.teams ?? {},
      memberships: parsed.memberships ?? {},
    }
  } catch {
    return blank()
  }
}

function save(next: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  // broadcast to other tabs/components
  try {
    localStorage.setItem(STORAGE_KEY + "_ping", String(Date.now()))
  } catch {}
}

export function getAppState(): AppState {
  return load()
}

export function setAppState(updater: (prev: AppState) => AppState): AppState {
  const prev = load()
  const next = updater(prev)
  save(next)
  return next
}

export function resetAppState() {
  save(blank())
}

export function makeId(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 10)
}

export function generateTeamCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

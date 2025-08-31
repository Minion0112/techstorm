"use client"

import * as React from "react"
import useSWR, { mutate as globalMutate } from "swr"
import {
  type AppState,
  getAppState,
  setAppState,
  makeId,
  generateTeamCode,
  type Team,
  type User,
  type Profile,
} from "@/lib/fake-db"

const KEY = "team-app-state"

const fetcher = async (): Promise<AppState> => getAppState()

export function useAppState() {
  const { data, mutate } = useSWR<AppState>(KEY, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith("team_creator_state_v1")) {
        globalMutate(KEY, getAppState(), false)
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  async function signInWithGoogleSim() {
    const fakeUser: User = {
      id: makeId("usr_"),
      name: "Neo",
      email: `neo.${makeId().slice(0, 4)}@matrix.dev`,
    }
    const next = setAppState((prev) => ({ ...prev, user: fakeUser, profile: null }))
    await mutate(next, false)
    return next.user
  }

  async function signOut() {
    const next = setAppState((prev) => ({ ...prev, user: null, profile: null }))
    await mutate(next, false)
  }

  async function completeProfile(input: { handle: string; bio?: string }) {
    const state = getAppState()
    if (!state.user) throw new Error("No user")
    const profile: Profile = { userId: state.user.id, handle: input.handle, bio: input.bio }
    const next = setAppState((prev) => ({ ...prev, profile }))
    await mutate(next, false)
    return profile
  }

  async function createTeam(name: string) {
    const state = getAppState()
    if (!state.user) throw new Error("No user")
    const id = makeId("team_")
    const code = generateTeamCode()
    const team: Team = {
      id,
      name,
      code,
      members: [state.user.id],
      createdAt: Date.now(),
    }
    const memberships = { ...state.memberships }
    memberships[state.user.id] = Array.from(new Set([...(memberships[state.user.id] ?? []), id]))
    const next = setAppState((prev) => ({
      ...prev,
      teams: { ...prev.teams, [id]: team },
      memberships,
    }))
    await mutate(next, false)
    return team
  }

  async function joinTeamByCode(code: string) {
    const state = getAppState()
    if (!state.user) throw new Error("No user")
    const team = Object.values(state.teams).find((t) => t.code === code.toUpperCase())
    if (!team) throw new Error("Team not found")
    if (!team.members.includes(state.user.id)) {
      team.members = [...team.members, state.user.id]
    }
    const memberships = { ...state.memberships }
    memberships[state.user.id] = Array.from(new Set([...(memberships[state.user.id] ?? []), team.id]))
    const next = setAppState((prev) => ({
      ...prev,
      teams: { ...prev.teams, [team.id]: team },
      memberships,
    }))
    await mutate(next, false)
    return team
  }

  // For demo: simulate another teammate joining to trigger animation
  async function simulateTeammateJoin(teamId: string) {
    const state = getAppState()
    const team = state.teams[teamId]
    if (!team) throw new Error("Team not found")
    const otherUserId = makeId("usr_")
    team.members = [...team.members, otherUserId]
    const next = setAppState((prev) => ({
      ...prev,
      teams: { ...prev.teams, [teamId]: team },
    }))
    await mutate(next, false)
    return team
  }

  return {
    state: data ?? getAppState(),
    actions: {
      signInWithGoogleSim,
      signOut,
      completeProfile,
      createTeam,
      joinTeamByCode,
      simulateTeammateJoin,
    },
  }
}

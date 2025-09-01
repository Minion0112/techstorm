'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function DashboardPage() {
  const router = useRouter()
  const [teamName, setTeamName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [teams, setTeams] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(profileData);

        const { data: teamsData } = await supabase.from('v_user_teams').select('*');
        setTeams(teamsData || []);
      }
    };
    getData();
  }, [supabase]);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const name = teamName.trim()
    if (!name) return
    
    const { data: newTeam, error } = await supabase.rpc('create_team_with_owner', { p_name: name });

    if (error) {
        console.error('[v0] create error:', error);
        return;
    }

    router.push(`/team/${newTeam.id}`);
  }

  async function onJoin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const code = joinCode.trim()
    if (!code) return
    
    const { data: joinedTeam, error } = await supabase.rpc('join_team_by_code', { p_join_code: code });

    if (error) {
        console.error('[v0] join error:', error);
        return;
    }

    router.push(`/team/${joinedTeam.id}`);
  }

  return (
    <main className="min-h-dvh text-white  relative z-10 ">
      <div className="mx-auto max-w-3xl px-6 py-12 space-y-10">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl text-balance">
              Welcome{profile?.display_name ? `, ${profile.display_name}` : ''}{' '}
              <span className="text-white/50">@{profile?.handle}</span>
            </h1>
            <Button
                className="bg-black text-white border border-white hover:bg-white hover:text-black"
                onClick={async () => {
                    await supabase.auth.signOut();
                    router.push('/');
                }}
            >
                Sign out
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-black border border-white">
            <CardHeader>
              <CardTitle>Create a team</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onCreate} className="space-y-4">
                <Input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Team name"
                  className="bg-black text-white border-white placeholder:text-white/40"
                />
                <Button
                  className="w-full bg-white text-black hover:bg-black hover:text-white border border-white"
                  type="submit"
                >
                  Create
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-black border border-white">
            <CardHeader>
              <CardTitle>Join a team</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onJoin} className="space-y-4">
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Join code"
                  className="bg-black text-white border-white placeholder:text-white/40 uppercase"
                />
                <Button
                  className="w-full bg-white text-black hover:bg-black hover:text-white border border-white"
                  type="submit"
                >
                  Join
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg">Your teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.length > 0 ? (
              teams.map((t) => (
                <Link
                  key={t.id}
                  href={`/team/${t.id}`}
                  className="block border border-white p-4 hover:bg-white hover:text-black transition"
                >
                  <div className="flex items-center justify-between">
                    <span>{t.name}</span>
                    <span className="text-xs">Code: {t.code}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-white/60 text-sm">You’re not in any teams yet.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

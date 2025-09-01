'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import FuzzyText from '@/components/transitions/glitch'
import ElectricBorder from '@/components/transitions/electric-grid'
import ProfileCard from '@/components/transitions/profile'
import { toast } from 'sonner'

export default function DashboardPage() {
  const router = useRouter()
  const [teamName, setTeamName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [team, setTeam] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(true)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(profileData);

        const { data: teamsData } = await supabase.from('v_user_teams').select('*');
        if (teamsData && teamsData.length > 0) {
            const currentTeam = teamsData[0];
            setTeam(currentTeam);
            
            const { data: membersData } = await supabase.rpc('get_team_members', { p_team_id: currentTeam.id });
            setMembers(membersData || []);
        }
      }
    };
    getData();
  }, [supabase, team]);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const name = teamName.trim()
    if (!name) return
    
    const { data: newTeam, error } = await supabase.rpc('create_team_with_owner', { p_name: name });

    if (error) {
        console.error('[v0] create error:', error);
        toast.error(error.message);
        return;
    }

    setTeam(newTeam);
  }

  async function onJoin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const code = joinCode.trim()
    if (!code) return
    
    const { data: joinedTeam, error } = await supabase.rpc('join_team_by_code', { p_join_code: code });

    if (error) {
        console.error('[v0] join error:', error);
        toast.error(error.message);
        return;
    }

    setTeam(joinedTeam);
  }

  async function onLeave() {
      if (!team) return;
      await supabase.rpc('leave_team', { p_team_id: team.id });
      setTeam(null);
      setMembers([]);
  }

  const blackAndWhiteBehindGradient = 'radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(0,80%,70%,var(--card-opacity)) 4%,hsla(0,60%,50%,calc(var(--card-opacity)*0.75)) 10%,hsla(0,40%,30%,calc(var(--card-opacity)*0.5)) 50%,hsla(0,0%,0%,0) 100%)';
  const blackAndWhiteInnerGradient = '';

  return (
    <main className="min-h-dvh text-white relative z-10">
      <div className="mx-auto max-w-6xl px-6 py-12 space-y-10">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
            <div className="space-y-8">
                {team ? (
                    <div className="space-y-8">
                        <div className="border border-white p-6">
                            <h3 className="text-xl mb-4">Team: {team.name}</h3>
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-white/50">
                                    {team.is_finalized ? 'Finalized' : `Join Code: ${team.join_code}`}
                                </p>
                                {!team.is_finalized && (
                                    <Button
                                        className="bg-black text-white border border-white hover:bg-white hover:text-black"
                                        onClick={() => navigator.clipboard.writeText(team.join_code)}
                                    >
                                        Copy
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="border border-white p-6">
                            <h3 className="text-xl mb-4">Team Members</h3>
                            <ul className="space-y-3">
                                {members.map(member => (
                                    <li key={member.handle} className="flex justify-between items-center">
                                        <div>
                                            <p>{member.display_name}</p>
                                            <p className="text-sm text-white/50">@{member.handle}</p>
                                        </div>
                                        <span className="text-xs px-2 py-1 border border-white rounded-full">{member.role}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={onLeave} className="w-full bg-transparent text-white border border-white hover:bg-white hover:text-black">
                                Leave Team
                            </Button>
                            {user && team && user.id === team.owner_id && !team.is_finalized && (
                                <Button
                                    className="w-full  text-white "
                                    onClick={async () => {
                                        const { error } = await supabase.rpc('finalize_team', { p_team_id: team.id });
                                        if (error) {
                                            toast.error(error.message);
                                        } else {
                                            // Refresh data
                                            const { data: teamData } = await supabase
                                                .from('teams')
                                                .select('*')
                                                .eq('id', team.id)
                                                .single();
                                            setTeam(teamData);
                                        }
                                    }}
                                    disabled={members.length < 1 || members.length > 5}
                                >
                                    Finalize Team
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="inline-flex border border-white p-1">
                                <Button onClick={() => setShowCreate(true)} className={`px-6 py-2 ${showCreate ? 'bg-white text-black' : 'bg-black text-white'}`}>Create</Button>
                                <Button onClick={() => setShowCreate(false)} className={`px-6 py-2 ${!showCreate ? 'bg-white text-black' : 'bg-black text-white'}`}>Join</Button>
                            </div>
                        </div>

                            <div className="p-8">
                                {showCreate ? (
                                    <form onSubmit={onCreate} className="space-y-4">
                                        <div className="-ml-13">
                                                  <FuzzyText fontSize="1.5rem" fontFamily="monospace" enableHover={false}>Create a new team</FuzzyText>
                                        </div>
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
                                ) : (
                                    <form onSubmit={onJoin} className="space-y-4">
                                                  <div className="-ml-13">
                                        
                                        <FuzzyText fontSize="1.5rem" fontFamily="monospace">Join an existing team</FuzzyText>
                                        </div>
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
                                )}
                            </div>
                    </div>
                )}
            </div>
            <div className="flex items-center justify-center">
                {profile && (
                    <ProfileCard
                        avatarUrl='./trp.png'
                        miniAvatarUrl='./placeholder-user.jpg'
                        name={profile.display_name}
                        title={team ? team.name : "No Team"}
                        handle={profile.handle}
                        status={team ? team.role : "Unassigned"}
                        behindGradient={blackAndWhiteBehindGradient}
                        innerGradient={blackAndWhiteInnerGradient}
                        showUserInfo={true}
                        contactText={team ? (team.is_finalized ? 'Finalized' : `Code: ${team.join_code}`) : "No Team"}
                        onContactClick={() => {
                            if (team && !team.is_finalized) {
                                navigator.clipboard.writeText(team.join_code)
                            }
                        }}
                    />
                )}
            </div>
        </div>
      </div>
    </main>
  )
}

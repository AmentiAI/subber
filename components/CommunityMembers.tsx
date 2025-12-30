"use client"

import { useEffect, useState } from "react"
import { Users, Search, Shield, UserCheck, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Member {
  id: string
  userId: string
  role: string
  joinedAt: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    profilePicture: string | null
  }
}

interface CommunityMembersProps {
  communitySlug: string
}

export function CommunityMembers({ communitySlug }: CommunityMembersProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetch(`/api/communities/${communitySlug}/members`)
      .then((res) => res.json())
      .then((data) => {
        setMembers(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [communitySlug])

  const filteredMembers = members.filter((member) => {
    const name = member.user.name || member.user.email
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4 text-red-500" />
      case "moderator":
        return <UserCheck className="h-4 w-4 text-blue-500" />
      default:
        return <User className="h-4 w-4 text-slate-400" />
    }
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
      moderator: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
      member: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
    }
    return styles[role as keyof typeof styles] || styles.member
  }

  if (loading) {
    return (
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const roleCounts = members.reduce(
    (acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Members</h2>
              <p className="text-white/80 text-sm">{members.length} total members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {roleCounts.admin || 0}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Admins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {roleCounts.moderator || 0}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Moderators</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {roleCounts.member || 0}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Members</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Members List */}
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              {searchQuery ? "No members found" : "No members yet"}
            </p>
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div
              key={member.id}
              className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {(member.user.profilePicture || member.user.image) ? (
                    <img
                      src={member.user.profilePicture || member.user.image || ""}
                      alt={member.user.name || "User"}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {(member.user.name || member.user.email)[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {member.user.name || "Anonymous"}
                      </h3>
                      {getRoleIcon(member.role)}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {member.user.email}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(
                    member.role
                  )}`}
                >
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}


"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { CommunityTabs } from "@/components/CommunityTabs"
import { Users, MessageSquare } from "lucide-react"
import { useWalletAuth } from "@/hooks/useWalletAuth"

interface Community {
  id: string
  name: string
  slug: string
  description: string | null
  isMember: boolean
  _count: {
    members: number
    posts: number
  }
}

export default function CommunityPage() {
  const params = useParams()
  const [community, setCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    if (params.slug) {
      fetch(`/api/communities/${params.slug}`)
        .then((res) => res.json())
        .then((data) => {
          setCommunity(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [params.slug])

  const { connected, address, getAuthHeaders } = useWalletAuth()

  const handleJoin = async () => {
    if (!connected || !address) {
      alert("Please connect your wallet to join communities")
      return
    }

    setJoining(true)
    try {
      const res = await fetch(`/api/communities/${params.slug}/join`, {
        method: "POST",
        headers: getAuthHeaders(),
      })

      if (res.ok) {
        setCommunity((prev) => prev && { ...prev, isMember: true })
      } else {
        const error = await res.json()
        alert(error.error || "Failed to join community")
      }
    } catch (err) {
      console.error("Failed to join community")
      alert("Failed to join community")
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-8" />
        </div>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Community not found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The community you're looking for doesn't exist.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Community Header */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
          <div className="px-6 pb-6 -mt-16">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="flex items-end space-x-4">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800">
                  <Users className="h-12 w-12 text-white" />
                </div>
                <div className="pb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {community.name}
                  </h1>
                  {community.description && (
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
                      {community.description}
                    </p>
                  )}
                </div>
              </div>
              
              {!community.isMember && (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {joining ? "Joining..." : "Join Community"}
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-6 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{community._count.members}</p>
                  <p className="text-sm">Members</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{community._count.posts}</p>
                  <p className="text-sm">Posts</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs with Content */}
        <CommunityTabs communitySlug={community.slug} isMember={community.isMember} />
      </div>
    </div>
  )
}


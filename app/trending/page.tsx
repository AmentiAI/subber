"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { TrendingUp, MessageSquare, Users, UserPlus, ArrowRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface TrendingCommunity {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  createdAt: string
  _count: {
    members: number
    posts: number
  }
  newMembers24h: number
}

export default function TrendingPage() {
  const [communities, setCommunities] = useState<TrendingCommunity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/communities/trending")
      .then((res) => res.json())
      .then((data) => {
        setCommunities(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Trending Communities
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Communities with 10+ new members in 24 hours or 20+ total members
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : communities.length === 0 ? (
        <div className="text-center py-12">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No Trending Communities
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            No communities have gained 10+ new members in the last 24 hours.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <Link
              key={community.id}
              href={`/communities/${community.slug}`}
              className="block bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 shadow-lg hover:shadow-2xl transition-all overflow-hidden group"
            >
              {/* Community Image/Banner */}
              {community.image ? (
                <div className="h-32 overflow-hidden">
                  <img
                    src={community.image}
                    alt={community.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
              )}

              <div className="p-6">
                {/* Community Name */}
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    r/{community.name}
                  </h2>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100" />
                </div>

                {/* Description */}
                {community.description && (
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                    {community.description}
                  </p>
                )}

                {/* Trending Badge */}
                <div className="mb-4">
                  <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full text-sm font-semibold">
                    <UserPlus className="h-4 w-4" />
                    <span>+{community.newMembers24h} new members</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {community._count.members}
                    </span>
                    <span>members</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <MessageSquare className="h-4 w-4" />
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {community._count.posts}
                    </span>
                    <span>posts</span>
                  </div>
                </div>

                {/* Created Date */}
                <div className="mt-3 text-xs text-slate-500 dark:text-slate-500">
                  Created {formatDistanceToNow(new Date(community.createdAt), { addSuffix: true })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}


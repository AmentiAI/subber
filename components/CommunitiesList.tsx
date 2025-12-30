"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Users, MessageSquare, TrendingUp, ArrowRight } from "lucide-react"

interface Community {
  id: string
  name: string
  slug: string
  description: string | null
  _count: {
    members: number
    posts: number
  }
}

export function CommunitiesList() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/communities")
      .then((res) => res.json())
      .then((data) => {
        setCommunities(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-2xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse"
          >
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (communities.length === 0) {
    return (
      <div className="text-center py-16 bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            No communities yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Be the first to create a community and start connecting with others!
          </p>
          <Link
            href="/communities/new"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <span>Create Community</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {communities.map((community, index) => {
        const isTrending = index < 3 && community._count.members > 0
        return (
          <Link
            key={community.id}
            href={`/communities/${community.slug}`}
            className="group bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 shadow-lg hover:shadow-2xl transition-all p-6 block relative overflow-hidden"
          >
            {isTrending && (
              <div className="absolute top-4 right-4 flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-semibold rounded-full">
                <TrendingUp className="h-3 w-3" />
                <span>Trending</span>
              </div>
            )}
            
            <div className="mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {community.name}
              </h2>
              {community.description && (
                <p className="text-slate-600 dark:text-slate-400 line-clamp-2 text-sm">
                  {community.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{community._count.members}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-medium">{community._count.posts}</span>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        )
      })}
    </div>
  )
}


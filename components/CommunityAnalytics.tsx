"use client"

import { useEffect, useState } from "react"
import { BarChart3, TrendingUp, Users, MessageSquare, Eye, Calendar } from "lucide-react"

interface Analytics {
  totalMembers: number
  totalPosts: number
  totalComments: number
  totalViews: number
  growthRate: number
  recentActivity: Array<{
    date: string
    newMembers: number
    newPosts: number
    newComments: number
    views: number
  }>
}

interface CommunityAnalyticsProps {
  communitySlug: string
}

export function CommunityAnalytics({ communitySlug }: CommunityAnalyticsProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/communities/${communitySlug}/analytics`)
      .then((res) => res.json())
      .then((data) => {
        setAnalytics(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [communitySlug])

  if (loading) {
    return (
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
        <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">No analytics data available</p>
      </div>
    )
  }

  const stats = [
    {
      label: "Total Members",
      value: analytics.totalMembers ?? 0,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Total Posts",
      value: analytics.totalPosts ?? 0,
      icon: MessageSquare,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      label: "Total Comments",
      value: analytics.totalComments ?? 0,
      icon: MessageSquare,
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-100 dark:bg-pink-900/30",
    },
    {
      label: "Total Views",
      value: analytics.totalViews ?? 0,
      icon: Eye,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Community Analytics</h2>
              <p className="text-white/80 text-sm">Track your community's growth and engagement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                </div>
                {stat.label === "Total Members" && (analytics.growthRate ?? 0) > 0 && (
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-semibold">+{analytics.growthRate ?? 0}%</span>
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                {(stat.value ?? 0).toLocaleString()}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Activity Chart */}
      {analytics.recentActivity && analytics.recentActivity.length > 0 && (
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
          <div className="flex items-center space-x-2 mb-6">
            <Calendar className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {analytics.recentActivity.slice(0, 7).map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {new Date(activity.date).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                  <span>{activity.newMembers ?? 0} members</span>
                  <span>{activity.newPosts ?? 0} posts</span>
                  <span>{activity.newComments ?? 0} comments</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


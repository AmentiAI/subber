"use client"

import { useEffect, useState } from "react"
import { UserPlus, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface Activity {
  id: string
  type: string
  userId: string
  userName: string
  userEmail: string
  userProfilePicture: string | null
  role: string
  joinedAt: string
}

interface CommunityActivityProps {
  communitySlug: string
}

export function CommunityActivity({ communitySlug }: CommunityActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/communities/${communitySlug}/activity`)
      .then((res) => res.json())
      .then((data) => {
        setActivities(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        setActivities([])
        setLoading(false)
      })
  }, [communitySlug])

  if (loading) {
    return (
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <UserPlus className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            <p className="text-white/80 text-sm">Users who recently joined</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <UserPlus className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <Link
              key={activity.id}
              href={`/users/${activity.userId}`}
              className="block px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                {activity.userProfilePicture ? (
                  <img
                    src={activity.userProfilePicture}
                    alt={activity.userName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {activity.userName[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {activity.userName}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {activity.role}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <UserPlus className="h-3 w-3 text-slate-400" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Joined {formatDistanceToNow(new Date(activity.joinedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <Calendar className="h-4 w-4 text-slate-400" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}


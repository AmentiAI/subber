"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { MessageSquare, UserPlus, UserMinus, Calendar, MapPin, Globe, ExternalLink } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { useWalletAuth } from "@/hooks/useWalletAuth"

interface PortfolioItem {
  id: string
  title: string
  description: string | null
  image: string | null
  link: string | null
  tags: string[] | null
  order: number
}

interface UserProfile {
  id: string
  name: string | null
  email: string
  bio: string | null
  image: string | null
  profilePicture: string | null
  bannerImage: string | null
  location: string | null
  website: string | null
  walletAddress?: string | null
  createdAt: string
  _count: {
    posts: number
    comments: number
    followers: number
    following: number
  }
  isFollowing: boolean
  isOwnProfile?: boolean
}

export default function UserProfilePage() {
  const params = useParams()
  const { getAuthHeaders, user: currentUser } = useWalletAuth()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])

  useEffect(() => {
    if (params.id) {
      fetch(`/api/users/${params.id}`, {
        headers: getAuthHeaders(),
      })
        .then((res) => res.json())
        .then((data) => {
          setUser(data)
          setFollowing(data.isFollowing || false)
          setLoading(false)
        })
        .catch(() => setLoading(false))
      
      // Fetch portfolio
      fetch(`/api/portfolio?userId=${params.id}`)
        .then((res) => res.json())
        .then((data) => setPortfolio(Array.isArray(data) ? data : []))
        .catch(() => setPortfolio([]))
    }
  }, [params.id, getAuthHeaders])

  const handleFollow = async () => {
    if (!user) return
    
    try {
      const res = await fetch(`/api/users/${user.id}/follow`, {
        method: following ? "DELETE" : "POST",
        headers: getAuthHeaders(),
      })

      if (res.ok) {
        setFollowing(!following)
        if (user) {
          setUser({
            ...user,
            _count: {
              ...user._count,
              followers: following ? user._count.followers - 1 : user._count.followers + 1,
            },
          })
        }
      }
    } catch (error) {
      console.error("Failed to follow/unfollow")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="animate-pulse">
              <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-6" />
              <div className="h-48 bg-white dark:bg-slate-800 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center py-16">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                User not found
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                The user you're looking for doesn't exist.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const profilePic = user.profilePicture || user.image
  // Use wallet address or email as fallback if name is not set
  const displayName = user.name || (user.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : user.email?.split('@')[0] || "User")
  const initials = displayName[0]?.toUpperCase() || "U"
  const isOwnProfile = user.isOwnProfile || (currentUser && currentUser.id === user.id)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Banner Section */}
        <div className="relative h-64 rounded-2xl overflow-hidden mb-4 shadow-xl">
          {user.bannerImage ? (
            <img
              src={user.bannerImage}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
          <div className="px-6 pb-6 -mt-20">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              {/* Profile Picture */}
              <div className="relative">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt={displayName}
                    className="w-32 h-32 rounded-2xl border-4 border-white dark:border-slate-800 shadow-xl object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-2xl border-4 border-white dark:border-slate-800 shadow-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                    {initials}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {!isOwnProfile && (
                <div className="flex items-center gap-3">
                  <Link
                    href={`/messages?user=${user.id}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-all font-semibold shadow-sm hover:shadow-md"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Message</span>
                  </Link>
                  <button
                    onClick={handleFollow}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
                      following
                        ? "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                    }`}
                  >
                    {following ? (
                      <>
                        <UserMinus className="h-4 w-4" />
                        <span>Unfollow</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              )}
              {isOwnProfile && (
                <div className="flex items-center gap-3">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl"
                  >
                    <span>Edit Profile</span>
                  </Link>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="space-y-4">
              {/* Name and Bio */}
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {displayName}
                </h1>
                {user.bio && (
                  <p className="text-slate-600 dark:text-slate-400">
                    {user.bio}
                  </p>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                {user.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    <span>{user.website.replace(/^https?:\/\//, "")}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {user._count.posts}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {user._count.followers}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {user._count.following}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Following</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Section */}
        {portfolio.length > 0 && (
          <div className="mt-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Portfolio</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {item.image && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <span>View Project</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

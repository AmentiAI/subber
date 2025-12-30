"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { UserPlus, UserMinus, MessageSquare, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useWalletAuth } from "@/hooks/useWalletAuth"

interface User {
  id: string
  name: string | null
  email: string
  profilePicture: string | null
  bannerImage: string | null
  bio: string | null
  location: string | null
  website: string | null
  createdAt: string
  _count: {
    posts: number
    followers: number
    following: number
  }
}

export default function QuickAddPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasMore: false,
  })
  const [following, setFollowing] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchUsers()
  }, [page])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/users/list?page=${page}&limit=20`)
      const data = await res.json()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const { connected, address, getAuthHeaders } = useWalletAuth()

  const handleFollow = async (userId: string) => {
    if (!connected || !address) {
      alert("Please connect your wallet to follow users")
      return
    }

    const isFollowing = following.has(userId)
    
    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
        headers: getAuthHeaders(),
      })

      if (res.ok) {
        const newFollowing = new Set(following)
        if (isFollowing) {
          newFollowing.delete(userId)
        } else {
          newFollowing.add(userId)
        }
        setFollowing(newFollowing)
        
        // Update follower count in UI
        setUsers(users.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                _count: { 
                  ...user._count, 
                  followers: isFollowing ? user._count.followers - 1 : user._count.followers + 1 
                } 
              }
            : user
        ))
      }
    } catch (error) {
      console.error("Failed to follow/unfollow")
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Quick Add
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Discover and connect with users. View profiles, follow, and start conversations.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
              <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">
            No users found. Be the first to join!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {users.map((user) => {
              const isFollowingUser = following.has(user.id)
              const displayName = user.name || "Anonymous"
              const initials = displayName[0].toUpperCase()
              const profilePic = user.profilePicture

              return (
                <div
                  key={user.id}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all"
                >
                  {/* Banner */}
                  {user.bannerImage ? (
                    <div className="h-24 overflow-hidden">
                      <img
                        src={user.bannerImage}
                        alt="Banner"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
                  )}

                  <div className="px-4 pb-4 -mt-12">
                    {/* Profile Picture */}
                    <div className="relative mb-4">
                      {profilePic ? (
                        <img
                          src={profilePic}
                          alt={displayName}
                          className="w-20 h-20 rounded-xl border-4 border-white dark:border-slate-800 shadow-lg object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl border-4 border-white dark:border-slate-800 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                          {initials}
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="mb-4">
                      <Link
                        href={`/users/${user.id}`}
                        className="block group"
                      >
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {displayName}
                        </h3>
                        {user.bio && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                            {user.bio}
                          </p>
                        )}
                      </Link>
                      
                      {user.location && (
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {user.location}
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                      <div className="text-center">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {user._count.posts}
                        </div>
                        <div>Posts</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {user._count.followers}
                        </div>
                        <div>Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {user._count.following}
                        </div>
                        <div>Following</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleFollow(user.id)}
                        className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                          isFollowingUser
                            ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600"
                            : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg"
                        }`}
                      >
                        {isFollowingUser ? (
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
                      <Link
                        href={`/messages?user=${user.id}`}
                        className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        title="Message"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/users/${user.id}`}
                        className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        title="View Profile"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
              
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Page {page} of {pagination.totalPages}
              </div>
              
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={!pagination.hasMore}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}


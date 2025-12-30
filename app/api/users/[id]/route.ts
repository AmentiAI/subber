import { NextResponse } from "next/server"
import { query, getCurrentUser } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get current user if authenticated (may be null if not connected)
    let currentUser = null
    try {
      currentUser = await getCurrentUser(request)
    } catch {
      // User not authenticated, that's okay
      currentUser = null
    }

    // Get user
    const userResult = await query(
      'SELECT * FROM "User" WHERE id = $1',
      [id]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const user = userResult.rows[0]

    // Get counts
    const [postsCount, commentsCount, followersCount, followingCount] = await Promise.all([
      query('SELECT COUNT(*) as count FROM "Post" WHERE "authorId" = $1', [id]),
      query('SELECT COUNT(*) as count FROM "Comment" WHERE "authorId" = $1', [id]),
      query('SELECT COUNT(*) as count FROM "Follow" WHERE "followingId" = $1', [id]),
      query('SELECT COUNT(*) as count FROM "Follow" WHERE "followerId" = $1', [id]),
    ])

    // Check if current user is viewing their own profile
    const isOwnProfile = currentUser && currentUser.id === id

    // Check if following (only if not own profile and current user exists)
    let isFollowing = false
    if (currentUser && !isOwnProfile) {
      const followResult = await query(
        'SELECT * FROM "Follow" WHERE "followerId" = $1 AND "followingId" = $2',
        [currentUser.id, id]
      )
      isFollowing = followResult.rows.length > 0
    }

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      image: user.image,
      profilePicture: user.profilePicture,
      bannerImage: user.bannerImage,
      location: user.location,
      website: user.website,
      walletAddress: user.walletAddress,
      createdAt: user.createdAt,
      _count: {
        posts: parseInt(postsCount.rows[0].count) || 0,
        comments: parseInt(commentsCount.rows[0].count) || 0,
        followers: parseInt(followersCount.rows[0].count) || 0,
        following: parseInt(followingCount.rows[0].count) || 0,
      },
      isFollowing,
      isOwnProfile,
    }

    return NextResponse.json(userProfile)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}


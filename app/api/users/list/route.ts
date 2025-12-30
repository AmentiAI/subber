import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    // Get total count
    const countResult = await query('SELECT COUNT(*) as count FROM "User"')
    const total = parseInt(countResult.rows[0].count) || 0

    // Get users with pagination
    const usersResult = await query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u."profilePicture",
        u."bannerImage",
        u.bio,
        u.location,
        u.website,
        u."createdAt",
        COUNT(DISTINCT p.id) as post_count,
        COUNT(DISTINCT f1.id) as follower_count,
        COUNT(DISTINCT f2.id) as following_count
      FROM "User" u
      LEFT JOIN "Post" p ON u.id = p."authorId"
      LEFT JOIN "Follow" f1 ON u.id = f1."followingId"
      LEFT JOIN "Follow" f2 ON u.id = f2."followerId"
      GROUP BY u.id
      ORDER BY u."createdAt" DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    const users = usersResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      profilePicture: row.profilePicture,
      bannerImage: row.bannerImage,
      bio: row.bio,
      location: row.location,
      website: row.website,
      createdAt: row.createdAt,
      _count: {
        posts: parseInt(row.post_count) || 0,
        followers: parseInt(row.follower_count) || 0,
        following: parseInt(row.following_count) || 0,
      },
    }))

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}


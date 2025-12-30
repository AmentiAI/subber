import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Get community
    const communityResult = await query(
      'SELECT id FROM "Community" WHERE slug = $1',
      [slug]
    )

    if (communityResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      )
    }

    const communityId = communityResult.rows[0].id

    // Get total counts
    const [membersResult, postsResult, commentsResult] = await Promise.all([
      query('SELECT COUNT(*) as count FROM "CommunityMember" WHERE "communityId" = $1', [communityId]),
      query('SELECT COUNT(*) as count FROM "Post" WHERE "communityId" = $1', [communityId]),
      query(
        `SELECT COUNT(*) as count 
         FROM "Comment" c
         INNER JOIN "Post" p ON c."postId" = p.id
         WHERE p."communityId" = $1`,
        [communityId]
      ),
    ])

    const totalMembers = parseInt(membersResult.rows[0].count) || 0
    const totalPosts = parseInt(postsResult.rows[0].count) || 0
    const totalComments = parseInt(commentsResult.rows[0].count) || 0

    // Get recent activity (last 30 days)
    const activityResult = await query(
      `SELECT 
        DATE("createdAt") as date,
        COUNT(DISTINCT CASE WHEN "joinedAt"::date = DATE("createdAt") THEN id END) as new_members,
        COUNT(DISTINCT CASE WHEN p."createdAt"::date = DATE("createdAt") THEN p.id END) as new_posts,
        COUNT(DISTINCT CASE WHEN c."createdAt"::date = DATE("createdAt") THEN c.id END) as new_comments
      FROM "CommunityMember" cm
      LEFT JOIN "Post" p ON p."communityId" = cm."communityId"
      LEFT JOIN "Comment" c ON c."postId" = p.id
      WHERE cm."communityId" = $1
        AND cm."createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
      LIMIT 30`,
      [communityId]
    )

    // Calculate growth rate (simplified)
    const growthRate = totalMembers > 0 ? Math.min(100, Math.round((totalPosts / totalMembers) * 10)) : 0

    const analytics = {
      totalMembers,
      totalPosts,
      totalComments,
      totalViews: 0, // Placeholder
      growthRate,
      recentActivity: activityResult.rows.map((row: any) => ({
        date: row.date,
        newMembers: parseInt(row.new_members) || 0,
        newPosts: parseInt(row.new_posts) || 0,
        newComments: parseInt(row.new_comments) || 0,
        views: 0,
      })),
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}


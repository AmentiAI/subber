import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Get communities with 10+ new members in the last 24 hours OR 20+ total members
    const result = await query(`
      SELECT 
        c.*,
        COUNT(DISTINCT cm."userId") as total_member_count,
        COUNT(DISTINCT CASE 
          WHEN cm."joinedAt" >= NOW() - INTERVAL '24 hours' 
          THEN cm."userId" 
        END) as new_members_24h,
        COUNT(DISTINCT p.id) as post_count
      FROM "Community" c
      LEFT JOIN "CommunityMember" cm ON c.id = cm."communityId"
      LEFT JOIN "Post" p ON c.id = p."communityId"
      GROUP BY c.id
      HAVING 
        COUNT(DISTINCT CASE 
          WHEN cm."joinedAt" >= NOW() - INTERVAL '24 hours' 
          THEN cm."userId" 
        END) >= 10
        OR COUNT(DISTINCT cm."userId") > 20
      ORDER BY 
        CASE 
          WHEN COUNT(DISTINCT CASE 
            WHEN cm."joinedAt" >= NOW() - INTERVAL '24 hours' 
            THEN cm."userId" 
          END) >= 10 THEN 1
          ELSE 2
        END,
        new_members_24h DESC,
        total_member_count DESC,
        c."createdAt" DESC
    `)

    const communities = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      image: row.image,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      _count: {
        members: parseInt(row.total_member_count) || 0,
        posts: parseInt(row.post_count) || 0,
      },
      newMembers24h: parseInt(row.new_members_24h) || 0,
    }))

    return NextResponse.json(communities)
  } catch (error) {
    console.error("Error fetching trending communities:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch trending communities",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}


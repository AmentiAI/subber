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

    // Get recent join activity (last 50 joins)
    const activityResult = await query(
      `SELECT 
        cm.id,
        cm."joinedAt",
        u.id as "userId",
        u.name,
        u.email,
        u."profilePicture",
        cm.role
      FROM "CommunityMember" cm
      INNER JOIN "User" u ON cm."userId" = u.id
      WHERE cm."communityId" = $1
      ORDER BY cm."joinedAt" DESC
      LIMIT 50`,
      [communityId]
    )

    const activities = activityResult.rows.map((row: any) => ({
      id: row.id,
      type: "join",
      userId: row.userId,
      userName: row.name || "Anonymous",
      userEmail: row.email,
      userProfilePicture: row.profilePicture,
      role: row.role,
      joinedAt: row.joinedAt,
    }))

    return NextResponse.json(activities)
  } catch (error) {
    console.error("Error fetching activity:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    )
  }
}


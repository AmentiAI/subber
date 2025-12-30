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

    // Get all members with user info
    const membersResult = await query(
      `SELECT 
        cm.id,
        cm."userId",
        cm.role,
        cm."joinedAt",
        u.id as "user_id",
        u.name,
        u.email,
        u.image,
        u."profilePicture"
      FROM "CommunityMember" cm
      INNER JOIN "User" u ON cm."userId" = u.id
      WHERE cm."communityId" = $1
      ORDER BY 
        CASE cm.role
          WHEN 'admin' THEN 1
          WHEN 'moderator' THEN 2
          ELSE 3
        END,
        cm."joinedAt" ASC`,
      [communityId]
    )

    const members = membersResult.rows.map((row: any) => ({
      id: row.id,
      userId: row.userId,
      role: row.role,
      joinedAt: row.joinedAt,
      user: {
        id: row.user_id,
        name: row.name,
        email: row.email,
        image: row.image || row.profilePicture,
        profilePicture: row.profilePicture,
      },
    }))

    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    )
  }
}


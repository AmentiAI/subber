import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUserFromRequest } from "@/lib/auth-helpers"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Get current user from wallet
    const user = await getCurrentUserFromRequest(request)

    // Find community
    const communityResult = await query(
      'SELECT * FROM "Community" WHERE slug = $1',
      [slug]
    )

    if (communityResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      )
    }

    const community = communityResult.rows[0]

    // Check if already a member
    const existingMemberResult = await query(
      'SELECT * FROM "CommunityMember" WHERE "userId" = $1 AND "communityId" = $2',
      [user.id, community.id]
    )

    if (existingMemberResult.rows.length > 0) {
      return NextResponse.json(
        { error: "Already a member" },
        { status: 400 }
      )
    }

    // Join community
    await query(
      'INSERT INTO "CommunityMember" (id, "userId", "communityId", role, "joinedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, NOW())',
      [user.id, community.id, "member"]
    )

    return NextResponse.json({ message: "Joined community successfully" })
  } catch (error) {
    console.error("Error joining community:", error)
    if (error instanceof Error && error.message.includes("Wallet address is required")) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: "Failed to join community" },
      { status: 500 }
    )
  }
}


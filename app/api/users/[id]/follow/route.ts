import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUserFromRequest } from "@/lib/auth-helpers"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUserFromRequest(request)

    // Check if already following
    const existing = await query(
      'SELECT * FROM "Follow" WHERE "followerId" = $1 AND "followingId" = $2',
      [user.id, id]
    )

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Already following" }, { status: 400 })
    }

    // Create follow
    await query(
      'INSERT INTO "Follow" (id, "followerId", "followingId", "createdAt") VALUES (gen_random_uuid()::text, $1, $2, NOW())',
      [user.id, id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error following user:", error)
    return NextResponse.json(
      { error: "Failed to follow user" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUserFromRequest(request)

    await query(
      'DELETE FROM "Follow" WHERE "followerId" = $1 AND "followingId" = $2',
      [user.id, id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unfollowing user:", error)
    return NextResponse.json(
      { error: "Failed to unfollow user" },
      { status: 500 }
    )
  }
}


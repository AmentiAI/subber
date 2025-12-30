import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUserFromRequest } from "@/lib/auth-helpers"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUserFromRequest(request)

    // Get all conversations for the user
    const result = await query(
      `SELECT 
        c.id,
        CASE 
          WHEN c."user1Id" = $1 THEN c."user2Id"
          ELSE c."user1Id"
        END as other_user_id,
        c."lastMessageAt"
      FROM "Conversation" c
      WHERE c."user1Id" = $1 OR c."user2Id" = $1
      ORDER BY c."lastMessageAt" DESC`,
      [user.id]
    )

    // Get user info and last message for each conversation
    const conversations = await Promise.all(
      result.rows.map(async (row: any) => {
        const [userResult, messageResult, unreadResult] = await Promise.all([
          query('SELECT id, name, email, "profilePicture", image FROM "User" WHERE id = $1', [row.other_user_id]),
          query(
            `SELECT content, "createdAt" 
             FROM "Message" 
             WHERE "conversationId" = $1 
             ORDER BY "createdAt" DESC 
             LIMIT 1`,
            [row.id]
          ),
          query(
            `SELECT COUNT(*) as count 
             FROM "Message" 
             WHERE "conversationId" = $1 
             AND "senderId" != $2 
             AND "readAt" IS NULL`,
            [row.id, user.id]
          ),
        ])

        return {
          id: row.id,
          otherUser: userResult.rows[0] || { id: row.other_user_id, name: null, email: "", image: null },
          lastMessage: messageResult.rows[0] || null,
          unreadCount: parseInt(unreadResult.rows[0].count) || 0,
        }
      })
    )

    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId } = body
    const user = await getCurrentUserFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    if (userId === user.id) {
      return NextResponse.json(
        { error: "Cannot create conversation with yourself" },
        { status: 400 }
      )
    }

    // Check if conversation already exists
    const existingResult = await query(
      `SELECT id FROM "Conversation" 
       WHERE ("user1Id" = $1 AND "user2Id" = $2) 
       OR ("user1Id" = $2 AND "user2Id" = $1)`,
      [user.id, userId]
    )

    if (existingResult.rows.length > 0) {
      return NextResponse.json({ id: existingResult.rows[0].id })
    }

    // Create new conversation
    const result = await query(
      `INSERT INTO "Conversation" (id, "user1Id", "user2Id", "createdAt", "lastMessageAt")
       VALUES (gen_random_uuid()::text, $1, $2, NOW(), NOW())
       RETURNING id`,
      [user.id, userId]
    )

    return NextResponse.json({ id: result.rows[0].id }, { status: 201 })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    )
  }
}


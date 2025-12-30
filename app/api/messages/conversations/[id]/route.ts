import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUserFromRequest } from "@/lib/auth-helpers"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUserFromRequest(request)

    // Get messages
    const result = await query(
      `SELECT 
        m.id,
        m.content,
        m."senderId",
        m."createdAt",
        m.image,
        u.name
      FROM "Message" m
      INNER JOIN "User" u ON m."senderId" = u.id
      WHERE m."conversationId" = $1
      ORDER BY m."createdAt" ASC`,
      [id]
    )

    const messages = result.rows.map((row: any) => ({
      id: row.id,
      content: row.content,
      senderId: row.senderId,
      createdAt: row.createdAt,
      image: row.image,
      sender: {
        id: row.senderId,
        name: row.name,
      },
    }))

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content, image } = body
    const user = await getCurrentUserFromRequest(request)

    // Create or get conversation
    let conversationId = id

    if (id === "new") {
      // This would need the other user ID from the request
      // For now, we'll create a placeholder
      return NextResponse.json({ error: "New conversations need user ID" }, { status: 400 })
    }

    // Create message
    await query(
      'INSERT INTO "Message" (id, "conversationId", "senderId", content, image, "createdAt") VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())',
      [conversationId, user.id, content || null, image || null]
    )

    // Update conversation last message time
    await query(
      'UPDATE "Conversation" SET "lastMessageAt" = NOW() WHERE id = $1',
      [conversationId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}


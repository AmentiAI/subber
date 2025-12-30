import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUserFromRequest } from "@/lib/auth-helpers"
import { z } from "zod"

const commentSchema = z.object({
  content: z.string().min(1).max(1000),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await query(
      `SELECT 
        c.*,
        u.id as author_id,
        u.name as author_name,
        u.image as author_image
      FROM "Comment" c
      INNER JOIN "User" u ON c."authorId" = u.id
      WHERE c."postId" = $1
      ORDER BY c."createdAt" ASC`,
      [id]
    )

    const comments = result.rows.map((row: any) => ({
      id: row.id,
      content: row.content,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      author: {
        id: row.author_id,
        name: row.author_name,
        image: row.author_image,
      },
    }))

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json(
      { error: "Failed to fetch comments" },
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
    const { content } = commentSchema.parse(body)

    // Check if post exists
    const postResult = await query(
      'SELECT * FROM "Post" WHERE id = $1',
      [id]
    )

    if (postResult.rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Get current user from wallet
    const user = await getCurrentUserFromRequest(request)

    // Create comment
    const commentResult = await query(
      'INSERT INTO "Comment" (id, content, "authorId", "postId", "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, NOW(), NOW()) RETURNING *',
      [content, user.id, id]
    )

    const comment = commentResult.rows[0]

    // Return comment with author info
    return NextResponse.json({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        id: user.id,
        name: user.name,
        image: user.image || user.profilePicture,
      },
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating comment:", error)
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    )
  }
}


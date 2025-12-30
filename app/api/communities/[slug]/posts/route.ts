import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUserFromRequest } from "@/lib/auth-helpers"
import { z } from "zod"

const postSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

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

    // Get posts with author and comment count
    const postsResult = await query(
      `SELECT 
        p.*,
        u.id as author_id,
        u.name as author_name,
        u.image as author_image,
        COUNT(DISTINCT c.id) as comment_count
      FROM "Post" p
      INNER JOIN "User" u ON p."authorId" = u.id
      LEFT JOIN "Comment" c ON p.id = c."postId"
      WHERE p."communityId" = $1
      GROUP BY p.id, u.id, u.name, u.image
      ORDER BY p."createdAt" DESC`,
      [community.id]
    )

    const posts = postsResult.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      author: {
        id: row.author_id,
        name: row.author_name,
        image: row.author_image,
      },
      _count: {
        comments: parseInt(row.comment_count) || 0,
      },
    }))

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { title, content } = postSchema.parse(body)

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

    // Get current user from wallet
    const user = await getCurrentUserFromRequest(request)

    // Create post
    const postResult = await query(
      'INSERT INTO "Post" (id, title, content, "authorId", "communityId", "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW(), NOW()) RETURNING *',
      [title, content, user.id, community.id]
    )

    const post = postResult.rows[0]

    // Return post with author info
    return NextResponse.json({
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
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

    console.error("Error creating post:", error)
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    )
  }
}


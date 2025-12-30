import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await query(
      `SELECT 
        p.*,
        u.id as author_id,
        u.name as author_name,
        u.image as author_image,
        c.id as community_id,
        c.name as community_name,
        c.slug as community_slug
      FROM "Post" p
      INNER JOIN "User" u ON p."authorId" = u.id
      INNER JOIN "Community" c ON p."communityId" = c.id
      WHERE p.id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const row = result.rows[0]
    const post = {
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
      community: {
        id: row.community_id,
        name: row.community_name,
        slug: row.community_slug,
      },
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    )
  }
}


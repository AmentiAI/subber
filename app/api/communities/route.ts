import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { z } from "zod"

const communitySchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(500).optional(),
})

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        c.*,
        COUNT(DISTINCT cm."userId") as member_count,
        COUNT(DISTINCT p.id) as post_count
      FROM "Community" c
      LEFT JOIN "CommunityMember" cm ON c.id = cm."communityId"
      LEFT JOIN "Post" p ON c.id = p."communityId"
      GROUP BY c.id
      ORDER BY c."createdAt" DESC
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
        members: parseInt(row.member_count) || 0,
        posts: parseInt(row.post_count) || 0,
      },
    }))

    return NextResponse.json(communities)
  } catch (error) {
    console.error("Error fetching communities:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch communities",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description } = communitySchema.parse(body)

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Check if community exists
    const existingResult = await query(
      'SELECT * FROM "Community" WHERE slug = $1',
      [slug]
    )

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: "Community with this name already exists" },
        { status: 400 }
      )
    }

    // Create community
    const result = await query(
      'INSERT INTO "Community" (id, name, slug, description, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, NOW(), NOW()) RETURNING *',
      [name, slug, description || null]
    )

    const community = result.rows[0]

    return NextResponse.json(community, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating community:", error)
    return NextResponse.json(
      { error: "Failed to create community" },
      { status: 500 }
    )
  }
}


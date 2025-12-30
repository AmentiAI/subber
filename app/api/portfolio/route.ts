import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUserFromRequest } from "@/lib/auth-helpers"
import { z } from "zod"

const portfolioSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  image: z.string().optional(),
  link: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  order: z.number().int().optional(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const result = await query(
      'SELECT * FROM "Portfolio" WHERE "userId" = $1 ORDER BY "order" ASC, "createdAt" DESC',
      [userId]
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, image, link, tags, order } = portfolioSchema.parse(body)
    const user = await getCurrentUserFromRequest(request)

    const result = await query(
      `INSERT INTO "Portfolio" (id, "userId", title, description, image, link, tags, "order", "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [
        user.id,
        title,
        description || null,
        image || null,
        link || null,
        tags || [],
        order || 0,
      ]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating portfolio item:", error)
    return NextResponse.json(
      { error: "Failed to create portfolio item" },
      { status: 500 }
    )
  }
}


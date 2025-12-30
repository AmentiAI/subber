import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUserFromRequest } from "@/lib/auth-helpers"
import { z } from "zod"

const portfolioSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  image: z.string().optional(),
  link: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  order: z.number().int().optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, image, link, tags, order } = portfolioSchema.parse(body)
    const user = await getCurrentUserFromRequest(request)

    // Check if portfolio item exists and belongs to user
    const checkResult = await query(
      'SELECT * FROM "Portfolio" WHERE id = $1 AND "userId" = $2',
      [id, user.id]
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Portfolio item not found" },
        { status: 404 }
      )
    }

    // Build update query dynamically
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`)
      values.push(title)
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`)
      values.push(description || null)
    }
    if (image !== undefined) {
      updates.push(`image = $${paramIndex++}`)
      values.push(image || null)
    }
    if (link !== undefined) {
      updates.push(`link = $${paramIndex++}`)
      values.push(link || null)
    }
    if (tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`)
      values.push(tags)
    }
    if (order !== undefined) {
      updates.push(`"order" = $${paramIndex++}`)
      values.push(order)
    }

    updates.push(`"updatedAt" = NOW()`)
    values.push(id, user.id)

    const result = await query(
      `UPDATE "Portfolio" 
       SET ${updates.join(", ")}
       WHERE id = $${paramIndex} AND "userId" = $${paramIndex + 1}
       RETURNING *`,
      values
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating portfolio item:", error)
    return NextResponse.json(
      { error: "Failed to update portfolio item" },
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

    // Check if portfolio item exists and belongs to user
    const checkResult = await query(
      'SELECT * FROM "Portfolio" WHERE id = $1 AND "userId" = $2',
      [id, user.id]
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Portfolio item not found" },
        { status: 404 }
      )
    }

    await query('DELETE FROM "Portfolio" WHERE id = $1', [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting portfolio item:", error)
    return NextResponse.json(
      { error: "Failed to delete portfolio item" },
      { status: 500 }
    )
  }
}


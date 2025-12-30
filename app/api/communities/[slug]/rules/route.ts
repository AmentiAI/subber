import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { rules, guidelines } = body

    // Update community rules
    await query(
      'UPDATE "Community" SET rules = $1, guidelines = $2, "updatedAt" = NOW() WHERE slug = $3',
      [rules || null, guidelines || null, slug]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating rules:", error)
    return NextResponse.json(
      { error: "Failed to update rules" },
      { status: 500 }
    )
  }
}


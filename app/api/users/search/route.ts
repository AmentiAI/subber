import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")

    if (!q || q.length < 2) {
      return NextResponse.json([])
    }

    const result = await query(
      `SELECT id, name, email, "profilePicture", image
       FROM "User"
       WHERE LOWER(name) LIKE LOWER($1) OR LOWER(email) LIKE LOWER($1)
       LIMIT 10`,
      [`%${q}%`]
    )

    const users = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      image: row.profilePicture || row.image,
    }))

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error searching users:", error)
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    )
  }
}


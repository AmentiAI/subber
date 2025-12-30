import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { walletAddress } = body

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      )
    }

    // Check if user exists with this wallet address
    const existingUser = await query(
      'SELECT * FROM "User" WHERE "walletAddress" = $1',
      [walletAddress]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json({ user: existingUser.rows[0] })
    }

    // Create new user with wallet address
    const newUser = await query(
      `INSERT INTO "User" (id, "walletAddress", name, email, password, "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [walletAddress, `Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`, null, '']
    )

    return NextResponse.json({ user: newUser.rows[0] }, { status: 201 })
  } catch (error) {
    console.error("Error authenticating wallet:", error)
    return NextResponse.json(
      { error: "Failed to authenticate wallet" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("walletAddress")

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      )
    }

    const result = await query(
      'SELECT * FROM "User" WHERE "walletAddress" = $1',
      [walletAddress]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: result.rows[0] })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}


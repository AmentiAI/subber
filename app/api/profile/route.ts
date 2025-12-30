import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUserFromRequest, getWalletAddressFromQuery } from "@/lib/auth-helpers"

export async function GET(request: Request) {
  try {
    const walletAddress = await getWalletAddressFromQuery(request)
    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      )
    }

    const user = await query(
      'SELECT * FROM "User" WHERE "walletAddress" = $1',
      [walletAddress]
    )

    if (user.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ id: user.rows[0].id, walletAddress: user.rows[0].walletAddress })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get("x-wallet-address")
    
    console.log("Profile update request:")
    console.log("  Header wallet address:", authHeader)
    console.log("  Body wallet address:", body.walletAddress)
    console.log("  Profile data:", { 
      name: body.name ? `${body.name.substring(0, 20)}...` : null,
      bio: body.bio ? `${body.bio.substring(0, 20)}...` : null,
      profilePicture: body.profilePicture ? "present" : "missing", 
      bannerImage: body.bannerImage ? "present" : "missing" 
    })
    
    // Get wallet address from header or body (prefer header)
    const walletAddress = authHeader || body.walletAddress
    
    if (!walletAddress) {
      console.error("Profile update error: Wallet address missing from both header and body")
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      )
    }
    
    const { name, bio, location, website, profilePicture, bannerImage } = body

    let user = await query(
      'SELECT * FROM "User" WHERE "walletAddress" = $1',
      [walletAddress]
    )

    // If user doesn't exist, create them
    if (user.rows.length === 0) {
      console.log("User not found, creating new user for wallet:", walletAddress)
      const newUser = await query(
        `INSERT INTO "User" (id, "walletAddress", name, email, password, "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW(), NOW())
         RETURNING *`,
        [walletAddress, `Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`, null, '']
      )
      user = newUser
      console.log("Created new user:", newUser.rows[0].id)
    }

    console.log("Updating profile for user:", user.rows[0].id)
    
    // Handle empty strings as null
    const nameValue = name && name.trim() ? name.trim() : null
    const bioValue = bio && bio.trim() ? bio.trim() : null
    const locationValue = location && location.trim() ? location.trim() : null
    const websiteValue = website && website.trim() ? website.trim() : null
    const profilePictureValue = profilePicture && profilePicture.trim() ? profilePicture.trim() : null
    const bannerImageValue = bannerImage && bannerImage.trim() ? bannerImage.trim() : null
    
    console.log("Update values:", {
      name: nameValue ? `${nameValue.substring(0, 20)}...` : null,
      bio: bioValue ? `${bioValue.substring(0, 20)}...` : null,
      location: locationValue,
      website: websiteValue,
      profilePicture: profilePictureValue ? "present" : null,
      bannerImage: bannerImageValue ? "present" : null,
    })
    
    const updateResult = await query(
      `UPDATE "User" 
       SET name = $1, bio = $2, location = $3, website = $4, "profilePicture" = $5, "bannerImage" = $6, "updatedAt" = NOW()
       WHERE "walletAddress" = $7
       RETURNING *`,
      [nameValue, bioValue, locationValue, websiteValue, profilePictureValue, bannerImageValue, walletAddress]
    )

    console.log("Profile updated successfully:", updateResult.rows[0])

    return NextResponse.json({ success: true, user: updateResult.rows[0] })
  } catch (error: any) {
    console.error("Error updating profile:", error)
    console.error("Error stack:", error.stack)
    console.error("Error message:", error.message)
    return NextResponse.json(
      { error: error.message || "Failed to update profile", details: error.toString() },
      { status: 500 }
    )
  }
}


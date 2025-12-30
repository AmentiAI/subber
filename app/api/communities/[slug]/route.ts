import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Get community first
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

    const communityRow = communityResult.rows[0]
    const communityId = communityRow.id

    // Get counts
    const [membersCount, postsCount] = await Promise.all([
      query('SELECT COUNT(*) as count FROM "CommunityMember" WHERE "communityId" = $1', [communityId]),
      query('SELECT COUNT(*) as count FROM "Post" WHERE "communityId" = $1', [communityId]),
    ])

    const community = {
      id: communityRow.id,
      name: communityRow.name,
      slug: communityRow.slug,
      description: communityRow.description,
      image: communityRow.image,
      rules: communityRow.rules,
      guidelines: communityRow.guidelines,
      settings: communityRow.settings,
      themeColor: communityRow.themeColor,
      bannerImage: communityRow.bannerImage,
      createdAt: communityRow.createdAt,
      updatedAt: communityRow.updatedAt,
      _count: {
        members: parseInt(membersCount.rows[0].count) || 0,
        posts: parseInt(postsCount.rows[0].count) || 0,
      },
      isMember: false,
    }

    return NextResponse.json(community)
  } catch (error) {
    console.error("Error fetching community:", error)
    return NextResponse.json(
      { error: "Failed to fetch community" },
      { status: 500 }
    )
  }
}


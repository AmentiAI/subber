import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
})

// Helper function to get a client from the pool
export async function query(text: string, params?: any[]) {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

// Helper to get or create user by wallet address
export async function getUserByWallet(walletAddress: string) {
  if (!walletAddress) {
    throw new Error("Wallet address is required")
  }

  const result = await query(
    'SELECT * FROM "User" WHERE "walletAddress" = $1',
    [walletAddress]
  )
  
  if (result.rows.length > 0) {
    return result.rows[0]
  }
  
  // Create new user with wallet address
  const insertResult = await query(
    `INSERT INTO "User" (id, "walletAddress", name, email, password, "createdAt", "updatedAt")
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW(), NOW())
     RETURNING *`,
    [walletAddress, `Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`, null, '']
  )
  
  return insertResult.rows[0]
}

// Legacy function for backward compatibility - will be removed
export async function getAnonymousUser() {
  // Try to get any user with a wallet address, or create a fallback
  const result = await query(
    'SELECT * FROM "User" WHERE "walletAddress" IS NOT NULL LIMIT 1'
  )
  
  if (result.rows.length > 0) {
    return result.rows[0]
  }
  
  // Fallback: create a temporary anonymous user
  const insertResult = await query(
    'INSERT INTO "User" (id, name, email, password, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, NOW(), NOW()) RETURNING *',
    ['Anonymous', null, '']
  )
  
  return insertResult.rows[0]
}

// Helper to get current user from request (wallet address from headers or body)
export async function getCurrentUser(request?: Request): Promise<any> {
  // Try to get wallet address from request
  let walletAddress: string | null = null

  if (request) {
    // Try to get from headers
    const authHeader = request.headers.get("x-wallet-address")
    if (authHeader) {
      walletAddress = authHeader
    } else {
      // Try to get from body (for POST requests)
      try {
        const body = await request.json()
        walletAddress = body.walletAddress || null
      } catch {
        // Not a JSON body or already consumed
      }
    }
  }

  if (!walletAddress) {
    throw new Error("Wallet address is required")
  }

  return getUserByWallet(walletAddress)
}

export { pool }


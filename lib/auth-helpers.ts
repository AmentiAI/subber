import { query, getUserByWallet } from "./db"

// Helper to get wallet address from request
export async function getWalletAddressFromRequest(request: Request): Promise<string | null> {
  // Try to get from headers first
  const authHeader = request.headers.get("x-wallet-address")
  if (authHeader) {
    return authHeader
  }

  // Try to get from body (for POST/PUT requests)
  // Note: This will consume the body, so callers need to clone the request if they need the body
  try {
    const clonedRequest = request.clone()
    const body = await clonedRequest.json()
    return body.walletAddress || null
  } catch {
    // Body already consumed or not JSON
    return null
  }
}

// Helper to get current user from request
export async function getCurrentUserFromRequest(request: Request) {
  const walletAddress = await getWalletAddressFromRequest(request)
  
  if (!walletAddress) {
    throw new Error("Wallet address is required. Please connect your wallet.")
  }

  return getUserByWallet(walletAddress)
}

// Helper for GET requests (wallet address from query params)
export async function getWalletAddressFromQuery(request: Request): Promise<string | null> {
  const { searchParams } = new URL(request.url)
  return searchParams.get("walletAddress")
}


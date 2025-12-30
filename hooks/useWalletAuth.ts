"use client"

import { useLaserEyes } from "@omnisat/lasereyes-react"
import { useEffect, useState } from "react"

export function useWalletAuth() {
  const { connected, address } = useLaserEyes()
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchUser = async () => {
    if (!connected || !address) {
      setUser(null)
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      })
      const data = await res.json()
      if (data.user) {
        setUser(data.user)
      }
    } catch (error) {
      console.error("Failed to fetch user:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (connected && address) {
      fetchUser()
    } else {
      setUser(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, address])

  // Helper to get auth headers for API calls
  const getAuthHeaders = () => {
    if (!address) return {}
    return {
      "x-wallet-address": address,
    }
  }

  // Helper to get auth body for API calls
  const getAuthBody = (body: any = {}) => {
    if (!address) return body
    return {
      ...body,
      walletAddress: address,
    }
  }

  return {
    connected,
    address,
    user,
    loading,
    getAuthHeaders,
    getAuthBody,
    refetchUser: fetchUser,
  }
}


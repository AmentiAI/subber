"use client"

import { useLaserEyes } from "@omnisat/lasereyes-react"
import { useEffect, useState } from "react"
import { Wallet, LogOut, User } from "lucide-react"
import Link from "next/link"
import { WalletModal } from "./WalletModal"

export function WalletConnect() {
  const { connected, address, disconnect } = useLaserEyes()
  
  const [user, setUser] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (connected && address) {
      // Get or create user by wallet address
      fetch("/api/auth/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user)
          }
        })
        .catch(() => {})
    } else {
      setUser(null)
    }
  }, [connected, address])

  const handleDisconnect = async () => {
    try {
      await disconnect()
      setUser(null)
    } catch (error) {
      console.error(error)
    }
  }

  if (connected && address) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
          <Wallet className="h-4 w-4" />
          <span className="text-sm font-medium">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <Link
          href="/profile"
          className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          title="Profile"
        >
          <User className="h-4 w-4 text-slate-700 dark:text-slate-300" />
        </Link>
        <button
          onClick={handleDisconnect}
          className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          title="Disconnect"
        >
          <LogOut className="h-4 w-4 text-slate-700 dark:text-slate-300" />
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold flex items-center space-x-2 transition-all"
      >
        <Wallet className="h-4 w-4" />
        <span>Connect Wallet</span>
      </button>
      <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}


"use client"

import { useLaserEyes } from "@omnisat/lasereyes-react"
import { useEffect, useState } from "react"
import { Wallet, Lock } from "lucide-react"
import { WalletModal } from "./WalletModal"

export function WalletGate({ children }: { children: React.ReactNode }) {
  const { connected, address } = useLaserEyes()
  
  const [showModal, setShowModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // If not connected, show modal after a brief delay
    if (!connected && !address) {
      const timer = setTimeout(() => {
        setShowModal(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [connected, address])

  // Prevent flash of content before checking connection
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="animate-pulse">
          <Wallet className="h-12 w-12 text-slate-400 mx-auto" />
        </div>
      </div>
    )
  }

  // If not connected, show connect screen
  if (!connected || !address) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-xl">
                <Lock className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Wallet Required
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Please connect your wallet to access the platform
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center space-x-3 mx-auto"
            >
              <Wallet className="h-6 w-6" />
              <span>Connect Wallet</span>
            </button>

            <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
              Supported wallets: Xverse, OYL, Magic Eden, Phantom, UniSat
            </p>
          </div>
        </div>
        <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    )
  }

  // If connected, show children
  return <>{children}</>
}


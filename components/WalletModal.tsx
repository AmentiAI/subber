"use client"

import { useState, useEffect } from "react"
import { useLaserEyes, OYL, XVERSE, UNISAT, MAGIC_EDEN, PHANTOM } from "@omnisat/lasereyes-react"
import { X, Wallet } from "lucide-react"

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

interface WalletOption {
  id: string
  name: string
  icon: string
  description: string
  provider: any // Wallet provider from LaserEyes
  available: boolean
}

// Wallet options - Xverse is primary, OYL is fallback
const WALLET_OPTIONS: WalletOption[] = [
  {
    id: "XVERSE",
    name: "Xverse",
    icon: "🔶",
    description: "Connect with Xverse wallet",
    provider: XVERSE,
    available: typeof window !== "undefined" && (
      (window as any).xverse !== undefined || 
      (window as any).XverseProvider !== undefined ||
      (window as any).Xverse !== undefined ||
      (window as any).XverseWallet !== undefined ||
      (window as any).xverseWallet !== undefined ||
      (window as any).BitcoinProvider !== undefined ||
      (window as any).bitcoinProvider !== undefined
    ),
  },
  {
    id: "OYL",
    name: "OYL Wallet",
    icon: "🔷",
    description: "Connect with OYL wallet",
    provider: OYL,
    available: true,
  },
  {
    id: "MAGIC_EDEN",
    name: "Magic Eden",
    icon: "✨",
    description: "Connect with Magic Eden wallet",
    provider: MAGIC_EDEN,
    available: typeof window !== "undefined" && (window as any).magicEden !== undefined,
  },
  {
    id: "PHANTOM",
    name: "Phantom",
    icon: "👻",
    description: "Connect with Phantom wallet",
    provider: PHANTOM,
    available: typeof window !== "undefined" && (window as any).phantom !== undefined,
  },
  {
    id: "UNISAT",
    name: "UniSat",
    icon: "🌐",
    description: "Connect with UniSat wallet",
    provider: UNISAT,
    available: typeof window !== "undefined" && (window as any).unisat !== undefined,
  },
]

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect } = useLaserEyes()
  const [connecting, setConnecting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [availableWallets, setAvailableWallets] = useState<Set<string>>(new Set())

  // Check for available wallets when modal opens
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      console.log("Modal opened, checking for wallets...")
      const available = new Set<string>()
      
      // Check Xverse first (primary wallet)
      const xverseDetected = 
        (window as any).xverse || 
        (window as any).XverseProvider || 
        (window as any).Xverse ||
        (window as any).XverseWallet ||
        (window as any).xverseWallet ||
        (window as any).BitcoinProvider ||
        (window as any).bitcoinProvider
      
      if (xverseDetected) {
        available.add("XVERSE")
        console.log("✅ Xverse detected")
      } else {
        console.log("❌ Xverse not detected")
      }
      
      // Check OYL (fallback option)
      available.add("OYL")
      console.log("OYL always available")
      
      // Check Phantom
      if ((window as any).phantom) {
        available.add("PHANTOM")
        console.log("✅ Phantom detected")
      }
      
      // Check UniSat
      if ((window as any).unisat) {
        available.add("UNISAT")
        console.log("✅ UniSat detected")
      }
      
      // Check Magic Eden
      if ((window as any).magicEden) {
        available.add("MAGIC_EDEN")
        console.log("✅ Magic Eden detected")
      }
      
      console.log("Available wallets:", Array.from(available))
      setAvailableWallets(available)
    }
  }, [isOpen])

  const handleConnect = async (wallet: WalletOption) => {
    // Prevent multiple simultaneous connections
    if (connecting !== null) {
      console.log("Already connecting to a wallet, please wait...")
      return
    }
    
    setConnecting(wallet.id)
    setError(null)
    console.log("Connecting to wallet:", wallet.name)
    
    // Set a timeout to prevent hanging
    let timeoutId: NodeJS.Timeout | null = null
    const setupTimeout = () => {
      timeoutId = setTimeout(() => {
        console.log("Connection timeout, resetting...")
        setConnecting(null)
        setError("Connection timed out. Please try again or use a different wallet.")
      }, 15000) // 15 second timeout
    }
    
    setupTimeout()
    
    try {
      // Handle Xverse as primary wallet - use LaserEyes built-in XVERSE provider
      if (wallet.id === "XVERSE") {
        // Use LaserEyes' built-in XVERSE provider
        await connect(XVERSE)
        console.log("Xverse connected via LaserEyes")
        
        // Get the address from LaserEyes after connection
        // The address will be available via useLaserEyes hook
        // We'll refresh to update the connection state
        window.location.reload()
        
      } else if (wallet.id === "OYL") {
        // For OYL, use the imported provider from LaserEyes
        await connect(wallet.provider)
      } else if (wallet.id === "UNISAT" || wallet.id === "MAGIC_EDEN" || wallet.id === "PHANTOM") {
        // These wallets are supported by LaserEyes - use the provider directly
        await connect(wallet.provider)
      } else {
        // Try to use LaserEyes connect with the provider
        // This might work if LaserEyes supports it
        try {
          await connect(wallet.provider as any)
        } catch {
          throw new Error(`${wallet.name} wallet connection not yet fully implemented. Please use Xverse or OYL wallet.`)
        }
      }
      
      // Clear timeout on success
      if (timeoutId) clearTimeout(timeoutId)
      
      // Close modal on success
      onClose()
    } catch (err: any) {
      console.error("Wallet connection error:", err)
      console.error("Error details:", {
        message: err?.message,
        name: err?.name,
        stack: err?.stack,
        toString: err?.toString(),
        stringified: JSON.stringify(err, null, 2),
        keys: err ? Object.keys(err) : [],
      })
      
      // Extract error message from various possible sources
      let errorMessage = ""
      
      if (err?.message) {
        errorMessage = err.message
      } else if (typeof err === "string") {
        errorMessage = err
      } else if (err?.toString && typeof err.toString === "function") {
        errorMessage = err.toString()
      } else if (err?.error?.message) {
        errorMessage = err.error.message
      } else if (err?.reason) {
        errorMessage = err.reason
      } else if (err?.code) {
        errorMessage = `Error code: ${err.code}`
      } else if (err && typeof err === "object") {
        // Try to stringify the error object
        try {
          errorMessage = JSON.stringify(err)
        } catch {
          errorMessage = "Unknown error occurred"
        }
      } else {
        errorMessage = `Failed to connect ${wallet.name}. Please make sure the wallet extension is installed and unlocked.`
      }
      
      // Add helpful context for Xverse
      if (wallet.id === "XVERSE" && (!errorMessage || errorMessage.includes("undefined") || errorMessage === "{}")) {
        errorMessage = "Xverse connection failed. Please ensure:\n1. Xverse extension is installed and enabled\n2. Xverse wallet is unlocked\n3. Try refreshing the page and connecting again"
      }
      
      setError(errorMessage)
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
      setConnecting(null)
    }
  }

  const handleCancel = () => {
    console.log("Canceling connection...")
    setConnecting(null)
    setError(null)
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      style={{ pointerEvents: 'auto' }}
      onClick={(e) => {
        // Close modal when clicking backdrop
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-slate-200 dark:border-slate-700 relative z-[10000]"
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Connect Wallet
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Choose a wallet to connect to your account
          </p>

          {/* Cancel button when connecting */}
          {connecting && (
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Connecting to {WALLET_OPTIONS.find(w => w.id === connecting)?.name || "wallet"}...
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            {WALLET_OPTIONS.map((wallet) => {
              const isAvailable = availableWallets.has(wallet.id)
              const isConnecting = connecting === wallet.id
              const isDisabled = connecting !== null && !isConnecting
              
              return (
                <button
                  key={wallet.id}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (!isDisabled) {
                      handleConnect(wallet).catch(err => {
                        console.error("Handle connect error:", err)
                      })
                    }
                  }}
                  disabled={isDisabled}
                  style={{ 
                    pointerEvents: isDisabled ? 'none' : 'auto',
                    width: '100%',
                    cursor: isDisabled ? 'not-allowed' : 'pointer'
                  }}
                  className={`w-full flex items-center justify-between p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl transition-all ${
                    isDisabled 
                      ? "opacity-50 cursor-not-allowed" 
                      : "hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer active:scale-95"
                  }`}
                  type="button"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{wallet.icon}</div>
                    <div className="text-left">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {wallet.name}
                        </h3>
                        {!isAvailable && wallet.id !== "OYL" && wallet.id !== "XVERSE" && (
                          <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                            Not Detected
                          </span>
                        )}
                        {isAvailable && wallet.id !== "OYL" && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                            Available
                          </span>
                        )}
                        {wallet.id === "XVERSE" && !isAvailable && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
                            Install Extension
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {wallet.description}
                      </p>
                    </div>
                  </div>
                  {isConnecting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  ) : (
                    <div className="w-5 h-5" /> // Spacer to maintain layout
                  )}
                </button>
              )
            })}
          </div>

          <p className="mt-6 text-xs text-center text-slate-500 dark:text-slate-400">
            By connecting, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}


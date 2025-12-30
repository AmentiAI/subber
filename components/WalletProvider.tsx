"use client"

import { LaserEyesProvider } from "@omnisat/lasereyes-react"

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <LaserEyesProvider config={{ network: "mainnet" }}>
      {children}
    </LaserEyesProvider>
  )
}


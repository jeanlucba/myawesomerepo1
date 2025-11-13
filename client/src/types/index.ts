export * from './contracts'

// Global types
export interface Network {
  id: number
  name: string
  displayName: string
  rpcUrl: string
  wsUrl?: string
  explorerUrl: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  testnet: boolean
  faucetUrl?: string
}

export type SupportedChainId = 81 | 592

export interface ErrorWithReason extends Error {
  reason?: string
  code?: string
}

import { defineChain } from 'viem'
import type { Network, SupportedChainId } from '../types'

// Viem chain definitions for wagmi
export const shibuya = defineChain({
  id: 81,
  name: 'Shibuya',
  nativeCurrency: {
    decimals: 18,
    name: 'Shibuya',
    symbol: 'SBY',
  },
  rpcUrls: {
    default: {
      http: ['https://evm.shibuya.astar.network'],
      webSocket: ['wss://rpc.shibuya.astar.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Subscan',
      url: 'https://shibuya.subscan.io',
    },
  },
  testnet: true,
})

export const astar = defineChain({
  id: 592,
  name: 'Astar',
  nativeCurrency: {
    decimals: 18,
    name: 'Astar',
    symbol: 'ASTR',
  },
  rpcUrls: {
    default: {
      http: ['https://evm.astar.network'],
      webSocket: ['wss://rpc.astar.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Subscan',
      url: 'https://astar.subscan.io',
    },
  },
  testnet: false,
})

// Network configuration
export const NETWORKS: Record<SupportedChainId, Network> = {
  81: {
    id: 81,
    name: 'shibuya',
    displayName: 'Shibuya Testnet',
    rpcUrl: 'https://evm.shibuya.astar.network',
    wsUrl: 'wss://rpc.shibuya.astar.network',
    explorerUrl: 'https://shibuya.subscan.io',
    nativeCurrency: {
      name: 'Shibuya',
      symbol: 'SBY',
      decimals: 18,
    },
    testnet: true,
    faucetUrl: 'https://portal.astar.network',
  },
  592: {
    id: 592,
    name: 'astar',
    displayName: 'Astar Network',
    rpcUrl: 'https://evm.astar.network',
    wsUrl: 'wss://rpc.astar.network',
    explorerUrl: 'https://astar.subscan.io',
    nativeCurrency: {
      name: 'Astar',
      symbol: 'ASTR',
      decimals: 18,
    },
    testnet: false,
  },
}

export const SUPPORTED_CHAINS = [shibuya, astar]

// Get default chain from environment
export const DEFAULT_CHAIN_ID: SupportedChainId =
  (import.meta.env.VITE_CHAIN_ID as SupportedChainId) || 81

export const DEFAULT_CHAIN = NETWORKS[DEFAULT_CHAIN_ID]

// Helper functions
export function isSupportedChain(chainId: number | undefined): chainId is SupportedChainId {
  return chainId === 81 || chainId === 592
}

export function getNetwork(chainId: number): Network | undefined {
  return isSupportedChain(chainId) ? NETWORKS[chainId] : undefined
}

export function getExplorerUrl(chainId: number, hash: string, type: 'tx' | 'address' = 'tx'): string {
  const network = getNetwork(chainId)
  if (!network) return '#'
  
  if (type === 'tx') {
    return `${network.explorerUrl}/tx/${hash}`
  }
  return `${network.explorerUrl}/address/${hash}`
}

import type { ContractAddresses } from '../types'

// Contract addresses - Update these after deployment
export const CONTRACT_ADDRESSES: ContractAddresses = {
  81: {
    // Shibuya Testnet
    PensionFiV2: (import.meta.env.VITE_SHIBUYA_PENSIONFI_ADDRESS as `0x${string}`) || '0x0000000000000000000000000000000000000000',
    TransactionsV2: (import.meta.env.VITE_SHIBUYA_TRANSACTIONS_ADDRESS as `0x${string}`) || '0x0000000000000000000000000000000000000000',
  },
  592: {
    // Astar Mainnet
    PensionFiV2: (import.meta.env.VITE_ASTAR_PENSIONFI_ADDRESS as `0x${string}`) || '0x0000000000000000000000000000000000000000',
    TransactionsV2: (import.meta.env.VITE_ASTAR_TRANSACTIONS_ADDRESS as `0x${string}`) || '0x0000000000000000000000000000000000000000',
  },
}

// Helper to get contract address by chain
export function getContractAddress(
  chainId: number,
  contract: 'PensionFiV2' | 'TransactionsV2'
): `0x${string}` | undefined {
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
  return addresses?.[contract]
}

// Validate contract addresses are set
export function validateContractAddresses(chainId: number): boolean {
  const pensionFi = getContractAddress(chainId, 'PensionFiV2')
  return pensionFi !== undefined && pensionFi !== '0x0000000000000000000000000000000000000000'
}

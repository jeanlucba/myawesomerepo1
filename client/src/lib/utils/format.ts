import { formatEther, parseEther } from 'viem'

/**
 * Format wei to ether string with specified decimals
 */
export function formatWei(wei: bigint | string, decimals: number = 4): string {
  const ether = formatEther(BigInt(wei))
  const num = parseFloat(ether)
  return num.toFixed(decimals)
}

/**
 * Parse ether string to wei bigint
 */
export function parseEth(ether: string): bigint {
  try {
    return parseEther(ether)
  } catch {
    return 0n
  }
}

/**
 * Format address for display
 */
export function formatAddress(address: string, chars: number = 4): string {
  if (!address) return ''
  return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`
}

/**
 * Format timestamp to human readable date
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format timestamp to human readable date and time
 */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Calculate days remaining until a future timestamp
 */
export function getDaysRemaining(unlockTimestamp: number): number {
  const now = Math.floor(Date.now() / 1000)
  const remaining = unlockTimestamp - now
  return Math.max(Math.floor(remaining / 86400), 0)
}

/**
 * Format days to human readable string
 */
export function formatDays(days: number): string {
  if (days === 0) return 'Unlocked'
  if (days === 1) return '1 day'
  return `${days} days`
}

/**
 * Format APY from basis points to percentage
 */
export function formatAPY(basisPoints: number): string {
  return (basisPoints / 100).toFixed(2) + '%'
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

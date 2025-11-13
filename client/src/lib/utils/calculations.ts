/**
 * Calculate interest based on stake amount and APY
 */
export function calculateInterest(
  amountWei: bigint,
  apyBasisPoints: number
): bigint {
  return (amountWei * BigInt(apyBasisPoints)) / 10000n
}

/**
 * Calculate total return (principal + interest)
 */
export function calculateTotalReturn(
  principal: bigint,
  interest: bigint
): bigint {
  return principal + interest
}

/**
 * Calculate early withdrawal amount (with penalty)
 */
export function calculateEarlyWithdrawal(
  amountWei: bigint,
  penaltyBasisPoints: number
): {
  amount: bigint
  penalty: bigint
} {
  const penalty = (amountWei * BigInt(penaltyBasisPoints)) / 10000n
  const amount = amountWei - penalty
  
  return { amount, penalty }
}

/**
 * Check if position is unlocked
 */
export function isPositionUnlocked(unlockTimestamp: number): boolean {
  return Date.now() / 1000 >= unlockTimestamp
}

/**
 * Calculate time remaining in seconds
 */
export function getTimeRemaining(unlockTimestamp: number): number {
  const now = Math.floor(Date.now() / 1000)
  return Math.max(unlockTimestamp - now, 0)
}

/**
 * Convert days to seconds
 */
export function daysToSeconds(days: number): number {
  return days * 24 * 60 * 60
}

/**
 * Convert seconds to days
 */
export function secondsToDays(seconds: number): number {
  return Math.floor(seconds / (24 * 60 * 60))
}

/**
 * Validate stake amount
 */
export function validateStakeAmount(
  amount: string,
  minStake: bigint,
  maxStake: bigint
): { valid: boolean; error?: string } {
  if (!amount || amount === '0') {
    return { valid: false, error: 'Amount must be greater than 0' }
  }
  
  try {
    const amountWei = BigInt(amount)
    
    if (amountWei < minStake) {
      return { valid: false, error: `Minimum stake is ${minStake} wei` }
    }
    
    if (amountWei > maxStake) {
      return { valid: false, error: `Maximum stake is ${maxStake} wei` }
    }
    
    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid amount' }
  }
}

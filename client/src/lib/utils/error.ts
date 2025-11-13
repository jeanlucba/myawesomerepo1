import type { ErrorWithReason } from '../../types'

/**
 * Parse error message from various error types
 */
export function parseError(error: unknown): string {
  if (!error) return 'An unknown error occurred'
  
  // Check for ethers/viem error with reason
  if (typeof error === 'object' && error !== null) {
    const e = error as ErrorWithReason
    
    // User rejected transaction
    if (e.code === 'ACTION_REJECTED' || e.code === '4001') {
      return 'Transaction rejected by user'
    }
    
    // Contract error with reason
    if (e.reason) {
      // Clean up common error prefixes
      const reason = e.reason
        .replace('execution reverted: ', '')
        .replace('PensionFi: ', '')
        .replace('Transactions: ', '')
      return reason
    }
    
    // Standard error message
    if ('message' in e && typeof e.message === 'string') {
      // Clean up common error patterns
      let message = e.message
      
      // Remove technical details
      if (message.includes('(')) {
        message = message.substring(0, message.indexOf('('))
      }
      
      return message.trim()
    }
  }
  
  // String error
  if (typeof error === 'string') {
    return error
  }
  
  return 'An unknown error occurred'
}

/**
 * Check if error is user rejection
 */
export function isUserRejection(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const e = error as ErrorWithReason
    return e.code === 'ACTION_REJECTED' || e.code === '4001'
  }
  return false
}

/**
 * Log error for debugging
 */
export function logError(context: string, error: unknown): void {
  console.error(`[${context}]`, error)
  
  if (typeof error === 'object' && error !== null) {
    const e = error as ErrorWithReason
    if (e.reason) console.error('Reason:', e.reason)
    if (e.code) console.error('Code:', e.code)
  }
}

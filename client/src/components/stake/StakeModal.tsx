import { useState } from 'react'
import type { FormattedTier } from '../../types'
import { parseError } from '../../lib/utils/error'

interface StakeModalProps {
  tier: FormattedTier
  onStake: (amount: string) => Promise<void>
  onClose: () => void
  isStaking: boolean
  calculateInterest: (amount: string, apyBasisPoints: number) => string
}

export function StakeModal({
  tier,
  onStake,
  onClose,
  isStaking,
  calculateInterest,
}: StakeModalProps) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const estimatedInterest = amount ? calculateInterest(amount, tier.apyPercent * 100) : '0'
  const totalReturn = amount ? (parseFloat(amount) + parseFloat(estimatedInterest)).toFixed(4) : '0'
  
  const handleStake = async () => {
    setError(null)
    
    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    
    if (parseFloat(amount) < parseFloat(tier.minStakeFormatted)) {
      setError(`Minimum stake is ${tier.minStakeFormatted} ASTR`)
      return
    }
    
    if (parseFloat(amount) > parseFloat(tier.maxStakeFormatted)) {
      setError(`Maximum stake is ${tier.maxStakeFormatted} ASTR`)
      return
    }
    
    try {
      await onStake(amount)
      onClose()
    } catch (err) {
      setError(parseError(err))
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold">Stake ASTR</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isStaking}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tier Info */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Lock Period:</span>
              <span className="font-semibold">{tier.daysLocked} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Fixed APY:</span>
              <span className="text-2xl font-bold text-primary-400">{tier.apyPercent}%</span>
            </div>
          </div>
          
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Amount to Stake
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                step="0.1"
                min="0"
                disabled={isStaking}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary-500 text-lg disabled:opacity-50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                ASTR
              </span>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>Min: {tier.minStakeFormatted} ASTR</span>
              <span>Max: {tier.maxStakeFormatted} ASTR</span>
            </div>
          </div>
          
          {/* Calculations */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">You Stake:</span>
                <span className="font-semibold">{amount} ASTR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Interest Earned:</span>
                <span className="font-semibold text-green-400">+{estimatedInterest} ASTR</span>
              </div>
              <div className="border-t border-gray-700 my-2" />
              <div className="flex justify-between">
                <span className="text-gray-400">Total Return:</span>
                <span className="text-xl font-bold text-primary-400">{totalReturn} ASTR</span>
              </div>
            </div>
          )}
          
          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 text-red-200 text-sm">
              {error}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isStaking}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleStake}
              disabled={isStaking || !amount || parseFloat(amount) <= 0}
              className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStaking ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Staking...
                </span>
              ) : (
                'Confirm Stake'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

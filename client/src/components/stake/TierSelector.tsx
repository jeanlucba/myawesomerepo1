import type { FormattedTier } from '../../types'
import { formatAPY } from '../../lib/utils'

interface TierSelectorProps {
  tiers: FormattedTier[]
  onSelect: (tier: FormattedTier) => void
  disabled?: boolean
}

export function TierSelector({ tiers, onSelect, disabled }: TierSelectorProps) {
  if (tiers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>Loading staking tiers...</p>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tiers.map((tier) => (
        <div
          key={tier.daysLocked}
          className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-primary-500 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20"
        >
          {/* Tier Badge */}
          <div className="absolute -top-3 left-6 px-3 py-1 bg-primary-600 rounded-full text-xs font-bold">
            {tier.daysLocked === 365 && 'POPULAR'}
            {tier.daysLocked === 730 && 'BETTER'}
            {tier.daysLocked === 1825 && 'BEST'}
          </div>
          
          {/* Lock Period */}
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-white mb-1">
              {tier.daysLocked}
            </div>
            <div className="text-gray-400 text-sm">Days Locked</div>
          </div>
          
          {/* APY */}
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-primary-400 mb-1">
              {tier.apyPercent}%
            </div>
            <div className="text-gray-400 text-sm">Fixed APY</div>
          </div>
          
          {/* Details */}
          <div className="space-y-2 mb-6 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Min Stake:</span>
              <span className="text-white">{tier.minStakeFormatted} ASTR</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Max Stake:</span>
              <span className="text-white">{tier.maxStakeFormatted} ASTR</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Lock Period:</span>
              <span className="text-white">
                {tier.daysLocked === 365 && '1 Year'}
                {tier.daysLocked === 730 && '2 Years'}
                {tier.daysLocked === 1825 && '5 Years'}
              </span>
            </div>
          </div>
          
          {/* Select Button */}
          <button
            onClick={() => onSelect(tier)}
            disabled={disabled}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select Tier
          </button>
        </div>
      ))}
    </div>
  )
}

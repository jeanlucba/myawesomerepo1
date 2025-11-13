import type { FormattedPosition } from '../../types'
import { formatAddress, formatDate, formatDays } from '../../lib/utils'

interface PositionTableProps {
  positions: FormattedPosition[]
  onClose: (positionId: number) => void
  isClosing: boolean
}

export function PositionTable({ positions, onClose, isClosing }: PositionTableProps) {
  if (positions.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
        <svg
          className="mx-auto h-12 w-12 text-gray-600 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-gray-400">You don't have any staking positions yet</p>
        <p className="text-gray-500 text-sm mt-2">Select a tier above to start staking</p>
      </div>
    )
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Position
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Staked
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Interest
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Return
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              APY
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {positions.map((position) => (
            <tr
              key={position.positionId}
              className="hover:bg-gray-800/50 transition-colors"
            >
              <td className="px-4 py-4 text-sm">
                <div>
                  <div className="font-semibold">#{position.positionId}</div>
                  <div className="text-xs text-gray-400">
                    {formatDate(position.createdDate.getTime() / 1000)}
                  </div>
                </div>
              </td>
              
              <td className="px-4 py-4">
                <div className="font-semibold">{position.etherStaked} ASTR</div>
              </td>
              
              <td className="px-4 py-4">
                <div className="font-semibold text-green-400">
                  {position.etherInterest} ASTR
                </div>
              </td>
              
              <td className="px-4 py-4">
                <div className="font-semibold text-primary-400">
                  {position.totalReturn} ASTR
                </div>
              </td>
              
              <td className="px-4 py-4">
                <div className="text-sm">{(position.percentInterest / 100).toFixed(2)}%</div>
              </td>
              
              <td className="px-4 py-4">
                {position.open ? (
                  <div>
                    {position.isUnlocked ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-700">
                        ✓ Unlocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-400 border border-yellow-700">
                        🔒 {formatDays(position.daysRemaining)}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-400">
                    Closed
                  </span>
                )}
              </td>
              
              <td className="px-4 py-4">
                {position.open ? (
                  <button
                    onClick={() => onClose(position.positionId)}
                    disabled={isClosing}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isClosing ? 'Processing...' : 'Withdraw'}
                  </button>
                ) : (
                  <span className="text-gray-500 text-sm">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

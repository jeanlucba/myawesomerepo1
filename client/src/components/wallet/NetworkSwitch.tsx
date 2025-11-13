import { useNetwork } from '../../hooks'
import { NETWORKS } from '../../config/networks'
import type { SupportedChainId } from '../../types'

export function NetworkSwitch() {
  const { chainId, network, isSupported, isSwitching, switchToChain } = useNetwork()
  
  if (isSupported && network) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg text-sm">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span>{network.displayName}</span>
      </div>
    )
  }
  
  return (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
        Unsupported Network
      </h3>
      <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
        Please switch to a supported network:
      </p>
      <div className="flex gap-2">
        {Object.values(NETWORKS).map((net) => (
          <button
            key={net.id}
            onClick={() => switchToChain(net.id as SupportedChainId)}
            disabled={isSwitching}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isSwitching ? 'Switching...' : net.displayName}
          </button>
        ))}
      </div>
    </div>
  )
}

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { formatAddress } from '../../lib/utils'
import { useWalletStore } from '../../store/walletStore'
import { useEffect } from 'react'

export function ConnectButton() {
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { setLastConnected, clearLastConnected } = useWalletStore()
  
  // Save last connected wallet
  useEffect(() => {
    if (isConnected && address && chainId) {
      setLastConnected(address, chainId)
    }
  }, [isConnected, address, chainId, setLastConnected])
  
  const handleDisconnect = () => {
    disconnect()
    clearLastConnected()
  }
  
  if (isConnected && address) {
    return (
      <button
        onClick={handleDisconnect}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
      >
        {formatAddress(address)}
      </button>
    )
  }
  
  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Connecting...' : `Connect ${connector.name}`}
        </button>
      ))}
    </div>
  )
}

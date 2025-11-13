import { useChainId, useSwitchChain, useAccount } from 'wagmi'
import { useMemo } from 'react'
import { isSupportedChain, getNetwork } from '../config/networks'
import type { Network } from '../types'

export function useNetwork() {
  const chainId = useChainId()
  const { isConnected } = useAccount()
  const { switchChain, isPending } = useSwitchChain()
  
  const network = useMemo<Network | undefined>(() => {
    return getNetwork(chainId)
  }, [chainId])
  
  const isSupported = useMemo(() => {
    return isSupportedChain(chainId)
  }, [chainId])
  
  const switchToChain = async (targetChainId: number) => {
    if (!isSupportedChain(targetChainId)) {
      throw new Error('Unsupported chain')
    }
    
    await switchChain({ chainId: targetChainId })
  }
  
  return {
    chainId,
    network,
    isSupported,
    isConnected,
    isSwitching: isPending,
    switchToChain,
  }
}

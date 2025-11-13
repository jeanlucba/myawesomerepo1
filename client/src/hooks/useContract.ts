import { usePublicClient, useWalletClient } from 'wagmi'
import { getContract, type GetContractReturnType } from 'viem'
import { useMemo } from 'react'
import { getContractAddress } from '../config/contracts'
import PensionFiV2ABI from '../abis/PensionFiV2.json'
import TransactionsV2ABI from '../abis/TransactionsV2.json'

export function useContract(
  contractName: 'PensionFiV2' | 'TransactionsV2',
  chainId?: number
) {
  const publicClient = usePublicClient({ chainId })
  const { data: walletClient } = useWalletClient({ chainId })
  
  return useMemo(() => {
    if (!publicClient || !chainId) return null
    
    const address = getContractAddress(chainId, contractName)
    if (!address) return null
    
    const abi = contractName === 'PensionFiV2' ? PensionFiV2ABI : TransactionsV2ABI
    
    return getContract({
      address,
      abi,
      client: walletClient || publicClient,
    })
  }, [contractName, chainId, publicClient, walletClient])
}

export type PensionFiV2Contract = NonNullable<ReturnType<typeof useContract>>

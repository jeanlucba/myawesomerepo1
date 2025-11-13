import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { parseEther } from 'viem'
import { useContract } from './useContract'
import type { Position, StakingTier, FormattedPosition, FormattedTier } from '../types'
import { formatWei, getDaysRemaining, formatAPY } from '../lib/utils'
import { calculateInterest, isPositionUnlocked } from '../lib/utils/calculations'

export function useStaking() {
  const { address } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const contract = useContract('PensionFiV2', chainId)
  const queryClient = useQueryClient()

  // Fetch user positions
  const {
    data: positions,
    isLoading: positionsLoading,
    error: positionsError,
    refetch: refetchPositions,
  } = useQuery({
    queryKey: ['positions', address, chainId],
    queryFn: async (): Promise<FormattedPosition[]> => {
      if (!contract || !address || !publicClient) return []
      
      // Get position IDs for user
      const positionIds = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'getPositionsByAddress',
        args: [address],
      }) as bigint[]
      
      // Fetch all positions
      const positions = await Promise.all(
        positionIds.map(async (id) => {
          const pos = await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: 'getPosition',
            args: [id],
          }) as any
          
          return pos
        })
      )
      
      // Format positions
      return positions.map((pos): FormattedPosition => {
        const unlockDate = new Date(Number(pos.unlockDate) * 1000)
        const daysRemaining = getDaysRemaining(Number(pos.unlockDate))
        
        return {
          positionId: Number(pos.positionId),
          walletAddress: pos.walletAddress,
          createdDate: new Date(Number(pos.createdDate) * 1000),
          unlockDate,
          percentInterest: Number(pos.percentInterest),
          etherStaked: formatWei(pos.weiStaked),
          etherInterest: formatWei(pos.weiInterest),
          totalReturn: formatWei(pos.weiStaked + pos.weiInterest),
          open: pos.open,
          claimed: pos.claimed,
          daysRemaining,
          isUnlocked: isPositionUnlocked(Number(pos.unlockDate)),
        }
      })
    },
    enabled: !!contract && !!address && !!publicClient,
    refetchInterval: 10000, // Refetch every 10 seconds
  })

  // Fetch staking tiers
  const {
    data: tiers,
    isLoading: tiersLoading,
    error: tiersError,
  } = useQuery({
    queryKey: ['staking-tiers', chainId],
    queryFn: async (): Promise<FormattedTier[]> => {
      if (!contract || !publicClient) return []
      
      // Get active tier IDs
      const tierIds = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'getActiveTiers',
      }) as number[]
      
      // Fetch tier details
      const tiers = await Promise.all(
        tierIds.map(async (id) => {
          const tier = await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: 'getTier',
            args: [id],
          }) as any
          
          return tier
        })
      )
      
      // Format tiers
      return tiers
        .filter((tier) => tier.active)
        .map((tier): FormattedTier => ({
          daysLocked: Number(tier.daysLocked),
          apyPercent: Number(tier.apyBasisPoints) / 100,
          active: tier.active,
          minStakeFormatted: formatWei(tier.minStake, 2),
          maxStakeFormatted: formatWei(tier.maxStake, 0),
        }))
    },
    enabled: !!contract && !!publicClient,
    staleTime: 60000, // Cache for 1 minute
  })

  // Stake mutation
  const stakeMutation = useMutation({
    mutationFn: async ({
      amount,
      daysLocked,
    }: {
      amount: string
      daysLocked: number
    }) => {
      if (!contract || !walletClient) {
        throw new Error('Contract or wallet not initialized')
      }
      
      const value = parseEther(amount)
      
      const hash = await walletClient.writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'stakeTokens',
        args: [daysLocked],
        value,
      })
      
      // Wait for transaction confirmation
      const receipt = await publicClient?.waitForTransactionReceipt({ hash })
      return receipt
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['positions'] })
      queryClient.invalidateQueries({ queryKey: ['contract-health'] })
    },
  })

  // Close position mutation
  const closePositionMutation = useMutation({
    mutationFn: async (positionId: number) => {
      if (!contract || !walletClient) {
        throw new Error('Contract or wallet not initialized')
      }
      
      const hash = await walletClient.writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'closePosition',
        args: [positionId],
      })
      
      const receipt = await publicClient?.waitForTransactionReceipt({ hash })
      return receipt
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] })
      queryClient.invalidateQueries({ queryKey: ['contract-health'] })
    },
  })

  // Calculate interest helper
  const calculateExpectedInterest = (
    amount: string,
    apyBasisPoints: number
  ): string => {
    if (!amount || isNaN(Number(amount))) return '0'
    
    try {
      const amountWei = parseEther(amount)
      const interest = calculateInterest(amountWei, apyBasisPoints)
      return formatWei(interest)
    } catch {
      return '0'
    }
  }

  return {
    // Data
    positions: positions || [],
    tiers: tiers || [],
    
    // Loading states
    positionsLoading,
    tiersLoading,
    isStaking: stakeMutation.isPending,
    isClosing: closePositionMutation.isPending,
    
    // Errors
    positionsError,
    tiersError,
    stakeError: stakeMutation.error,
    closeError: closePositionMutation.error,
    
    // Actions
    stake: stakeMutation.mutate,
    stakeAsync: stakeMutation.mutateAsync,
    closePosition: closePositionMutation.mutate,
    closePositionAsync: closePositionMutation.mutateAsync,
    refetchPositions,
    
    // Helpers
    calculateExpectedInterest,
  }
}

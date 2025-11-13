// Contract Types for PensionFi V2

export interface Position {
  positionId: number
  walletAddress: string
  createdDate: number
  unlockDate: number
  percentInterest: number
  weiStaked: bigint
  weiInterest: bigint
  open: boolean
  claimed: boolean
}

export interface StakingTier {
  daysLocked: number
  apyBasisPoints: number
  active: boolean
  minStake: bigint
  maxStake: bigint
}

export interface ContractHealth {
  balance: bigint
  staked: bigint
  interestPaid: bigint
  positionCount: number
  isPaused: boolean
}

export interface WithdrawalCheck {
  canWithdraw: boolean
  isEarly: boolean
  timeRemaining: bigint
}

export interface Transaction {
  sender: string
  receiver: string
  amount: bigint
  message: string
  timestamp: number
  txHash: string
  transactionType: number
}

// Formatted versions for display
export interface FormattedPosition {
  positionId: number
  walletAddress: string
  createdDate: Date
  unlockDate: Date
  percentInterest: number
  etherStaked: string
  etherInterest: string
  totalReturn: string
  open: boolean
  claimed: boolean
  daysRemaining: number
  isUnlocked: boolean
}

export interface FormattedTier {
  daysLocked: number
  apyPercent: number
  active: boolean
  minStakeFormatted: string
  maxStakeFormatted: string
}

// Contract addresses by chain ID
export type ContractAddresses = {
  [chainId: number]: {
    PensionFiV2: `0x${string}`
    TransactionsV2: `0x${string}`
  }
}

// Transaction status
export enum TransactionStatus {
  IDLE = 'idle',
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface TransactionState {
  status: TransactionStatus
  hash?: string
  error?: Error
}

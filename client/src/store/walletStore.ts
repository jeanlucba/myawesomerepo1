import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WalletState {
  lastConnectedAddress: string | null
  lastConnectedChainId: number | null
  isConnecting: boolean
  
  setLastConnected: (address: string, chainId: number) => void
  clearLastConnected: () => void
  setConnecting: (isConnecting: boolean) => void
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      lastConnectedAddress: null,
      lastConnectedChainId: null,
      isConnecting: false,
      
      setLastConnected: (address, chainId) =>
        set({ lastConnectedAddress: address, lastConnectedChainId: chainId }),
      
      clearLastConnected: () =>
        set({ lastConnectedAddress: null, lastConnectedChainId: null }),
      
      setConnecting: (isConnecting) => set({ isConnecting }),
    }),
    {
      name: 'pensionfi-wallet',
      partialize: (state) => ({
        lastConnectedAddress: state.lastConnectedAddress,
        lastConnectedChainId: state.lastConnectedChainId,
      }),
    }
  )
)

import { http, createConfig } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'
import { shibuya, astar, SUPPORTED_CHAINS } from './networks'

// WalletConnect project ID (get from https://cloud.walletconnect.com/)
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

// Configure wagmi
export const config = createConfig({
  chains: [shibuya, astar],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    walletConnect({
      projectId,
      metadata: {
        name: 'PensionFi',
        description: 'Stake ASTR tokens and earn fixed APY',
        url: 'https://pensionfi.app',
        icons: ['https://pensionfi.app/icon.png'],
      },
      showQrModal: true,
    }),
  ],
  transports: {
    [shibuya.id]: http(),
    [astar.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

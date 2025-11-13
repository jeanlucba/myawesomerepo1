import { ConnectButton } from '../wallet/ConnectButton'
import { NetworkSwitch } from '../wallet/NetworkSwitch'
import { useAccount } from 'wagmi'

export function Header() {
  const { isConnected } = useAccount()
  
  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              PensionFi
            </div>
            <span className="px-2 py-0.5 bg-primary-600/20 text-primary-400 text-xs font-semibold rounded-full">
              V2
            </span>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="/stake" className="text-gray-300 hover:text-white transition-colors">
              Stake
            </a>
            <a href="/portfolio" className="text-gray-300 hover:text-white transition-colors">
              Portfolio
            </a>
            <a href="/about" className="text-gray-300 hover:text-white transition-colors">
              About
            </a>
          </nav>
          
          {/* Wallet */}
          <div className="flex items-center gap-3">
            {isConnected && <NetworkSwitch />}
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  )
}

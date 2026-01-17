'use client';

import { useAccount } from 'wagmi';
import { AuthButton } from './components/AuthButton';
import { Faucet } from './components/Faucet';
import { ActivityLog } from './components/ActivityLog';
import { OrderForm } from './components/OrderForm';
import { Orderbook } from './components/Orderbook';
import { BotMonitor } from './components/BotMonitor';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <main className="min-h-screen">
      {/* Terminal Status Bar */}
      <div className="bg-[#000000] border-b border-[#FF9500] px-4 py-1">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <img
                src="/tempo-mark.svg"
                alt="Tempo"
                className="h-5 w-5"
              />
              <span className="text-[#FF9500] font-bold">TEMPO FX</span>
            </div>
            <div className="text-[#8E8E93]">MODERATO</div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-[#00FF41] rounded-full animate-pulse"></span>
              <span className="text-[#00FF41]">LIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-[#8E8E93]">
              {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </div>
            <AuthButton />
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="border-b-2 border-[#FF9500] bg-[#0a0a0a] sticky top-0 z-50">
        <div className="w-full px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="text-[#FF9500] font-bold text-sm">STABLECOIN DEX</div>
              <div className="text-[#00E5FF] text-xs">ALPHAУSD • BETAUSD • THETAUSD</div>
            </div>
            <div className="text-[#8E8E93] text-xs">ENSHRINED EXCHANGE</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full px-2 py-2">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-4xl mx-auto terminal-panel p-8">
            <h2 className="text-3xl font-bold mb-4 text-[#FF9500]">TEMPO FX TERMINAL</h2>
            <p className="text-sm text-[#8E8E93] mb-8 max-w-2xl uppercase">
              Enshrined Stablecoin Exchange // Limit Orders // Flip Orders // Market Orders
            </p>
            <div className="w-full max-w-md">
              <AuthButton />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-2">
            {/* Orderbook - Column 1 */}
            <div className="xl:col-span-1">
              <Orderbook />
            </div>

            {/* Order Form - Column 2 */}
            <div className="xl:col-span-1">
              <OrderForm />
            </div>

            {/* Balances & Bots - Column 3 */}
            <div className="xl:col-span-1 space-y-2">
              <Faucet />
              <BotMonitor />
            </div>

            {/* Activity Log - Column 4 */}
            <div className="xl:col-span-1">
              <ActivityLog />
            </div>
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <footer className="border-t-2 border-[#FF9500] bg-[#000000] mt-2">
        <div className="w-full px-4 py-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex gap-6 text-[#8E8E93]">
              <a
                href="https://docs.tempo.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#FF9500] transition-colors"
              >
                DOCS
              </a>
              <a
                href="https://explore.tempo.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#FF9500] transition-colors"
              >
                EXPLORER
              </a>
              <a
                href="https://tempo.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#FF9500] transition-colors"
              >
                TEMPO.XYZ
              </a>
            </div>
            <div className="text-[#8E8E93]">
              TEMPO MODERATO TESTNET // CHAIN ID: 42431
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

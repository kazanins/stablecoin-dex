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
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-black bg-white sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="/tempo-mark.svg"
                alt="Tempo"
                className="h-8 w-8"
              />
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">Welcome to Tempo DEX Demo</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl">
              Experience Tempo's enshrined Stablecoin DEX with support for Limit Orders,
              Flip Orders, and Market Orders. Sign up with passkeys to get started.
            </p>
            <div className="w-full max-w-md">
              <AuthButton />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            {/* Orderbook - Column 1 */}
            <div className="xl:col-span-1">
              <Orderbook />
            </div>

            {/* Order Form - Column 2 */}
            <div className="xl:col-span-1">
              <OrderForm />
            </div>

            {/* Balances & Bots - Column 3 */}
            <div className="xl:col-span-1 space-y-4">
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

      {/* Footer */}
      <footer className="border-t border-black mt-4">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
            <div>
              <p>Built for Tempo</p>
            </div>
            <div className="flex gap-4">
              <a
                href="https://docs.tempo.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black transition-colors"
              >
                Docs
              </a>
              <a
                href="https://explore.tempo.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black transition-colors"
              >
                Explorer
              </a>
              <a
                href="https://tempo.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black transition-colors"
              >
                tempo.xyz
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';

interface BotState {
  id: string;
  address: string;
  pair: string;
  isActive: boolean;
  orderCount: number;
  lastActivity: number;
}

export function BotMonitor() {
  const [bots, setBots] = useState<BotState[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBotStatus = async () => {
    try {
      const response = await fetch('/api/bots/status');
      if (response.ok) {
        const data = await response.json();
        setBots(data.bots || []);
      }
    } catch (error) {
      console.error('Failed to fetch bot status:', error);
    }
  };

  useEffect(() => {
    fetchBotStatus();
    // Poll for bot status every 15 seconds (reduced to avoid overhead)
    const interval = setInterval(fetchBotStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleStartBots = async () => {
    setIsStarting(true);
    setError(null);

    try {
      const response = await fetch('/api/bots/start', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start bots');
      }

      setBots(data.bots || []);
    } catch (err: any) {
      setError(err.message || 'Failed to start bots');
    } finally {
      setIsStarting(false);
    }
  };

  const anyBotActive = bots.some(bot => bot.isActive);

  return (
    <div className="terminal-panel">
      <div className="terminal-header flex items-center justify-between">
        <span>MARKET MAKERS</span>
        {!anyBotActive && (
          <button
            onClick={handleStartBots}
            disabled={isStarting}
            className="px-2 py-1 bg-[#00FF41] text-black hover:bg-[#00FF41]/80 disabled:bg-[#333333] disabled:text-[#8E8E93] transition-colors text-[10px] font-bold terminal-value"
          >
            {isStarting ? '...' : '▶ START'}
          </button>
        )}
      </div>

      <div className="p-2">
        {error && (
          <div className="mb-2 p-2 bg-[#000000] border border-[#FF3B30] text-[#FF3B30] text-[10px] terminal-value">
            ⚠ {error}
          </div>
        )}

        <div className="space-y-2">
          {bots.length === 0 ? (
            <p className="text-[10px] text-[#8E8E93] uppercase">NO BOTS ACTIVE</p>
          ) : (
            bots.map((bot) => (
              <div
                key={bot.id}
                className="border border-[#333333] bg-[#000000] p-2 hover:border-[#FF9500] transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        bot.isActive ? 'bg-[#00FF41] animate-pulse' : 'bg-[#8E8E93]'
                      }`}
                    />
                    <span className="font-bold text-[10px] text-[#FFD60A] terminal-value">{bot.pair}</span>
                  </div>
                </div>

                <div className="text-[10px] text-[#8E8E93]">
                  <div className="flex justify-between">
                    <span>ORDERS:</span>
                    <span className="font-mono text-[#00E5FF] terminal-value">{bot.orderCount}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

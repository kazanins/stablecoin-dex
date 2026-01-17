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
    <div className="border border-black p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold">Bots</h2>
        {!anyBotActive && (
          <button
            onClick={handleStartBots}
            disabled={isStarting}
            className="px-2 py-1 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 transition-colors text-xs"
          >
            {isStarting ? '...' : 'Start'}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {bots.length === 0 ? (
          <p className="text-xs text-gray-600">No bots</p>
        ) : (
          bots.map((bot) => (
            <div
              key={bot.id}
              className="border border-gray-300 p-2"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      bot.isActive ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                  <span className="font-medium text-xs">{bot.pair}</span>
                </div>
              </div>

              <div className="text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Orders:</span>
                  <span className="font-mono">{bot.orderCount}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

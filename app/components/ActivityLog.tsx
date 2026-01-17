'use client';

import { useState, useEffect } from 'react';
import { getActivities, clearActivities, formatActivity, type Activity } from '@/lib/local-storage';
import { TEMPO_MODERATO } from '@/lib/constants';

export function ActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([]);

  const loadActivities = () => {
    setActivities(getActivities());
  };

  useEffect(() => {
    loadActivities();
    // Poll for new activities every 5 seconds (reduced to avoid overhead)
    const interval = setInterval(loadActivities, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClear = () => {
    if (confirm('Clear all activity history?')) {
      clearActivities();
      setActivities([]);
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'order_placed':
        return 'text-[#00E5FF]';
      case 'order_filled':
        return 'text-[#00FF41]';
      case 'order_cancelled':
        return 'text-[#FF3B30]';
      case 'swap_executed':
        return 'text-[#FFD60A]';
      case 'faucet_claim':
        return 'text-[#8E8E93]';
      default:
        return 'text-[#E5E5EA]';
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'order_placed':
        return '▸';
      case 'order_filled':
        return '✓';
      case 'order_cancelled':
        return '✗';
      case 'swap_executed':
        return '⇄';
      case 'faucet_claim':
        return '💧';
      default:
        return '•';
    }
  };

  return (
    <div className="terminal-panel h-full flex flex-col">
      <div className="terminal-header flex items-center justify-between">
        <span>ACTIVITY LOG</span>
        {activities.length > 0 && (
          <button
            onClick={handleClear}
            className="text-[10px] text-[#8E8E93] hover:text-[#FF3B30] terminal-value"
          >
            ✗ CLEAR
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {activities.length === 0 ? (
            <p className="text-[10px] text-[#8E8E93] uppercase">NO ACTIVITY</p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="border-b border-[#333333] pb-1.5 last:border-0"
              >
                <p className={`text-[10px] font-mono terminal-value ${getActivityColor(activity.type)}`}>
                  <span className="mr-1">{getActivityIcon(activity.type)}</span>
                  {formatActivity(activity)}
                </p>
                {activity.txHash && (
                  <a
                    href={`${TEMPO_MODERATO.explorer}/tx/${activity.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#00E5FF] hover:text-[#FF9500] terminal-value inline-block mt-0.5"
                  >
                    → EXPLORER
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

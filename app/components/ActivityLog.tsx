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
        return 'text-blue-600';
      case 'order_filled':
        return 'text-green-600';
      case 'order_cancelled':
        return 'text-red-600';
      case 'swap_executed':
        return 'text-purple-600';
      case 'faucet_claim':
        return 'text-gray-600';
      default:
        return 'text-black';
    }
  };

  return (
    <div className="border border-black p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold">Activity</h2>
        {activities.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-gray-600 hover:text-black"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-1.5 flex-1 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-xs text-gray-600">No activity yet</p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="border-b border-gray-200 pb-1.5 last:border-0"
            >
              <p className={`text-xs font-mono ${getActivityColor(activity.type)}`}>
                {formatActivity(activity)}
              </p>
              {activity.txHash && (
                <a
                  href={`${TEMPO_MODERATO.explorer}/tx/${activity.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View →
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

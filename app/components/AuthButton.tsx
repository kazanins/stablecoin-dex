'use client';

import { useConnect, useAccount, useDisconnect, useConnectors } from 'wagmi';
import { useState, useEffect } from 'react';

export function AuthButton() {
  const { address, isConnected } = useAccount();
  const { connect, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const connectors = useConnectors();
  const [showError, setShowError] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const webAuthnConnector = connectors[0]; // WebAuthn connector

  const handleSignUp = () => {
    if (!webAuthnConnector) return;
    setShowError(false);
    connect(
      { connector: webAuthnConnector },
      {
        onError: () => setShowError(true),
      }
    );
  };

  const handleSignIn = () => {
    if (!webAuthnConnector) return;
    setShowError(false);
    connect(
      { connector: webAuthnConnector },
      {
        onError: () => setShowError(true),
      }
    );
  };

  const handleSignOut = () => {
    disconnect();
    setShowError(false);
  };

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-3 py-1 border border-[#333333] text-[#8E8E93]">
          <span className="text-[10px] terminal-value">LOADING...</span>
        </div>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1 border border-[#00FF41] bg-[#000000]">
          <div className="w-1.5 h-1.5 bg-[#00FF41] rounded-full animate-pulse" />
          <span className="font-mono text-[10px] text-[#00FF41] terminal-value">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="px-3 py-1 border border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white transition-colors font-bold text-[10px] terminal-value"
        >
          SIGN OUT
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 items-center">
      <div className="flex gap-2">
        <button
          onClick={handleSignUp}
          disabled={isPending}
          className="px-4 py-2 bg-[#FF9500] text-black border border-[#FF9500] hover:bg-[#FF9500]/80 disabled:bg-[#333333] disabled:border-[#333333] disabled:text-[#8E8E93] transition-colors font-bold text-xs terminal-value uppercase"
        >
          {isPending ? 'CREATING...' : 'SIGN UP'}
        </button>
        <button
          onClick={handleSignIn}
          disabled={isPending}
          className="px-4 py-2 border border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF] hover:text-black disabled:border-[#333333] disabled:text-[#8E8E93] transition-colors font-bold text-xs terminal-value uppercase"
        >
          {isPending ? 'SIGNING IN...' : 'SIGN IN'}
        </button>
      </div>
      {showError && error && (
        <div className="text-[#FF3B30] text-[10px] max-w-md terminal-value">
          ⚠ {error.message || 'Authentication failed. Please try again.'}
        </div>
      )}
    </div>
  );
}

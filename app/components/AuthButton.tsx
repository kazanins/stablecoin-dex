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
      { connector: webAuthnConnector, capabilities: { type: 'sign-up' } },
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
      <div className="flex items-center gap-4">
        <div className="px-4 py-2 border border-gray-300 text-gray-400">
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 border border-black">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="font-mono text-sm">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 border border-black hover:bg-black hover:text-white transition-colors font-medium"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <button
          onClick={handleSignUp}
          disabled={isPending}
          className="px-6 py-3 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 transition-colors font-medium"
        >
          {isPending ? 'Creating account...' : 'Sign Up'}
        </button>
        <button
          onClick={handleSignIn}
          disabled={isPending}
          className="px-6 py-3 border border-black hover:bg-black hover:text-white disabled:border-gray-400 disabled:text-gray-400 transition-colors font-medium"
        >
          {isPending ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
      {showError && error && (
        <div className="text-red-600 text-sm max-w-md">
          {error.message || 'Authentication failed. Please try again.'}
        </div>
      )}
      <p className="text-sm text-gray-600 max-w-md">
        Sign up to create a new Tempo account with passkeys, or sign in with an existing passkey.
      </p>
    </div>
  );
}

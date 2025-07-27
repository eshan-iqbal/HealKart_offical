'use client';

import { useAuth } from '@/contexts/AuthContext';

export function AuthDebug() {
  const { user, loading } = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs z-50">
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>User: {user ? user.email : 'null'}</div>
      <div>Role: {user?.role || 'null'}</div>
    </div>
  );
} 
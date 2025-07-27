'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAuthPage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Auth State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>User:</strong> {user ? 'Logged In' : 'Not Logged In'}
              </div>
              {user && (
                <div className="space-y-2">
                  <div><strong>ID:</strong> {user._id}</div>
                  <div><strong>Email:</strong> {user.email}</div>
                  <div><strong>Name:</strong> {user.fullName}</div>
                  <div><strong>Role:</strong> {user.role}</div>
                  <div><strong>Phone:</strong> {user.phone || 'Not set'}</div>
                  <div><strong>Address:</strong> {user.address || 'Not set'}</div>
                  <div><strong>Verified:</strong> {user.isVerified ? 'Yes' : 'No'}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 space-x-4">
          <Button asChild>
            <a href="/">Go to Home</a>
          </Button>
          <Button asChild>
            <a href="/orders">Go to Orders</a>
          </Button>
          <Button asChild>
            <a href="/admin">Go to Admin</a>
          </Button>
          {user && (
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 
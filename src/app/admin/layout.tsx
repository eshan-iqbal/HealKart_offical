// src/app/admin/layout.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Users, Bell, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { io } from 'socket.io-client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/sign-in?redirect_url=/admin/orders");
      } else if (user.role !== "admin") {
        router.replace("/");
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetch('/api/admin/notifications')
        .then(res => res.json())
        .then(data => setNotifications(data.notifications || []));
      // Real-time updates
      const socket = io({ path: '/api/admin/notifications/socket' });
      socket.on('new-order', (notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 20));
      });
      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  if (loading || !user || user.role !== "admin") {
    return <div className="flex h-screen items-center justify-center">Checking admin access...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin/orders">
              <Button variant="ghost" className="flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Orders</span>
              </Button>
            </Link>
            <Link href="/admin/products">
              <Button variant="ghost" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Products</span>
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="ghost" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Users</span>
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none" aria-label="Notifications">
                  <Bell className="h-6 w-6 text-orange-500" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{notifications.length}</span>
                  )}
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-xs p-0 bg-white rounded-xl shadow-2xl border border-gray-100">
                <DialogHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-2 border-b">
                  <DialogTitle className="text-lg font-semibold">Notifications</DialogTitle>
                  {notifications.length > 0 && (
                    <button
                      className="p-1 rounded hover:bg-gray-100 text-gray-500"
                      onClick={() => setNotifications([])}
                      title="Clear All"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </DialogHeader>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 bg-gray-50">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-gray-400 text-center">No new notifications</div>
                  ) : notifications.map((n, i) => (
                    <div key={i} className="p-4 flex flex-col gap-1 hover:bg-orange-50 transition">
                      <div className="font-medium text-gray-900 text-sm">New Order: <span className="text-orange-600">{n.orderId}</span></div>
                      <div className="text-gray-600 text-xs">{n.userEmail} placed an order for <span className="font-semibold">₹{n.totalAmount}</span></div>
                      <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <Link href="/">
              <Button variant="outline">Back to Store</Button>
            </Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto py-6">{children}</main>
    </div>
  );
}

// src/app/admin/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus, assignOrder, getAssignedOrders, getUnassignedOrders, type OrderStatus } from '@/services/orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Share2, Truck, PackageCheck, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';


interface AdminUser {
  _id: string;
  email: string;
  fullName: string;
  role: 'admin';
}

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [assigningOrder, setAssigningOrder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    try {
      let data;
      if (viewMode === 'assigned' && user?._id) {
        data = await getAssignedOrders(user._id);
      } else if (viewMode === 'unassigned') {
        data = await getUnassignedOrders();
      } else {
        data = await getAllOrders();
      }
      setOrders(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        const admins = data.users.filter((u: any) => u.role === 'admin');
        setAdminUsers(admins);
      }
    } catch (error) {
      console.error('Error fetching admin users:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchAdminUsers();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [viewMode, user?._id]);

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-500',
      processing: 'bg-blue-500',
      shipped: 'bg-purple-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500'
    };

    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors] || 'bg-gray-500'} text-white`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingStatus(orderId);
      await updateOrderStatus(orderId, newStatus);
      await fetchOrders();
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleOrderAssignment = async (orderId: string, adminId: string) => {
    if (!user?._id) return;
    
    try {
      setAssigningOrder(orderId);
      await assignOrder(orderId, adminId, user._id);
      await fetchOrders();
      toast.success('Order assigned successfully');
    } catch (error) {
      toast.error('Failed to assign order');
      console.error('Error assigning order:', error);
    } finally {
      setAssigningOrder(null);
    }
  };

  const shareOnWhatsApp = (order: any) => {
    const message = `Order Update\n\nOrder ID: ${order.id}\nStatus: ${order.status}\nItems:\n${order.items.map((item: any) => `- ${item.name} (x${item.quantity})`).join('\n')}\nTotal: ₹${order.totalAmount}\n\nThank you for shopping with us!`;
    const phoneNumber = order.shippingAddress.mobileNumber.startsWith('+91') 
      ? order.shippingAddress.mobileNumber 
      : `+91${order.shippingAddress.mobileNumber}`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // PDF Invoice Generation with pdfmake
  const handleDownloadInvoice = async (order: any) => {
    // Dynamically import pdfmake and vfs_fonts only on the client
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
    const pdfMake = pdfMakeModule.default || pdfMakeModule;
    pdfMake.vfs =
      (pdfFontsModule && pdfFontsModule.pdfMake && pdfFontsModule.pdfMake.vfs) ||
      (pdfFontsModule && pdfFontsModule.default && pdfFontsModule.default.pdfMake && pdfFontsModule.default.pdfMake.vfs) ||
      (pdfFontsModule && pdfFontsModule.default && pdfFontsModule.default.vfs) ||
      (pdfFontsModule && pdfFontsModule.vfs);

    // Get logo as base64
    let logoBase64 = '';
    try {
      const logoUrl = '/images/logo.png';
      const getBase64FromUrl = async (url: string) => {
        const res = await fetch(url);
        const blob = await res.blob();
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      };
      logoBase64 = await getBase64FromUrl(logoUrl);
    } catch (e) {}

    const docDefinition = {
      content: [
        {
          columns: [
            logoBase64 ? { image: logoBase64, width: 60 } : {},
            [
              { text: '1nceMore - Thrifted Treasures', style: 'header' },
              { text: 'Kulgam Jammu & Kashmir, 192231', style: 'subheader' },
              { text: 'Email: 1ncemore.es@gmail.com | Phone: +91-6006223504', style: 'subheader' },
            ]
          ],
          columnGap: 20
        },
        { canvas: [ { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 } ], margin: [0, 10, 0, 10] },
        { text: 'INVOICE', style: 'invoiceTitle' },
        {
          columns: [
            [
              { text: 'Billed To:', style: 'tableHeader' },
              { text: order.shippingAddress.fullName },
              { text: order.shippingAddress.street },
              { text: `${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zip}` },
              { text: order.shippingAddress.country },
              { text: `Phone: ${order.shippingAddress.mobileNumber}` },
            ],
            [
              { text: `Order ID: ${order._id}` },
              { text: `Order Date: ${order.createdAt ? format(new Date(order.createdAt), 'PPP p') : ''}` },
              { text: `Payment Method: ${order.paymentMethod}${order.upiId ? ' (' + order.upiId + ')' : ''}` },
            ]
          ],
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 40, 60, 60],
            body: [
              [
                { text: 'Item', style: 'tableHeader' },
                { text: 'Qty', style: 'tableHeader' },
                { text: 'Price', style: 'tableHeader' },
                { text: 'Total', style: 'tableHeader' },
              ],
              ...order.items.map((item: any) => [
                item.name,
                item.quantity,
                `₹${item.price.toFixed(2)}`,
                `₹${(item.price * item.quantity).toFixed(2)}`
              ])
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 10]
        },
        {
          columns: [
            { width: '*', text: '' },
            {
              table: {
                body: [
                  [
                    { text: 'Shipping:', style: 'tableHeader', alignment: 'right' },
                    { text: (typeof order.shippingCost === 'number' ? (order.shippingCost === 0 ? 'Free' : `₹${order.shippingCost.toFixed(2)}`) : 'Free'), alignment: 'right' }
                  ],
                  [
                    { text: 'Total Amount:', style: 'tableHeader', alignment: 'right' },
                    { text: `₹${order.totalAmount.toFixed(2)}`, alignment: 'right' }
                  ]
                ]
              },
              layout: 'noBorders',
              width: 200
            }
          ]
        },
        { text: 'Free delivery on orders above ₹500', style: 'footer', margin: [0, 10, 0, 0] },
        { text: 'Thank you for shopping with us!', style: 'footer', margin: [0, 20, 0, 0] },
        { text: 'For support, contact 1ncemore.es@gmail.com', style: 'footer' }
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 2] },
        subheader: { fontSize: 10, margin: [0, 0, 0, 2] },
        invoiceTitle: { fontSize: 14, bold: true, margin: [0, 0, 0, 8] },
        tableHeader: { bold: true, fontSize: 11, fillColor: '#eeeeee' },
        footer: { fontSize: 10, italics: true, color: '#555' }
      },
      defaultStyle: {
        font: 'Roboto',
        fontSize: 10
      }
    };
    pdfMake.createPdf(docDefinition).download(`Invoice_${order._id}.pdf`);
  };

  const getAssignedAdminName = (assignedTo: string) => {
    const admin = adminUsers.find(a => a._id === assignedTo);
    return admin ? admin.fullName : 'Unknown Admin';
  };

  // Filter orders by search term
  const filteredOrders = orders.filter(order => {
    const term = searchTerm.toLowerCase();
    return (
      order._id?.toLowerCase().includes(term) ||
      order.shippingAddress.fullName.toLowerCase().includes(term) ||
      order.shippingAddress.mobileNumber.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>Orders Dashboard</CardTitle>
            <div className="flex items-center gap-4 flex-wrap">
              <Input
                type="text"
                placeholder="Search by Order ID, Name, or Phone"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={viewMode} onValueChange={(value: 'all' | 'assigned' | 'unassigned') => setViewMode(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="assigned">My Assigned Orders</SelectItem>
                  <SelectItem value="unassigned">Unassigned Orders</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left">Order ID</th>
                  <th className="p-4 text-left">Customer</th>
                  <th className="p-4 text-left">Phone</th>
                  <th className="p-4 text-left">Items</th>
                  <th className="p-4 text-left">Total</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Assigned To</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{order._id}</td>
                    <td className="p-4">
                      <div>{order.shippingAddress.fullName}</div>
                      <div className="text-sm text-gray-500">{order.userEmail}</div>
                    </td>
                    <td className="p-4">{order.shippingAddress.mobileNumber}</td>
                    <td className="p-4">
                      {order.items.map((item: any) => (
                        <div key={`${order._id}-${item.id}`} className="mb-1">
                          {item.name} (x{item.quantity})
                        </div>
                      ))}
                    </td>
                    <td className="p-4">₹{order.totalAmount}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(order.status)}
                        <div className="flex gap-2 flex-wrap">
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(order._id, 'processing')}
                              disabled={updatingStatus === order._id}
                            >
                              <Truck className="mr-2 h-4 w-4" />
                              Process
                            </Button>
                          )}
                          {order.status === 'processing' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(order._id, 'shipped')}
                              disabled={updatingStatus === order._id}
                            >
                              <Truck className="mr-2 h-4 w-4" />
                              Ship
                            </Button>
                          )}
                          {order.status === 'shipped' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(order._id, 'delivered')}
                              disabled={updatingStatus === order._id}
                            >
                              <PackageCheck className="mr-2 h-4 w-4" />
                              Deliver
                            </Button>
                          )}
                          {/* Cancel button for all except delivered/cancelled */}
                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                              disabled={updatingStatus === order._id}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {order.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{getAssignedAdminName(order.assignedTo)}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <span className="text-sm text-gray-500">Unassigned</span>
                          <Select
                            onValueChange={(adminId) => handleOrderAssignment(order._id, adminId)}
                            disabled={assigningOrder === order._id}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Assign" />
                            </SelectTrigger>
                            <SelectContent>
                              {adminUsers.map((admin) => (
                                <SelectItem key={admin._id} value={admin._id}>
                                  {admin.fullName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareOnWhatsApp(order)}
                        className="flex items-center gap-2"
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(order)}
                        className="flex items-center gap-2 mt-2"
                      >
                        Download Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

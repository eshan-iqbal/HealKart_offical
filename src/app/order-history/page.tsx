// src/app/order-history/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Package, IndianRupee, CalendarDays, Loader2, MapPin, Phone, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getUserOrders, type Order, type OrderStatus } from '@/services/orders'; // Import Order type and service
import { format, parseISO } from 'date-fns'; // Import parseISO for string dates
import { useAuth } from '@/contexts/AuthContext';


// Helper function to get status icon and color
function getStatusInfo(status: string) {
  switch (status.toLowerCase()) {
    case 'delivered':
      return { 
        icon: CheckCircle, 
        color: 'text-green-600', 
        bgColor: 'bg-green-50', 
        borderColor: 'border-green-200',
        label: 'Delivered'
      };
    case 'shipped':
      return { 
        icon: Truck, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50', 
        borderColor: 'border-blue-200',
        label: 'Shipped'
      };
    case 'processing':
      return { 
        icon: Clock, 
        color: 'text-orange-600', 
        bgColor: 'bg-orange-50', 
        borderColor: 'border-orange-200',
        label: 'Processing'
      };
    case 'pending':
      return { 
        icon: Clock, 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-50', 
        borderColor: 'border-yellow-200',
        label: 'Pending'
      };
    case 'cancelled':
      return { 
        icon: AlertCircle, 
        color: 'text-red-600', 
        bgColor: 'bg-red-50', 
        borderColor: 'border-red-200',
        label: 'Cancelled'
      };
    default:
      return { 
        icon: Clock, 
        color: 'text-gray-600', 
        bgColor: 'bg-gray-50', 
        borderColor: 'border-gray-200',
        label: status.charAt(0).toUpperCase() + status.slice(1)
      };
  }
}

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && user._id) {
      setIsLoading(true);
      setError(null); // Clear previous errors
      getUserOrders(user._id)
        .then(data => {
          setOrders(data);
        })
        .catch(err => {
          console.error("Failed to fetch orders:", err);
          setError('Failed to load your order history. Please try again later.');
        })
        .finally(() => {
           setIsLoading(false);
        });
    } else if (!loading && !user) {
      setIsLoading(false);
    }
  }, [user, loading]);

  // PDF Invoice Generation with pdfmake
  const handleDownloadInvoice = async (order: Order) => {
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
              { text: `Order Date: ${typeof order.createdAt === 'string' ? format(parseISO(order.createdAt), 'PPP p') : ''}` },
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
              ...order.items.map(item => [
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
        { text: 'Thank you for shopping with us!', style: 'footer', margin: [0, 20, 0, 0] },
        { text: 'For support, contact 1ncemore.es@gmail.com', style: 'footer' },
        { text: 'Free delivery on orders above ₹500', style: 'footer', margin: [0, 10, 0, 0] }
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
        <h1 className="mb-8 text-center text-3xl font-bold tracking-tight text-primary md:text-4xl">
          Order History
        </h1>
        {/* Skeleton Loading State */}
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <Skeleton className="h-6 w-3/4" />
                 <Skeleton className="h-5 w-20" />
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                 <Skeleton className="h-4 w-1/2" />
                 <Skeleton className="h-4 w-1/4" />
                 <div className="flex space-x-2 pt-2">
                    <Skeleton className="h-10 w-10 rounded border" />
                    <Skeleton className="h-10 w-10 rounded border" />
                 </div>
              </CardContent>
               <CardFooter>
                 <Skeleton className="h-8 w-24 rounded" />
               </CardFooter>
            </Card>
           ))}
         </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center md:px-6 lg:py-12">
        <h1 className="mb-8 text-center text-3xl font-bold tracking-tight text-primary md:text-4xl">
          Order History
        </h1>
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Sign in to view your orders</h3>
            <p className="text-muted-foreground mb-4">Please sign in to access your order history and track your purchases.</p>
            <Button asChild className="w-full">
              <Link href="/sign-in?redirect_url=/order-history">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-destructive md:px-6 lg:py-12">
        <h1 className="mb-8 text-center text-3xl font-bold tracking-tight text-primary md:text-4xl">
          Order History
        </h1>
        <Card className="max-w-md mx-auto border-destructive">
          <CardHeader>
            <CardTitle>Error Loading Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
      <h1 className="mb-8 text-center text-3xl font-bold tracking-tight text-primary md:text-4xl">
        Order History
      </h1>

      {orders.length === 0 ? (
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <div className="relative mb-6">
              <Package className="mx-auto h-16 w-16 text-muted-foreground" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-xs font-bold">0</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground mb-6">Start your thrifted fashion journey! Discover unique pieces that tell stories.</p>
            <Button asChild className="bg-orange-600 hover:bg-orange-700">
              <Link href="/clothes">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <Card key={order._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {/* Order Header */}
                <CardHeader className={`${statusInfo.bgColor} ${statusInfo.borderColor} border-b-2 p-6`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${statusInfo.bgColor} ${statusInfo.borderColor} border`}>
                        <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          Order #{order._id?.slice(-8).toUpperCase()}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarDays className="h-4 w-4" />
                          {typeof order.createdAt === 'string'
                            ? format(parseISO(order.createdAt), 'PPP p')
                            : 'Invalid Date'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${statusInfo.bgColor} ${statusInfo.color} border ${statusInfo.borderColor} font-medium`}>
                        {statusInfo.label}
                      </Badge>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">₹{order.totalAmount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Products Grid */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Items Ordered
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {order.items.map((item, index) => (
                        <div key={`${order._id}-${item.id}-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="relative">
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={60}
                              height={60}
                              className="h-15 w-15 rounded-lg object-cover border"
                            />
                            <div className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-sm text-gray-600">₹{item.price.toFixed(2)} each</p>
                            <p className="text-xs text-gray-500">Total: ₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Payment Information */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <IndianRupee className="w-4 h-4" />
                        Payment Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="font-medium capitalize">{order.paymentMethod}</span>
                        </div>
                        {order.upiId && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">UPI ID:</span>
                            <span className="font-medium">{order.upiId}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="font-bold text-lg text-orange-600">₹{order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Information */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Shipping Address
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="font-medium">{order.shippingAddress.fullName}</p>
                        <p className="text-gray-600">{order.shippingAddress.street}</p>
                        {order.shippingAddress.landmark && (
                          <p className="text-gray-600">Near: {order.shippingAddress.landmark}</p>
                        )}
                        <p className="text-gray-600">
                          {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zip}
                        </p>
                        <p className="text-gray-600">{order.shippingAddress.country}</p>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{order.shippingAddress.mobileNumber}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="bg-gray-50 p-6">
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <Button variant="outline" size="sm" className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50">
                      <Truck className="w-4 h-4 mr-2" />
                      Track Order
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50" onClick={() => handleDownloadInvoice(order)}>
                      Download Invoice
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50">
                      Need Help?
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {orders.length > 0 && (
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-orange-600">{orders.length}</div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    ₹{orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {orders.filter(o => o.status === 'delivered').length}
                  </div>
                  <div className="text-sm text-gray-600">Delivered</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {orders.filter(o => o.status === 'pending' || o.status === 'processing').length}
                  </div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

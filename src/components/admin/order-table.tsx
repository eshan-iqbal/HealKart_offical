'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { IndianRupee, CalendarDays, Loader2, Eye, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { type Order, type OrderStatus, updateOrderStatus } from '@/services/orders'; // Import Order type and service
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface OrderTableProps {
  initialOrders: Order[]; // Expect serialized orders
}

// Helper function to get badge variant based on status
function getStatusBadgeVariant(status: OrderStatus): 'default' | 'secondary' | 'outline' | 'destructive' {
   switch (status.toLowerCase()) {
    case 'delivered': return 'default';
    case 'shipped': return 'secondary';
    case 'processing': return 'outline';
    case 'cancelled': return 'destructive';
    default: return 'outline';
  }
}

const ORDER_STATUSES: OrderStatus[] = ['processing', 'shipped', 'delivered', 'cancelled'];

export function OrderTable({ initialOrders }: OrderTableProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filter, setFilter] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({}); // Track loading state per order
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const { toast } = useToast();

   // Update local state if initialOrders prop changes (e.g., after revalidation)
   useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);


  const filteredOrders = useMemo(() => {
    const lowerCaseFilter = filter.toLowerCase();
    return orders.filter(order => {
      const orderIdMatch = order._id?.toLowerCase().includes(lowerCaseFilter);
      const emailMatch = order.userEmail?.toLowerCase().includes(lowerCaseFilter);
      const statusMatch = order.status.toLowerCase().includes(lowerCaseFilter);
      const addressMatch = `${order.shippingAddress.fullName} ${order.shippingAddress.street} ${order.shippingAddress.city} ${order.shippingAddress.zip}`.toLowerCase().includes(lowerCaseFilter);
      const itemMatch = order.items.some(item => item.name.toLowerCase().includes(lowerCaseFilter));

      return orderIdMatch || emailMatch || statusMatch || addressMatch || itemMatch;
    });
  }, [orders, filter]);

  const handleStatusChange = async (orderId: string | undefined, newStatus: OrderStatus) => {
     if (!orderId) {
      console.error("Order ID is undefined, cannot update status.");
      toast({ title: "Error", description: "Cannot update status: Order ID missing.", variant: "destructive" });
      return;
    }

    setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      if (updatedOrder) {
        // Update the local state
        setOrders(prevOrders =>
          prevOrders.map(o => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
         toast({ title: "Status Updated", description: `Order ${orderId.substring(0, 8)}... status set to ${newStatus}.` });
      } else {
         toast({ title: "Update Failed", description: `Could not find order ${orderId.substring(0, 8)}...`, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
       toast({ title: "Error", description: `Failed to update status for order ${orderId.substring(0, 8)}...`, variant: "destructive" });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const openDetailsModal = (order: Order) => {
    setSelectedOrderDetails(order);
  };

  const closeDetailsModal = () => {
    setSelectedOrderDetails(null);
  };


  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
         <Filter className="h-5 w-5 text-muted-foreground" />
         <Input
           placeholder="Filter orders (ID, email, status, address, item...)"
           value={filter}
           onChange={(event) => setFilter(event.target.value)}
           className="max-w-sm"
         />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">{order._id?.substring(0, 8) ?? 'N/A'}...</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{order._id}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                      {format(new Date(order.createdAt), 'PP p')}
                  </TableCell>
                  <TableCell>
                     <div className="text-sm">{order.shippingAddress.fullName}</div>
                     <div className="text-xs text-muted-foreground">{order.userEmail ?? 'No email'}</div>
                  </TableCell>
                   <TableCell>
                     <span className="flex items-center gap-1">
                        <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                        {order.totalAmount.toFixed(2)}
                     </span>
                   </TableCell>
                  <TableCell className="text-center">
                      {updatingStatus[order._id!] ? (
                        <Loader2 className="mx-auto h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <Select
                          value={order.status}
                           onValueChange={(newStatus) => handleStatusChange(order._id, newStatus as OrderStatus)}
                           disabled={updatingStatus[order._id!]} // Disable while updating this specific order
                        >
                          <SelectTrigger className="h-8 w-[120px] text-xs">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map((status) => (
                              <SelectItem key={status} value={status} className="text-xs">
                                 <Badge variant={getStatusBadgeVariant(status)} className="mr-2">{status}</Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                  </TableCell>
                   <TableCell className="text-right">
                     <Button variant="ghost" size="icon" onClick={() => openDetailsModal(order)} aria-label="View Order Details">
                         <Eye className="h-4 w-4" />
                      </Button>
                    {/* Add more actions like "Print Invoice" if needed */}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No orders found matching your filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
        {/* Add Pagination if needed */}

       {/* Order Details Modal */}
        {selectedOrderDetails && (
            <AlertDialog open={!!selectedOrderDetails} onOpenChange={closeDetailsModal}>
            <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                <AlertDialogTitle>Order Details (#{selectedOrderDetails._id?.substring(0, 8)}...)</AlertDialogTitle>
                 <AlertDialogDescription>
                    Placed on {format(new Date(selectedOrderDetails.createdAt), 'PPp')} by {selectedOrderDetails.userEmail ?? selectedOrderDetails.shippingAddress.fullName}
                 </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-4 text-sm">
                     {/* Items */}
                    <div className="space-y-2">
                        <h4 className="font-semibold">Items ({selectedOrderDetails.items.length})</h4>
                        {selectedOrderDetails.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-2 border-b pb-1">
                                <div className='flex items-center gap-2'>
                                    <img src={item.image} alt={item.name} className="h-10 w-10 rounded border object-cover" />
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                                <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                     {/* Shipping Address */}
                     <div className="space-y-1 border-t pt-3">
                       <h4 className="font-semibold">Shipping Address</h4>
                       <p>{selectedOrderDetails.shippingAddress.fullName}</p>
                       <p>{selectedOrderDetails.shippingAddress.street}, {selectedOrderDetails.shippingAddress.landmark ? `${selectedOrderDetails.shippingAddress.landmark}, ` : ''}</p>
                       <p>{selectedOrderDetails.shippingAddress.city}, {selectedOrderDetails.shippingAddress.state} - {selectedOrderDetails.shippingAddress.zip}</p>
                       <p>Ph: {selectedOrderDetails.shippingAddress.mobileNumber}</p>
                    </div>

                     {/* Payment & Total */}
                    <div className="space-y-1 border-t pt-3">
                        <h4 className="font-semibold">Payment & Summary</h4>
                        <p>Payment Method: <span className="capitalize font-medium">{selectedOrderDetails.paymentMethod}</span></p>
                        <p>Total Amount: <span className="font-medium">₹{selectedOrderDetails.totalAmount.toFixed(2)}</span></p>
                        <p>Current Status: <Badge variant={getStatusBadgeVariant(selectedOrderDetails.status)}>{selectedOrderDetails.status}</Badge></p>
                    </div>
                </div>

                <AlertDialogFooter>
                <AlertDialogCancel onClick={closeDetailsModal}>Close</AlertDialogCancel>
                {/* Optionally add action like "Print" */}
                {/* <AlertDialogAction>Print Invoice</AlertDialogAction> */}
                </AlertDialogFooter>
            </AlertDialogContent>
            </AlertDialog>
        )}

    </div>
  );
}

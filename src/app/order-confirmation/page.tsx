"use client";
export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4 text-green-600">Payment Successful!</h1>
      <p className="mb-2 text-lg">Thank you for your order.</p>
      {orderId && (
        <p className="mb-4 text-gray-700">
          Order ID: <span className="font-mono font-semibold">{orderId}</span>
        </p>
      )}
      <Button asChild className="mt-4">
        <Link href="/order-history">Go to My Orders</Link>
      </Button>
      <Button asChild variant="outline" className="mt-4 ml-2">
        <Link href="/">Continue Shopping</Link>
      </Button>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense>
      <OrderConfirmationContent />
    </Suspense>
  );
} 
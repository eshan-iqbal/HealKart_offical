'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea'; // If needed for address line 2/landmark
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

// Define Zod schema for address validation
const addressSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  mobileNumber: z.string().regex(/^\d{10}$/, { message: "Please enter a valid 10-digit mobile number." }),
  street: z.string().min(5, { message: "Street address must be at least 5 characters." }),
  landmark: z.string().optional(), // Optional landmark
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  state: z.string().min(2, { message: "State must be at least 2 characters." }),
  zip: z.string().regex(/^\d{6}$/, { message: "Please enter a valid 6-digit PIN code." }),
  country: z.string().min(2, {message: "Country is required"}).default("India"), // Default country
});

export type AddressSchema = z.infer<typeof addressSchema>;

interface AddressFormProps {
  onSubmitSuccess: (data: AddressSchema) => void; // Callback when form is valid
  initialData?: Partial<AddressSchema>; // Optional initial data
}

export function AddressForm({ onSubmitSuccess, initialData }: AddressFormProps) {
  const [isSaved, setIsSaved] = useState(false);

  const form = useForm<AddressSchema>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: 'India', // Set default country
      ...initialData, // Spread initial data if provided
    },
  });

  function onSubmit(values: AddressSchema) {
    // This function is called only when the form is valid
    console.log('Address Submitted:', values);
    onSubmitSuccess(values); // Pass validated data to parent component
    setIsSaved(true); // Indicate that the address is saved/confirmed
    // Optionally, you could disable the form or show a confirmation message here
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
           {/* Full Name */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} disabled={isSaved}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mobile Number */}
           <FormField
            control={form.control}
            name="mobileNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="Enter 10-digit mobile number" {...field} disabled={isSaved}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

         {/* Street Address */}
        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address (House No, Building, Street, Area)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., 123 MG Road, Sector 15" {...field} disabled={isSaved}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Landmark (Optional) */}
        <FormField
          control={form.control}
          name="landmark"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Landmark (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Near City Hospital" {...field} disabled={isSaved}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
           {/* City */}
           <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Enter city" {...field} disabled={isSaved}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

           {/* State */}
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input placeholder="Enter state" {...field} disabled={isSaved}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PIN Code */}
          <FormField
            control={form.control}
            name="zip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PIN Code</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Enter 6-digit PIN code" {...field} maxLength={6} disabled={isSaved}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

         {/* Country (can be hidden if always India) */}
         <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem className="hidden"> {/* Hidden by default */}
                <FormLabel>Country</FormLabel>
                <FormControl>
                   <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


        <div className="flex justify-end pt-4">
           {isSaved ? (
             <div className="flex items-center gap-2 text-green-600">
               <CheckCircle className="h-5 w-5" />
               <span>Address Saved</span>
                <Button variant="link" size="sm" onClick={() => { setIsSaved(false); form.reset(form.getValues()); }} className="ml-2 h-auto p-0 text-primary">Edit</Button>
             </div>
           ) : (
            <Button type="submit" disabled={form.formState.isSubmitting}>
                Save Address
             </Button>
           )}
        </div>
      </form>
    </Form>
  );
}

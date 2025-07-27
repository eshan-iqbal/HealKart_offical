'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Settings, LayoutDashboard, Users } from 'lucide-react'; // Add icons as needed
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const adminNavItems = [
//   { href: '/admin', label: 'Dashboard', icon: LayoutDashboard }, // Example dashboard link
  { href: '/admin/orders', label: 'Orders', icon: Package },
//   { href: '/admin/users', label: 'Users', icon: Users }, // Example users link
//   { href: '/admin/settings', label: 'Settings', icon: Settings }, // Example settings link
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-background p-4 md:flex">
       <nav className="flex flex-col gap-2">
         <TooltipProvider delayDuration={0}>
            {adminNavItems.map((item) => (
            <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                <Button
                    variant={pathname === item.href ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    asChild
                >
                    <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                    </Link>
                </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={5}>
                 {item.label}
                </TooltipContent>
            </Tooltip>
            ))}
         </TooltipProvider>
       </nav>
    </aside>
  );
}

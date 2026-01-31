"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

const tabs = [
  { name: 'Campaigns', href: '/dashboard/campaigns' },
  { name: 'Contacts', href: '/dashboard/contacts' },
  { name: 'Clients', href: '/dashboard/clients' },
  { name: 'Keywords', href: '/dashboard/keywords' },
];

export function DashboardTabs() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="border-b border-gray-200">
      <div className="flex items-center justify-between px-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                isActive(tab.href)
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
              aria-current={isActive(tab.href) ? 'page' : undefined}
            >
              {tab.name}
              {isActive(tab.href) && (
                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                  New
                </span>
              )}
            </Link>
          ))}
        </nav>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-50">
          <MoreHorizontal className="h-4 w-4 mr-1" />
          More
        </Button>
      </div>
    </div>
  );
}

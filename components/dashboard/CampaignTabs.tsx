import { useState } from 'react';
import { cn } from '@/lib/utils';

type CampaignTab = 'all' | 'active' | 'paused' | 'draft';

export function CampaignTabs({
  activeTab,
  onTabChange,
  className,
}: {
  activeTab: CampaignTab;
  onTabChange: (tab: CampaignTab) => void;
  className?: string;
}) {
  const tabs: { id: CampaignTab; label: string }[] = [
    { id: 'all', label: 'All Campaigns' },
    { id: 'active', label: 'Active' },
    { id: 'paused', label: 'Paused' },
    { id: 'draft', label: 'Drafts' },
  ];

  return (
    <div className={cn('border-b border-gray-200', className)}>
      <nav className="-mb-px flex space-x-8" aria-label="Campaign tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            )}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.label}
            {tab.id === 'active' && (
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                3
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

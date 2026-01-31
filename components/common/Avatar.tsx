// components/common/Avatar.tsx
"use client";

import React from 'react';
import { Avatar as UIAvatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AvatarProps {
  imgUrl?: string;
  sizeClass?: string;
  userName?: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  imgUrl, 
  sizeClass = "size-8", 
  userName = "User",
  className 
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <UIAvatar className={cn(sizeClass, className)}>
      {imgUrl && (
        <AvatarImage 
          src={imgUrl} 
          alt={userName}
          className="object-cover"
        />
      )}
      <AvatarFallback className="bg-blue-100 text-blue-600 font-medium text-sm">
        {getInitials(userName)}
      </AvatarFallback>
    </UIAvatar>
  );
};

export default Avatar;
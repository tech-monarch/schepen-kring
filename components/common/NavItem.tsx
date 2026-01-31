import { useParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { NavItem as NavItemType } from '@/types/sidebar';

interface NavItemProps {
  item: NavItemType;
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({
  item,
  isActive,
  isCollapsed,
  onClick
}) => {
  const currentPath = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const Icon = item.icon;

  const { locale } = useParams();
  const router = useRouter();

  // Generate the href based on the route
  const getHref = (route: string) => {
    return `/${locale}${route}`;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (hasSubItems) {
      e.preventDefault();
      setIsOpen(!isOpen);
      // Don't close the menu when toggling submenus
      return;
    }
    // Close mobile menu when a direct link is clicked
    if (onClick) {
      e.preventDefault();
      onClick();
      // Small delay to allow the menu to close before navigation
      setTimeout(() => {
        router.push(getHref(item.href));
      }, 100);
    }
  };

  return (
    <div className="relative group/nav-item">
      <Link
        href={hasSubItems ? '#' : getHref(item.href)}
        onClick={handleClick}
        className={cn(
          'relative flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
          'group-hover/nav-item:bg-gray-50',
          isActive
            ? 'text-blue-600 bg-blue-50 font-semibold'
            : 'text-gray-600 hover:text-gray-900',
          isCollapsed ? 'justify-center' : 'justify-between',
          item.className
        )}
      >
        <div className="flex items-center">
          <div className={cn(
            'absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full',
            'transition-all duration-200',
            isActive ? 'bg-blue-600 scale-y-100' : 'bg-transparent scale-y-0 group-hover/nav-item:scale-y-50'
          )} />
          <Icon
            className={cn(
              'flex-shrink-0 transition-colors',
              isActive ? 'text-blue-600' : 'text-gray-400 group-hover/nav-item:text-gray-600',
              isCollapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3'
            )}
            aria-hidden="true"
          />
          {!isCollapsed && (
            <span className="truncate">
              {item.title}
              {item.badge && (
                <span className={cn(
                  'ml-2 text-xs font-medium px-2 py-0.5 rounded-full',
                  isActive 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 group-hover/nav-item:bg-gray-200'
                )}>
                  {item.badge}
                </span>
              )}
            </span>
          )}
        </div>
        {!isCollapsed && hasSubItems && (
          <ChevronRight
            className={cn(
              'h-4 w-4 transition-transform duration-200 text-gray-400',
              isOpen ? 'rotate-90' : '',
              isActive ? 'text-blue-500' : 'group-hover/nav-item:text-gray-600'
            )}
          />
        )}
      </Link>

      {!isCollapsed && hasSubItems && item.subItems && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pl-4 mt-1 space-y-1 overflow-hidden"
            >
              {item.subItems.map((subItem) => {
                const SubIcon = subItem.icon;
                const isSubItemActive = currentPath === getHref(subItem.href);

                return (
                  <Link
                    key={subItem.href}
                    href={getHref(subItem.href)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onClick) onClick();
                    }}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200',
                      'hover:bg-gray-50',
                      isSubItemActive 
                        ? 'text-blue-600 font-medium bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    <SubIcon 
                      className={cn(
                        'h-4 w-4 mr-3 transition-colors',
                        isSubItemActive ? 'text-blue-500' : 'text-gray-400 group-hover/nav-item:text-gray-500'
                      )} 
                    />
                    <span>{subItem.title}</span>
                    {subItem.badge && (
                      <span className="ml-auto bg-blue-50 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                        {subItem.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

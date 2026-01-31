export interface BaseNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  badge?: string | number;
}
        
export interface NavItem extends BaseNavItem {
  roles?: (string | number)[]; 
  subItems?: BaseNavItem[];
};
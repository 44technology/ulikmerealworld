import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileLayout from './MobileLayout';
import DesktopLayout from './DesktopLayout';

interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

/**
 * Responsive layout: mobile = narrow column + bottom nav space;
 * desktop = sidebar + wide content (no mobile look).
 */
export default function AppLayout({ children, hideNav = false }: AppLayoutProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileLayout hideNav={hideNav}>{children}</MobileLayout>;
  }

  return <DesktopLayout hideNav={hideNav}>{children}</DesktopLayout>;
}

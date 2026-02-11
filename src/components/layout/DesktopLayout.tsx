import { ReactNode } from 'react';
import DesktopSidebar from './DesktopSidebar';

interface DesktopLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

const SIDEBAR_WIDTH = 256; // w-64 = 16rem = 256px

export default function DesktopLayout({ children, hideNav = false }: DesktopLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {!hideNav && <DesktopSidebar />}
      <main
        className="min-h-screen bg-background"
        style={!hideNav ? { marginLeft: SIDEBAR_WIDTH } : undefined}
      >
        <div className="mx-auto max-w-6xl px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

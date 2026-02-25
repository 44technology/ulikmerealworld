import { NavLink } from 'react-router-dom';
import {
  Home,
  Sparkles,
  Dice5,
  Compass,
  GraduationCap,
  Users,
  MessageCircle,
  User,
  Settings,
  Ticket,
  Wallet,
  Calendar,
  MapPin,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { icon: Home, label: 'Home', path: '/home' },
  { icon: Sparkles, label: 'Life', path: '/life' },
  { icon: Dice5, label: 'Surprise Me', path: '/surprise' },
  { icon: Compass, label: 'Discover', path: '/discover' },
  { icon: MapPin, label: 'Venues', path: '/discover?tab=venues' },
  { icon: GraduationCap, label: 'Classes', path: '/classes' },
  { icon: Users, label: 'Communities', path: '/communities' },
  { icon: MessageCircle, label: 'Chat', path: '/chat' },
  { icon: Calendar, label: 'Schedule', path: '/schedule' },
  { icon: Ticket, label: 'My Tickets', path: '/tickets' },
  { icon: Wallet, label: 'Payouts', path: '/payouts' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export default function DesktopSidebar() {
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 flex-shrink-0 border-r border-border bg-card/95 backdrop-blur">
      <div className="flex h-full flex-col">
        {/* Logo / Brand */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-foreground">Ulikme</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom: Settings + User */}
        <div className="border-t border-border p-3 space-y-0.5">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <Settings className="h-5 w-5 shrink-0" />
            Settings
          </NavLink>
          {user && (
            <div className="rounded-xl px-3 py-2 text-xs text-muted-foreground">
              <p className="font-medium text-foreground truncate">{user.displayName || user.firstName || 'User'}</p>
              <p className="truncate">{user.email || '—'}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

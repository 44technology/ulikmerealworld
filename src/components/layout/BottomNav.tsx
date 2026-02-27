import {
  Home,
  Star,
  Dice5,
  MessageCircle,
  User,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { icon: Home, label: 'Home', path: '/home' },
  { icon: Star, label: 'Life', path: '/life' },
  { icon: Dice5, label: 'Surprise', path: '/surprise', isMain: true },
  { icon: MessageCircle, label: 'Chats', path: '/chat' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = item.path ? location.pathname === item.path : false;
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <motion.button
                key="surprise"
                onClick={() => navigate('/surprise')}
                className="fab -mt-6"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-6 h-6" />
              </motion.button>
            );
          }

          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path!)}
              className="flex flex-col items-center gap-1 py-2 px-3 min-w-0 flex-1"
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? 'text-accent' : 'text-muted-foreground'
                  }`}
                />
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
              <span
                className={`text-xs font-medium truncate w-full text-center ${
                  isActive ? 'text-accent' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

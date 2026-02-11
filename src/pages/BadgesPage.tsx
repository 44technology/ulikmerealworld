import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Star, Users, Calendar, MapPin, Heart, Zap, Crown, Target, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import BottomNav from '@/components/layout/BottomNav';

const earnedBadges = [
  { id: '1', icon: Star, name: 'First Vibe', description: 'Attended your first meetup', color: 'from-amber-400/20 to-orange-500/10', borderColor: 'border-amber-500/30', iconColor: 'text-amber-600 dark:text-amber-400', earnedDate: 'Jan 10, 2024' },
  { id: '2', icon: Users, name: 'Social Butterfly', description: 'Connected with 10+ people', color: 'from-primary/20 to-primary/5', borderColor: 'border-primary/30', iconColor: 'text-primary', earnedDate: 'Jan 15, 2024' },
  { id: '3', icon: Heart, name: 'Verified Member', description: 'Completed profile verification', color: 'from-rose-400/20 to-pink-500/10', borderColor: 'border-rose-500/30', iconColor: 'text-rose-600 dark:text-rose-400', earnedDate: 'Jan 5, 2024' },
];

const availableBadges = [
  { id: '4', icon: Trophy, name: 'Vibe Master', description: 'Host 10 successful vibes', progress: 3, total: 10 },
  { id: '5', icon: Crown, name: 'Community Leader', description: 'Get 50 connections', progress: 24, total: 50 },
  { id: '6', icon: Calendar, name: 'Regular', description: 'Attend vibes 4 weeks in a row', progress: 2, total: 4 },
  { id: '7', icon: MapPin, name: 'Explorer', description: 'Visit 20 different venues', progress: 8, total: 20 },
  { id: '8', icon: Zap, name: 'Quick Connect', description: 'Make 5 connections in one vibe', progress: 3, total: 5 },
  { id: '9', icon: Target, name: 'Perfect Host', description: 'Get 5-star rating as host', progress: 0, total: 1 },
];

const BadgesPage = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button onClick={() => navigate('/home')} className="p-2 -ml-2" whileTap={{ scale: 0.9 }}>
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>
          <h1 className="text-xl font-bold text-foreground">Badges</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-8">
        {/* Stats strip */}
        <div className="rounded-2xl border border-border/50 bg-card/50 p-5 flex items-center justify-around gap-6">
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{earnedBadges.length}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Earned</p>
          </div>
          <div className="w-px h-12 bg-border" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{availableBadges.length}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">In progress</p>
          </div>
        </div>

        {/* Earned Badges */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Earned</h2>
          <div className="grid grid-cols-3 gap-3">
            {earnedBadges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`rounded-2xl border bg-gradient-to-br ${badge.color} ${badge.borderColor} p-4 text-center shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="w-12 h-12 rounded-xl bg-background/60 backdrop-blur flex items-center justify-center mx-auto mb-2.5 border border-white/10">
                    <Icon className={`w-6 h-6 ${badge.iconColor}`} />
                  </div>
                  <p className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">{badge.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{badge.earnedDate}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* In Progress */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">In progress</h2>
          <div className="space-y-3">
            {availableBadges.map((badge, index) => {
              const Icon = badge.icon;
              const progressPercent = badge.total > 0 ? Math.round((badge.progress / badge.total) * 100) : 0;
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="rounded-2xl border border-border/50 bg-card/50 p-4 flex items-center gap-4 hover:border-primary/20 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{badge.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground tabular-nums w-8 text-right">
                        {badge.progress}/{badge.total}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>

      <BottomNav />
    </AppLayout>
  );
};

export default BadgesPage;

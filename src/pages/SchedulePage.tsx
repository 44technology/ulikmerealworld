import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  GraduationCap,
  Users,
  Sparkles,
  Coffee,
  LayoutGrid,
  List,
  X,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import BottomNav from '@/components/layout/BottomNav';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { apiRequest, API_ENDPOINTS } from '@/lib/api';
import { useMeetups } from '@/hooks/useMeetups';
import { useAuth } from '@/contexts/AuthContext';
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isSameDay,
  isWithinInterval,
  eachDayOfInterval,
  getDay,
  isSameMonth,
  startOfDay,
} from 'date-fns';

export type ScheduleItemType = 'class' | 'vibe' | 'event' | 'ready_to_meet';

export interface ScheduleItem {
  id: string;
  type: ScheduleItemType;
  title: string;
  startTime: string;
  endTime?: string;
  venueName?: string;
  subtitle?: string;
  link?: string;
}

const TYPE_CONFIG: Record<
  ScheduleItemType,
  { label: string; color: string; bg: string; border: string; icon: typeof GraduationCap }
> = {
  class: {
    label: 'Class',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/15',
    border: 'border-l-blue-500',
    icon: GraduationCap,
  },
  vibe: {
    label: 'Vibe',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-l-emerald-500',
    icon: Users,
  },
  event: {
    label: 'Event',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/15',
    border: 'border-l-violet-500',
    icon: Sparkles,
  },
  ready_to_meet: {
    label: 'Ready to meet',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-l-amber-500',
    icon: Coffee,
  },
};

// Mock Ready to meet (from chat meetup requests)
const MOCK_READY_TO_MEET: ScheduleItem[] = [
  {
    id: 'rtm-1',
    type: 'ready_to_meet',
    title: 'Coffee with Sarah',
    startTime: new Date(Date.now() + 86400000 * 2).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 2 + 3600000).toISOString(),
    venueName: 'Panther Coffee',
    subtitle: 'From chat',
    link: '/chat',
  },
  {
    id: 'rtm-2',
    type: 'ready_to_meet',
    title: 'Quick catch-up',
    startTime: new Date(Date.now() + 86400000 * 5).toISOString(),
    venueName: 'Zuma Miami',
    subtitle: 'From chat',
    link: '/chat',
  },
];

const SchedulePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const SCHEDULE_VIEW_KEY = 'schedule_view_mode';
  const [viewMode, setViewModeState] = useState<'week' | 'month'>(() => {
    if (typeof window === 'undefined') return 'week';
    return (sessionStorage.getItem(SCHEDULE_VIEW_KEY) as 'week' | 'month') || 'week';
  });
  const setViewMode = (mode: 'week' | 'month') => {
    setViewModeState(mode);
    sessionStorage.setItem(SCHEDULE_VIEW_KEY, mode);
  };
  const [weekAnchor, setWeekAnchor] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(new Date()));
  const [selectedDayForModal, setSelectedDayForModal] = useState<Date | null>(null);
  const todaySectionRef = useRef<HTMLDivElement | null>(null);

  // Enrolled classes
  const { data: enrollments } = useQuery({
    queryKey: ['my-classes', user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user?.id) return [];
      const res = await apiRequest<{ success: boolean; data: any[] }>(API_ENDPOINTS.CLASSES.MY_CLASSES);
      return res.data || [];
    },
    enabled: isAuthenticated && !!user?.id,
  });

  // Meetups (vibes) and events
  const { data: meetupsData } = useMeetups();
  const { data: eventsData } = useMeetups({ type: 'event' });
  const meetupsList = meetupsData?.data ?? (Array.isArray(meetupsData) ? meetupsData : []);
  const eventsList = eventsData?.data ?? (Array.isArray(eventsData) ? eventsData : []);

  const scheduleItems = useMemo((): ScheduleItem[] => {
    const items: ScheduleItem[] = [];

    (enrollments || []).forEach((e: any) => {
      const c = e.class || e;
      if (c.startTime)
        items.push({
          id: `class-${c.id}`,
          type: 'class',
          title: c.title || 'Class',
          startTime: c.startTime,
          endTime: c.endTime,
          venueName: c.venue?.name,
          link: `/class/${c.id}`,
        });
    });

    meetupsList
      .filter((m: any) => m.startTime && m.type !== 'event')
      .forEach((m: any) => {
        items.push({
          id: `vibe-${m.id}`,
          type: 'vibe',
          title: m.title || 'Vibe',
          startTime: m.startTime,
          endTime: m.endTime,
          venueName: m.venue?.name,
          link: `/meetup/${m.id}`,
        });
      });

    eventsList.forEach((e: any) => {
      if (e.startTime)
        items.push({
          id: `event-${e.id}`,
          type: 'event',
          title: e.title || 'Event',
          startTime: e.startTime,
          endTime: e.endTime,
          venueName: e.venue?.name,
          link: `/meetup/${e.id}`,
        });
    });

    items.push(...MOCK_READY_TO_MEET);
    return items.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [enrollments, meetupsList, eventsList]);

  const weekStart = viewMode === 'week' ? weekAnchor : startOfWeek(monthAnchor, { weekStartsOn: 1 });
  const weekEnd = viewMode === 'week' ? endOfWeek(weekAnchor, { weekStartsOn: 1 }) : endOfWeek(monthAnchor, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: viewMode === 'week' ? weekEnd : endOfMonth(monthAnchor) });

  const itemsByDay = useMemo(() => {
    const map: Record<string, ScheduleItem[]> = {};
    weekDays.forEach((d) => {
      const key = format(d, 'yyyy-MM-dd');
      map[key] = scheduleItems.filter((item) => isSameDay(new Date(item.startTime), d));
    });
    return map;
  }, [scheduleItems, weekDays]);

  const monthWeeks = useMemo(() => {
    const start = startOfMonth(monthAnchor);
    const end = endOfMonth(monthAnchor);
    const days = eachDayOfInterval({ start, end });
    const weeks: Date[][] = [];
    let week: Date[] = [];
    const firstDow = getDay(start) === 0 ? 6 : getDay(start) - 1;
    for (let i = 0; i < firstDow; i++) week.push(new Date(0));
    days.forEach((d) => {
      week.push(d);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    });
    if (week.length) {
      while (week.length < 7) week.push(new Date(0));
      weeks.push(week);
    }
    return weeks;
  }, [monthAnchor]);

  const goPrev = () => {
    if (viewMode === 'week') setWeekAnchor((d) => subWeeks(d, 1));
    else setMonthAnchor((d) => subMonths(d, 1));
  };
  const goNext = () => {
    if (viewMode === 'week') setWeekAnchor((d) => addWeeks(d, 1));
    else setMonthAnchor((d) => addMonths(d, 1));
  };
  const goToday = () => {
    const today = new Date();
    setWeekAnchor(startOfWeek(today, { weekStartsOn: 1 }));
    setMonthAnchor(startOfMonth(today));
    if (viewMode === 'week') {
      setTimeout(() => {
        todaySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  };

  return (
    <AppLayout>
      <div className="sticky top-0 z-40 glass safe-top border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button
            type="button"
            onClick={() => navigate('/home')}
            className="p-2 -ml-2 shrink-0"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </motion.button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground">Schedule</h1>
            <p className="text-xs text-muted-foreground">Class, vibe, event & ready to meet in one place</p>
          </div>
          <div className="w-10" />
        </div>

        {/* View toggle + period */}
        <div className="px-4 pb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'week' ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="w-4 h-4" />
              Week
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'month' ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid className="w-4 h-4" />
              Month
            </button>
          </div>
          <button
            type="button"
            onClick={goToday}
            className="text-sm font-medium text-primary hover:underline"
          >
            Today
          </button>
        </div>

        {/* Period nav */}
        <div className="px-4 pb-3 flex items-center justify-between">
          <motion.button
            type="button"
            onClick={goPrev}
            className="p-2 rounded-xl hover:bg-muted text-foreground"
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <span className="text-sm font-semibold text-foreground">
            {viewMode === 'week'
              ? `Week of ${format(weekStart, 'EEE d MMM')}`
              : format(monthAnchor, 'MMMM yyyy')}
          </span>
          <motion.button
            type="button"
            onClick={goNext}
            className="p-2 rounded-xl hover:bg-muted text-foreground"
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Week strip (only in week view) – tap day to open list modal */}
        {viewMode === 'week' && (
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
            {weekDays.map((d) => {
              const key = format(d, 'yyyy-MM-dd');
              const count = itemsByDay[key]?.length ?? 0;
              const isToday = isSameDay(d, new Date());
              return (
                <motion.button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDayForModal(d)}
                  className={`shrink-0 w-12 flex flex-col items-center rounded-xl py-2 px-1 border-2 transition-colors ${
                    isToday ? 'border-primary bg-primary/10' : 'border-transparent bg-muted/50 hover:bg-muted'
                  }`}
                  whileTap={{ scale: 0.96 }}
                >
                  <span className="text-[10px] uppercase text-muted-foreground">{format(d, 'EEE')}</span>
                  <span className={`text-lg font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {format(d, 'd')}
                  </span>
                  {count > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence mode="wait">
          {viewMode === 'week' ? (
            <motion.div
              key="week"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              {weekDays.map((day) => {
                const key = format(day, 'yyyy-MM-dd');
                const items = itemsByDay[key] || [];
                const isToday = isSameDay(day, new Date());
                return (
                  <div
                    key={key}
                    ref={isToday ? todaySectionRef : undefined}
                  >
                    <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      {format(day, 'EEEE, d MMMM')}
                      {isToday && (
                        <span className="text-xs font-normal text-primary">Today</span>
                      )}
                    </h2>
                    {items.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-4 pl-2">Nothing scheduled</p>
                    ) : (
                      <ul className="space-y-2">
                        {items.map((item) => {
                          const config = TYPE_CONFIG[item.type];
                          const Icon = config.icon;
                          return (
                            <motion.li
                              key={item.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`rounded-xl border border-border overflow-hidden border-l-4 ${config.border} ${config.bg}`}
                            >
                              <button
                                type="button"
                                onClick={() => item.link && navigate(item.link)}
                                className="w-full text-left p-4 flex gap-3"
                              >
                                <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${config.bg} ${config.color}`}>
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className={`text-xs font-medium ${config.color}`}>
                                    {config.label}
                                  </span>
                                  <h3 className="font-semibold text-foreground truncate mt-0.5">
                                    {item.title}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {format(new Date(item.startTime), 'HH:mm')}
                                      {item.endTime && ` – ${format(new Date(item.endTime), 'HH:mm')}`}
                                    </span>
                                    {item.venueName && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {item.venueName}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            </motion.li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="month"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthWeeks.flat().map((d, i) => {
                  if (d.getTime() === 0) return <div key={`empty-${i}`} className="aspect-square" />;
                  const key = format(d, 'yyyy-MM-dd');
                  const dayItems = scheduleItems.filter((it) => isSameDay(new Date(it.startTime), d));
                  const isToday = isSameDay(d, new Date());
                  const isCurrentMonth = isSameMonth(d, monthAnchor);
                  return (
                    <motion.button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDayForModal(d)}
                      className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-1 transition-colors w-full ${
                        isCurrentMonth ? 'bg-card border-border hover:bg-muted/50' : 'bg-muted/30 border-transparent'
                      } ${isToday ? 'ring-2 ring-primary' : ''}`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className={`text-sm font-medium ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {format(d, 'd')}
                      </span>
                      <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                        {dayItems.slice(0, 4).map((it) => (
                          <span
                            key={it.id}
                            className={`w-1.5 h-1.5 rounded-full ${
                              it.type === 'class'
                                ? 'bg-blue-500'
                                : it.type === 'vibe'
                                  ? 'bg-emerald-500'
                                  : it.type === 'event'
                                    ? 'bg-violet-500'
                                    : 'bg-amber-500'
                            }`}
                          />
                        ))}
                        {dayItems.length > 4 && (
                          <span className="text-[10px] text-muted-foreground">+{dayItems.length - 4}</span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
                {(['class', 'vibe', 'event', 'ready_to_meet'] as ScheduleItemType[]).map((t) => {
                  const c = TYPE_CONFIG[t];
                  const Icon = c.icon;
                  return (
                    <div key={t} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${t === 'class' ? 'bg-blue-500' : t === 'vibe' ? 'bg-emerald-500' : t === 'event' ? 'bg-violet-500' : 'bg-amber-500'}`} />
                      <span className="text-xs text-muted-foreground">{c.label}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Day detail modal (from month view small squares) */}
      <Dialog open={!!selectedDayForModal} onOpenChange={(open) => !open && setSelectedDayForModal(null)}>
        <DialogContent className="max-w-md rounded-2xl max-h-[85vh] flex flex-col p-0 gap-0">
          {selectedDayForModal && (
            <>
              <DialogHeader className="p-4 border-b border-border shrink-0">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg font-semibold text-foreground">
                    {format(selectedDayForModal, 'EEEE, d MMMM yyyy')}
                  </DialogTitle>
                  <motion.button
                    type="button"
                    onClick={() => setSelectedDayForModal(null)}
                    className="p-2 rounded-full hover:bg-muted text-foreground"
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </DialogHeader>
              <div className="overflow-y-auto p-4 space-y-2">
                {(() => {
                  const key = format(selectedDayForModal, 'yyyy-MM-dd');
                  const items = scheduleItems.filter((it) => isSameDay(new Date(it.startTime), selectedDayForModal));
                  if (items.length === 0) {
                    return (
                      <p className="text-sm text-muted-foreground py-6 text-center">Nothing scheduled this day</p>
                    );
                  }
                  return items.map((item) => {
                    const config = TYPE_CONFIG[item.type];
                    const Icon = config.icon;
                    return (
                      <motion.button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedDayForModal(null);
                          if (item.link) navigate(item.link);
                        }}
                        className={`w-full text-left rounded-xl border border-border overflow-hidden border-l-4 ${config.border} ${config.bg} p-4 flex gap-3 items-center`}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${config.bg} ${config.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                          <h3 className="font-semibold text-foreground truncate mt-0.5">{item.title}</h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(item.startTime), 'HH:mm')}
                              {item.endTime && ` – ${format(new Date(item.endTime), 'HH:mm')}`}
                            </span>
                            {item.venueName && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {item.venueName}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                      </motion.button>
                    );
                  });
                })()}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </AppLayout>
  );
};

export default SchedulePage;

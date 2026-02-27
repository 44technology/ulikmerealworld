import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ticket, QrCode, Calendar, MapPin, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import BottomNav from '@/components/layout/BottomNav';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { useMyTickets } from '@/hooks/useTickets';

// Mock ticket data - will be replaced with API call
const mockTickets = [
  {
    id: '1',
    ticketNumber: 'TKT-2025-001234',
    qrCode: 'QR-2025-001234',
    status: 'ACTIVE',
    price: 50,
    purchasedAt: new Date('2025-01-20'),
    expiresAt: new Date('2025-02-15'),
    class: {
      id: '1',
      title: 'Shopify Store Setup & Brand Building',
      startTime: new Date('2025-02-10T10:00:00'),
      venue: { name: 'Business Center', city: 'Mexico City' },
    },
    meetup: null,
  },
  {
    id: '2',
    ticketNumber: 'TKT-2025-001235',
    qrCode: 'QR-2025-001235',
    status: 'USED',
    price: 0,
    purchasedAt: new Date('2025-01-15'),
    usedAt: new Date('2025-01-24T18:00:00'),
    class: null,
    meetup: {
      id: '1',
      title: 'Networking Event',
      startTime: new Date('2025-01-24T18:00:00'),
      venue: { name: 'Co-working Space', city: 'Monterrey' },
    },
  },
  {
    id: '3',
    ticketNumber: 'TKT-2025-001236',
    qrCode: 'QR-2025-001236',
    status: 'ACTIVE',
    price: 75,
    purchasedAt: new Date('2025-01-22'),
    expiresAt: new Date('2025-02-20'),
    class: {
      id: '2',
      title: 'AutoCAD Basics',
      startTime: new Date('2025-02-15T14:00:00'),
      venue: { name: 'Training Center', city: 'Monterrey' },
    },
    meetup: null,
  },
  {
    id: '4',
    ticketNumber: 'TKT-2025-001240',
    qrCode: 'QR-2025-001240',
    status: 'EXPIRED',
    price: 25,
    purchasedAt: new Date('2025-01-10'),
    expiresAt: new Date('2025-01-28'),
    class: {
      id: '3',
      title: 'Photography Workshop',
      startTime: new Date('2025-01-25T09:00:00'),
      venue: { name: 'Creative Studio', city: 'Mexico City' },
    },
    meetup: null,
  },
];

const MyTicketsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const { data: apiTickets } = useMyTickets();
  const tickets = useMemo(() => {
    const list = apiTickets && apiTickets.length > 0 ? apiTickets : mockTickets;
    return Array.isArray(list) ? list : mockTickets;
  }, [apiTickets]);

  // Upcoming: only non-expired, future events
  const upcomingTickets = tickets.filter((ticket: any) => {
    const eventDate = ticket.class?.startTime || ticket.meetup?.startTime;
    const isFuture = eventDate && new Date(eventDate) > new Date();
    const notExpired = ticket.status !== 'EXPIRED' && ticket.status !== 'USED';
    return isFuture && notExpired;
  });

  const pastTickets = tickets.filter((ticket: any) => {
    const eventDate = ticket.class?.startTime || ticket.meetup?.startTime;
    const isPast = eventDate && new Date(eventDate) <= new Date();
    return !eventDate || isPast || ticket.status === 'USED' || ticket.status === 'EXPIRED';
  });

  // Under Past: split into Used vs Expired
  const pastUsedTickets = pastTickets.filter((t: any) => t.status === 'USED');
  const pastExpiredTickets = pastTickets.filter((t: any) => {
    const eventDate = t.class?.startTime || t.meetup?.startTime;
    const eventPassed = eventDate && new Date(eventDate) <= new Date();
    return t.status === 'EXPIRED' || (eventPassed && t.status !== 'USED');
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            <span className="text-xs font-medium text-green-600">Active</span>
          </div>
        );
      case 'USED':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-600">Used</span>
          </div>
        );
      case 'CANCELLED':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20">
            <XCircle className="w-3 h-3 text-red-600" />
            <span className="text-xs font-medium text-red-600">Cancelled</span>
          </div>
        );
      case 'EXPIRED':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-500/10 border border-gray-500/20">
            <AlertCircle className="w-3 h-3 text-gray-600" />
            <span className="text-xs font-medium text-gray-600">Expired</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getEffectiveStatus = (ticket: any) => {
    const eventDate = ticket.class?.startTime || ticket.meetup?.startTime;
    const eventPassed = eventDate && new Date(eventDate) <= new Date();
    if (ticket.status === 'USED') return 'USED';
    if (ticket.status === 'EXPIRED' || (eventPassed && ticket.status !== 'USED')) return 'EXPIRED';
    return ticket.status;
  };

  const TicketCard = ({ ticket }: { ticket: any }) => {
    const event = ticket.class || ticket.meetup;
    const eventDate = ticket.class?.startTime || ticket.meetup?.startTime;
    const effectiveStatus = getEffectiveStatus(ticket);

    return (
      <motion.div
        role="button"
        tabIndex={0}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate(`/ticket/${ticket.id}`)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/ticket/${ticket.id}`); } }}
        className="card-elevated p-4 rounded-2xl cursor-pointer hover:ring-2 hover:ring-primary/20 transition-shadow"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ticket</p>
              <p className="text-sm font-semibold text-foreground">{ticket.ticketNumber}</p>
            </div>
          </div>
          {getStatusBadge(effectiveStatus)}
        </div>

        {event && (
          <>
            <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{event.title}</h3>
            <div className="space-y-2 mb-3">
              {eventDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(eventDate), 'MMM d, yyyy • h:mm a')}
                </div>
              )}
              {event.venue && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {event.venue.name} • {event.venue.city}
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">View QR Code</span>
          </div>
          {ticket.price > 0 && (
            <span className="text-sm font-semibold text-foreground">${ticket.price}</span>
          )}
          {ticket.price === 0 && (
            <span className="text-xs text-muted-foreground">Free</span>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center gap-4 px-4 py-3">
          <motion.button
            onClick={() => navigate('/home')}
            className="p-2 -ml-2"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">My Tickets</h1>
            <p className="text-xs text-muted-foreground">View and manage your tickets</p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upcoming' | 'past')}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4 space-y-4">
            {upcomingTickets.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-2">No upcoming tickets</p>
                <p className="text-xs text-muted-foreground">Enroll in a class or join an activity to get tickets</p>
              </div>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Upcoming (expired olmayan)
                </h3>
                <div className="space-y-4">
                  {upcomingTickets.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4 space-y-6">
            {pastTickets.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No past tickets</p>
              </div>
            ) : (
              <>
                {pastExpiredTickets.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Expired
                    </h3>
                    <div className="space-y-4">
                      {pastExpiredTickets.map((ticket) => (
                        <TicketCard key={ticket.id} ticket={ticket} />
                      ))}
                    </div>
                  </div>
                )}
                {pastUsedTickets.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Used
                    </h3>
                    <div className="space-y-4">
                      {pastUsedTickets.map((ticket) => (
                        <TicketCard key={ticket.id} ticket={ticket} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </AppLayout>
  );
};

export default MyTicketsPage;

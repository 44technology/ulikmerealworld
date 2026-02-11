import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, QrCode, Ticket, Calendar, MapPin, Clock, Download, Share2, CheckCircle2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { useTicket } from '@/hooks/useTickets';

// Mock tickets for fallback when API has no data (keyed by id)
const mockTicketsById: Record<string, any> = {
  '1': {
    id: '1',
    ticketNumber: 'TKT-2025-001234',
    qrCode: 'TKT-2025-001234',
    status: 'ACTIVE',
    price: 50,
    purchasedAt: '2025-01-20',
    expiresAt: '2025-02-15',
    class: {
      id: '1',
      title: 'Shopify Store Setup & Brand Building',
      description: 'Learn how to set up and build your Shopify store',
      startTime: '2025-02-10T10:00:00',
      endTime: '2025-02-10T13:00:00',
      venue: { name: 'Business Center', address: '123 Main St', city: 'Mexico City' },
      instructor: { name: 'Maria Rodriguez', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    },
    meetup: null,
  },
  '2': {
    id: '2',
    ticketNumber: 'TKT-2025-001235',
    qrCode: 'TKT-2025-001235',
    status: 'USED',
    price: 0,
    purchasedAt: '2025-01-15',
    usedAt: '2025-01-24T18:00:00',
    class: null,
    meetup: {
      id: '1',
      title: 'Networking Event',
      startTime: '2025-01-24T18:00:00',
      venue: { name: 'Co-working Space', city: 'Monterrey' },
    },
  },
  '3': {
    id: '3',
    ticketNumber: 'TKT-2025-001236',
    qrCode: 'TKT-2025-001236',
    status: 'ACTIVE',
    price: 75,
    purchasedAt: '2025-01-22',
    expiresAt: '2025-02-20',
    class: {
      id: '2',
      title: 'AutoCAD Basics',
      startTime: '2025-02-15T14:00:00',
      venue: { name: 'Training Center', city: 'Monterrey' },
    },
    meetup: null,
  },
  '4': {
    id: '4',
    ticketNumber: 'TKT-2025-001240',
    qrCode: 'TKT-2025-001240',
    status: 'EXPIRED',
    price: 25,
    purchasedAt: '2025-01-10',
    expiresAt: '2025-01-28',
    class: {
      id: '3',
      title: 'Photography Workshop',
      startTime: '2025-01-25T09:00:00',
      venue: { name: 'Creative Studio', city: 'Mexico City' },
    },
    meetup: null,
  },
};

const TicketDetailPage = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user } = useAuth();
  const [qrCodeVisible, setQrCodeVisible] = useState(true);

  const { data: apiTicket, isLoading } = useTicket(ticketId || '');
  const mockTicket = ticketId ? mockTicketsById[ticketId] : null;
  const ticket = apiTicket || mockTicket;

  const event = ticket?.class || ticket?.meetup;
  const eventType = ticket?.class ? 'class' : 'vibe';
  const eventDate = ticket?.class?.startTime || ticket?.meetup?.startTime;
  const isEventPast = !!(eventDate && new Date(eventDate) <= new Date()) || ticket?.status === 'USED';

  const handleDownloadQR = () => {
    // In production, download QR code image
    toast.success('QR code download started');
  };

  const handleShareTicket = () => {
    // In production, share ticket
    if (navigator.share) {
      navigator.share({
        title: `Ticket: ${event?.title}`,
        text: `Check out my ticket for ${event?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Ticket link copied to clipboard');
    }
  };

  if (isLoading && !mockTicket) {
    return (
      <AppLayout>
        <div className="sticky top-0 z-40 glass safe-top">
          <div className="flex items-center gap-4 px-4 py-3">
            <motion.button onClick={() => navigate('/home')} className="p-2 -ml-2" whileTap={{ scale: 0.9 }}>
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </motion.button>
            <h1 className="text-xl font-bold text-foreground">Ticket Details</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-muted-foreground">Loading ticket...</p>
        </div>
      </AppLayout>
    );
  }

  if (!ticket) {
    return (
      <AppLayout>
        <div className="sticky top-0 z-40 glass safe-top">
          <div className="flex items-center gap-4 px-4 py-3">
            <motion.button onClick={() => navigate('/home')} className="p-2 -ml-2" whileTap={{ scale: 0.9 }}>
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </motion.button>
            <h1 className="text-xl font-bold text-foreground">Ticket Details</h1>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
          <Ticket className="w-16 h-16 text-muted-foreground" />
          <p className="text-muted-foreground text-center">Ticket not found</p>
          <Button variant="outline" onClick={() => navigate('/tickets')}>Back to My Tickets</Button>
        </div>
      </AppLayout>
    );
  }

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
            <h1 className="text-xl font-bold text-foreground">Ticket Details</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {/* Ticket Number */}
        <div className="card-elevated p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Ticket Number</span>
            </div>
            {ticket.status === 'ACTIVE' && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                <span className="text-xs font-medium text-green-600">Active</span>
              </div>
            )}
          </div>
          <p className="text-2xl font-bold text-foreground">{ticket.ticketNumber}</p>
        </div>

        {/* QR Code – prominent area */}
        <div className="card-elevated rounded-2xl overflow-hidden border-2 border-primary/20">
          <div className="bg-primary/10 px-4 py-3 border-b border-border">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold text-foreground">QR Code</h2>
                  <p className="text-xs text-muted-foreground">
                    {isEventPast ? 'This event has ended' : 'Show this at the event entrance'}
                  </p>
                </div>
              </div>
              {isEventPast && (
                <span className="shrink-0 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold border border-border">
                  Expired
                </span>
              )}
            </div>
          </div>
          <div className="p-6 flex flex-col items-center">
            {isEventPast && (
              <div className="w-full max-w-[280px] mb-3 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Expired</span>
                <p className="text-xs text-muted-foreground mt-0.5">This ticket is no longer valid for entry</p>
              </div>
            )}
            <div className="w-full max-w-[280px] aspect-square bg-white rounded-2xl p-4 border-2 border-border flex items-center justify-center shadow-inner">
              {qrCodeVisible && ticket.qrCode ? (
                <QRCodeDisplay
                  value={ticket.qrCode}
                  size={240}
                  className="rounded-lg"
                />
              ) : qrCodeVisible ? (
                <p className="text-sm text-muted-foreground">No QR code available</p>
              ) : (
                <div className="text-center space-y-3">
                  <QrCode className="w-16 h-16 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">QR Code hidden</p>
                  <Button size="sm" variant="outline" onClick={() => setQrCodeVisible(true)}>
                    Show QR Code
                  </Button>
                </div>
              )}
            </div>
            {qrCodeVisible && ticket.qrCode && (
              <p className="text-xs font-mono text-muted-foreground mt-3 break-all text-center max-w-full px-2">{ticket.ticketNumber}</p>
            )}
          </div>
          <div className="p-4 border-t border-border flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setQrCodeVisible(!qrCodeVisible)}>
              {qrCodeVisible ? 'Hide' : 'Show'} QR
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadQR}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleShareTicket}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Event Details */}
        {event && (
          <div className="card-elevated p-4 rounded-2xl space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Event Details</h2>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">{event.title}</h3>
              {ticket.class?.description && (
                <p className="text-sm text-muted-foreground">{ticket.class.description}</p>
              )}
            </div>

            <div className="space-y-3">
              {eventDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(eventDate), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(eventDate), 'h:mm a')}
                      {ticket.class?.endTime && ` - ${format(new Date(ticket.class.endTime), 'h:mm a')}`}
                    </p>
                  </div>
                </div>
              )}

              {event.venue && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Location</p>
                    <p className="text-sm text-muted-foreground">{event.venue.name}</p>
                    {event.venue.address && (
                      <p className="text-sm text-muted-foreground">{event.venue.address}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{event.venue.city}</p>
                  </div>
                </div>
              )}

              {(ticket.class?.instructor || (ticket.class as any)?.host) && (
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <span className="text-xs text-primary font-semibold">H</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Host</p>
                    <p className="text-sm text-muted-foreground">{(ticket.class as any).host?.name || ticket.class.instructor.name}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (eventType === 'class') {
                    navigate(`/class/${event.id}`);
                  } else {
                    navigate(`/meetup/${event.id}`);
                  }
                }}
              >
                View Event Details
              </Button>
            </div>
          </div>
        )}

        {/* Purchase Info */}
        <div className="card-elevated p-4 rounded-2xl">
          <h2 className="text-lg font-semibold text-foreground mb-4">Purchase Information</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Price</span>
              <span className="text-sm font-semibold text-foreground">
                {ticket.price > 0 ? `$${ticket.price}` : 'Free'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Purchased</span>
              <span className="text-sm text-foreground">
                {format(new Date(ticket.purchasedAt), 'MMM d, yyyy')}
              </span>
            </div>
            {ticket.expiresAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expires</span>
                <span className="text-sm text-foreground">
                  {format(new Date(ticket.expiresAt), 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </AppLayout>
  );
};

export default TicketDetailPage;

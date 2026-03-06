import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Calendar, MapPin, Users, Ticket, ArrowRight, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type EventTicket = {
  id: number;
  title: string;
  price: number;
  type: 'paid' | 'free';
  available: number;
  sold: number;
};

export default function EventsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [events, setEvents] = useState([
    { 
      id: 1, 
      title: 'Networking Mixer', 
      description: 'Connect with entrepreneurs and professionals', 
      date: '2025-02-15', 
      time: '18:00', 
      location: 'Conference Center', 
      maxParticipants: 50, 
      currentParticipants: 32,
      type: 'networking',
      tickets: [
        { id: 1, title: 'Networking Mixer Ticket', price: 50, type: 'paid' as const, available: 50, sold: 32 },
      ] as EventTicket[],
    },
    { 
      id: 2, 
      title: 'Workshop: Business Growth', 
      description: 'Learn strategies for scaling your business', 
      date: '2025-02-20', 
      time: '14:00', 
      location: 'Training Room', 
      maxParticipants: 30, 
      currentParticipants: 15,
      type: 'workshop',
      tickets: [
        { id: 2, title: 'Workshop Ticket', price: 75, type: 'paid' as const, available: 30, sold: 15 },
      ] as EventTicket[],
    },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground mt-2">{isAdmin ? 'View and modify user-created events' : 'Event\'ler, 15+ kişi ile oluşturduğunuz etkinliklerdir. Bağımsız event oluşturma kaldırıldı.'}</p>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Event nasıl oluşturulur?</p>
              <p className="text-sm text-muted-foreground mt-1">Event artık ayrı oluşturulmaz. <strong>Activities</strong> sayfasında bir etkinlik oluşturup <strong>Max Participants</strong> değerini <strong>15 veya üzeri</strong> yaptığınızda otomatik olarak Event etiketi alır.</p>
              <Button asChild variant="default" className="mt-4">
                <Link to="/vibes">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Activities sayfasına git
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card 
            key={event.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/events/${event.id}`)}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle>{event.title}</CardTitle>
                <Badge variant="outline">{event.type}</Badge>
              </div>
              <CardDescription>{event.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{event.date} at {event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{event.currentParticipants}/{event.maxParticipants} participants</span>
                  </div>
                </div>
                
                {/* Tickets Preview */}
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">Tickets ({event.tickets?.length || 0})</span>
                  </div>
                  {event.tickets && event.tickets.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {event.tickets.slice(0, 2).map((ticket) => (
                        <div key={ticket.id} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {ticket.type === 'paid' ? `$${ticket.price}` : 'Free'}
                          </span>
                          <span className="text-muted-foreground">
                            {ticket.sold} / {ticket.available} sold
                          </span>
                        </div>
                      ))}
                      {event.tickets.length > 2 && (
                        <p className="text-xs text-muted-foreground">+{event.tickets.length - 2} more</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Calendar, MapPin, Users, Ticket, Plus, ArrowRight, Info, DollarSign, Gift, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

type EventTicket = {
  id: number;
  title: string;
  price: number;
  type: 'paid' | 'free';
  available: number;
  sold: number;
};

export default function EventsPage() {
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
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [newTicketPrice, setNewTicketPrice] = useState('');
  const [newTicketType, setNewTicketType] = useState<'paid' | 'free'>('paid');
  const [newTicketAvailable, setNewTicketAvailable] = useState('');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground mt-2">Event'ler, 15+ kişi ile oluşturduğunuz etkinliklerdir. Bağımsız event oluşturma kaldırıldı.</p>
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
          <Card key={event.id}>
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
                
                {/* Tickets Section */}
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">Tickets ({event.tickets?.length || 0})</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedEventId(event.id);
                        setIsTicketDialogOpen(true);
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  {event.tickets && event.tickets.length > 0 ? (
                    <div className="space-y-2">
                      {event.tickets.map((ticket) => (
                        <div key={ticket.id} className="p-2 rounded-lg bg-muted/50 border border-border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{ticket.type === 'paid' ? `$${ticket.price}` : 'Free'}</span>
                            <Badge variant={ticket.type === 'paid' ? 'default' : 'secondary'} className="text-xs">
                              {ticket.type}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{ticket.sold} / {ticket.available} sold</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs"
                              onClick={() => {
                                setEvents(events.map(e => 
                                  e.id === event.id 
                                    ? {
                                        ...e,
                                        tickets: e.tickets.map(t => 
                                          t.id === ticket.id 
                                            ? { ...t, type: t.type === 'paid' ? 'free' : 'paid', price: t.type === 'paid' ? 0 : 50 }
                                            : t
                                        )
                                      }
                                    : e
                                ));
                                toast.success(`Ticket switched to ${ticket.type === 'paid' ? 'free' : 'paid'}`);
                              }}
                            >
                              {ticket.type === 'paid' ? (
                                <><ToggleRight className="w-3 h-3 mr-1" />Free</>
                              ) : (
                                <><ToggleLeft className="w-3 h-3 mr-1" />Paid</>
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-2">No tickets yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ticket Dialog */}
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Ticket</DialogTitle>
            <DialogDescription>Add a ticket option for this event</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ticket Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={newTicketType === 'paid' ? 'default' : 'outline'}
                  onClick={() => {
                    setNewTicketType('paid');
                    setNewTicketPrice('');
                  }}
                  className="flex-1"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Paid
                </Button>
                <Button
                  type="button"
                  variant={newTicketType === 'free' ? 'default' : 'outline'}
                  onClick={() => {
                    setNewTicketType('free');
                    setNewTicketPrice('');
                  }}
                  className="flex-1"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Free
                </Button>
              </div>
            </div>
            {newTicketType === 'paid' && (
              <div className="space-y-2">
                <Label>Price ($) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  placeholder="e.g., 50"
                  value={newTicketPrice}
                  onChange={(e) => setNewTicketPrice(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Available Tickets <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                placeholder="e.g., 50"
                value={newTicketAvailable}
                onChange={(e) => setNewTicketAvailable(e.target.value)}
                min="1"
              />
            </div>
            <Button
              onClick={() => {
                if (!selectedEventId) return;
                if (!newTicketAvailable || parseInt(newTicketAvailable) <= 0) {
                  toast.error('Please enter a valid number of available tickets');
                  return;
                }
                if (newTicketType === 'paid' && (!newTicketPrice || parseFloat(newTicketPrice) <= 0)) {
                  toast.error('Please enter a valid price for paid tickets');
                  return;
                }
                const selectedEvent = events.find(e => e.id === selectedEventId);
                if (!selectedEvent) return;
                
                const newTicket: EventTicket = {
                  id: (selectedEvent.tickets?.length || 0) + 1,
                  title: `${selectedEvent.title} Ticket`,
                  price: newTicketType === 'paid' ? parseFloat(newTicketPrice) : 0,
                  type: newTicketType,
                  available: parseInt(newTicketAvailable),
                  sold: 0,
                };
                
                setEvents(events.map(e => 
                  e.id === selectedEventId 
                    ? { ...e, tickets: [...(e.tickets || []), newTicket] }
                    : e
                ));
                setNewTicketPrice('');
                setNewTicketAvailable('');
                setNewTicketType('paid');
                setIsTicketDialogOpen(false);
                toast.success('Ticket created successfully!');
              }}
              className="w-full"
              disabled={!newTicketAvailable || (newTicketType === 'paid' && !newTicketPrice)}
            >
              Create Ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Plus, Calendar, MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';

const WEEKDAYS = [
  { id: 'monday', label: 'Mon' },
  { id: 'tuesday', label: 'Tue' },
  { id: 'wednesday', label: 'Wed' },
  { id: 'thursday', label: 'Thu' },
  { id: 'friday', label: 'Fri' },
  { id: 'saturday', label: 'Sat' },
  { id: 'sunday', label: 'Sun' },
] as const;

type VibeItem = {
  id: number;
  title: string;
  description: string;
  scheduleType: 'one_time' | 'recurring_weekly';
  date: string;
  time: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  recurringDays?: string[];
  startTime?: string;
  endTime?: string;
};

function getActivityScheduleDisplay(v: VibeItem): string {
  if (v.scheduleType === 'recurring_weekly' && (v.recurringDays?.length ?? 0) > 0 && v.startTime && v.endTime) {
    const days = (v.recurringDays ?? []).map((d) => WEEKDAYS.find((w) => w.id === d)?.label ?? d).join(', ');
    return `Every ${days} · ${v.startTime}–${v.endTime}`;
  }
  if (v.date && v.time) return `${v.date} at ${v.time}`;
  return v.time || '—';
}

export default function VibesPage() {
  const [vibes, setVibes] = useState<VibeItem[]>([
    { id: 1, title: 'Bowling Night', description: 'Join us for a fun bowling session', scheduleType: 'one_time', date: '2025-02-05', time: '19:00', location: 'Main Hall', maxParticipants: 20, currentParticipants: 12 },
    { id: 2, title: 'Karaoke Evening', description: 'Sing your heart out', scheduleType: 'one_time', date: '2025-02-10', time: '20:00', location: 'Event Room', maxParticipants: 30, currentParticipants: 18 },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [scheduleType, setScheduleType] = useState<'one_time' | 'recurring_weekly'>('one_time');
  const [recurringDays, setRecurringDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('20:00');

  const toggleRecurringDay = (dayId: string) => {
    setRecurringDays((prev) => (prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]));
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !location || !maxParticipants) {
      toast.error('Please fill title, description, location and max participants');
      return;
    }
    if (scheduleType === 'one_time') {
      if (!date || !time) {
        toast.error('Please fill date and time for one-time activity');
        return;
      }
    } else {
      if (recurringDays.length === 0) {
        toast.error('Select at least one day for recurring activity');
        return;
      }
      if (!startTime || !endTime) {
        toast.error('Please set start and end time');
        return;
      }
    }
    const newVibe: VibeItem = {
      id: vibes.length + 1,
      title,
      description,
      scheduleType,
      date: scheduleType === 'one_time' ? date : '',
      time: scheduleType === 'one_time' ? time : startTime,
      location,
      maxParticipants: parseInt(maxParticipants, 10),
      currentParticipants: 0,
      recurringDays: scheduleType === 'recurring_weekly' ? recurringDays : undefined,
      startTime: scheduleType === 'recurring_weekly' ? startTime : undefined,
      endTime: scheduleType === 'recurring_weekly' ? endTime : undefined,
    };
    setVibes([newVibe, ...vibes]);
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setLocation('');
    setMaxParticipants('');
    setScheduleType('one_time');
    setRecurringDays([]);
    setStartTime('19:00');
    setEndTime('20:00');
    setIsDialogOpen(false);
    toast.success('Vibe created successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Vibe</h1>
          <p className="text-muted-foreground mt-2">Organize events and meetups</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Vibe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Vibe</DialogTitle>
              <DialogDescription>Organize an event or meetup</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="e.g., Bowling Night"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your vibe..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="e.g., Main Hall"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <Label>Schedule</Label>
                <div className="flex gap-2">
                  <Button type="button" variant={scheduleType === 'one_time' ? 'default' : 'outline'} size="sm" onClick={() => setScheduleType('one_time')}>One-time</Button>
                  <Button type="button" variant={scheduleType === 'recurring_weekly' ? 'default' : 'outline'} size="sm" onClick={() => setScheduleType('recurring_weekly')}>Recurring</Button>
                </div>
              </div>
              {scheduleType === 'one_time' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                  </div>
                </div>
              )}
              {scheduleType === 'recurring_weekly' && (
                <>
                  <div className="space-y-2">
                    <Label>Days of week</Label>
                    <div className="flex flex-wrap gap-2">
                      {WEEKDAYS.map((day) => (
                        <Button
                          key={day.id}
                          type="button"
                          variant={recurringDays.includes(day.id) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleRecurringDay(day.id)}
                        >
                          {day.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start time</Label>
                      <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>End time</Label>
                      <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </div>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label>Max Participants</Label>
                <Input
                  type="number"
                  placeholder="e.g., 20"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Create Vibe
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vibes.map((vibe) => (
          <Card key={vibe.id}>
            <CardHeader>
              <CardTitle>{vibe.title}</CardTitle>
              <CardDescription>{vibe.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{getActivityScheduleDisplay(vibe)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{vibe.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{vibe.currentParticipants}/{vibe.maxParticipants} participants</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

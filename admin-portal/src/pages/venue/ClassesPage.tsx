import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Plus, GraduationCap, MapPin, Calendar, Clock, Users, DollarSign, Building2, Pencil, UserCheck, UserX, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { VENUE_LOCATIONS, getLocationNameById } from '../../lib/venueLocations';

type PendingRequest = {
  id: string;
  userName: string;
  email: string;
  requestedAt: string;
};

const classCategories = [
  { id: 'fitness', label: 'Fitness' },
  { id: 'yoga', label: 'Yoga' },
  { id: 'dance', label: 'Dance' },
  { id: 'music', label: 'Music' },
  { id: 'art', label: 'Art' },
  { id: 'workshop', label: 'Workshop' },
  { id: 'tech', label: 'Tech' },
  { id: 'business', label: 'Business' },
  { id: 'other', label: 'Other' },
];

type ClassItem = {
  id: number;
  title: string;
  category: string;
  type: 'onsite';
  price: number;
  maxStudents: number;
  currentStudents: number;
  locationId: string;
  roomOrArea?: string;
  date: string;
  time: string;
  duration: string;
  frequency: string;
  description: string;
  pendingRequests?: PendingRequest[];
};

export default function VenueClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([
    {
      id: 1,
      title: 'Yoga Morning',
      category: 'yoga',
      type: 'onsite',
      price: 25,
      maxStudents: 15,
      currentStudents: 8,
      locationId: 'loc-1',
      roomOrArea: 'Studio A',
      date: '2025-03-10',
      time: '09:00',
      duration: '1 hour',
      frequency: 'Weekly',
      description: 'Morning yoga session',
      pendingRequests: [
        { id: 'req-1', userName: 'Ayşe Yılmaz', email: 'ayse@example.com', requestedAt: '2025-03-05' },
        { id: 'req-2', userName: 'Mehmet Kaya', email: 'mehmet@example.com', requestedAt: '2025-03-06' },
      ],
    },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [maxStudents, setMaxStudents] = useState('');
  const [locationId, setLocationId] = useState(VENUE_LOCATIONS[0]?.id ?? '');
  const [roomOrArea, setRoomOrArea] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [frequency, setFrequency] = useState('once');
  const [description, setDescription] = useState('');

  const getLocationDisplay = (cls: ClassItem) => {
    const locName = getLocationNameById(cls.locationId);
    return cls.roomOrArea ? `${locName} – ${cls.roomOrArea}` : locName;
  };

  const resetForm = () => {
    setEditingClassId(null);
    setTitle('');
    setCategory('');
    setPrice('');
    setMaxStudents('');
    setLocationId(VENUE_LOCATIONS[0]?.id ?? '');
    setRoomOrArea('');
    setDate('');
    setTime('');
    setDuration('');
    setFrequency('once');
    setDescription('');
  };

  const openEdit = (cls: ClassItem) => {
    setEditingClassId(cls.id);
    setTitle(cls.title);
    setCategory(cls.category);
    setPrice(cls.price > 0 ? String(cls.price) : '');
    setMaxStudents(String(cls.maxStudents));
    setLocationId(cls.locationId);
    setRoomOrArea(cls.roomOrArea ?? '');
    setDate(cls.date);
    setTime(cls.time);
    setDuration(cls.duration);
    setFrequency(cls.frequency === 'One time' ? 'once' : cls.frequency === 'Weekly' ? 'weekly' : 'custom');
    setDescription(cls.description ?? '');
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!title.trim() || !maxStudents || !date || !time || !duration.trim()) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!locationId) {
      toast.error('Please select a location');
      return;
    }
    const frequencyDisplay = frequency === 'once' ? 'One time' : frequency === 'weekly' ? 'Weekly' : 'Custom';
    if (editingClassId !== null) {
      setClasses((prev) =>
        prev.map((c) =>
          c.id === editingClassId
            ? {
                ...c,
                title: title.trim(),
                category: category || 'other',
                price: price ? parseFloat(price) : 0,
                maxStudents: parseInt(maxStudents, 10),
                locationId,
                roomOrArea: roomOrArea.trim() || undefined,
                date,
                time,
                duration: duration.trim(),
                frequency: frequencyDisplay,
                description: description.trim(),
              }
            : c
        )
      );
      toast.success('Class updated successfully!');
    } else {
      const newClass: ClassItem = {
        id: Math.max(0, ...classes.map((c) => c.id)) + 1,
        title: title.trim(),
        category: category || 'other',
        type: 'onsite',
        price: price ? parseFloat(price) : 0,
        maxStudents: parseInt(maxStudents, 10),
        currentStudents: 0,
        locationId,
        roomOrArea: roomOrArea.trim() || undefined,
        date,
        time,
        duration: duration.trim(),
        frequency: frequencyDisplay,
        description: description.trim(),
        pendingRequests: [],
      };
      setClasses([newClass, ...classes]);
      toast.success('On-site class created successfully!');
    }
    resetForm();
    setIsDialogOpen(false);
  };

  const handleAcceptRequest = (classId: number, requestId: string) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id !== classId) return c;
        const newPending = (c.pendingRequests ?? []).filter((r) => r.id !== requestId);
        const newCurrent = Math.min(c.currentStudents + 1, c.maxStudents);
        return { ...c, currentStudents: newCurrent, pendingRequests: newPending };
      })
    );
    toast.success('User accepted');
  };

  const handleRejectRequest = (classId: number, requestId: string) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id !== classId) return c;
        return { ...c, pendingRequests: (c.pendingRequests ?? []).filter((r) => r.id !== requestId) };
      })
    );
    toast.success('Request rejected');
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) resetForm();
    setIsDialogOpen(open);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">On-Site Classes</h1>
          <p className="text-muted-foreground mt-2">Create and manage classes. Edit, approve join requests, and use QR check-in on tablet for attendance.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Create On-Site Class
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingClassId ? 'Edit On-Site Class' : 'Create On-Site Class'}</DialogTitle>
              <DialogDescription>
                {editingClassId ? 'Update class details' : 'Add a class that takes place at your venue'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Class Title</Label>
                <Input placeholder="e.g., Yoga Morning" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select category</option>
                  {classCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input type="number" min={0} placeholder="0 for free" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Max Students</Label>
                  <Input type="number" min={1} placeholder="e.g., 20" value={maxStudents} onChange={(e) => setMaxStudents(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Venue Location</Label>
                <select value={locationId} onChange={(e) => setLocationId(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {VENUE_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Room / Area (optional)</Label>
                <Input placeholder="e.g., Studio A, Main Hall" value={roomOrArea} onChange={(e) => setRoomOrArea(e.target.value)} />
              </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input placeholder="e.g., 1 hour" value={duration} onChange={(e) => setDuration(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="once">One time</option>
                    <option value="weekly">Weekly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea placeholder="Brief description of the class..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingClassId ? 'Save Changes' : 'Create On-Site Class'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <Card key={cls.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  {cls.title}
                </CardTitle>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    On-site
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cls)} title="Edit class">
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="flex items-center gap-2 mt-2">
                <DollarSign className="w-4 h-4" />
                <span>{cls.price === 0 ? 'Free' : `$${cls.price}`}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{cls.date} at {cls.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{cls.duration} ({cls.frequency})</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{getLocationDisplay(cls)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{cls.currentStudents}/{cls.maxStudents} students</span>
                </div>
              </div>

              {/* Ticket / QR Check-in – tablet'te katılım için */}
              <Link to={`/checkin?classId=${cls.id}&title=${encodeURIComponent(cls.title)}`}>
                <Button variant="outline" className="w-full" size="sm">
                  <QrCode className="w-4 h-4 mr-2" />
                  Tickets & QR Check-in
                </Button>
              </Link>

              {(cls.pendingRequests?.length ?? 0) > 0 && (
                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    Pending join requests ({cls.pendingRequests!.length})
                  </p>
                  <ul className="space-y-2">
                    {cls.pendingRequests!.map((req) => (
                      <li key={req.id} className="flex items-center justify-between gap-2 text-sm py-1.5 px-2 rounded bg-background">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{req.userName}</p>
                          <p className="text-xs text-muted-foreground truncate">{req.email}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="default"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => handleAcceptRequest(cls.id, req.id)}
                            disabled={cls.currentStudents >= cls.maxStudents}
                            title={cls.currentStudents >= cls.maxStudents ? 'Class is full' : 'Accept'}
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => handleRejectRequest(cls.id, req.id)} title="Reject">
                            <UserX className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

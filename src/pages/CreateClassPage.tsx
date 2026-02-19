import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { X, BookOpen, Camera, Calendar, Clock, DollarSign, Users, MapPin, Plus, AlertCircle, Crown, Lock, Monitor, Video, Building, Paperclip, FileText, ListOrdered } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useVenues, useVenue } from '@/hooks/useVenues';
import { checkVenueHours } from '@/lib/venueHours';
import { CLASS_AND_COMMUNITY_CATEGORIES } from '@/constants/categories';
import { useCommunities } from '@/hooks/useCommunities';
import { toast } from 'sonner';
import { apiRequest, API_ENDPOINTS, apiUpload, getAuthToken } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

type MaterialItem = { id: string; file: File; name: string };

type SyllabusLesson = { id: string; title: string; description: string };
type SyllabusModule = { id: string; title: string; lessons: SyllabusLesson[] };

/** Placeholder and hint per meeting platform so users know the right link format. */
const MEETING_PLATFORM_CONFIG: Record<string, { placeholder: string; hint: string }> = {
  zoom: {
    placeholder: 'e.g. https://zoom.us/j/123456789 or https://us06web.zoom.us/j/...',
    hint: 'Create a meeting at zoom.us → Copy "Join URL" or "Invite link".',
  },
  teams: {
    placeholder: 'e.g. https://teams.microsoft.com/l/meetup-join/19%3a...',
    hint: 'Calendar → New meeting → Add participants → Copy "Get link to join".',
  },
  meet: {
    placeholder: 'e.g. https://meet.google.com/abc-defg-hij',
    hint: 'Create a meeting at meet.google.com or Google Calendar → Copy the meeting link.',
  },
  webex: {
    placeholder: 'e.g. https://example.webex.com/meet/... or meeting number link',
    hint: 'Schedule a meeting in Webex → Copy "Join meeting" or invitation link.',
  },
  custom: {
    placeholder: 'e.g. https://discord.gg/... or any meeting URL',
    hint: 'Paste the link participants will use to join (Discord, Skype, etc.).',
  },
};

const CreateClassPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const communityIdFromQuery = searchParams.get('communityId') || undefined;
  const { isAuthenticated, user, updateUser } = useAuth();
  const { data: venues = [] } = useVenues();
  const { data: communities = [] } = useCommunities();
  const [communityId, setCommunityId] = useState<string>(communityIdFromQuery || '');

  const neverCreatedClass = (user?.createdClassesCount ?? 0) === 0;
  const missingFollowersOrExpertise =
    user?.socialMediaFollowers == null ||
    !(user?.expertise && user.expertise.length > 0);
  const mustCollectCreatorInfo = neverCreatedClass && missingFollowersOrExpertise && isAuthenticated;
  const [showRequiredInfoModal, setShowRequiredInfoModal] = useState(false);
  const [requiredFollowerCount, setRequiredFollowerCount] = useState('');
  const [requiredExpertise, setRequiredExpertise] = useState('');
  const [requiredCertifiedAreas, setRequiredCertifiedAreas] = useState('');
  const [savingCreatorInfo, setSavingCreatorInfo] = useState(false);

  useEffect(() => {
    if (mustCollectCreatorInfo) {
      setShowRequiredInfoModal(true);
      setRequiredFollowerCount(String(user?.socialMediaFollowers ?? ''));
      setRequiredExpertise(user?.expertise?.join(', ') ?? '');
      setRequiredCertifiedAreas(user?.certifiedAreas?.join(', ') ?? '');
    }
  }, [mustCollectCreatorInfo, user?.socialMediaFollowers, user?.expertise, user?.certifiedAreas]);

  const handleSaveCreatorInfo = async () => {
    if (!requiredFollowerCount.trim()) {
      toast.error('Please enter your social media follower count');
      return;
    }
    const num = parseInt(requiredFollowerCount, 10);
    if (isNaN(num) || num < 0) {
      toast.error('Please enter a valid follower count');
      return;
    }
    const expertiseList = requiredExpertise
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (expertiseList.length === 0) {
      toast.error('Please enter at least one area of experience (e.g. Marketing, Tech)');
      return;
    }
    const certifiedList = requiredCertifiedAreas
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setSavingCreatorInfo(true);
    try {
      await updateUser({
        socialMediaFollowers: num,
        expertise: expertiseList,
        certifiedAreas: certifiedList.length > 0 ? certifiedList : undefined,
      });
      setShowRequiredInfoModal(false);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save');
    } finally {
      setSavingCreatorInfo(false);
    }
  };

  useEffect(() => {
    if (communityIdFromQuery) setCommunityId(communityIdFromQuery);
  }, [communityIdFromQuery]);

  const [selectedVenueDisplay, setSelectedVenueDisplay] = useState<{ id: string; name: string } | null>(null);
  useEffect(() => {
    const fromState = (location.state as any)?.selectedVenue;
    if (fromState?.id) {
      setVenueId(fromState.id);
      setSelectedVenueDisplay({ id: fromState.id, name: fromState.name });
      window.history.replaceState({}, '', location.pathname + (location.search || ''));
    }
  }, [location.state, location.pathname, location.search]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skill, setSkill] = useState('');
  const [category, setCategory] = useState('');
  const [categoryOtherText, setCategoryOtherText] = useState(''); // when category === 'other'
  const [venueId, setVenueId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  /** When frequency is 'custom', only end time (HH:mm) is needed; same day as start. */
  const [endTimeOnly, setEndTimeOnly] = useState('');
  const [maxStudents, setMaxStudents] = useState('');
  const [price, setPrice] = useState('');
  const [schedule, setSchedule] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isExclusive, setIsExclusive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [frequency, setFrequency] = useState<'once' | 'custom'>('once');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [classMaterials, setClassMaterials] = useState<MaterialItem[]>([]);
  const [syllabus, setSyllabus] = useState<SyllabusModule[]>([]);
  const [lessons, setLessons] = useState<Array<{ id: string; day: string; time: string; title: string; materials: MaterialItem[] }>>([]);
  const [type, setType] = useState<'online' | 'onsite' | 'hybrid'>('online');
  const [meetingPlatform, setMeetingPlatform] = useState<'zoom' | 'teams' | 'meet' | 'webex' | 'custom' | ''>('');
  const [meetingLink, setMeetingLink] = useState('');
  const [customPlatformName, setCustomPlatformName] = useState('');
  const [physicalLocation, setPhysicalLocation] = useState('');

  const { data: venueDetails } = useVenue(type === 'onsite' && venueId ? venueId : '');

  const weekDays = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];
  
  /** Custom days: only one day at a time; select day then add lessons one by one. */
  const selectDay = (day: string) => {
    setSelectedDays([day]);
  };
  
  const handleAddLesson = () => {
    if (frequency !== 'custom' || selectedDays.length === 0) {
      toast.error('Please select a day first');
      return;
    }
    if (!startTime) {
      toast.error('Please set start time first');
      return;
    }
    const day = selectedDays[0];
    const timeOnly = startTime.split('T')[1] || startTime.split(' ')[1] || '10:00';
    const newLesson = {
      id: `lesson-${Date.now()}-${day}-${lessons.length}`,
      day,
      time: timeOnly,
      title: `${weekDays.find(w => w.value === day)?.label} - ${title || 'Lesson'}${lessons.filter(l => l.day === day).length > 0 ? ` (${lessons.filter(l => l.day === day).length + 1})` : ''}`,
      materials: [] as MaterialItem[],
    };
    setLessons([...lessons, newLesson]);
    toast.success('Lesson added');
  };

  const handleRemoveLesson = (lessonId: string) => {
    setLessons(lessons.filter(l => l.id !== lessonId));
  };

  const handleAddSyllabusModule = () => {
    setSyllabus((prev) => [...prev, { id: `mod-${Date.now()}`, title: '', lessons: [] }]);
  };
  const handleRemoveSyllabusModule = (moduleId: string) => {
    setSyllabus((prev) => prev.filter((m) => m.id !== moduleId));
  };
  const handleSyllabusModuleTitle = (moduleId: string, title: string) => {
    setSyllabus((prev) => prev.map((m) => (m.id === moduleId ? { ...m, title } : m)));
  };
  const handleAddSyllabusLesson = (moduleId: string) => {
    setSyllabus((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: [...m.lessons, { id: `les-${Date.now()}`, title: '', description: '' }] }
          : m
      )
    );
  };
  const handleRemoveSyllabusLesson = (moduleId: string, lessonId: string) => {
    setSyllabus((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m))
    );
  };
  const handleSyllabusLessonTitle = (moduleId: string, lessonId: string, title: string) => {
    setSyllabus((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, title } : l)) } : m
      )
    );
  };
  const handleSyllabusLessonDescription = (moduleId: string, lessonId: string, description: string) => {
    setSyllabus((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, description } : l)) } : m
      )
    );
  };

  const classMaterialInputRef = useRef<HTMLInputElement>(null);
  const lessonMaterialInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleAddClassMaterials = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const newItems: MaterialItem[] = Array.from(files).map((file) => ({
      id: `cm-${Date.now()}-${file.name}`,
      file,
      name: file.name,
    }));
    setClassMaterials((prev) => [...prev, ...newItems]);
    e.target.value = '';
  };
  const handleRemoveClassMaterial = (id: string) => {
    setClassMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddLessonMaterials = (lessonId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const newItems: MaterialItem[] = Array.from(files).map((file) => ({
      id: `lm-${Date.now()}-${lessonId}-${file.name}`,
      file,
      name: file.name,
    }));
    setLessons((prev) =>
      prev.map((l) => (l.id === lessonId ? { ...l, materials: [...l.materials, ...newItems] } : l))
    );
    e.target.value = '';
  };
  const handleRemoveLessonMaterial = (lessonId: string, materialId: string) => {
    setLessons((prev) =>
      prev.map((l) =>
        l.id === lessonId ? { ...l, materials: l.materials.filter((m) => m.id !== materialId) } : l
      )
    );
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to create a class');
      navigate('/');
      return;
    }

    try {
      if (!title?.trim() || !description?.trim() || !skill?.trim() || !startTime) {
        toast.error('Please fill in all required fields');
        return;
      }
      if (type === 'onsite' && !venueId) {
        toast.error('Please select a venue for onsite classes');
        return;
      }
      if ((type === 'online' || type === 'hybrid') && !meetingLink?.trim()) {
        toast.error('Please enter the meeting link');
        return;
      }

      const priceNum = price === '' || price === undefined ? undefined : parseFloat(price);
      if (priceNum !== undefined && !isNaN(priceNum)) {
        if (priceNum < 0) {
          toast.error('Price cannot be negative');
          return;
        }
      if (priceNum > 0 && priceNum < 10) {
        toast.error('Paid classes must be at least $10');
        return;
      }
      }

      if (type === 'onsite' && venueId && venueDetails?.businessHours) {
        const startDate = new Date(startTime);
        const endDate = frequency === 'custom' && endTimeOnly && startTime
          ? (() => { const d = new Date(startTime); const [h, m] = endTimeOnly.split(':').map(Number); d.setHours(h, m ?? 0, 0, 0); return d; })()
          : endTime ? new Date(endTime) : undefined;
        const venueCheck = checkVenueHours(venueDetails.businessHours, startDate, endDate);
        if (!venueCheck.valid) {
          toast.error(venueCheck.message);
          return;
        }
      }

      setLoading(true);

      const classData = {
        title,
        description,
        skill,
        category: category === 'other' ? (categoryOtherText?.trim() || 'other') : (category || undefined),
        venueId: type === 'onsite' ? venueId : undefined,
        communityId: communityId || undefined,
        type,
        meetingPlatform: (type === 'online' || type === 'hybrid') ? meetingPlatform : undefined,
        meetingLink: (type === 'online' || type === 'hybrid') ? meetingLink : undefined,
        customPlatformName: (type === 'online' || type === 'hybrid') && meetingPlatform === 'custom' ? customPlatformName : undefined,
        physicalLocation: type === 'hybrid' ? physicalLocation : undefined,
        startTime: new Date(`${startTime}`).toISOString(),
        endTime: (() => {
          if (frequency === 'custom' && endTimeOnly && startTime) {
            const d = new Date(startTime); const [h, m] = endTimeOnly.split(':').map(Number); d.setHours(h, m ?? 0, 0, 0); return d.toISOString();
          }
          return endTime ? new Date(`${endTime}`).toISOString() : undefined;
        })(),
        maxStudents: maxStudents ? parseInt(maxStudents) : undefined,
        price: priceNum !== undefined && !isNaN(priceNum) ? priceNum : undefined,
        schedule: schedule || undefined,
        lessons: lessons.map((l) => ({ day: l.day, time: l.time, title: l.title })),
        syllabus: syllabus.length > 0 ? syllabus.map((m) => ({ title: m.title, lessons: m.lessons.map((l) => ({ title: l.title, description: l.description || undefined })) })) : undefined,
      };

      const hasMaterials = image || classMaterials.length > 0 || lessons.some((l) => l.materials.length > 0);
      if (hasMaterials) {
        const formData = new FormData();
        if (image) formData.append('image', image);
        formData.append('data', JSON.stringify(classData));
        classMaterials.forEach((m) => formData.append('classMaterials', m.file));
        lessons.forEach((lesson, idx) => {
          lesson.materials.forEach((m) => formData.append(`lesson_${idx}_materials`, m.file));
        });
        const token = getAuthToken();
        const res = await fetch(API_ENDPOINTS.CLASSES.CREATE, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: 'Failed to create class' }));
          throw new Error(err.message || 'Failed to create class');
        }
      } else {
        await apiRequest(API_ENDPOINTS.CLASSES.CREATE, {
          method: 'POST',
          body: JSON.stringify(classData),
        });
      }

      toast.success('Class created successfully!');
      if (communityId) {
        navigate(`/community/${communityId}`);
      } else {
        navigate('/discover');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  return (
    <AppLayout hideNav>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-40 glass safe-top">
          <div className="flex items-center justify-between px-4 py-3">
            <motion.button
              onClick={() => navigate('/home')}
              className="p-2 -ml-2"
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6 text-foreground" />
            </motion.button>
            <h1 className="font-bold text-foreground">Create Class</h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">Create an Expert-Led Class</h2>
            <p className="text-muted-foreground">Share real experience, not theory. Teach what you've actually built and achieved. Entrepreneurs learn from real results.</p>
          </div>

          {/* Image upload */}
          <div>
            <label className="block">
              <motion.div 
                className="w-full h-32 rounded-2xl border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-2 cursor-pointer"
                whileTap={{ scale: 0.98 }}
              >
                <Camera className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {image ? image.name : 'Add class photo (optional)'}
                </span>
              </motion.div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Class Title *
              </label>
              <Input
                placeholder="e.g., Beginner Tennis Class"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Skill/Subject *
              </label>
              <Input
                placeholder="e.g., Tennis, Yoga, Cooking..."
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Link to Community (optional)
              </label>
              <select
                value={communityId}
                onChange={(e) => setCommunityId(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground"
              >
                <option value="">None</option>
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Class Type *
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <Button
                  type="button"
                  variant={type === 'online' ? 'default' : 'outline'}
                  onClick={() => {
                    setType('online');
                    setPhysicalLocation('');
                  }}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <Monitor className="w-4 h-4" />
                  <span className="text-xs">Online</span>
                </Button>
                <Button
                  type="button"
                  variant={type === 'hybrid' ? 'default' : 'outline'}
                  onClick={() => {
                    setType('hybrid');
                  }}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <Video className="w-4 h-4" />
                  <span className="text-xs">Hybrid</span>
                </Button>
                <Button
                  type="button"
                  variant={type === 'onsite' ? 'default' : 'outline'}
                  onClick={() => {
                    setType('onsite');
                    setMeetingPlatform('');
                    setMeetingLink('');
                    setCustomPlatformName('');
                  }}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <Building className="w-4 h-4" />
                  <span className="text-xs">Onsite</span>
                </Button>
              </div>
            </div>

            {(type === 'online' || type === 'hybrid') && (
              <>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Meeting Platform *
                  </label>
                  <select
                    value={meetingPlatform}
                    onChange={(e) => {
                      setMeetingPlatform(e.target.value as 'zoom' | 'teams' | 'meet' | 'webex' | 'custom');
                      if (e.target.value !== 'custom') {
                        setCustomPlatformName('');
                      }
                    }}
                    className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground"
                  >
                    <option value="">Select platform...</option>
                    <option value="zoom">Zoom</option>
                    <option value="teams">Microsoft Teams</option>
                    <option value="meet">Google Meet</option>
                    <option value="webex">Webex</option>
                    <option value="custom">Other Platform</option>
                  </select>
                </div>
                {meetingPlatform === 'custom' && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Platform Name *
                    </label>
                    <Input
                      placeholder="e.g., Discord, Skype, etc."
                      value={customPlatformName}
                      onChange={(e) => setCustomPlatformName(e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Meeting Link *
                  </label>
                  <Input
                    placeholder={meetingPlatform ? (MEETING_PLATFORM_CONFIG[meetingPlatform]?.placeholder ?? 'Paste your meeting link') : 'Select a platform first'}
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                  {meetingPlatform && MEETING_PLATFORM_CONFIG[meetingPlatform]?.hint && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {MEETING_PLATFORM_CONFIG[meetingPlatform].hint}
                    </p>
                  )}
                </div>
              </>
            )}

            {type === 'hybrid' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Physical Location *
                </label>
                <Input
                  placeholder="e.g., Training Center, Room 101, 123 Main St, Mexico City"
                  value={physicalLocation}
                  onChange={(e) => setPhysicalLocation(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
            )}

            {type === 'onsite' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Venue *
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-12 rounded-xl justify-start gap-2"
                      onClick={() => navigate('/select-venue?returnTo=create-class')}
                    >
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      {venueId
                        ? (selectedVenueDisplay?.name ?? venues.find((v) => v.id === venueId)?.name ?? 'Venue selected')
                        : 'Browse venues near me'}
                    </Button>
                    {venueId && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-xl shrink-0"
                        onClick={() => navigate(`/venue/${venueId}`)}
                        title="View venue details"
                      >
                        <MapPin className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                  {venueId && (
                    <p className="text-xs text-muted-foreground">
                      {selectedVenueDisplay?.name ?? venues.find((v) => v.id === venueId)?.name} selected.{' '}
                      <button
                        type="button"
                        onClick={() => navigate(`/venue/${venueId}`)}
                        className="text-primary hover:underline"
                      >
                        View venue details
                      </button>
                      <span className="block mt-1">
                        {(venueDetails?.pricePerHalfHour ?? venues.find((v) => v.id === venueId)?.pricePerHalfHour ?? 0) > 0
                          ? `$${Number(venueDetails?.pricePerHalfHour ?? venues.find((v) => v.id === venueId)?.pricePerHalfHour ?? 0).toFixed(2)} per 30 min`
                          : '$0 per 30 min'}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Category (optional)
              </label>
              <Select value={category || undefined} onValueChange={(v) => setCategory(v || '')}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {CLASS_AND_COMMUNITY_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <SelectItem key={cat.value} value={cat.value} className="flex items-center gap-3 rounded-lg py-2.5">
                        <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                        {cat.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {category === 'other' && (
                <Input
                  placeholder="Specify category (optional)"
                  value={categoryOtherText}
                  onChange={(e) => setCategoryOtherText(e.target.value)}
                  className="h-12 rounded-xl mt-2"
                />
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Description *
              </label>
              <Textarea
                placeholder="Describe your class, what students will learn, skill level required..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl min-h-[120px]"
              />
            </div>

            {/* Class materials (optional) */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                <Paperclip className="w-4 h-4" /> Class materials (optional)
              </label>
              <p className="text-xs text-muted-foreground mb-2">PDF, documents, or files for the whole class</p>
              <input
                ref={classMaterialInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/*"
                className="hidden"
                onChange={handleAddClassMaterials}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl border-dashed"
                onClick={() => classMaterialInputRef.current?.click()}
              >
                <FileText className="w-4 h-4 mr-2" />
                Add materials
              </Button>
              {classMaterials.length > 0 && (
                <ul className="mt-2 space-y-2">
                  {classMaterials.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50 border border-border text-sm"
                    >
                      <span className="truncate text-foreground">{m.name}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="shrink-0 h-8 w-8 p-0"
                        onClick={() => handleRemoveClassMaterial(m.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Course syllabus (optional) */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                <ListOrdered className="w-4 h-4" /> Course syllabus (optional)
              </label>
              <p className="text-xs text-muted-foreground mb-3">Add modules and lessons so students see what they will learn.</p>
              <div className="space-y-4">
                {syllabus.map((module) => (
                  <div key={module.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Module title (e.g. Week 1: Introduction)"
                        value={module.title}
                        onChange={(e) => handleSyllabusModuleTitle(module.id, e.target.value)}
                        className="flex-1 h-10 rounded-lg"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="shrink-0 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveSyllabusModule(module.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="pl-2 border-l-2 border-muted space-y-2">
                      {module.lessons.map((lesson) => (
                        <div key={lesson.id} className="space-y-1">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Lesson title"
                              value={lesson.title}
                              onChange={(e) => handleSyllabusLessonTitle(module.id, lesson.id, e.target.value)}
                              className="flex-1 h-9 rounded-lg text-sm"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="shrink-0 h-9 w-9 p-0"
                              onClick={() => handleRemoveSyllabusLesson(module.id, lesson.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <Textarea
                            placeholder="Short description (optional)"
                            value={lesson.description}
                            onChange={(e) => handleSyllabusLessonDescription(module.id, lesson.id, e.target.value)}
                            className="min-h-[60px] text-sm rounded-lg resize-none"
                            rows={2}
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="w-full border-dashed"
                        onClick={() => handleAddSyllabusLesson(module.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add lesson
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl border-dashed gap-2"
                  onClick={handleAddSyllabusModule}
                >
                  <Plus className="w-4 h-4" />
                  Add module
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Start Date/Time *
                </label>
                <Input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-1">
                  <Clock className="w-4 h-4" /> End {frequency === 'custom' ? 'time (same day)' : 'Date/Time'}
                </label>
                {frequency === 'custom' ? (
                  <Input
                    type="time"
                    value={endTimeOnly}
                    onChange={(e) => setEndTimeOnly(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                ) : (
                  <Input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Schedule
              </label>
              <div className="flex gap-2 mb-3">
                <Button
                  type="button"
                  variant={frequency === 'once' ? 'default' : 'outline'}
                  onClick={() => {
                    setFrequency('once');
                    setSelectedDays([]);
                    setLessons([]);
                    setEndTimeOnly('');
                  }}
                  className="flex-1"
                >
                  One time
                </Button>
                <Button
                  type="button"
                  variant={frequency === 'custom' ? 'default' : 'outline'}
                  onClick={() => setFrequency('custom')}
                  className="flex-1"
                >
                  Custom days
                </Button>
              </div>
              {frequency === 'custom' && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">Select one day, then add lessons one by one.</p>
                  <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg bg-muted/50">
                    {weekDays.map((day) => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="custom-day"
                          id={`day-${day.value}`}
                          checked={selectedDays.includes(day.value)}
                          onChange={() => selectDay(day.value)}
                          className="w-4 h-4 border-border"
                        />
                        <label
                          htmlFor={`day-${day.value}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {day.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  {selectedDays.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">Lessons ({lessons.length})</label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleAddLesson}
                          disabled={!startTime}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Lesson
                        </Button>
                      </div>
                      {lessons.length === 0 ? (
                        <div className="p-4 rounded-lg border border-dashed border-border bg-muted/30 text-center">
                          <AlertCircle className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground mb-1">No lessons yet</p>
                          <p className="text-xs text-muted-foreground">Click &quot;Add Lesson&quot; to add a lesson for {weekDays.find(w => w.value === selectedDays[0])?.label}</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {lessons.map((lesson) => (
                            <div key={lesson.id} className="p-3 rounded-lg border border-border bg-card space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-foreground">{weekDays.find(w => w.value === lesson.day)?.label}</p>
                                  <p className="text-xs text-muted-foreground">{lesson.time}</p>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveLesson(lesson.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="border-t border-border pt-2 mt-2">
                                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                  <Paperclip className="w-3 h-3" /> Lesson materials
                                </p>
                                <input
                                  type="file"
                                  multiple
                                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/*"
                                  className="hidden"
                                  ref={(el) => {
                                    lessonMaterialInputRefs.current[lesson.id] = el;
                                  }}
                                  onChange={(e) => handleAddLessonMaterials(lesson.id, e)}
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs border-dashed"
                                  onClick={() => lessonMaterialInputRefs.current[lesson.id]?.click()}
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  Add material
                                </Button>
                                {lesson.materials.length > 0 && (
                                  <ul className="mt-2 space-y-1">
                                    {lesson.materials.map((m) => (
                                      <li
                                        key={m.id}
                                        className="flex items-center justify-between gap-2 py-1.5 px-2 rounded bg-muted/50 text-xs"
                                      >
                                        <span className="truncate text-foreground">{m.name}</span>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="ghost"
                                          className="shrink-0 h-6 w-6 p-0"
                                          onClick={() => handleRemoveLessonMaterial(lesson.id, m.id)}
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-1">
                  <Users className="w-4 h-4" /> Max Students
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 20"
                  value={maxStudents}
                  onChange={(e) => setMaxStudents(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-1">
                  <DollarSign className="w-4 h-4" /> Price
                </label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0 for free, min $10 if paid"
                  value={price}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '' || v === '.') setPrice(v);
                    else {
                      const n = parseFloat(v);
                      if (!isNaN(n) && n < 0) setPrice('0');
                      else setPrice(v);
                    }
                  }}
                  className="h-12 rounded-xl"
                />
                {(!price || parseFloat(price) === 0) && (
                  <p className="text-xs text-muted-foreground mt-1">Free class</p>
                )}
                {price && parseFloat(price) > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">+5% processing fee applies</p>
                )}
              </div>
            </div>
            
            {/* Free classes: ads always on; viewers can go ad-free via one-time fee in Settings */}
            {(!price || parseFloat(price) === 0) && (
              <div className="space-y-2 p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Free classes show ads</p>
                    <p className="text-xs text-muted-foreground">Viewers can remove ads with a one-time fee in Settings.</p>
                  </div>
                </div>
              </div>
            )}
            {price && parseFloat(price) > 0 && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                    Paid classes never show ads
                  </p>
                </div>
              </div>
            )}

            {/* Premium & Exclusive Options */}
            <div className="space-y-3 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-600" />
                  <div>
                    <label className="text-sm font-medium text-foreground">Premium Class</label>
                    <p className="text-xs text-muted-foreground">Highlight your expertise</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPremium(!isPremium)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isPremium ? 'bg-yellow-500' : 'bg-muted-foreground/30'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                      isPremium ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  <div>
                    <label className="text-sm font-medium text-foreground">Exclusive Class</label>
                    <p className="text-xs text-muted-foreground">Limited seats, private access</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExclusive(!isExclusive)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isExclusive ? 'bg-purple-500' : 'bg-muted-foreground/30'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                      isExclusive ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 glass safe-bottom p-4 border-t border-border">
          <Button
            onClick={handleSubmit}
            disabled={!title || !description || !skill || !startTime || loading || (type === 'onsite' && !venueId) || ((type === 'online' || type === 'hybrid') && (!meetingPlatform || !meetingLink)) || (type === 'hybrid' && !physicalLocation.trim()) || (meetingPlatform === 'custom' && !customPlatformName.trim()) || (frequency === 'custom' && (selectedDays.length === 0 || lessons.length === 0))}
            className="w-full h-12 rounded-xl bg-gradient-primary"
          >
            {loading ? 'Creating...' : 'Create Class'}
          </Button>
        </div>
      </div>

      {/* Required: followers + expertise when user has never created a class */}
      <Dialog
        open={showRequiredInfoModal}
        onOpenChange={(open) => {
          if (!open && mustCollectCreatorInfo) navigate('/home');
          else if (!open) setShowRequiredInfoModal(false);
        }}
      >
        <DialogContent className="max-w-md" onPointerDownOutside={(e) => mustCollectCreatorInfo && e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Tell us about your reach & experience</DialogTitle>
            <DialogDescription>
              Before creating your first class, we need your social media follower count and the areas you're experienced in. This helps learners find the right experts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="required-followers">Social media followers (total)</Label>
              <Input
                id="required-followers"
                type="number"
                min={0}
                placeholder="e.g. 10000"
                value={requiredFollowerCount}
                onChange={(e) => setRequiredFollowerCount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Instagram, YouTube, Twitter, TikTok, etc.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="required-expertise">Areas of experience (deneyim alanları)</Label>
              <Input
                id="required-expertise"
                placeholder="e.g. Marketing, Startup, Tech"
                value={requiredExpertise}
                onChange={(e) => setRequiredExpertise(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Separate with commas</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="required-certified">Certified in (sertifikalı olduğunuz alanlar)</Label>
              <Input
                id="required-certified"
                placeholder="e.g. Google Ads, AWS, PMP (optional)"
                value={requiredCertifiedAreas}
                onChange={(e) => setRequiredCertifiedAreas(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Optional. Separate with commas. Shows as certified on your profile.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => navigate('/home')}>
              Cancel
            </Button>
            <Button onClick={handleSaveCreatorInfo} disabled={savingCreatorInfo}>
              {savingCreatorInfo ? 'Saving...' : 'Continue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default CreateClassPage;

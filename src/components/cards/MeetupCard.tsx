import { motion } from 'framer-motion';
import { MapPin, Clock, Users, Heart, Ticket } from 'lucide-react';
import UserAvatar from '../ui/UserAvatar';
import { Button } from '../ui/button';

interface MeetupCardProps {
  id: string;
  title: string;
  venue?: string | { name: string; address?: string; city?: string };
  location?: string;
  time?: string;
  date?: string;
  category?: string;
  categoryEmoji?: string;
  attendees?: { id: string; avatar?: string; name: string }[];
  maxAttendees?: number;
  image?: string;
  host?: { name: string; avatar?: string; id?: string };
  creator?: { 
    id: string; 
    firstName: string; 
    lastName: string; 
    displayName?: string; 
    avatar?: string 
  };
  startTime?: string;
  /** When 'event', show Event label (e.g. vibe converted to event) */
  type?: 'activity' | 'vibe' | 'event';
  pricePerPerson?: number;
  isFree?: boolean;
  _count?: { members: number };
  members?: Array<{
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      displayName?: string;
      avatar?: string;
    };
  }>;
  onPress?: () => void;
  onJoin?: (e: React.MouseEvent) => void;
  showJoinButton?: boolean;
}

const MeetupCard = ({
  title,
  venue: venueName,
  location,
  time,
  date,
  categoryEmoji,
  attendees: mockAttendees,
  maxAttendees,
  image,
  host,
  creator,
  startTime,
  type,
  pricePerPerson,
  isFree,
  _count,
  members,
  onPress,
  onJoin,
  showJoinButton = false,
}: MeetupCardProps) => {
  const isEvent = type === 'event';
  const typeLabel = isEvent ? 'Event' : 'Activity';
  const isPaid = pricePerPerson != null && pricePerPerson > 0 && !isFree;
  // Normalize data - support both mock data and backend data
  const hostData = host || (creator ? {
    name: creator.displayName || `${creator.firstName} ${creator.lastName}`,
    avatar: creator.avatar,
    id: creator.id,
  } : { name: 'Unknown', avatar: undefined });
  
  // Handle venue - can be string or object
  const venueDisplay = typeof venueName === 'string' 
    ? venueName 
    : (venueName?.name || 'Location TBD');
  const attendees = mockAttendees || (members?.map(m => ({
    id: m.user.id,
    name: m.user.displayName || `${m.user.firstName} ${m.user.lastName}`,
    avatar: m.user.avatar,
  })) || []);
  
  const attendeeCount = attendees.length;
  const maxCount = maxAttendees || 10;
  
  // Format date/time from startTime if provided
  let displayDate = date;
  let displayTime = time;
  if (startTime && !date) {
    const startDate = new Date(startTime);
    displayDate = startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    displayTime = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  
  const emoji = categoryEmoji || '🎉';
  return (
    <motion.div
      className="card-interactive overflow-hidden"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onPress}
    >
      {/* Image */}
      {image && (
        <div className="relative h-32 overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          <div className="absolute bottom-2 left-3 flex items-center gap-2">
            <span className="text-2xl">{emoji}</span>
            {displayDate && <span className="text-sm font-medium text-card">{displayDate}</span>}
          </div>
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${isEvent ? 'bg-violet-500/90 text-white' : 'bg-primary/90 text-white'}`}>
              {isEvent && <Ticket className="w-3 h-3" />}
              {typeLabel}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              isPaid ? 'bg-card/90 backdrop-blur-sm text-card' : 'bg-green-500/90 text-white'
            }`}>
              {isPaid ? `$${pricePerPerson}` : 'Free'}
            </span>
            <button className="p-2 rounded-full bg-card/20 backdrop-blur-sm">
              <Heart className="w-4 h-4 text-card" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {!image && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${isEvent ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400' : 'bg-primary/10 text-primary'}`}>
              {isEvent && <Ticket className="w-3 h-3" />}
              {typeLabel}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              isPaid ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-600 dark:text-green-400'
            }`}>
              {isPaid ? `$${pricePerPerson}` : 'Free'}
            </span>
          </div>
        )}
        <div>
          <h3 className="font-semibold text-foreground line-clamp-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{venueDisplay}</p>
        </div>

        {(location || displayTime) && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-1">{location}</span>
              </div>
            )}
            {displayTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{displayTime}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <UserAvatar src={hostData.avatar} alt={hostData.name} size="sm" />
            <span className="text-sm font-medium">{hostData.name}</span>
          </div>

          <div className="flex items-center gap-2">
            {attendees.length > 0 && (
              <div className="flex -space-x-2">
                {attendees.slice(0, 3).map((attendee) => (
                  <UserAvatar 
                    key={attendee.id} 
                    src={attendee.avatar} 
                    alt={attendee.name} 
                    size="sm" 
                  />
                ))}
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{attendeeCount}/{maxCount}</span>
            </div>
          </div>
        </div>

        {showJoinButton && onJoin && (
          <div className="pt-3">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onJoin(e);
              }}
              className="w-full bg-gradient-primary"
            >
              Join {typeLabel}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MeetupCard;

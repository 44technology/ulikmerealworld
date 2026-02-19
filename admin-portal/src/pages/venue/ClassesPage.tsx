import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { GraduationCap, MapPin, Calendar, Clock, Users, DollarSign, Crown, Lock, TrendingUp, Video } from 'lucide-react';

export default function VenueClassesPage() {
  const navigate = useNavigate();
  const [classes] = useState([
    { id: 1, title: 'Diction Class', category: 'diction', type: 'online', price: 50, maxStudents: 20, currentStudents: 12, location: 'Zoom', meetingPlatform: 'zoom', meetingLink: 'https://zoom.us/j/123456789', date: '2025-02-05', time: '18:00', duration: '1 hour', frequency: 'Monday, Wednesday, Friday', isPremium: false, isExclusive: false, isPopular: false, recentEnrollments: 0 },
    { id: 2, title: 'AutoCAD Basics', category: 'tech', type: 'onsite', price: 75, maxStudents: 15, currentStudents: 8, location: 'Training Center', date: '2025-02-10', time: '14:00', duration: '2 hours', frequency: 'weekly', isPremium: true, isExclusive: false, isPopular: true, recentEnrollments: 15 },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Classes</h1>
        <p className="text-muted-foreground mt-2">View classes at your venue. Class creation is done in the main app.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <Card
            key={cls.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/classes/${cls.id}`)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  {cls.title}
                  {'classType' in cls && cls.classType === 'masterclass' && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-600 ml-2">
                      <Crown className="w-3 h-3 mr-1" />
                      Masterclass
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {'isPremium' in cls && cls.isPremium && 'classType' in cls && cls.classType !== 'masterclass' && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  {'isExclusive' in cls && cls.isExclusive && 'classType' in cls && cls.classType !== 'masterclass' && (
                    <Badge variant="outline" className="border-primary text-primary">
                      <Lock className="w-3 h-3 mr-1" />
                      Exclusive
                    </Badge>
                  )}
                  <Badge variant={cls.type === 'online' ? 'default' : 'secondary'}>
                    {cls.type}
                  </Badge>
                </div>
              </div>
              <CardDescription className="flex items-center gap-2 mt-2">
                <DollarSign className="w-4 h-4" />
                <span>${cls.price}</span>
                {cls.price > 0 && (
                  <span className="text-xs text-muted-foreground">(+5% processing fee)</span>
                )}
              </CardDescription>
              {'isPopular' in cls && cls.isPopular && 'recentEnrollments' in cls && cls.recentEnrollments > 0 && (
                <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-orange-600">This course is popular.</p>
                    <p className="text-xs text-muted-foreground">{cls.recentEnrollments} people enrolled last week.</p>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
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
                  <span>
                    {cls.type === 'online' || cls.type === 'hybrid'
                      ? (cls.meetingPlatform ? `${cls.meetingPlatform.charAt(0).toUpperCase() + cls.meetingPlatform.slice(1)}` : 'Online')
                      : cls.location}
                  </span>
                </div>
                {(cls.type === 'online' || cls.type === 'hybrid') && cls.meetingLink && (
                  <div className="flex items-center gap-2 text-sm">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Join Meeting
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{cls.currentStudents}/{cls.maxStudents} students</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

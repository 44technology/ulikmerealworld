import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Clock, GraduationCap, CheckCircle2, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import BottomNav from '@/components/layout/BottomNav';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiRequest, API_ENDPOINTS } from '@/lib/api';
import { getClassLessonProgress } from '@/lib/classLessonProgress';
import { format } from 'date-fns';

interface EnrolledClass {
  id: string;
  enrolledAt: string;
  status: string;
  class: {
    id: string;
    title: string;
    skill: string;
    category?: string;
    image?: string;
    startTime: string;
    endTime?: string;
    schedule?: string;
    price?: number;
    venue: {
      id: string;
      name: string;
      address: string;
      city: string;
    };
  };
}

const MyClassesPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Fetch user's enrolled classes
  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['my-classes', user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user?.id) return [];
      
      const response = await apiRequest<{ success: boolean; data: EnrolledClass[] }>(
        API_ENDPOINTS.CLASSES.MY_CLASSES
      );
      
      return response.data.sort((a, b) => 
        new Date(a.class.startTime).getTime() - new Date(b.class.startTime).getTime()
      );
    },
    enabled: isAuthenticated && !!user?.id,
  });

  // Separate upcoming and past classes
  const now = new Date();
  const upcomingClasses = enrollments?.filter(enrollment => {
    const startTime = new Date(enrollment.class.startTime);
    return startTime >= now;
  }) || [];
  
  const pastClasses = enrollments?.filter(enrollment => {
    const startTime = new Date(enrollment.class.startTime);
    return startTime < now;
  }) || [];

  const ClassItem = ({ enrollment }: { enrollment: EnrolledClass }) => {
    const classItem = enrollment.class;
    const startTime = new Date(classItem.startTime);
    const dateStr = format(startTime, 'EEEE, MMMM d');
    const timeStr = format(startTime, 'h:mm a');
    const endTimeStr = classItem.endTime ? format(new Date(classItem.endTime), 'h:mm a') : null;
    const progress = getClassLessonProgress(classItem, user?.id);

    return (
      <motion.div
        className="card-elevated overflow-hidden cursor-pointer"
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/class/${classItem.id}`)}
      >
        {classItem.image && (
          <div className="relative h-32">
            <img src={classItem.image} alt={classItem.title} className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                (classItem.price === 0 || classItem.price == null) ? 'bg-green-500/90 text-white' : 'bg-card/90 backdrop-blur-sm text-card'
              }`}>
                {(classItem.price === 0 || classItem.price == null) ? 'Free' : '$'}
              </span>
              <span className="px-2 py-1 rounded-full bg-card/90 backdrop-blur-sm text-xs font-medium text-card">
                {classItem.skill}
              </span>
            </div>
          </div>
        )}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-foreground flex-1">{classItem.title}</h3>
            {enrollment.status === 'enrolled' && (
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
            )}
          </div>

          {(!classItem.image && (classItem.price === 0 || classItem.price != null)) && (
            <span className={`inline-block mb-2 px-2 py-1 rounded-full text-xs font-semibold ${
              (classItem.price === 0 || classItem.price == null) ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-primary/10 text-primary'
            }`}>
              {(classItem.price === 0 || classItem.price == null) ? 'Free' : '$'}
            </span>
          )}
          {progress.total > 0 && (
            <div className="flex items-center gap-2 mb-3 py-2 px-3 rounded-lg bg-primary/5 border border-primary/10">
              <ListChecks className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-foreground">
                {progress.completed} of {progress.total} lessons
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden min-w-[60px]">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2 mt-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{dateStr}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{timeStr}{endTimeStr ? ` - ${endTimeStr}` : ''}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{classItem.venue?.name || '—'}</span>
            </div>
            {classItem.schedule && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GraduationCap className="w-4 h-4" />
                <span>{classItem.schedule}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <p className="text-muted-foreground mb-4">Please login to view your classes</p>
          <motion.button
            onClick={() => navigate('/login')}
            className="px-6 py-2 rounded-xl bg-gradient-primary text-primary-foreground font-medium"
            whileTap={{ scale: 0.95 }}
          >
            Login
          </motion.button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button
            onClick={() => navigate('/home')}
            className="p-2 -ml-2"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>
          <h1 className="text-xl font-bold text-foreground">My Classes</h1>
        </div>
      </div>

      <div className="px-4 pb-4">
        <Tabs defaultValue="upcoming" className="mt-2">
          <TabsList className="grid w-full grid-cols-2 bg-muted rounded-xl p-1 h-12">
            <TabsTrigger value="upcoming" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Past
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4 space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : upcomingClasses.length > 0 ? (
              upcomingClasses.map((enrollment) => (
                <ClassItem key={enrollment.id} enrollment={enrollment} />
              ))
            ) : (
              <div className="text-center py-12">
                <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No upcoming classes</p>
                <motion.button
                  onClick={() => navigate('/classes')}
                  className="mt-4 px-6 py-2 rounded-xl bg-gradient-primary text-primary-foreground font-medium"
                  whileTap={{ scale: 0.95 }}
                >
                  Browse Classes
                </motion.button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4 space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : pastClasses.length > 0 ? (
              pastClasses.map((enrollment) => (
                <ClassItem key={enrollment.id} enrollment={enrollment} />
              ))
            ) : (
              <div className="text-center py-12">
                <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No past classes</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </AppLayout>
  );
};

export default MyClassesPage;

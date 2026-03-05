import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Users, CheckCircle2, Edit, Calendar, MapPin, GraduationCap } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { useClass } from '@/hooks/useClasses';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

/** Mock: per-module completion count. In production would come from API. */
function getModuleCompletionCounts(
  syllabus: Array<{ id?: string; lessons?: unknown[] }> | undefined,
  totalEnrolled: number
): Record<string, number> {
  if (!syllabus?.length || totalEnrolled === 0) return {};
  const out: Record<string, number> = {};
  syllabus.forEach((mod, i) => {
    const modId = mod.id || `mod-${i}`;
    const ratio = 0.9 - i * 0.2;
    out[modId] = Math.max(0, Math.floor(totalEnrolled * ratio));
  });
  return out;
}

const ManageClassPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { data: classItem, isLoading, error } = useClass(id || '');

  const isCreator = useMemo(() => {
    if (!user?.id || !classItem) return false;
    const cid = (classItem as any).creatorId || (classItem as any).creator?.id;
    return cid === user.id;
  }, [user?.id, classItem]);

  const totalEnrolled = classItem?._count?.enrollments ?? 0;
  const syllabus = (classItem as any)?.syllabus || [];
  const moduleCompletion = useMemo(
    () => getModuleCompletionCounts(syllabus, totalEnrolled),
    [syllabus, totalEnrolled]
  );

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <p className="text-muted-foreground mb-4">Please log in to manage your class.</p>
          <Button onClick={() => navigate('/login')}>Log in</Button>
        </div>
      </AppLayout>
    );
  }

  if (isLoading || !id) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !classItem) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <p className="text-muted-foreground mb-4">Class not found.</p>
          <Button variant="outline" onClick={() => navigate('/classes')}>Back to Classes</Button>
        </div>
      </AppLayout>
    );
  }

  if (!isCreator) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <p className="text-muted-foreground mb-4">You can only manage classes you created.</p>
          <Button variant="outline" onClick={() => navigate(`/class/${id}`)}>View class</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col pb-20">
        <div className="sticky top-0 z-10 glass safe-top border-b border-border/50">
          <div className="flex items-center gap-3 px-4 py-3">
            <motion.button
              onClick={() => navigate(`/class/${id}`)}
              className="p-2 -ml-2 rounded-lg hover:bg-muted/80"
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </motion.button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-foreground truncate">Manage class</h1>
              <p className="text-xs text-muted-foreground truncate">{classItem.title}</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 space-y-6">
          <div className="card-elevated p-4 rounded-2xl space-y-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              Class details
            </h2>
            <p className="text-sm text-muted-foreground">{classItem.description}</p>
            <div className="flex flex-wrap gap-3 text-sm">
              {classItem.startTime && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(classItem.startTime), 'MMM d, yyyy · h:mm a')}
                </span>
              )}
              {classItem.venue?.name && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {classItem.venue.name}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-4 h-4" />
                {totalEnrolled} enrolled
              </span>
            </div>
            <Button
              className="w-full sm:w-auto"
              onClick={() => navigate(`/create-class?id=${id}`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit class
            </Button>
          </div>

          <div className="card-elevated p-4 rounded-2xl">
            <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              Module completion
            </h2>
            {syllabus.length === 0 ? (
              <p className="text-sm text-muted-foreground">No modules yet. Edit the class to add a syllabus.</p>
            ) : (
              <ul className="space-y-3">
                {syllabus.map((mod: any, idx: number) => {
                  const modId = mod.id || `mod-${idx}`;
                  const completed = moduleCompletion[modId] ?? 0;
                  const lessonCount = Array.isArray(mod.lessons) ? mod.lessons.length : 0;
                  return (
                    <motion.li
                      key={modId}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{mod.title || `Module ${idx + 1}`}</p>
                        {lessonCount > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">{lessonCount} lesson{lessonCount !== 1 ? 's' : ''}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-semibold text-foreground">{completed}</span>
                        <span className="text-xs text-muted-foreground">completed</span>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </AppLayout>
  );
};

export default ManageClassPage;

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, MapPin, Clock, DollarSign, Users, Calendar, Phone, Globe, CreditCard, AlertCircle, Info, Star, CheckCircle2, X, Monitor, CheckCircle, Sparkles, MessageCircle, ChevronRight, FileText, ListChecks, PlayCircle, TrendingUp, ShoppingBag, Download, Gift, Package, Send, Plus, Ticket, QrCode, Check } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/ui/UserAvatar';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useClass, useEnrollInClass, useCancelEnrollment } from '@/hooks/useClasses';
import { useCreateTicketForClass, useMyTickets } from '@/hooks/useTickets';
import { usePaymentBreakdown } from '@/hooks/usePaymentBreakdown';
import { useWallet } from '@/contexts/WalletContext';
import { useMentor } from '@/hooks/useMentors';
import { useAuth } from '@/contexts/AuthContext';
import { getClassLessonProgress, setLessonCompleted as persistLessonCompleted } from '@/lib/classLessonProgress';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ClassDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const isMentorClass = id?.startsWith('mentor-');
  const mentorId = isMentorClass ? id.replace('mentor-', '') : null;
  const { data: mentor, isLoading: mentorLoading } = useMentor(mentorId || '');
  const { data: classItem, isLoading: classLoading } = useClass(isMentorClass ? '' : id!);
  
  const isLoading = isMentorClass ? mentorLoading : classLoading;
  const enrollInClass = useEnrollInClass();
  const cancelEnrollment = useCancelEnrollment();
  const createTicket = useCreateTicketForClass();
  const { data: myTickets } = useMyTickets();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [showQADialog, setShowQADialog] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [selectedLessonForQA, setSelectedLessonForQA] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<any>(null);
  const [justEnrolled, setJustEnrolled] = useState(false);
  const [isFreeEnrollment, setIsFreeEnrollment] = useState(false);
  const [progressDirty, setProgressDirty] = useState(0);

  // Lesson progress (for enrolled users) – persisted in localStorage, same on web & mobile
  const lessonProgress = classItem && user ? getClassLessonProgress(classItem, user.id) : { total: 0, completed: 0, completedIds: [], percent: 0 };

  // Q&A per lesson (placeholder until API); shape: { id, lessonId, studentName, question?, answer?, createdAt }
  const mockQAs: Array<{ id: string; lessonId: string; studentName: string; question?: string; answer?: string; createdAt: Date }> = [];
  
  // Find ticket for this class if user has enrolled
  const userTicket = myTickets?.find(t => t.class?.id === id && t.status !== 'CANCELLED');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [saveCardToWallet, setSaveCardToWallet] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'new' | string>('new');
  const [savedCardCVC, setSavedCardCVC] = useState('');
  const { cards: walletCards, addCard } = useWallet();
  const [paymentInvoice, setPaymentInvoice] = useState<{
    invoiceNumber: string;
    amount: number;
    date: string;
    paymentMethod: string;
    cardLast4?: string;
  } | null>(null);

  const grossAmount = classItem?.price ?? 0;
  const paymentBreakdownOpts =
    showPaymentDialog && !isMentorClass && !!id && grossAmount > 0
      ? { classId: id, grossAmount }
      : null;
  const { data: paymentBreakdown } = usePaymentBreakdown(paymentBreakdownOpts);
  const breakdown = paymentBreakdown ?? (grossAmount > 0 ? {
    venueRent: 0,
    venueRentLabel: '$0 per 30 min',
    ulikmeCommissionPercent: 4,
    ulikmeCommission: Math.round(grossAmount * 0.04 * 100) / 100,
    stripeFee: Math.round(grossAmount * 0.03 * 100) / 100,
    grossAmount,
    payoutAmount: grossAmount - Math.round(grossAmount * 0.04 * 100) / 100 - Math.round(grossAmount * 0.03 * 100) / 100,
  } : null);

  // When payment dialog opens, default to first saved card if any
  useEffect(() => {
    if (showPaymentDialog) {
      setSelectedPaymentMethod(walletCards.length > 0 ? walletCards[0].id : 'new');
      setSavedCardCVC('');
    }
  }, [showPaymentDialog]);

  // Detect card type from card number
  const getCardType = (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';
    return '';
  };
  
  const cardType = getCardType(cardNumber);

  // Check if user is enrolled - check both enrollments array and ticket
  const isEnrolledFromEnrollments = user && classItem?.enrollments?.some((e) => 
    (typeof e.user === 'object' ? e.user?.id : e.userId) === user.id
  ) || false;
  const hasTicket = !!userTicket && userTicket.status !== 'CANCELLED';
  const hasCreatedTicket = !!createdTicket && createdTicket.qrCode;
  const isEnrolled = isEnrolledFromEnrollments || hasTicket || justEnrolled || hasCreatedTicket;
  
  const enrollment = classItem?.enrollments?.find((e) => 
    user && (typeof e.user === 'object' ? e.user?.id : e.userId) === user.id
  );
  const isPaid = isEnrolled && enrollment && (enrollment.status === 'paid' || enrollment.status === 'enrolled') && classItem?.price && classItem.price > 0;
  
  // Check if enrollment is within 24 hours (for refund eligibility)
  const enrollmentDate = enrollment?.createdAt ? new Date(enrollment.createdAt) : null;
  const now = new Date();
  const hoursSinceEnrollment = enrollmentDate 
    ? (now.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60)
    : null;
  const isWithin24Hours = hoursSinceEnrollment !== null && hoursSinceEnrollment < 24;
  const canCancelWithRefund = isPaid && isWithin24Hours;
  
  // Check if class is online
  const isOnline = !classItem?.latitude || !classItem?.longitude;

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to enroll');
      navigate('/login');
      return;
    }

    // If class has a price, show payment dialog
    if (classItem?.price && classItem.price > 0) {
      setShowPaymentDialog(true);
      // Default to first saved card if any
      setSelectedPaymentMethod(walletCards.length > 0 ? walletCards[0].id : 'new');
      setSavedCardCVC('');
      return;
    }

    // Free class - enroll directly
    try {
      const enrollment = await enrollInClass.mutateAsync(id!);
      console.log('Free enrollment response:', enrollment);
      
      // Mark as just enrolled to update UI immediately
      setJustEnrolled(true);
      setIsFreeEnrollment(true);
      
      // Invalidate queries to refresh enrollment status
      queryClient.invalidateQueries({ queryKey: ['class', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      
      // Show QR code ticket if available (from enrollment response)
      // Check multiple possible response structures
      const ticket = enrollment?.ticket || enrollment?.data?.ticket || (enrollment as any)?.ticket;
      console.log('Ticket from enrollment:', ticket);
      if (ticket && ticket.qrCode) {
        setCreatedTicket(ticket);
        console.log('Created ticket set:', ticket);
      }
      
      // Show success modal for free classes too
      setShowSuccessDialog(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to enroll');
    }
  };

  const handlePayment = async () => {
    const useSavedCard = selectedPaymentMethod !== 'new' && walletCards.some((c) => c.id === selectedPaymentMethod);
    if (useSavedCard) {
      if (!savedCardCVC.trim() || savedCardCVC.length < 3) {
        toast.error('Enter CVC for your card');
        return;
      }
    } else {
      if (!cardNumber || !cardExpiry || !cardCVC) {
        toast.error('Please fill in all payment details');
        return;
      }
    }

    try {
      const enrollment = await enrollInClass.mutateAsync(id!);
      
      // Mark as just enrolled to update UI immediately
      setJustEnrolled(true);
      setIsFreeEnrollment(false); // Paid enrollment
      
      // Invalidate queries to refresh enrollment status
      queryClient.invalidateQueries({ queryKey: ['class', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      
      // Generate invoice info (card only)
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const invoiceData = {
        invoiceNumber,
        amount: classItem?.price || 0,
        date: new Date().toISOString(),
        paymentMethod: 'Card',
        cardLast4: cardNumber.slice(-4).replace(/\s/g, ''),
      };
      const last4ForInvoice = useSavedCard
        ? (walletCards.find((c) => c.id === selectedPaymentMethod)?.last4 ?? '')
        : cardNumber.replace(/\s/g, '').slice(-4);
      setPaymentInvoice({
        ...invoiceData,
        cardLast4: last4ForInvoice,
      });

      if (!useSavedCard && saveCardToWallet) {
        const last4 = cardNumber.replace(/\s/g, '').slice(-4);
        const [expiryMonth, expiryYear] = cardExpiry.split('/');
        addCard({
          last4,
          brand: cardType || 'card',
          expiryMonth: expiryMonth || '',
          expiryYear: expiryYear || '',
        });
      }

      setShowPaymentDialog(false);
      setSelectedPaymentMethod('new');
      setSavedCardCVC('');
      setCardNumber('');
      setCardExpiry('');
      setCardCVC('');
      
      // Show QR code ticket if available (from enrollment response)
      if (enrollment?.ticket) {
        setCreatedTicket(enrollment.ticket);
        setShowSuccessDialog(true);
      } else {
        // Fallback: Try to create ticket separately if not in enrollment response
        try {
          const ticket = await createTicket.mutateAsync(id!);
          setCreatedTicket(ticket);
          setShowSuccessDialog(true);
        } catch (ticketError: any) {
          // Ticket creation failed, but enrollment succeeded
          console.warn('Ticket creation failed:', ticketError);
          setShowSuccessDialog(true);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
    }
  };


  const handleCancel = async () => {
    try {
      await cancelEnrollment.mutateAsync(id!);
      setJustEnrolled(false); // Reset justEnrolled state
      toast.success('Enrollment cancelled');
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel enrollment');
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  // Handle mentor classes - redirect to classes page with mentorship filter
  if (isMentorClass) {
    if (!mentor) {
      return (
        <AppLayout>
          <div className="text-center py-12 px-4">
            <p className="text-muted-foreground mb-4">Mentor not found</p>
            <Button onClick={() => navigate('/classes')} className="mt-4">
              Go to Classes
            </Button>
          </div>
        </AppLayout>
      );
    }
    return (
      <AppLayout>
        <div className="text-center py-12 px-4">
          <p className="text-muted-foreground mb-4">Mentor profile: {mentor.displayName || mentor.name}</p>
          <p className="text-sm text-muted-foreground mb-6">
            View available mentorship classes from this mentor in the Classes page.
          </p>
          <Button onClick={() => navigate('/classes?category=mentorship')} className="mt-4">
            View Mentorship Classes
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (!classItem) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Class not found</p>
          <Button onClick={() => navigate('/home')} className="mt-4">
            Go Back
          </Button>
        </div>
      </AppLayout>
    );
  }

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
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </motion.button>
            <h1 className="font-bold text-foreground">Class Details</h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Hero Image */}
          <div className="relative h-80 overflow-hidden">
            {classItem.image ? (
              <img
                src={classItem.image}
                alt={classItem.title || 'Class'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <BookOpen className="w-24 h-24 text-primary/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm text-primary text-sm font-medium">
                  {classItem.skill || 'Class'}
                </span>
                {classItem.category && (
                  <span className="px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm text-muted-foreground text-sm">
                    {classItem.category}
                  </span>
                )}
                {isOnline ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/90 backdrop-blur-sm text-secondary-foreground text-sm font-medium">
                    <Monitor className="w-3 h-3" />
                    Online
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-friendme/90 backdrop-blur-sm text-friendme-foreground text-sm font-medium">
                    <Building2 className="w-3 h-3" />
                    Onsite
                  </span>
                )}
                {isPaid && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-green-500/90 backdrop-blur-sm text-white text-sm font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Paid
                    </span>
                    {canCancelWithRefund && (
                      <span className="px-3 py-1 rounded-full bg-blue-500/90 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Refundable (24h)
                      </span>
                    )}
                    <motion.button
                      onClick={() => {
                        // Load invoice from enrollment or use stored invoice
                        if (enrollment && classItem?.price) {
                          setPaymentInvoice({
                            invoiceNumber: `INV-${enrollment.id}-${Date.now()}`,
                            amount: classItem.price,
                            date: enrollment.createdAt || new Date().toISOString(),
                            paymentMethod: 'Card',
                            cardLast4: '****',
                          });
                          setShowInvoiceDialog(true);
                        }
                      }}
                      className="px-3 py-1 rounded-full bg-primary/10 backdrop-blur-sm text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                      whileTap={{ scale: 0.95 }}
                    >
                      View Invoice
                    </motion.button>
                  </div>
                )}
              </div>
              <h2 className="text-3xl font-bold text-card mb-2 drop-shadow-lg">
                {classItem.title || `${classItem.category ? classItem.category.charAt(0).toUpperCase() + classItem.category.slice(1) : 'Class'} Course`}
              </h2>
              <div className="flex items-center gap-2">
                {(classItem.price === undefined || classItem.price === null || classItem.price === 0) ? (
                  <span className="px-2 py-1 rounded-full bg-friendme/20 text-friendme text-sm font-medium">
                    Free
                  </span>
                ) : (
                  <span className="text-2xl font-bold text-card drop-shadow-lg">
                    ${classItem.price}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 py-6 space-y-6 -mt-4">
            {/* Popular Badge */}
            {(classItem as any).isPopular && (classItem as any).recentEnrollments && (classItem as any).recentEnrollments > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10 border border-orange-500/20 mb-4"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">This course is popular.</p>
                  <p className="text-xs text-muted-foreground">{(classItem as any).recentEnrollments} people enrolled last week.</p>
                </div>
              </motion.div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="card-elevated p-4 rounded-2xl text-center">
                <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  {classItem._count?.enrollments || 0}
                </p>
                <p className="text-xs text-muted-foreground">Enrolled</p>
              </div>
              <div className="card-elevated p-4 rounded-2xl text-center">
                <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  {classItem.maxStudents ? classItem.maxStudents - (classItem._count?.enrollments || 0) : '∞'}
                </p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
              <div className="card-elevated p-4 rounded-2xl text-center">
                <Star className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">4.8</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
            </div>

            {/* Your progress (lessons) – shown when enrolled and class has lessons */}
            {isEnrolled && lessonProgress.total > 0 && (
              <div className="card-elevated p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-primary" />
                    Your progress
                  </h3>
                  <span className="text-sm font-medium text-primary">
                    {lessonProgress.completed} of {lessonProgress.total} lessons
                  </span>
                </div>
                <Progress value={lessonProgress.percent} className="h-2" />
              </div>
            )}

            {/* Class Description */}
            {classItem.description && (
              <div className="card-elevated p-4 rounded-2xl">
                <h3 className="font-semibold text-foreground mb-2">About This Class</h3>
                <p className="text-foreground leading-relaxed">{classItem.description}</p>
              </div>
            )}

            {/* Course Syllabus - Always show if available */}
            {classItem.syllabus && Array.isArray(classItem.syllabus) && classItem.syllabus.length > 0 ? (
              <div className="card-elevated p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Course Syllabus</h3>
                </div>
                <div className="space-y-4">
                  {classItem.syllabus.map((module: any, index: number) => (
                    <motion.div
                      key={module.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-l-2 border-primary/30 pl-4 pb-4 last:pb-0"
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-sm font-bold text-primary">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">{module.title || `Module ${index + 1}`}</h4>
                          {module.description && (
                            <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                          )}
                          {module.lessons && Array.isArray(module.lessons) && module.lessons.length > 0 && (
                            <div className="space-y-2 mt-3">
                              {module.lessons.map((lesson: any, lessonIndex: number) => {
                                const lessonQAs = mockQAs.filter(qa => qa.lessonId === lesson.id);
                                const isCompleted = lesson.completed || (lesson.id && lessonProgress.completedIds.includes(lesson.id));
                                return (
                                  <div key={lesson.id || lessonIndex} className="space-y-2">
                                    <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <PlayCircle className="w-3 h-3 text-primary" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">
                                          {lesson.title || `Lesson ${lessonIndex + 1}`}
                                        </p>
                                        {lesson.duration && (
                                          <p className="text-xs text-muted-foreground mt-0.5">
                                            {lesson.duration}
                                          </p>
                                        )}
                                        {lesson.description && (
                                          <p className="text-xs text-muted-foreground mt-1">
                                            {lesson.description}
                                          </p>
                                        )}
                                      </div>
                                      {isEnrolled && lesson.id && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            persistLessonCompleted(id!, lesson.id, user?.id, !isCompleted);
                                            setProgressDirty((n) => n + 1);
                                          }}
                                          className="flex-shrink-0 p-1 rounded-full hover:bg-muted transition-colors"
                                          title={isCompleted ? 'Mark not complete' : 'Mark complete'}
                                        >
                                          <CheckCircle className={`w-5 h-5 ${isCompleted ? 'text-green-500' : 'text-muted-foreground/50'}`} />
                                        </button>
                                      )}
                                      {!isEnrolled && isCompleted && (
                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                      )}
                                    </div>
                                    
                                    {/* Q&A Section for this lesson */}
                                    {isEnrolled && (
                                      <div className="ml-7 p-3 rounded-lg bg-muted/30 border border-border">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2">
                                            <MessageCircle className="w-3 h-3 text-primary" />
                                            <span className="text-xs font-semibold">Q&A ({lessonQAs.length})</span>
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              setSelectedLessonForQA(lesson.id);
                                              setShowQADialog(true);
                                            }}
                                            className="h-7 text-xs"
                                          >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Ask
                                          </Button>
                                        </div>
                                        
                                        {lessonQAs.length > 0 ? (
                                          <div className="space-y-2 mt-2">
                                            {lessonQAs.map((qa) => (
                                              <div key={qa.id} className={`p-2 rounded-lg text-xs ${
                                                qa.answer 
                                                  ? 'bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-800' 
                                                  : 'bg-yellow-50/50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800'
                                              }`}>
                                                <div className="flex items-start gap-2 mb-1">
                                                  <Users className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                  <div className="flex-1">
                                                    <span className="font-semibold text-foreground">{qa.studentName}</span>
                                                    <span className="text-muted-foreground ml-1">• {qa.createdAt.toLocaleDateString()}</span>
                                                  </div>
                                                </div>
                                                <p className="text-xs text-foreground mb-1 ml-5">Q: {qa.question}</p>
                                                {qa.answer && (
                                                  <div className="ml-5 mt-1 p-2 rounded bg-background/50 border-l-2 border-primary/30">
                                                    <p className="text-xs text-foreground">
                                                      <span className="font-semibold text-primary">A: </span>
                                                      {qa.answer}
                                                    </p>
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-xs text-muted-foreground text-center py-1">
                                            No questions yet
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card-elevated p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">Course Syllabus</h3>
                </div>
                <p className="text-sm text-muted-foreground">Syllabus will be available soon.</p>
              </div>
            )}

            {/* Monetization - Digital Products & Course Materials */}
            {(classItem as any).digitalProducts || (classItem as any).courseMaterials || (classItem as any).bonusContent ? (
              <div className="card-elevated p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Course Materials & Digital Products</h3>
                </div>
                <div className="space-y-3">
                  {/* Digital Products */}
                  {(classItem as any).digitalProducts && Array.isArray((classItem as any).digitalProducts) && (classItem as any).digitalProducts.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Digital Products
                      </h4>
                      <div className="space-y-2">
                        {(classItem as any).digitalProducts.map((product: any, index: number) => (
                          <motion.div
                            key={product.id || index}
                            className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Package className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">{product.name}</p>
                                {product.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{product.description}</p>
                                )}
                              </div>
                            </div>
                            {product.price ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-primary">${product.price}</span>
                                <Button size="sm" className="h-8">
                                  Buy
                                </Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" className="h-8">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Course Materials */}
                  {(classItem as any).courseMaterials && Array.isArray((classItem as any).courseMaterials) && (classItem as any).courseMaterials.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Course Materials
                      </h4>
                      <div className="space-y-2">
                        {(classItem as any).courseMaterials.map((material: any, index: number) => (
                          <motion.div
                            key={material.id || index}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-secondary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">{material.name}</p>
                                {material.type && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{material.type.toUpperCase()}</p>
                                )}
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="h-8">
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bonus Content */}
                  {(classItem as any).bonusContent && Array.isArray((classItem as any).bonusContent) && (classItem as any).bonusContent.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Gift className="w-4 h-4 text-orange-500" />
                        Bonus Content
                      </h4>
                      <div className="space-y-2">
                        {(classItem as any).bonusContent.map((bonus: any, index: number) => (
                          <motion.div
                            key={bonus.id || index}
                            className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-orange-500/5 to-yellow-500/5 border border-orange-500/10"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                <Gift className="w-5 h-5 text-orange-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">{bonus.name}</p>
                                {bonus.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{bonus.description}</p>
                                )}
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="h-8 border-orange-500/20">
                              <Download className="w-4 h-4 mr-1" />
                              Access
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Venue Info / Online Info */}
            {isOnline ? (
              <div className="card-elevated p-4 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Online Class</h3>
                    <p className="text-foreground">This class will be conducted online via video conference</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Meeting link will be shared after enrollment
                    </p>
                  </div>
                </div>
              </div>
            ) : classItem.venue ? (
              <div className="card-elevated p-4 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      {classItem.venue.name || 'Location TBD'}
                    </h3>
                    {classItem.venue.address && (
                      <p className="text-sm text-muted-foreground">{classItem.venue.address}</p>
                    )}
                    {classItem.venue.city && (
                      <p className="text-sm text-muted-foreground">{classItem.venue.city}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Details – date, time, schedule, price */}
            <div className="card-elevated p-4 rounded-2xl space-y-3">
              <h3 className="font-semibold text-foreground mb-3">Details</h3>
              
              {/* QR Code Ticket - Show if user has enrolled and has ticket */}
              {(isEnrolled && (userTicket || createdTicket) && (userTicket?.status !== 'USED' && createdTicket?.status !== 'USED')) && (
                <motion.button
                  onClick={() => {
                    const ticketToShow = userTicket || createdTicket;
                    if (ticketToShow) {
                      setCreatedTicket(ticketToShow);
                      setShowTicketDialog(true);
                    }
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20 text-left mb-3"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Ticket className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Your Ticket</p>
                    <p className="font-medium text-foreground">View QR Code</p>
                    <p className="text-xs text-primary mt-1">Tap to show your entry QR code</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-primary" />
                </motion.button>
              )}
              
              {classItem.startTime && (
                <>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium text-foreground">
                        {classItem.startTime ? format(new Date(classItem.startTime), 'EEEE, MMMM d, yyyy') : 'TBD'}
                      </p>
                    </div>
                  </div>

                  {classItem.startTime && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p className="font-medium text-foreground">
                          {format(new Date(classItem.startTime), 'h:mm a')}
                          {classItem.endTime && ` - ${format(new Date(classItem.endTime), 'h:mm a')}`}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {classItem.schedule && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Schedule</p>
                    <p className="font-medium text-foreground">{classItem.schedule}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium text-foreground">
                    {(classItem.price === undefined || classItem.price === null || classItem.price === 0) ? 'Free' : `$${classItem.price}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Enrolled</p>
                  <p className="font-medium text-foreground">
                    {classItem._count?.enrollments || 0}
                    {classItem.maxStudents && ` / ${classItem.maxStudents}`} students
                  </p>
                </div>
              </div>

              {((classItem as any).instructor || (classItem as any).creator) && (
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Host</p>
                    <p className="font-medium text-foreground">
                      {(classItem as any).instructor?.displayName || (classItem as any).creator?.displayName || `${(classItem as any).instructor?.firstName || (classItem as any).creator?.firstName || ''} ${(classItem as any).instructor?.lastName || (classItem as any).creator?.lastName || ''}`.trim() || 'Host'}
                    </p>
                    {((classItem as any).instructor?.certifiedAreas || (classItem as any).creator?.certifiedAreas)?.length > 0 && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Certified: {((classItem as any).instructor?.certifiedAreas || (classItem as any).creator?.certifiedAreas || []).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Enrolled Students - Visible to everyone */}
            {classItem.enrollments && classItem.enrollments.length > 0 && (
              <div className="card-elevated p-4 rounded-2xl">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Class Participants ({classItem.enrollments.length})
                </h3>
                <div className="space-y-2">
                  {classItem.enrollments.map((enrollment) => {
                    const userName = enrollment.user?.displayName || `${enrollment.user?.firstName || ''} ${enrollment.user?.lastName || ''}`.trim() || 'Unknown User';
                    const isCurrentUser = enrollment.user?.id === user?.id;
                    
                    return (
                      <motion.button
                        key={enrollment.id}
                        onClick={() => {
                          if (!isCurrentUser && enrollment.user?.id) {
                            navigate(`/user/${enrollment.user.id}`);
                          }
                        }}
                        disabled={isCurrentUser}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                          isCurrentUser 
                            ? 'bg-muted cursor-default' 
                            : 'bg-muted hover:bg-muted/80 active:bg-muted/60'
                        }`}
                        whileTap={!isCurrentUser ? { scale: 0.98 } : {}}
                      >
                        <UserAvatar
                          src={enrollment.user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                          alt={userName}
                          size="sm"
                        />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-foreground">
                            {userName}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-primary font-medium">(You)</span>
                            )}
                          </p>
                          {enrollment.status && (
                            <p className="text-xs text-muted-foreground capitalize">
                              {enrollment.status}
                            </p>
                          )}
                        </div>
                        {!isCurrentUser && (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                {classItem.enrollments.length > 10 && (
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Showing all {classItem.enrollments.length} participants
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 glass safe-bottom p-4 border-t border-border space-y-3">
          {isEnrolled ? (
            <>
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl flex items-center justify-center gap-2"
                onClick={() => {
                  // Navigate to chat page and try to find/create class chat
                  navigate(`/chat?classId=${id}`);
                }}
              >
                <MessageCircle className="w-5 h-5" />
                Open Class Chat
              </Button>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl"
                  disabled
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  {isPaid ? 'Enrolled (Paid)' : 'Enrolled'}
                </Button>
                {isPaid && (
                  <p className="text-xs text-center text-muted-foreground px-2">
                    You can cancel your enrollment within 24 hours for a full refund.
                  </p>
                )}
                {canCancelWithRefund && (
                  <div className="w-full p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-blue-600">24-Hour Refund Policy</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        You can cancel and get a full refund within 24 hours of enrollment.
                      </p>
                      {hoursSinceEnrollment !== null && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.floor(24 - hoursSinceEnrollment)} hours remaining
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl text-destructive border-destructive"
                  onClick={handleCancel}
                  disabled={cancelEnrollment.isPending || (isPaid && !canCancelWithRefund)}
                >
                  {cancelEnrollment.isPending 
                    ? 'Cancelling...' 
                    : isPaid && !canCancelWithRefund
                    ? 'Cancel (No Refund)'
                    : 'Cancel Enrollment'}
                </Button>
                {isPaid && !canCancelWithRefund && (
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    24-hour refund window has passed
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <Button
                onClick={handleEnroll}
                className="w-full h-12 rounded-xl bg-gradient-primary"
                disabled={enrollInClass.isPending || (classItem.maxStudents && (classItem._count?.enrollments || 0) >= classItem.maxStudents)}
              >
                {enrollInClass.isPending
                  ? 'Joining...'
                  : classItem.maxStudents && (classItem._count?.enrollments || 0) >= classItem.maxStudents
                  ? 'Class Full'
                  : classItem.price && classItem.price > 0
                  ? `Join the Class - $${classItem.price}`
                  : 'Join the Class (Free)'}
              </Button>
              {isEnrolled && (
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl flex items-center justify-center gap-2"
                  onClick={() => {
                    navigate(`/chat?classId=${id}`);
                  }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Open Class Chat
                </Button>
              )}
            </>
          )}
        </div>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-md mx-4 rounded-2xl">
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
              <DialogDescription>
                Pay ${classItem?.price} to enroll in this class
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Saved cards from wallet */}
              {walletCards.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Payment method</p>
                  <div className="space-y-2">
                    {walletCards.map((card) => (
                      <label
                        key={card.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                          selectedPaymentMethod === card.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={selectedPaymentMethod === card.id}
                          onChange={() => setSelectedPaymentMethod(card.id)}
                          className="sr-only"
                        />
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground capitalize">{card.brand}</p>
                          <p className="text-sm text-muted-foreground font-mono">•••• {card.last4}</p>
                        </div>
                        {selectedPaymentMethod === card.id && <Check className="w-5 h-5 text-primary shrink-0" />}
                      </label>
                    ))}
                    <label
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                        selectedPaymentMethod === 'new' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={selectedPaymentMethod === 'new'}
                        onChange={() => setSelectedPaymentMethod('new')}
                        className="sr-only"
                      />
                      <Plus className="w-5 h-5 text-muted-foreground shrink-0" />
                      <span className="font-medium text-foreground">New card</span>
                      {selectedPaymentMethod === 'new' && <Check className="w-5 h-5 text-primary shrink-0 ml-auto" />}
                    </label>
                  </div>
                </div>
              )}

              {/* CVC when saved card selected */}
              {selectedPaymentMethod !== 'new' && walletCards.some((c) => c.id === selectedPaymentMethod) && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={savedCardCVC}
                    onChange={(e) => setSavedCardCVC(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}

              {/* New card form */}
              {(selectedPaymentMethod === 'new' || walletCards.length === 0) && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                      maxLength={19}
                      className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-xs text-muted-foreground">Visa</span>
                      <span className="text-xs text-muted-foreground">Mastercard</span>
                      <span className="text-xs text-muted-foreground">Amex</span>
                      <span className="text-xs text-muted-foreground">Discover</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Expiry</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 2) setCardExpiry(value);
                          else setCardExpiry(value.slice(0, 2) + '/' + value.slice(2, 4));
                        }}
                        maxLength={5}
                        className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">CVC</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cardCVC}
                        onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        maxLength={3}
                        className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Save card to wallet - only when using new card */}
              {(selectedPaymentMethod === 'new' || walletCards.length === 0) && (
                <label className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveCardToWallet}
                    onChange={(e) => setSaveCardToWallet(e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-foreground">
                    Save this card to my wallet for future payments
                  </span>
                </label>
              )}

              {/* Revenue split breakdown */}
              {breakdown && (
                <div className="space-y-2 rounded-xl bg-muted/50 p-3 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Venue rent (30 min)</span>
                    <span>{breakdown.venueRentLabel}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Ulikme commission ({breakdown.ulikmeCommissionPercent}%)</span>
                    <span>−${breakdown.ulikmeCommission.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">${classItem?.price}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPaymentDialog(false);
                  setCardNumber('');
                  setCardExpiry('');
                  setCardCVC('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={
                  enrollInClass.isPending ||
                  (selectedPaymentMethod !== 'new' && walletCards.some((c) => c.id === selectedPaymentMethod)
                    ? savedCardCVC.length < 3
                    : !cardNumber.trim() || !cardExpiry || !cardCVC)
                }
                className="flex-1 bg-gradient-primary"
              >
                {enrollInClass.isPending ? 'Processing...' : `Pay $${classItem?.price}`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Success Modal - Slides in from right */}
        <AnimatePresence>
          {showSuccessDialog && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setShowSuccessDialog(false);
                  setIsFreeEnrollment(false);
                  // Invalidate class query to refresh enrollment status
                  if (id) {
                    queryClient.invalidateQueries({ queryKey: ['class', id] });
                    queryClient.invalidateQueries({ queryKey: ['tickets'] });
                  }
                }}
                className="fixed inset-0 bg-black/50 z-50"
              />
              
              {/* Success Modal */}
              <motion.div
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background z-50 shadow-2xl"
                style={{ maxHeight: '100vh' }}
              >
                <div className="h-full flex flex-col">
                  {/* Close button */}
                  <div className="flex justify-end p-4">
                    <motion.button
                      onClick={() => {
                        setShowSuccessDialog(false);
                        setIsFreeEnrollment(false);
                        // Invalidate class query to refresh enrollment status
                        if (id) {
                          queryClient.invalidateQueries({ queryKey: ['class', id] });
                          queryClient.invalidateQueries({ queryKey: ['tickets'] });
                        }
                      }}
                      className="p-2 rounded-full hover:bg-muted transition-colors"
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-5 h-5 text-foreground" />
                    </motion.button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    {/* Success Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                      className="flex justify-center mb-6"
                    >
                      <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                      </div>
                    </motion.div>

                    {/* Success Message */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-center mb-6"
                    >
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        {isFreeEnrollment ? t('enrollmentSuccessful') || 'Enrollment Successful!' : t('paymentSuccessful')}
                      </h2>
                    </motion.div>

                    {/* Class Schedule Info */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="w-full p-5 rounded-2xl bg-green-500/10 border-2 border-green-500/20 mb-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{classItem?.title}</p>
                          <p className="text-xs text-muted-foreground">{t('classInfo')}</p>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-green-500 text-white text-xs font-medium">
                          {isFreeEnrollment ? 'Enrolled' : t('paymentCompleted')}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {classItem?.startTime && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span className="text-muted-foreground">{t('startDate')}:</span>
                            <span className="font-medium text-foreground">
                              {format(new Date(classItem.startTime), 'd MMMM yyyy, EEEE')}
                            </span>
                          </div>
                        )}
                        
                        {classItem?.endTime && classItem?.startTime && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span className="text-muted-foreground">{t('endDate')}:</span>
                            <span className="font-medium text-foreground">
                              {format(new Date(classItem.endTime), 'd MMMM yyyy')}
                            </span>
                          </div>
                        )}
                        
                        {classItem?.schedule && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-green-600" />
                            <span className="text-muted-foreground">{t('schedule')}:</span>
                            <span className="font-medium text-foreground">{classItem.schedule}</span>
                          </div>
                        )}
                        
                        {classItem?.startTime && classItem?.endTime && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-green-600" />
                            <span className="text-muted-foreground">{t('totalDuration')}:</span>
                            <span className="font-medium text-foreground">
                              {Math.ceil((new Date(classItem.endTime).getTime() - new Date(classItem.startTime).getTime()) / (1000 * 60 * 60 * 24 * 7))} {t('weeks')}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* QR Code Ticket Section */}
                    {createdTicket && createdTicket.qrCode && (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.45 }}
                        className="w-full mb-6"
                      >
                        <div className="text-center mb-4">
                          <h4 className="text-sm font-semibold text-foreground mb-1">Your Entry QR Code</h4>
                          <p className="text-xs text-muted-foreground">Show this QR code at the class entrance</p>
                        </div>
                        <div className="flex justify-center">
                          <div className="bg-white rounded-2xl p-6 border-4 border-primary/20">
                            <QRCodeDisplay 
                              value={createdTicket.qrCode} 
                              size={200}
                              className="rounded-lg"
                            />
                          </div>
                        </div>
                        {createdTicket.ticketNumber && (
                          <div className="text-center mt-4">
                            <p className="text-xs text-muted-foreground mb-1">Ticket Number</p>
                            <p className="text-sm font-mono font-semibold text-foreground">{createdTicket.ticketNumber}</p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Payment Invoice Info */}
                    {paymentInvoice && (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="w-full p-4 rounded-xl bg-muted border border-border mb-6"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-foreground">Payment Details</h4>
                          <button
                            onClick={() => setShowInvoiceDialog(true)}
                            className="text-xs text-primary hover:underline"
                          >
                            View Invoice
                          </button>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount Charged:</span>
                            <span className="font-semibold text-foreground">${paymentInvoice.amount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Payment Method:</span>
                            <span className="font-medium text-foreground">
                              {paymentInvoice.paymentMethod}
                              {paymentInvoice.cardLast4 && ` •••• ${paymentInvoice.cardLast4}`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Invoice #:</span>
                            <span className="font-mono text-xs text-foreground">{paymentInvoice.invoiceNumber}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* What to Do Next */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="w-full mb-6"
                    >
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        {t('whatToDo')}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-muted">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{t('joinChat')}</p>
                            <p className="text-xs text-muted-foreground">{t('joinChatDesc')}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-muted">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{t('checkNotifications')}</p>
                            <p className="text-xs text-muted-foreground">{t('checkNotificationsDesc')}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Action Button */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="w-full pb-4"
                    >
                      <div className="space-y-2">
                        {createdTicket && createdTicket.qrCode && (
                          <Button
                            onClick={() => {
                              setShowSuccessDialog(false);
                              setShowTicketDialog(true);
                            }}
                            variant="outline"
                            className="w-full h-12 rounded-xl flex items-center justify-center gap-2"
                          >
                            <Ticket className="w-5 h-5" />
                            View Full Ticket Details
                          </Button>
                        )}
                        {!createdTicket?.qrCode && isFreeEnrollment && (
                          <div className="w-full p-4 rounded-xl bg-muted border-2 border-dashed border-muted-foreground/20 text-center">
                            <p className="text-sm text-muted-foreground">
                              This is an online class. No QR code needed.
                            </p>
                          </div>
                        )}
                        <Button
                          onClick={() => {
                            setShowSuccessDialog(false);
                            setIsFreeEnrollment(false);
                            if (id) {
                              queryClient.invalidateQueries({ queryKey: ['class', id] });
                              queryClient.invalidateQueries({ queryKey: ['tickets'] });
                            }
                            // Stay on class details (modal closes, same page)
                          }}
                          className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground"
                        >
                          {t('backToDetails')}
                        </Button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Ticket QR Code Dialog */}
        <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
          <DialogContent className="max-w-md mx-4 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                Your Ticket
              </DialogTitle>
              <DialogDescription>
                Show this QR code at the event entrance
              </DialogDescription>
            </DialogHeader>
            
            {(() => {
              const ticketToShow = createdTicket || userTicket;
              if (!ticketToShow) {
                return (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No ticket found</p>
                  </div>
                );
              }
              
              return (
                <div className="space-y-6 py-4">
                  {/* Ticket Number */}
                  {ticketToShow.ticketNumber && (
                    <div className="text-center pb-4 border-b border-border">
                      <p className="text-sm text-muted-foreground mb-1">Ticket Number</p>
                      <p className="text-xl font-bold text-foreground">{ticketToShow.ticketNumber}</p>
                    </div>
                  )}

                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="bg-white rounded-2xl p-6 border-4 border-primary/20 flex items-center justify-center">
                      {ticketToShow.qrCode ? (
                        <QRCodeDisplay 
                          value={ticketToShow.qrCode} 
                          size={240}
                          className="rounded-lg"
                        />
                      ) : (
                        <div className="w-64 h-64 flex items-center justify-center">
                          <p className="text-sm text-muted-foreground">QR code generating...</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Ticket Status */}
                  {ticketToShow.status && (
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <p className={`text-sm font-semibold ${
                        ticketToShow.status === 'ACTIVE' ? 'text-green-600' : 
                        ticketToShow.status === 'USED' ? 'text-muted-foreground' : 
                        'text-orange-600'
                      }`}>
                        {ticketToShow.status === 'ACTIVE' ? 'Active' : 
                         ticketToShow.status === 'USED' ? 'Used' : 
                         ticketToShow.status}
                      </p>
                    </div>
                  )}
                  
                  {/* QR Code Data (for debugging, can be removed in production) */}
                  {ticketToShow.qrCode && process.env.NODE_ENV === 'development' && (
                    <div className="text-center">
                      <p className="text-xs font-mono text-muted-foreground break-all px-4">
                        {ticketToShow.qrCode}
                      </p>
                    </div>
                  )}
                  
                  {/* Event Info */}
                  {(() => {
                    const eventClass = ticketToShow?.class || classItem;
                    if (!eventClass) return null;
                    
                    return (
                      <div className="p-4 rounded-xl bg-muted space-y-2">
                        <p className="text-sm font-semibold text-foreground">
                          {eventClass.title}
                        </p>
                        {eventClass.startTime && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">
                              {format(
                                new Date(eventClass.startTime),
                                'EEEE, MMMM d, yyyy • h:mm a'
                              )}
                            </span>
                          </div>
                        )}
                        {eventClass.venue && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">
                              {eventClass.venue.name}
                              {eventClass.venue.address && ` • ${eventClass.venue.address}`}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  
                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowTicketDialog(false);
                          const ticketToShow = createdTicket || userTicket;
                          if (ticketToShow?.id) {
                            navigate(`/ticket/${ticketToShow.id}`);
                          }
                        }}
                        className="flex-1"
                      >
                        View Full Ticket
                      </Button>
                      <Button
                        onClick={() => {
                          setShowTicketDialog(false);
                          navigate('/home');
                        }}
                        className="flex-1 bg-gradient-primary"
                      >
                        Done
                      </Button>
                    </div>
                    <motion.button
                      onClick={() => {
                        setShowTicketDialog(false);
                        navigate('/tickets');
                      }}
                      className="text-sm text-primary font-medium hover:underline"
                      whileTap={{ scale: 0.98 }}
                    >
                      My Tickets
                    </motion.button>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* Invoice Dialog */}
        <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
          <DialogContent className="max-w-md mx-4 rounded-2xl">
            <DialogHeader>
              <DialogTitle>Payment Invoice</DialogTitle>
              <DialogDescription>
                Payment receipt and invoice details
              </DialogDescription>
            </DialogHeader>
            
            {paymentInvoice && (
              <div className="space-y-6 py-4">
                {/* Invoice Header */}
                <div className="text-center pb-4 border-b border-border">
                  <h3 className="text-lg font-bold text-foreground mb-1">{classItem?.title}</h3>
                  <p className="text-sm text-muted-foreground">Invoice #{paymentInvoice.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(paymentInvoice.date), 'MMMM d, yyyy • h:mm a')}
                  </p>
                </div>

                {/* Payment Details */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="text-2xl font-bold text-primary">${paymentInvoice.amount}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="font-medium text-foreground">
                      {paymentInvoice.paymentMethod}
                      {paymentInvoice.cardLast4 && ` •••• ${paymentInvoice.cardLast4}`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Transaction Date:</span>
                    <span className="font-medium text-foreground">
                      {format(new Date(paymentInvoice.date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Invoice Number:</span>
                    <span className="font-mono text-xs text-foreground">{paymentInvoice.invoiceNumber}</span>
                  </div>
                </div>

                {/* Class Info */}
                {classItem && (
                  <div className="p-4 rounded-xl bg-muted space-y-2">
                    <p className="text-sm font-semibold text-foreground">Class Information</p>
                    <div className="space-y-1 text-sm">
                      {classItem.startTime && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Start Date:</span>
                          <span className="text-foreground">
                            {format(new Date(classItem.startTime), 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                      {(classItem.instructor || (classItem as any).host) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Host:</span>
                          <span className="text-foreground">
                            {(classItem as any).host?.name || classItem.instructor?.displayName || `${classItem.instructor?.firstName || ''} ${classItem.instructor?.lastName || ''}`.trim() || 'Host'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowInvoiceDialog(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      // Print or download invoice
                      window.print();
                    }}
                    className="flex-1 bg-gradient-primary"
                  >
                    Print / Save
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      {/* Q&A Dialog */}
      <Dialog open={showQADialog} onOpenChange={setShowQADialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ask a Question</DialogTitle>
            <DialogDescription>
              Ask a question about this lesson. The host will respond.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs font-medium text-muted-foreground mb-1">Lesson:</p>
              <p className="text-sm text-foreground">
                {classItem?.syllabus
                  ?.flatMap((m: any) => m.lessons)
                  .find((l: any) => l.id === selectedLessonForQA)?.title || 'Unknown Lesson'}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Your Question</label>
              <textarea
                placeholder="Type your question here..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setQuestionText('');
                  setShowQADialog(false);
                  setSelectedLessonForQA(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!questionText.trim()) {
                    toast.error('Please enter a question');
                    return;
                  }
                  toast.success('Question submitted! The host will respond soon.');
                  setQuestionText('');
                  setShowQADialog(false);
                  setSelectedLessonForQA(null);
                }}
                className="flex-1 bg-gradient-primary"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AppLayout>
  );
};

export default ClassDetailPage;

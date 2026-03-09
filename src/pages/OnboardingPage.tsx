import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import uliMascot from '@/assets/uli-mascot.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LiraAvatarScreen } from '@/components/LiraAvatarScreen';
import { ChevronRight, Check, Users, Heart, Briefcase, Home, Phone, Mail, Smartphone, Camera, X, Upload, Sparkles, Coffee, Dumbbell, Music, Gamepad2, BookOpen, Plane, UtensilsCrossed, Film, ShoppingBag, GraduationCap, TrendingUp, Building2, Target, Lightbulb, MapPin, DollarSign, Zap, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { API_ENDPOINTS, apiRequest } from '@/lib/api';

type OnboardingStep = 'welcome' | 'method' | 'phone' | 'otp' | 'email' | 'name' | 'birthday' | 'accountCreated' | 'location' | 'gender' | 'occupation' | 'lookingFor' | 'interests' | 'profilePhoto' | 'photos' | 'faceScan' | 'selfie' | 'bio' | 'complete';

// Mexico cities for location preference (optional)
const mexicoCities = [
  { id: 'mexico-city', label: 'Mexico City', emoji: '🏙️' },
  { id: 'monterrey', label: 'Monterrey', emoji: '🏭' },
  { id: 'guadalajara', label: 'Guadalajara', emoji: '🌮' },
  { id: 'queretaro', label: 'Querétaro', emoji: '🏛️' },
  { id: 'cancun', label: 'Cancún / Playa del Carmen', emoji: '🏖️' },
];

const signupMethods = [
  { id: 'phone', label: 'Phone Number', icon: Phone, description: 'Sign up with phone number' },
  { id: 'google', label: 'Google', icon: Mail, description: 'Continue with Google' },
  { id: 'apple', label: 'Apple ID', icon: Smartphone, description: 'Continue with Apple' },
];

const genderOptions = [
  { id: 'female', label: 'Women', emoji: '👩' },
  { id: 'male', label: 'Men', emoji: '👨' },
  { id: 'other', label: 'Other', emoji: '🧑' },
];

const occupationOptions = [
  { id: 'entrepreneur', label: 'Entrepreneur', emoji: '🚀' },
  { id: 'freelancer', label: 'Freelancer', emoji: '💼' },
  { id: 'corporate', label: 'Corporate', emoji: '🏢' },
  { id: 'creator', label: 'Creator / Influencer', emoji: '📱' },
  { id: 'educator', label: 'Educator', emoji: '📚' },
  { id: 'other', label: 'Other', emoji: '✨' },
];

const lookingForOptions = [
  { id: 'learn-entrepreneurship', label: 'Learn Entrepreneurship', icon: TrendingUp, emoji: '🚀', color: 'connectme' },
  { id: 'ecommerce-business', label: 'E-commerce & Digital Business', icon: ShoppingBag, emoji: '🛒', color: 'connectme' },
  { id: 'real-estate-investing', label: 'Real Estate & Investing', icon: Building2, emoji: '🏠', color: 'connectme' },
  { id: 'marketing-growth', label: 'Marketing & Growth', icon: Target, emoji: '📈', color: 'connectme' },
  { id: 'business-mindset', label: 'Business Mindset & Lifestyle', icon: Lightbulb, emoji: '🧠', color: 'connectme' },
  { id: 'networking', label: 'Networking', icon: Briefcase, emoji: '🤝', color: 'connectme' },
  { id: 'mentorship', label: 'Find a Mentor', icon: Users, emoji: '👔', color: 'connectme' },
  { id: 'teach-share', label: 'Teach & Share Knowledge', icon: GraduationCap, emoji: '📚', color: 'connectme' },
  { id: 'startup-community', label: 'Startup Community', icon: Zap, emoji: '⚡', color: 'connectme' },
  { id: 'investor-connections', label: 'Investor Connections', icon: DollarSign, emoji: '💰', color: 'connectme' },
  { id: 'coffee-chats', label: 'Coffee & Business Chats', icon: Coffee, emoji: '☕', color: 'friendme' },
  { id: 'workshops', label: 'Workshops & Masterclasses', icon: BookOpen, emoji: '🎓', color: 'friendme' },
];

const interestOptions = [
  // Coffee & Drinks
  { id: 'coffee', label: 'Coffee', emoji: '☕' },
  { id: 'wine', label: 'Wine', emoji: '🍷' },
  { id: 'cocktails', label: 'Cocktails', emoji: '🍸' },
  { id: 'beer', label: 'Beer', emoji: '🍺' },
  { id: 'tea', label: 'Tea', emoji: '🫖' },
  
  // Sports (Expanded)
  { id: 'tennis', label: 'Tennis', emoji: '🎾' },
  { id: 'basketball', label: 'Basketball', emoji: '🏀' },
  { id: 'soccer', label: 'Soccer', emoji: '⚽' },
  { id: 'volleyball', label: 'Volleyball', emoji: '🏐' },
  { id: 'swimming', label: 'Swimming', emoji: '🏊' },
  { id: 'surfing', label: 'Surfing', emoji: '🏄' },
  { id: 'cycling', label: 'Cycling', emoji: '🚴' },
  { id: 'running', label: 'Running', emoji: '🏃' },
  { id: 'golf', label: 'Golf', emoji: '⛳' },
  { id: 'boxing', label: 'Boxing', emoji: '🥊' },
  { id: 'yoga', label: 'Yoga', emoji: '🧘' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'baseball', label: 'Baseball', emoji: '⚾' },
  { id: 'football', label: 'Football', emoji: '🏈' },
  { id: 'martial-arts', label: 'Martial Arts', emoji: '🥋' },
  { id: 'rock-climbing', label: 'Rock Climbing', emoji: '🧗' },
  { id: 'paddleboarding', label: 'Paddleboarding', emoji: '🏄‍♂️' },
  { id: 'kayaking', label: 'Kayaking', emoji: '🛶' },
  { id: 'diving', label: 'Diving', emoji: '🤿' },
  { id: 'skiing', label: 'Skiing', emoji: '⛷️' },
  { id: 'snowboarding', label: 'Snowboarding', emoji: '🏂' },
  { id: 'skating', label: 'Skating', emoji: '⛸️' },
  { id: 'hiking', label: 'Hiking', emoji: '🥾' },
  { id: 'crossfit', label: 'CrossFit', emoji: '🏋️' },
  { id: 'pilates', label: 'Pilates', emoji: '🧘‍♀️' },
  { id: 'dance-fitness', label: 'Dance Fitness', emoji: '💃' },
  
  // Latin Music & Dance (Miami - Expanded)
  { id: 'reggaeton', label: 'Reggaeton', emoji: '🎵' },
  { id: 'salsa', label: 'Salsa', emoji: '💃' },
  { id: 'bachata', label: 'Bachata', emoji: '💃' },
  { id: 'merengue', label: 'Merengue', emoji: '🎵' },
  { id: 'latin-jazz', label: 'Latin Jazz', emoji: '🎷' },
  { id: 'cumbia', label: 'Cumbia', emoji: '🎶' },
  { id: 'tango', label: 'Tango', emoji: '🕺' },
  { id: 'flamenco', label: 'Flamenco', emoji: '🎸' },
  { id: 'samba', label: 'Samba', emoji: '🥁' },
  { id: 'dembow', label: 'Dembow', emoji: '🎤' },
  { id: 'reggae', label: 'Reggae', emoji: '🎵' },
  { id: 'dancing', label: 'Dancing', emoji: '💃' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'live-music', label: 'Live Music', emoji: '🎸' },
  
  // Cuisine & Food (Expanded)
  { id: 'cooking', label: 'Cooking', emoji: '👨‍🍳' },
  { id: 'italian-food', label: 'Italian Cuisine', emoji: '🍝' },
  { id: 'japanese-food', label: 'Japanese Cuisine', emoji: '🍣' },
  { id: 'mexican-food', label: 'Mexican Cuisine', emoji: '🌮' },
  { id: 'french-food', label: 'French Cuisine', emoji: '🥐' },
  { id: 'thai-food', label: 'Thai Cuisine', emoji: '🍜' },
  { id: 'indian-food', label: 'Indian Cuisine', emoji: '🍛' },
  { id: 'chinese-food', label: 'Chinese Cuisine', emoji: '🥟' },
  { id: 'korean-food', label: 'Korean Cuisine', emoji: '🍲' },
  { id: 'mediterranean-food', label: 'Mediterranean', emoji: '🥙' },
  { id: 'caribbean-food', label: 'Caribbean Cuisine', emoji: '🍹' },
  { id: 'cuban-food', label: 'Cuban Cuisine', emoji: '🥪' },
  { id: 'peruvian-food', label: 'Peruvian Cuisine', emoji: '🍽️' },
  { id: 'brazilian-food', label: 'Brazilian Cuisine', emoji: '🍖' },
  { id: 'spanish-food', label: 'Spanish Cuisine', emoji: '🥘' },
  { id: 'greek-food', label: 'Greek Cuisine', emoji: '🫒' },
  { id: 'seafood', label: 'Seafood', emoji: '🦞' },
  { id: 'bbq', label: 'BBQ', emoji: '🍖' },
  { id: 'vegan', label: 'Vegan', emoji: '🥗' },
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥬' },
  { id: 'foodie', label: 'Foodie', emoji: '🍽️' },
  { id: 'fine-dining', label: 'Fine Dining', emoji: '🍴' },
  { id: 'street-food', label: 'Street Food', emoji: '🌯' },
  
  // Other Interests
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'art', label: 'Art', emoji: '🎨' },
  { id: 'reading', label: 'Reading', emoji: '📚' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'photography', label: 'Photography', emoji: '📷' },
  { id: 'movies', label: 'Movies', emoji: '🎬' },
  { id: 'theater', label: 'Theater', emoji: '🎭' },
  { id: 'comedy', label: 'Comedy', emoji: '😂' },
  { id: 'networking', label: 'Networking', emoji: '💼' },
  { id: 'beach', label: 'Beach', emoji: '🏖️' },
  { id: 'nightlife', label: 'Nightlife', emoji: '🌃' },
  { id: 'wellness', label: 'Wellness', emoji: '🧘‍♀️' },
  { id: 'fashion', label: 'Fashion', emoji: '👗' },
  { id: 'technology', label: 'Technology', emoji: '💻' },
  { id: 'entrepreneurship', label: 'Entrepreneurship', emoji: '🚀' },
];

const messages: Record<OnboardingStep, string[]> = {
  welcome: [
    "Hey there! 👋",
    "I'm Lira, your guide to learning from real entrepreneurs!",
    "Ulikme is where real experience meets real results.",
    "Let's create your account to get started.",
    "How would you like to sign up?",
  ],
  method: [
    "Great choice!",
    "Let's continue...",
  ],
  phone: [
    "Perfect!",
    "What's your phone number?",
    "We'll send you a verification code.",
  ],
  otp: [
    "Great!",
    "We've sent a verification code to your phone.",
    "Enter the code below to verify your number.",
  ],
  email: [
    "Got it!",
    "What's your email address?",
  ],
  name: [
    "Perfect! Let's start with the basics.",
    "What should I call you? 😊",
  ],
  birthday: [
    "Nice to meet you!",
    "When's your birthday? I promise I won't forget it! 🎂",
  ],
  location: [
    "Great!",
    "We use your location to show nearby places and better recommendations.",
  ],
  accountCreated: [
    "Your account is successfully created! Let's continue.",
  ],
  gender: [
    "Got it!",
    "How do you identify?",
  ],
  occupation: [
    "Thanks!",
    "What's your profession?",
  ],
  lookingFor: [
    "Great!",
    "What are you looking to learn or achieve?",
    "Select all that apply! We'll match you with the right classes and mentors! 🚀",
  ],
  interests: [
    "Awesome!",
    "What business skills and topics interest you?",
    "Select up to 10 interests! Focus on what you want to learn or teach! 💼",
  ],
  bio: [
    "Great!",
    "Tell us about yourself.",
    "Share your business journey, what you've built, or what you want to learn. Real experience matters! 💼",
  ],
  photos: [
    "Great! Now let's add some photos to your profile.",
    "You need to add at least 2 photos before we can continue.",
    "After adding 2 photos, we'll take a selfie, then you'll tell us about yourself! 📸",
    "Tap on the empty slots below to add photos or videos (up to 15).",
  ],
  selfie: [
    "Great! You've added your photos.",
    "Now let's take a selfie to verify it's really you.",
    "After this, you'll tell us about yourself! 📸",
  ],
  bio: [
    "Almost done!",
    "Tell us a bit about yourself - what you love, what you're passionate about.",
    "This helps others get to know you better! ✨",
  ],
  complete: [
    "You're all set! 🎉",
    "Welcome to Ulikme! Let's connect you with real entrepreneurs and expert-led classes!",
  ],
  profilePhoto: [
    "Upload your photo.",
    "This helps us confirm your identity and keep the community safe.",
  ],
  faceScan: [
    "Let's verify it's you.",
    "We'll compare your selfie with your uploaded photo.",
  ],
};

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { register, verifyOTP, loginWithGoogle, loginWithApple } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [messageIndex, setMessageIndex] = useState(0);
  const [showInput, setShowInput] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currentMessages = messages[step];

  useEffect(() => {
    setMessageIndex(0);
    setShowInput(false);
    
    // Prevent going to selfie if less than 2 photos
    if (step === 'selfie' && photos.length < 2) {
      toast.error('Please add at least 2 photos before taking selfie');
      setStep('photos');
      return;
    }
    
    // Photos step - show immediately without waiting for messages
    if (step === 'photos') {
      setShowInput(true);
      // Show messages quickly
      const showMessages = async () => {
        for (let i = 0; i < currentMessages.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 400));
          setMessageIndex(i + 1);
        }
      };
      showMessages();
      return;
    }
    
    // Other steps - show messages then input
    const showMessages = async () => {
      for (let i = 0; i < currentMessages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setMessageIndex(i + 1);
      }
      await new Promise(resolve => setTimeout(resolve, 400));
      setShowInput(true);
    };
    
    showMessages();
  }, [step, currentMessages.length]);

  const handleMethodSelect = async (methodId: string) => {
    setSelectedMethod(methodId);
    
    if (methodId === 'google') {
      setLoading(true);
      try {
        await loginWithGoogle();
        // If Google login succeeds, user is registered, go to profile setup
        setStep('name');
      } catch (error: any) {
        toast.error(error.message || 'Google sign up failed');
      } finally {
        setLoading(false);
      }
    } else if (methodId === 'apple') {
      setLoading(true);
      try {
        await loginWithApple();
        // If Apple login succeeds, user is registered, go to profile setup
        setStep('name');
      } catch (error: any) {
        toast.error(error.message || 'Apple sign up failed');
      } finally {
        setLoading(false);
      }
    } else if (methodId === 'phone') {
      setStep('phone');
    }
  };

  const handleSendOTP = async () => {
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`;
      
      // In production, this would call the OTP send API
      // For now, simulate sending OTP
      toast.success('Verification code sent!');
      setOtpSent(true);
      setStep('otp');
    } catch (error: any) {
      console.error('OTP send error:', error);
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`;
      
      // Verify OTP (in production, this would validate the actual code)
      // For mockup, accept any 6-digit code or '123456'
      const response = await verifyOTP(formattedPhone, otpCode);
      
      // Phone verified - continue to email
      toast.success('Phone verified!');
      setStep('email');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error(error.message || 'Invalid verification code. Please try again.');
      setOtpCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailNext = () => {
    if (!email.trim()) return;
    setStep('name');
  };

  const handleNameNext = () => {
    // Split name into first and last name
    const nameParts = name.trim().split(' ');
    setFirstName(nameParts[0] || '');
    setLastName(nameParts.slice(1).join(' ') || nameParts[0] || '');
    setStep('birthday');
  };

  // Helper function to convert base64 to File
  const base64ToFile = (base64: string, filename: string): File => {
    // If it's already a URL (not base64), return empty file (won't be used)
    if (base64.startsWith('http://') || base64.startsWith('https://') || base64.startsWith('data:video;')) {
      return new File([], filename, { type: 'image/png' });
    }
    
    // Check if it's a valid base64 string
    if (!base64.includes(',')) {
      // Not a valid base64 data URL, return empty file
      return new File([], filename, { type: 'image/png' });
    }
    
    const arr = base64.split(',');
    if (arr.length < 2) {
      return new File([], filename, { type: 'image/png' });
    }
    
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    try {
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    } catch (error) {
      // If decode fails, return empty file
      return new File([], filename, { type: 'image/png' });
    }
  };

  // Helper function to upload image to Cloudinary via backend
  const uploadImage = async (base64: string): Promise<string> => {
    // If it's already a URL (dummy data), return it directly
    if (base64.startsWith('http://') || base64.startsWith('https://')) {
      return base64;
    }
    
    // If it's a video URL with data:video prefix, remove the prefix
    if (base64.startsWith('data:video;')) {
      return base64.replace('data:video;', '');
    }
    
    // If it's base64, try to upload
    try {
      const file = base64ToFile(base64, `photo-${Date.now()}.png`);
      
      // If file is empty (URL was passed), return the original string
      if (file.size === 0) {
        return base64;
      }
      
      const formData = new FormData();
      formData.append('image', file);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_ENDPOINTS.USERS.AVATAR}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(error.message || 'Failed to upload image');
      }
      
      const data = await response.json();
      // Avatar endpoint returns { success: true, data: { id, avatar } }
      return data.data?.avatar || data.avatar || '';
    } catch (error) {
      // If upload fails and it's a base64 string, return it as-is
      // This handles dummy mode where upload might not work
      if (base64.startsWith('data:')) {
        return base64;
      }
      throw error;
    }
  };

  const handleComplete = async () => {

    setLoading(true);
    try {
      if (selectedMethod === 'phone') {
        const formattedPhone = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`;
        const nameParts = name.trim().split(' ');
        const finalFirstName = firstName || nameParts[0] || '';
        const finalLastName = lastName || nameParts.slice(1).join(' ') || nameParts[0] || '';
        
        await register({
          phone: formattedPhone,
          email: email.trim() || undefined,
          firstName: finalFirstName,
          lastName: finalLastName,
          displayName: name,
          dateOfBirth: birthday ? new Date(birthday).toISOString() : undefined,
          authProvider: 'PHONE',
        });
      } else {
        // Google/Apple - user already registered, just update profile
        const nameParts = name.trim().split(' ');
        const finalFirstName = firstName || nameParts[0] || '';
        const finalLastName = lastName || nameParts.slice(1).join(' ') || nameParts[0] || '';
        
        await register({
          email: email.trim() || undefined,
          firstName: finalFirstName,
          lastName: finalLastName,
          displayName: name,
          dateOfBirth: birthday ? new Date(birthday).toISOString() : undefined,
          authProvider: selectedMethod === 'google' ? 'GOOGLE' : 'APPLE',
        });
      }

      // Upload photos and selfie to Cloudinary
      let uploadedPhotos: string[] = [];
      let uploadedSelfie: string | null = null;

      if (photos.length > 0) {
        toast.loading('Uploading photos...', { id: 'upload-photos' });
        uploadedPhotos = await Promise.all(
          photos.map(photo => uploadImage(photo))
        );
        toast.dismiss('upload-photos');
      }

      if (selfie) {
        toast.loading('Uploading selfie...', { id: 'upload-selfie' });
        uploadedSelfie = await uploadImage(selfie);
        toast.dismiss('upload-selfie');
      }

      // Update profile with all collected data
      toast.loading('Completing your profile...', { id: 'update-profile' });
      await apiRequest(API_ENDPOINTS.USERS.UPDATE, {
        method: 'PUT',
        body: JSON.stringify({
          gender,
          occupation,
          lookingFor,
          interests,
          bio,
          photos: uploadedPhotos,
          selfie: uploadedSelfie,
        }),
      });
      toast.dismiss('update-profile');

      toast.success('Welcome to ULIKME!');
      setStep('complete');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const steps: OnboardingStep[] = ['welcome', 'method', 'phone', 'otp', 'email', 'name', 'birthday', 'accountCreated', 'location', 'gender', 'occupation', 'lookingFor', 'interests', 'profilePhoto', 'photos', 'faceScan', 'selfie', 'bio', 'complete'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      
      // Skip steps based on selected method
      if (selectedMethod === 'google' || selectedMethod === 'apple') {
        if (step === 'method') {
          setStep('name');
          return;
        }
      }
      
      // Check if moving from photos to faceScan - require at least 2 photos
      if (step === 'photos' && nextStep === 'faceScan') {
        if (photos.length < 2) {
          toast.error('Please add at least 2 photos before continuing');
          return;
        }
      }
      
      // Check if moving from faceScan to selfie
      if (step === 'faceScan' && nextStep !== 'selfie') {
        setStep('selfie');
        return;
      }
      
      // Check if moving from photos to selfie (legacy path) - require at least 2 photos
      if (step === 'photos' && nextStep === 'selfie') {
        if (photos.length < 2) {
          toast.error('Please add at least 2 photos before continuing to selfie');
          return;
        }
      }
      
      // Check if moving from interests to profilePhoto
      if (step === 'interests' && nextStep !== 'profilePhoto') {
        setStep('profilePhoto');
        return;
      }
      
      // Check if moving from profilePhoto to photos
      if (step === 'profilePhoto' && nextStep !== 'photos') {
        setStep('photos');
        return;
      }
      
      setStep(nextStep);
    } else {
      navigate('/home');
    }
  };

  const toggleLookingFor = (id: string) => {
    setLookingFor(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleInterest = (id: string) => {
    setInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const remainingSlots = 15 - photos.length;
      if (remainingSlots <= 0) {
        toast.error('Maximum 15 photos/videos allowed');
        event.target.value = ''; // Reset input
        return;
      }
      
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      let successCount = 0;
      let errorCount = 0;
      
      filesToProcess.forEach((file, index) => {
        // Check file type
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');
        
        if (!isVideo && !isImage) {
          toast.error(`${file.name} is not a valid image or video file`);
          errorCount++;
          return;
        }
        
        // Check file size (max 50MB for videos, 10MB for images)
        const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
          toast.error(`${file.name} is too large. Max size: ${isVideo ? '50MB' : '10MB'}`);
          errorCount++;
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setPhotos(prev => [...prev, e.target.result as string]);
            successCount++;
            
            // Show success message after all files are processed
            if (successCount + errorCount === filesToProcess.length) {
              if (successCount > 0) {
                toast.success(`Added ${successCount} ${successCount === 1 ? 'photo' : 'photos'}`);
              }
            }
          }
        };
        reader.onerror = () => {
          toast.error(`Failed to read ${file.name}`);
          errorCount++;
        };
        reader.readAsDataURL(file);
      });
      
      // Reset input to allow selecting the same file again
      event.target.value = '';
    }
  };

  const handleSelfieCapture = () => {
    // In production, this would use camera API
    toast.info('Camera access would open here. For now, using placeholder.');
    setSelfie('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400');
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Auto-fill selfie with dummy data
  useEffect(() => {
    if (step === 'selfie' && !selfie) {
      setSelfie('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400');
    }
  }, [step, selfie]);

  const renderInput = () => {
    if (!showInput) return null;

    switch (step) {
      case 'welcome':
        // welcome artık LiraAvatarScreen ile erken dönüldü; bu case sadece fallback
        return null;
      case 'method':
        return (
          <div className="space-y-3 mt-4">
            {signupMethods.map((method) => {
              const Icon = method.icon;
              return (
                <motion.button
                  key={method.id}
                  onClick={() => handleMethodSelect(method.id)}
                  disabled={loading}
                  className="w-full p-4 rounded-xl bg-card border border-border hover:bg-accent transition-colors text-left flex items-center gap-4"
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * signupMethods.indexOf(method) }}
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{method.label}</div>
                    <div className="text-sm text-muted-foreground">{method.description}</div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        );

      case 'phone':
        return (
          <div className="space-y-4 mt-4">
            <div>
              <Input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 rounded-xl"
                disabled={loading}
              />
            </div>
            <Button
              onClick={handleSendOTP}
              disabled={loading || !phone}
              className="w-full bg-gradient-primary h-12 text-lg font-semibold"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </Button>
            <button
              onClick={() => setStep('welcome')}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
          </div>
        );

      case 'otp':
        return (
          <div className="space-y-4 mt-4">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                Code sent to {phone}
              </p>
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <Input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otpCode[index] || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 1) {
                        const newCode = otpCode.split('');
                        newCode[index] = value;
                        setOtpCode(newCode.join('').slice(0, 6));
                        
                        // Auto-focus next input
                        if (value && index < 5) {
                          const nextInput = document.getElementById(`otp-${index + 1}`);
                          nextInput?.focus();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
                        const prevInput = document.getElementById(`otp-${index - 1}`);
                        prevInput?.focus();
                      }
                    }}
                    id={`otp-${index}`}
                    className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    disabled={loading}
                  />
                ))}
              </div>
            </div>
            <Button
              onClick={handleVerifyOTP}
              disabled={loading || otpCode.length !== 6}
              className="w-full bg-gradient-primary h-12 text-lg font-semibold"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>
            <div className="flex items-center justify-between text-sm">
              <button
                onClick={() => {
                  setStep('phone');
                  setOtpCode('');
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Change number
              </button>
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="text-primary hover:underline font-medium"
              >
                Resend code
              </button>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-center text-blue-600">
                💡 For testing, you can use any 6-digit code or '123456'
              </p>
            </div>
          </div>
        );

      case 'name':
        return (
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-14 text-lg text-center rounded-2xl border-2 border-primary/20 focus:border-primary"
            />
            <Button 
              onClick={handleNameNext} 
              disabled={!name.trim() || loading}
              className="w-full bg-gradient-primary h-14 text-lg font-semibold shadow-glow disabled:opacity-50"
            >
              Continue <ChevronRight className="ml-2" />
            </Button>
          </div>
        );

      case 'birthday':
        return (
          <div className="space-y-4 mt-4">
            <Input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="h-14 text-lg text-center rounded-2xl border-2 border-primary/20 focus:border-primary"
            />
            <Button 
              onClick={() => setStep('gender')} 
              disabled={!birthday || loading}
              className="w-full bg-gradient-primary h-14 text-lg font-semibold shadow-glow disabled:opacity-50"
            >
              Continue <ChevronRight className="ml-2" />
            </Button>
          </div>
        );

      case 'gender':
        return (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              {genderOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => setGender(option.id)}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    gender === option.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border bg-card'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <p className="mt-2 font-medium">{option.label}</p>
                </motion.button>
              ))}
            </div>
            <Button 
              onClick={() => setStep('occupation')} 
              disabled={!gender || loading}
              className="w-full bg-gradient-primary h-14 text-lg font-semibold shadow-glow disabled:opacity-50"
            >
              Continue <ChevronRight className="ml-2" />
            </Button>
          </div>
        );

      case 'occupation':
        return (
          <div className="space-y-4 mt-4">
            <select
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full h-14 rounded-2xl border-2 border-border bg-card px-4 text-base text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">Select your profession</option>
              {occupationOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.emoji} {option.label}
                </option>
              ))}
            </select>
            <Button 
              onClick={() => setStep('lookingFor')} 
              disabled={!occupation || loading}
              className="w-full bg-gradient-primary h-14 text-lg font-semibold shadow-glow disabled:opacity-50"
            >
              Continue <ChevronRight className="ml-2" />
            </Button>
          </div>
        );

      case 'lookingFor':
        return (
          <div className="space-y-4 mt-4">
            <div className="text-center mb-2">
              <p className="text-sm text-muted-foreground">
                Selected: {lookingFor.length} (select all that apply)
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
              {lookingForOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = lookingFor.includes(option.id);
                return (
                  <motion.button
                    key={option.id}
                    onClick={() => toggleLookingFor(option.id)}
                    className={`p-4 rounded-2xl border-2 transition-all relative ${
                      isSelected 
                        ? 'border-primary bg-gradient-to-br from-primary/20 to-primary/10 shadow-md' 
                        : 'border-border bg-card hover:border-primary/30'
                    }`}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {isSelected && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md"
                      >
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </motion.div>
                    )}
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl">{option.emoji}</span>
                      <p className="font-medium text-xs text-center leading-tight">{option.label}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
            <Button 
              onClick={() => setStep('interests')} 
              disabled={lookingFor.length === 0 || loading}
              className="w-full bg-gradient-primary h-14 text-lg font-semibold shadow-glow disabled:opacity-50"
            >
              Continue <ChevronRight className="ml-2" />
            </Button>
            {lookingFor.length === 0 && (
              <p className="text-xs text-center text-muted-foreground">
                Please select at least one option
              </p>
            )}
          </div>
        );

      case 'interests':
        return (
          <div className="space-y-4 mt-4">
            <div className="text-center mb-2">
              <p className="text-sm text-muted-foreground">
                Selected: {interests.length} / 10
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
              {interestOptions.map((option) => {
                const isSelected = interests.includes(option.id);
                const isDisabled = !isSelected && interests.length >= 10;
                return (
                  <motion.button
                    key={option.id}
                    onClick={() => toggleInterest(option.id)}
                    disabled={isDisabled}
                    className={`p-4 rounded-2xl border-2 transition-all relative ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : isDisabled
                        ? 'border-border bg-muted opacity-50 cursor-not-allowed'
                        : 'border-border bg-card'
                    }`}
                    whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                  >
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <span className="text-3xl">{option.emoji}</span>
                    <p className="mt-1 font-medium text-xs">{option.label}</p>
                  </motion.button>
                );
              })}
            </div>
            <Button 
              onClick={() => setStep('photos')} 
              disabled={interests.length === 0 || loading}
              className="w-full bg-gradient-primary h-14 text-lg font-semibold shadow-glow disabled:opacity-50"
            >
              Continue to Photos <ChevronRight className="ml-2" />
            </Button>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-center text-blue-600 font-medium">
                📸 Next: You'll add photos, then take a selfie, and finally tell us about yourself
              </p>
            </div>
          </div>
        );

      case 'bio':
        return (
          <div className="space-y-4 mt-4">
            <div className="text-center mb-4">
              <p className="text-base font-semibold text-foreground mb-1">
                Tell Us About Yourself
              </p>
              <p className="text-sm text-muted-foreground">
                Share what makes you unique! This helps others get to know you better.
              </p>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself... What do you love? What are you passionate about? What are your goals?"
              rows={6}
              maxLength={500}
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length} / 500 characters
            </p>
            <Button 
              onClick={handleComplete} 
              disabled={loading}
              className="w-full bg-gradient-primary h-14 text-lg font-semibold shadow-glow disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Complete Sign Up'} <ChevronRight className="ml-2" />
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              You can skip this and add it later
            </p>
          </div>
        );

      case 'photos':
        return (
          <div className="space-y-4 mt-4">
            <div className="text-center mb-4">
              <p className="text-base font-semibold text-foreground mb-1">
                Add Photos & Videos
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Added: {photos.length} / 15 (minimum 2 required)
              </p>
              {photos.length < 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20"
                >
                  <span className="text-xs font-medium text-orange-600">
                    ⚠️ Add at least 2 photos to continue to selfie
                  </span>
                </motion.div>
              )}
              {photos.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-green-500/10 border-2 border-green-500/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-500/20 flex-shrink-0">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-700 mb-0.5">
                        Great! You've added {photos.length} photo{photos.length > 1 ? 's' : ''}.
                      </p>
                      <p className="text-xs text-green-600">
                        Now let's take your selfie! 📸
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto pb-2">
              {[...Array(Math.max(15, photos.length + 1))].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`aspect-square rounded-xl overflow-hidden border-2 ${
                    photos[index] 
                      ? 'border-border' 
                      : 'border-dashed border-primary/50 bg-muted/50 hover:border-primary hover:bg-muted cursor-pointer'
                  } flex items-center justify-center relative group`}
                  onClick={() => {
                    if (!photos[index] && photos.length < 15) {
                      document.getElementById('photo-upload')?.click();
                    }
                  }}
                >
                  {photos[index] ? (
                    <div className="relative w-full h-full">
                      {photos[index].startsWith('data:video') ? (
                        <video src={photos[index]} className="w-full h-full object-cover" controls />
                      ) : (
                        <img src={photos[index]} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                      )}
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(index);
                        }}
                        className="absolute top-1 right-1 p-1.5 rounded-full bg-destructive text-destructive-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                      {photos[index].startsWith('data:video') && (
                        <div className="absolute bottom-1 left-1 px-2 py-1 rounded-md bg-black/70 text-white text-xs font-medium">
                          🎥 Video
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 p-4">
                      <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Camera className="w-6 h-6 text-primary" />
                      </div>
                      {index === 0 && photos.length === 0 && (
                        <p className="text-xs text-center text-muted-foreground px-2">
                          Tap to add photo
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12"
                onClick={() => document.getElementById('photo-upload')?.click()}
                disabled={photos.length >= 15}
              >
                <Upload className="w-4 h-4 mr-2" />
                {photos.length >= 15 ? 'Maximum Reached' : 'Add More'}
              </Button>
              {photos.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 px-4"
                  onClick={() => {
                    setPhotos([]);
                    toast.info('All photos removed');
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Button 
              onClick={() => {
                if (photos.length < 2) {
                  toast.error('Please add at least 2 photos before continuing to selfie');
                  return;
                }
                setStep('selfie');
              }} 
              disabled={photos.length < 2 || loading}
              className="w-full bg-gradient-primary h-14 text-lg font-semibold shadow-glow disabled:opacity-50 disabled:cursor-not-allowed relative"
            >
              {photos.length < 2 ? (
                <>
                  Add {2 - photos.length} More Photo{2 - photos.length > 1 ? 's' : ''} to Continue
                </>
              ) : (
                <>
                  Continue to Selfie <ChevronRight className="ml-2" />
                </>
              )}
            </Button>
            {photos.length < 2 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-orange-500/10 border-2 border-orange-500/30"
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-orange-500/20 flex-shrink-0 mt-0.5">
                    <Camera className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-orange-700 mb-1">
                      Photos Required
                    </p>
                    <p className="text-xs text-orange-600 leading-relaxed">
                      You need to add at least <strong>2 photos</strong> before you can take your selfie. 
                      Tap on the empty slots above or use the "Add More" button to upload photos.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 'selfie':
        return (
          <div className="space-y-4 mt-4">
            <div className="text-center mb-4">
              <p className="text-base font-semibold text-foreground mb-1">
                Take Your Selfie
              </p>
              <p className="text-sm text-muted-foreground">
                Let's verify it's really you! We'll compare your selfie with your uploaded photos.
              </p>
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden border-2 border-primary bg-muted flex items-center justify-center">
              {selfie ? (
                <div className="relative w-full h-full">
                  <img src={selfie} alt="Selfie" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setSelfie(null)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-destructive text-destructive-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center p-6">
                  <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">Take a selfie</p>
                </div>
              )}
            </div>
            <Button
              onClick={handleSelfieCapture}
              variant="outline"
              className="w-full h-12"
            >
              <Camera className="w-4 h-4 mr-2" />
              {selfie ? 'Retake Selfie' : 'Take Selfie'}
            </Button>
            <Button 
              onClick={() => {
                if (!selfie) {
                  toast.error('Please take a selfie before continuing');
                  return;
                }
                setStep('bio');
              }} 
              disabled={!selfie || loading}
              className="w-full bg-gradient-primary h-14 text-lg font-semibold shadow-glow disabled:opacity-50"
            >
              Continue to About Me <ChevronRight className="ml-2" />
            </Button>
            {!selfie && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20"
              >
                <p className="text-xs text-center text-orange-600 font-medium">
                  ⚠️ Please take a selfie to continue
                </p>
              </motion.div>
            )}
          </div>
        );

      case 'complete':
        return (
          <div className="min-h-screen bg-white flex flex-col">
            <header className="flex items-center justify-center relative px-4 pt-12 pb-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="absolute left-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"
                aria-label="Back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-xl font-bold text-[#ED6C27]">ULIKME</span>
            </header>

            <div className="flex-1 px-6 flex flex-col items-center">
              <div className="mt-6 mb-6">
                <div className="w-40 h-40 rounded-full bg-[#FDE7D3] flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full bg-[#ED6C27] flex items-center justify-center">
                    <ShieldCheck className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                You&apos;re verified ✓
              </h2>
              <p className="text-sm text-gray-600 text-center max-w-xs">
                Your selfie was successfully matched with your photo. Your profile is now verified and trusted by the
                community.
              </p>
            </div>

            <div className="px-6 pb-6">
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="w-full h-12 rounded-xl bg-[#ED6C27] text-white font-semibold text-base"
              >
                Get Started
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Signup ilk ekranı: login ekranı ile aynı stil (kalabalık arka plan + 3 buton)
  if (step === 'welcome') {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Arka plan: kalabalık görsel + koyu overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.45)), url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80')",
          }}
        />
        <div className="relative flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-10 max-w-md mx-auto w-full">
          {/* Logo: beyaz kare, yumuşak köşeler, soldan sağa hafif mavi–turuncu gradient, içinde siyah U */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(to right, #b8daf0 0%, #ffffff 50%, #ffdfb8 100%)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            }}
          >
            <span className="text-4xl font-black text-black leading-none">U</span>
          </div>

          {/* ULIKME */}
          <h1 className="text-4xl font-extrabold text-white uppercase tracking-tight mb-8">
            ULIKME
          </h1>

          {/* Create your Account */}
          <div className="text-center mb-2">
            <p className="text-white text-lg">Create your</p>
            <p className="text-white text-2xl font-bold">Account</p>
          </div>
          <p className="text-white/90 text-sm mb-8">
            Choose how you&apos;d like to get started
          </p>

          {/* Üç buton: beyaz, yuvarlatılmış, açık gri yazı, hafif gölge */}
          <div className="w-full space-y-3">
            {signupMethods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => handleMethodSelect(method.id)}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-4 px-4 rounded-xl bg-white text-gray-600 font-medium hover:bg-gray-50 active:scale-[0.99] transition-colors disabled:opacity-60 shadow-md"
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{method.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sign in link */}
          <p className="mt-8 text-center text-white/90 text-sm">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-semibold text-white underline underline-offset-2 hover:no-underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Telefon – Lira soruyor
  if (step === 'phone') {
    return (
      <LiraAvatarScreen
        title="Lira"
        onBack={() => setStep('welcome')}
        message="What's your phone number? I'll send you a verification code."
        showMediaControls={false}
        onNext={handleSendOTP}
        nextLabel="Send code"
        nextLoading={loading}
        nextDisabled={!phone.trim()}
      >
        <Input
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-12 rounded-xl border-gray-200"
          disabled={loading}
        />
      </LiraAvatarScreen>
    );
  }

  // OTP – Lira doğrulama
  if (step === 'otp') {
    return (
      <LiraAvatarScreen
        title="Lira"
        onBack={() => { setStep('phone'); setOtpCode(''); }}
        message={
          <>
            I&apos;ve sent a code to your phone.
            <br />
            Enter it below to continue.
          </>
        }
        showMediaControls={false}
        onNext={handleVerifyOTP}
        nextLabel="Verify"
        nextLoading={loading}
        nextDisabled={otpCode.length !== 6}
      >
        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otpCode[index] || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 1) {
                  const newCode = otpCode.split('');
                  newCode[index] = value;
                  setOtpCode(newCode.join('').slice(0, 6));
                  if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
                  document.getElementById(`otp-${index - 1}`)?.focus();
                }
              }}
              id={`otp-${index}`}
              className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-gray-200"
              disabled={loading}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 text-center">Code sent to {phone}</p>
        <button type="button" onClick={handleSendOTP} disabled={loading} className="text-sm text-[#ED6C27] font-medium">
          Resend code
        </button>
      </LiraAvatarScreen>
    );
  }

  // Email – Lira soruyor
  if (step === 'email') {
    return (
      <LiraAvatarScreen
        title="Lira"
        onBack={() => setStep('otp')}
        message="What's your email address?"
        showMediaControls={false}
        onNext={handleEmailNext}
        nextLabel="Next"
        nextDisabled={!email.trim()}
      >
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 rounded-xl border-gray-200"
        />
      </LiraAvatarScreen>
    );
  }

  // İsim – Lira soruyor
  if (step === 'name') {
    return (
      <LiraAvatarScreen
        title="Lira"
        onBack={() => setStep('email')}
        message="What should I call you?"
        showMediaControls={false}
        onNext={handleNameNext}
        nextLabel="Next"
        nextLoading={loading}
        nextDisabled={!name.trim()}
      >
        <Input
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 rounded-xl border-gray-200 text-center"
        />
      </LiraAvatarScreen>
    );
  }

  // Doğum tarihi – Lira soruyor
  if (step === 'birthday') {
    return (
      <LiraAvatarScreen
        title="Lira"
        onBack={() => setStep('name')}
        message="When's your birthday? I promise I won't forget it!"
        showMediaControls={false}
        onNext={() => setStep('accountCreated')}
        nextLabel="Next"
        nextDisabled={!birthday}
      >
        <Input
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          className="h-12 rounded-xl border-gray-200 text-center"
        />
      </LiraAvatarScreen>
    );
  }

  // Account created – Location Services'tan önce
  if (step === 'accountCreated') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="flex items-center justify-center relative px-4 pt-12 pb-4">
          <button
            type="button"
            onClick={() => setStep('birthday')}
            className="absolute left-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xl font-bold text-[#ED6C27]">ULIKME</span>
        </header>

        <div className="flex-1 px-6 flex flex-col items-center justify-center">
          {/* Turuncu/sarı → mor gradient blob */}
          <div
            className="w-48 h-48 rounded-full mb-8 flex-shrink-0"
            style={{
              background: 'radial-gradient(ellipse 80% 70% at 50% 30%, #F5B027 0%, #ED6C27 30%, #9B59B6 70%, #2C3E50 100%)',
              boxShadow: '0 12px 40px rgba(237, 108, 39, 0.25)',
            }}
          />
          <p className="text-gray-500 text-center text-base">Your account</p>
          <p className="text-gray-900 font-bold text-center text-lg mt-1">
            is successfully created! Let&apos;s continue.
          </p>
        </div>

        <div className="px-6 pb-8">
          <button
            type="button"
            onClick={() => setStep('location')}
            className="w-full h-12 rounded-xl bg-[#ED6C27] text-white font-semibold text-base"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // Lokasyon ekranı – ULIKME başlığı, ikon ve alt metin
  if (step === 'location') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="flex items-center justify-center relative px-4 pt-12 pb-4">
          <button
            type="button"
            onClick={() => setStep('accountCreated')}
            className="absolute left-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xl font-bold text-[#ED6C27]">ULIKME</span>
        </header>

        <div className="flex-1 px-6 flex flex-col items-center">
          {/* Büyük turuncu lokasyon ikonu */}
          <div className="mt-4 mb-6">
            <div className="w-32 h-32 rounded-full bg-[#ED6C27] flex items-center justify-center">
              <MapPin className="w-16 h-16 text-white" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Location Services</h2>
          <p className="text-sm text-gray-600 text-center max-w-xs mb-auto">
            We use your location to show nearby places, improve recommendations, and enhance your overall experience.
          </p>
        </div>

        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={() => setStep('gender')}
            className="w-full h-12 rounded-xl bg-[#ED6C27] text-white font-semibold text-base"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // Cinsiyet ekranı – üç satırlı seçim + alt turuncu Next
  if (step === 'gender') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="flex items-center justify-center relative px-4 pt-12 pb-4">
          <button
            type="button"
            onClick={() => setStep('location')}
            className="absolute left-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xl font-bold text-[#ED6C27]">ULIKME</span>
        </header>

        <div className="flex-1 px-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">What&apos;s your gender?</h2>

          <div className="space-y-3 mb-auto">
            {genderOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setGender(option.id)}
                className={`w-full h-12 rounded-full px-4 flex items-center justify-between text-base font-medium ${
                  gender === option.id
                    ? 'bg-[#FFF3E8] text-gray-900 border border-[#ED6C27]'
                    : 'bg-[#F7F7F7] text-gray-800 border border-transparent'
                }`}
              >
                <span>{option.label}</span>
                <span
                  className={`w-5 h-5 rounded-full border ${
                    gender === option.id ? 'bg-[#ED6C27] border-[#ED6C27]' : 'border-gray-400 bg-white'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={() => setStep('occupation')}
            disabled={!gender}
            className="w-full h-12 rounded-xl bg-[#ED6C27] text-white font-semibold text-base disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // Meslek ekranı – gender ekranıyla aynı stil
  if (step === 'occupation') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="flex items-center justify-center relative px-4 pt-12 pb-4">
          <button
            type="button"
            onClick={() => setStep('gender')}
            className="absolute left-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xl font-bold text-[#ED6C27]">ULIKME</span>
        </header>

        <div className="flex-1 px-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-900 mt-2 text-center">What do you do?</h2>
          <p className="text-xs text-gray-500 text-center mb-6">
            Your job, role, or what you&apos;re currently working as
          </p>

          <div className="space-y-3 mb-auto">
            {occupationOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setOccupation(option.id)}
                className={`w-full h-12 rounded-full px-4 flex items-center justify-between text-base font-medium ${
                  occupation === option.id
                    ? 'bg-[#FFF3E8] text-gray-900 border border-[#ED6C27]'
                    : 'bg-[#F7F7F7] text-gray-800 border border-transparent'
                }`}
              >
                <span>{option.label}</span>
                <span
                  className={`w-5 h-5 rounded-full border ${
                    occupation === option.id ? 'bg-[#ED6C27] border-[#ED6C27]' : 'border-gray-400 bg-white'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={() => setStep('lookingFor')}
            disabled={!occupation}
            className="w-full h-12 rounded-xl bg-[#ED6C27] text-white font-semibold text-base disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // Learn / Achieve ekranı – hedefler (lookingFor)
  if (step === 'lookingFor') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="flex items-center justify-center relative px-4 pt-12 pb-4">
          <button
            type="button"
            onClick={() => setStep('occupation')}
            className="absolute left-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xl font-bold text-[#ED6C27]">ULIKME</span>
        </header>

        <div className="flex-1 px-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-900 mt-2 text-center">
            What do you want to achieve
          </h2>
          <p className="text-xs text-gray-500 text-center mb-6">
            Select all that apply! We&apos;ll match you with the right classes and mentors!
          </p>

          <div className="grid grid-cols-3 gap-3 mb-auto">
            {lookingForOptions.map((option) => {
              const isSelected = lookingFor.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleLookingFor(option.id)}
                  className={`h-24 rounded-2xl px-2 py-2 text-xs font-medium text-center flex flex-col items-center justify-center gap-2 transition-colors ${
                    isSelected
                      ? 'bg-[#FFF3E8] text-gray-900 border border-[#ED6C27]'
                      : 'bg-[#F7F7F7] text-gray-800 border border-transparent'
                  }`}
                >
                  <span className="text-xl">{option.emoji}</span>
                  <span className="leading-tight">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={() => setStep('interests')}
            disabled={lookingFor.length === 0}
            className="w-full h-12 rounded-xl bg-[#ED6C27] text-white font-semibold text-base disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // Interests ekranı – ilgi alanları listesi
  if (step === 'interests') {
    const minInterests = 5;

    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="flex items-center justify-center relative px-4 pt-12 pb-4">
          <button
            type="button"
            onClick={() => setStep('lookingFor')}
            className="absolute left-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xl font-bold text-[#ED6C27]">ULIKME</span>
        </header>

        <div className="flex-1 px-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-900 mt-2 text-center">
            Please select your interest
          </h2>
          <p className="text-xs text-[#ED6C27] font-medium text-center mt-1">
            Select at least {minInterests} options.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 mb-auto">
            {interestOptions.map((option) => {
              const isSelected = interests.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleInterest(option.id)}
                  className={`h-12 rounded-xl px-4 flex items-center justify-between text-sm font-medium ${
                    isSelected
                      ? 'bg-[#FFF3E8] text-gray-900 border border-[#ED6C27]'
                      : 'bg-[#F7F7F7] text-gray-800 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{option.emoji}</span>
                    <span>{option.label}</span>
                  </span>
                  <span
                    className={`w-5 h-5 rounded-sm border ${
                      isSelected ? 'bg-[#ED6C27] border-[#ED6C27]' : 'border-gray-400 bg-white'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={() => setStep('profilePhoto')}
            disabled={interests.length < minInterests}
            className="w-full h-12 rounded-xl bg-[#ED6C27] text-white font-semibold text-base disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // Sayfa 1: Upload your photo (boş) / Sayfa 2: Aynı ekran, fotoğraf yüklendi
  if (step === 'profilePhoto') {
    const handleProfilePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) setProfilePhoto(ev.target.result as string);
        };
        reader.readAsDataURL(file);
      }
      e.target.value = '';
    };

    const goToPhotos = () => {
      if (profilePhoto) setPhotos(prev => [profilePhoto, ...prev]);
      setStep('photos');
    };

    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="flex items-center justify-center relative px-4 pt-12 pb-4">
          <button
            type="button"
            onClick={() => setStep('interests')}
            className="absolute left-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xl font-bold text-[#ED6C27]">ULIKME</span>
        </header>

        <div className="flex-1 px-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-900 mt-4 text-center">
            Upload your photo
          </h2>
          <p className="text-sm text-gray-500 text-center mt-2 mb-8">
            This helps us confirm your identity and keep the community safe.
          </p>

          <div className="relative flex-1 flex items-center justify-center min-h-[280px]">
            <label className="w-full aspect-[4/5] max-w-sm rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoSelect}
                className="sr-only"
                id="profile-photo-upload"
              />
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-16 h-16 text-gray-400" />
              )}
              <span
                className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-[#ED6C27] flex items-center justify-center text-white shadow-lg"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  document.getElementById('profile-photo-upload')?.click();
                }}
              >
                <span className="text-2xl leading-none">+</span>
              </span>
            </label>
          </div>
        </div>

        <div className="px-6 pb-8">
          <button
            type="button"
            onClick={goToPhotos}
            className="w-full h-12 rounded-xl bg-[#ED6C27] text-white font-semibold text-base"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // Çoklu foto sayfası – ekteki gibi: Add your best Photos, 2x3 grid, + butonları
  if (step === 'photos') {
    const slotCount = 6;
    const slots = Array.from({ length: slotCount }, (_, i) => photos[i] ?? null);

    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="flex items-center justify-center relative px-4 pt-12 pb-4">
          <button
            type="button"
            onClick={() => setStep('profilePhoto')}
            className="absolute left-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xl font-bold text-[#ED6C27]">ULIKME</span>
        </header>

        <div className="flex-1 px-6 flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 mt-2">
            Add your best Photos
          </h2>
          <p className="text-sm text-gray-700 mt-1 mb-6">
            Let&apos;s add your 2 photos to start.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-auto">
            {slots.map((photo, index) => (
              <div key={index} className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative">
                {photo ? (
                  <>
                    {photo.startsWith('data:video') ? (
                      <video src={photo} className="w-full h-full object-cover" />
                    ) : (
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <label className="absolute inset-0 flex items-center justify-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="sr-only"
                      onChange={handlePhotoUpload}
                    />
                    <Camera className="w-10 h-10 text-gray-400 pointer-events-none" />
                    <span className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-[#ED6C27] flex items-center justify-center text-white text-xl leading-none pointer-events-none">
                      +
                    </span>
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 pb-8">
          <button
            type="button"
            onClick={() => photos.length >= 2 && setStep('faceScan')}
            disabled={photos.length < 2}
            className="w-full h-12 rounded-xl bg-[#ED6C27] text-white font-semibold text-base disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // Face scan sayfası – Let's verify it's you
  if (step === 'faceScan') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="flex items-center justify-center relative px-4 pt-12 pb-4">
          <button
            type="button"
            onClick={() => setStep('photos')}
            className="absolute left-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xl font-bold text-[#ED6C27]">ULIKME</span>
        </header>

        <div className="flex-1 px-6 flex flex-col items-center">
          <h2 className="text-xl font-bold text-gray-900 mt-4 text-center">
            Let&apos;s verify it&apos;s you
          </h2>
          <p className="text-sm text-gray-600 text-center mt-2 mb-8 max-w-xs">
            We&apos;ll compare your selfie with your uploaded photo to make sure it&apos;s really you. This helps keep everyone safe.
          </p>

          {/* İllüstrasyon: telefon + kilit + tik */}
          <div className="relative flex items-center justify-center w-48 h-48 mb-8">
            <div className="absolute w-32 h-32 rounded-full bg-gray-100" />
            <div className="relative w-24 h-40 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
              <Lock className="w-10 h-10 text-[#ED6C27]" />
            </div>
            <div className="absolute top-2 right-6 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-2 border-white">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-green-500" />
            <div className="absolute bottom-4 -left-2 w-3 h-3 rounded-full bg-[#ED6C27]" />
            <div className="absolute top-8 -left-4 w-2 h-2 rounded-full bg-red-400" />
          </div>
        </div>

        <div className="px-6 pb-8">
          <button
            type="button"
            onClick={() => setStep('selfie')}
            className="w-full h-12 rounded-xl bg-[#ED6C27] text-white font-semibold text-base"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // Tell us about you – son iki sayfadan biri
  if (step === 'bio') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="flex items-center justify-center relative px-4 pt-12 pb-4">
          <button
            type="button"
            onClick={() => setStep('selfie')}
            className="absolute left-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xl font-bold text-[#ED6C27]">ULIKME</span>
        </header>

        <div className="flex-1 px-6 flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 mt-4 text-center">
            Tell us about you
          </h2>
          <p className="text-sm text-gray-500 text-center mt-2 mb-6">
            Share a little about yourself so others get to know you
          </p>

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short intro, anything you'd like others to know..."
            rows={6}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ED6C27]/20 resize-none"
          />
        </div>

        <div className="px-6 pb-8">
          <button
            type="button"
            onClick={async () => {
              await handleComplete();
            }}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#ED6C27] text-white font-semibold text-base disabled:opacity-50"
          >
            {loading ? '...' : 'Next'}
          </button>
        </div>
      </div>
    );
  }

  // Success sayfası – Congratulations + profile summary
  if (step === 'complete') {
    const lookingForLabels = lookingFor
      .map((id) => lookingForOptions.find((o) => o.id === id)?.label)
      .filter(Boolean);
    const interestLabels = interests
      .map((id) => interestOptions.find((o) => o.id === id)?.label)
      .filter(Boolean);
    const occupationLabel = occupationOptions.find((o) => o.id === occupation)?.label ?? '—';

    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="flex items-center justify-center relative px-4 pt-12 pb-4">
          <button
            type="button"
            onClick={() => setStep('bio')}
            className="absolute left-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xl font-bold text-[#ED6C27]">ULIKME</span>
        </header>

        <div className="flex-1 px-6 flex flex-col items-center overflow-auto">
          <h2 className="text-xl font-bold text-[#ED6C27] uppercase tracking-tight mt-4 mb-4">
            Congratulations
          </h2>

          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {photos[0] ? (
                <img src={photos[0]} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl text-gray-400">👤</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-2 border-white">
              <Check className="w-5 h-5 text-white" />
            </div>
          </div>

          <p className="text-base font-bold text-gray-900 mb-1">
            Your profile is ready <span className="text-green-500">✓</span>
          </p>
          <p className="text-sm text-gray-500 text-center mb-6">
            You can now start meeting people who match your vibe.
          </p>

          <p className="text-sm font-medium text-gray-900 mb-2">Profile summary</p>
          <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-900">Looking for</span>
              <span className="text-gray-600 text-right">
                {lookingForLabels.length ? lookingForLabels.slice(0, 2).join(', ') + (lookingForLabels.length > 2 ? ', +' + (lookingForLabels.length - 2) : '') : '—'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-900">Activities</span>
              <span className="text-gray-600 text-right">
                {interestLabels.length ? interestLabels.slice(0, 3).join(', ') + (interestLabels.length > 3 ? ', +' + (interestLabels.length - 3) : '') : '—'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-900">Personality</span>
              <span className="text-gray-600">—</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-900">Availability</span>
              <span className="text-gray-600">Weekends, Anytime</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-900">Values</span>
              <span className="text-gray-600">—</span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-8 pt-4">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="w-full h-12 rounded-xl bg-[#ED6C27] text-white font-semibold text-base"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero" />
      
      <div className="relative flex-1 flex flex-col px-6 pt-12 pb-8 max-w-md mx-auto w-full">
        {/* Lira Mascot */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8 }}
        >
          <motion.img 
            src={uliMascot} 
            alt="Lira" 
            className="w-32 h-32 drop-shadow-lg"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Chat bubbles */}
        <div className="flex-1 space-y-3">
          <AnimatePresence>
            {currentMessages.slice(0, messageIndex).map((message, index) => (
              <motion.div
                key={`${step}-${index}`}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-border"
              >
                  <p className="text-foreground">{message}</p>
              </motion.div>
            ))}
          </AnimatePresence>

        {/* Input area */}
        <AnimatePresence>
            {renderInput() && (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
            >
              {renderInput()}
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {/* Sign in link (welcome artık avatar ekranında; method ekranında göster) */}
        {step === 'method' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;

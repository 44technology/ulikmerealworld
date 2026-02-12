import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Building2, Mail, Lock, MapPin, Phone, Globe, User, ArrowLeft, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const VENUE_CATEGORIES = [
  'Restaurant',
  'Café',
  'Bar',
  'Park',
  'Event Space',
  'Hotel',
  'Gallery',
  'Other',
];

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const;

const defaultHours = { open: '09:00', close: '18:00', closed: false };

function businessHoursToString(h: Record<string, { open: string; close: string; closed: boolean }>): string {
  return DAYS.map(({ key, label }) => {
    const d = h[key];
    if (!d || d.closed) return `${label.slice(0, 3)}: Closed`;
    return `${label.slice(0, 3)}: ${d.open}-${d.close}`;
  }).join('; ');
}

export default function VenueSignupPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Venue Owner Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Venue Info
    venueName: '',
    category: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    website: '',
    phoneNumber: '',
    businessLicense: '',
    taxId: '',
  });

  const [businessHoursByDay, setBusinessHoursByDay] = useState<Record<string, { open: string; close: string; closed: boolean }>>(() => {
    const o: Record<string, { open: string; close: string; closed: boolean }> = {};
    DAYS.forEach((d) => { o[d.key] = { ...defaultHours }; });
    return o;
  });
  const [applyAllOpen, setApplyAllOpen] = useState('09:00');
  const [applyAllClose, setApplyAllClose] = useState('18:00');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!formData.category) {
      toast.error('Please select a venue category');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          displayName: `${formData.firstName} ${formData.lastName}`,
          authProvider: 'EMAIL',
          // Venue-specific data will be sent in a separate API call
          venueData: {
            name: formData.venueName,
            category: formData.category,
            description: formData.description,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            zipCode: formData.zipCode,
            website: formData.website,
            phone: formData.phoneNumber,
            businessHours: businessHoursToString(businessHoursByDay),
            businessLicense: formData.businessLicense,
            taxId: formData.taxId,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      toast.success('Registration successful! Please wait for admin approval.');
      navigate('/login');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Venue Registration</h1>
            <p className="text-muted-foreground">Create your venue account to start managing your business</p>
          </div>

          {/* Back to Login */}
          <div className="mb-6">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Venue Owner Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">
                Venue Owner Information
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="venue@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Min. 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Venue Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">
                Venue Information
              </h2>

              <div className="space-y-2">
                <Label htmlFor="venueName">Venue Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="venueName"
                    name="venueName"
                    placeholder="Restaurant Name"
                    value={formData.venueName}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category / Type</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {VENUE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Tell us about your venue..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="address"
                    name="address"
                    placeholder="123 Main Street"
                    value={formData.address}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Miami"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="FL"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    placeholder="33101"
                    value={formData.zipCode}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  placeholder="United States"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Venue Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="+1234567890"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      placeholder="https://example.com"
                      value={formData.website}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Business Hours
                </Label>
                <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">Apply to all days:</span>
                    <Input
                      type="time"
                      value={applyAllOpen}
                      onChange={(e) => setApplyAllOpen(e.target.value)}
                      className="w-28 h-9"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      type="time"
                      value={applyAllClose}
                      onChange={(e) => setApplyAllClose(e.target.value)}
                      className="w-28 h-9"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBusinessHoursByDay((prev) => {
                          const next = { ...prev };
                          DAYS.forEach((d) => {
                            next[d.key] = { open: applyAllOpen, close: applyAllClose, closed: false };
                          });
                          return next;
                        });
                        toast.success('Hours applied to all days');
                      }}
                    >
                      Apply to all
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {DAYS.map(({ key, label }) => {
                      const day = businessHoursByDay[key] || defaultHours;
                      return (
                        <div key={key} className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="w-24 shrink-0 font-medium text-foreground">{label}</span>
                          <label className="flex items-center gap-1.5 shrink-0">
                            <input
                              type="checkbox"
                              checked={day.closed}
                              onChange={(e) => {
                                setBusinessHoursByDay((prev) => ({
                                  ...prev,
                                  [key]: { ...prev[key], closed: e.target.checked },
                                }));
                              }}
                              className="rounded border-border"
                            />
                            <span className="text-muted-foreground">Closed</span>
                          </label>
                          {!day.closed && (
                            <>
                              <Input
                                type="time"
                                value={day.open}
                                onChange={(e) =>
                                  setBusinessHoursByDay((prev) => ({
                                    ...prev,
                                    [key]: { ...prev[key], open: e.target.value },
                                  }))
                                }
                                className="w-28 h-8"
                              />
                              <span className="text-muted-foreground">–</span>
                              <Input
                                type="time"
                                value={day.close}
                                onChange={(e) =>
                                  setBusinessHoursByDay((prev) => ({
                                    ...prev,
                                    [key]: { ...prev[key], close: e.target.value },
                                  }))
                                }
                                className="w-28 h-8"
                              />
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-border">
                <h3 className="text-sm font-medium text-foreground">Verification (optional at signup)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessLicense">Business License No.</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="businessLicense"
                        name="businessLicense"
                        placeholder="License number"
                        value={formData.businessLicense}
                        onChange={handleChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Input
                      id="taxId"
                      name="taxId"
                      placeholder="Tax ID / EIN"
                      value={formData.taxId}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-primary text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Venue Account'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>By signing up, you agree to our Terms of Service and Privacy Policy</p>
              <p className="mt-2">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

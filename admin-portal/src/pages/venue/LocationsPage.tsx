import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Plus, MapPin, Building2, Image as ImageIcon, X, Upload, Globe, Phone, Users, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Venue {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  image?: string;
  website?: string;
  phone?: string;
  capacity?: number;
  amenities: string[];
}

const commonAmenities = [
  'WiFi',
  'Parking',
  'Outdoor Seating',
  'Wheelchair Accessible',
  'Pet Friendly',
  'Live Music',
  'Bar',
  'Restaurant',
  'Coffee',
  'Dining',
  'Entertainment',
  'Sports',
];

export default function LocationsPage() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: 'United States',
    zipCode: '',
    latitude: '',
    longitude: '',
    website: '',
    phone: '',
    capacity: '',
  });

  // TODO: Fetch venues from API
  const [venues, setVenues] = useState<Venue[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.address || !formData.city || !formData.country) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      toast.error('Please provide latitude and longitude');
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('state', formData.state);
      formDataToSend.append('country', formData.country);
      formDataToSend.append('zipCode', formData.zipCode);
      formDataToSend.append('latitude', formData.latitude);
      formDataToSend.append('longitude', formData.longitude);
      formDataToSend.append('website', formData.website);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('capacity', formData.capacity);
      formDataToSend.append('amenities', JSON.stringify(selectedAmenities));
      
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      const token = localStorage.getItem('portal_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/venues`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create venue');
      }

      const result = await response.json();
      toast.success('Venue created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        address: '',
        city: '',
        state: '',
        country: 'United States',
        zipCode: '',
        latitude: '',
        longitude: '',
        website: '',
        phone: '',
        capacity: '',
      });
      setSelectedAmenities([]);
      setSelectedImage(null);
      setImagePreview(null);
      setIsDialogOpen(false);
      
      // Refresh venues list
      // TODO: Fetch venues again
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to create venue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
          toast.success('Location detected!');
        },
        (error) => {
          toast.error('Unable to get location. Please enter manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Locations</h1>
          <p className="text-muted-foreground mt-2">Manage your venue locations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Location</DialogTitle>
              <DialogDescription>Add a new venue location to your account</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Basic Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Venue Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="Restaurant Name"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
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

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Venue Image</Label>
                  <div className="flex items-center gap-4">
                    {imagePreview ? (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-border">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setSelectedImage(null);
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground text-center px-2">Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Upload a high-quality image of your venue (max 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Location Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
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
                    <Label htmlFor="city">City *</Label>
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
                  <Label htmlFor="country">Country *</Label>
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
                    <Label htmlFor="latitude">Latitude *</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="any"
                      placeholder="25.7617"
                      value={formData.latitude}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="longitude"
                        name="longitude"
                        type="number"
                        step="any"
                        placeholder="-80.1918"
                        value={formData.longitude}
                        onChange={handleChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGetLocation}
                        className="whitespace-nowrap"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Auto
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Contact Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      placeholder="100"
                      value={formData.capacity}
                      onChange={handleChange}
                      className="pl-10"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {commonAmenities.map((amenity) => (
                    <Badge
                      key={amenity}
                      variant={selectedAmenities.includes(amenity) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleAmenity(amenity)}
                    >
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Location'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Venues List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {venues.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium mb-2">No locations yet</p>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Create your first venue location to get started
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </CardContent>
          </Card>
        ) : (
          venues.map((venue) => (
            <Card key={venue.id}>
              <CardHeader>
                <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                  {venue.image ? (
                    <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardTitle>{venue.name}</CardTitle>
                <CardDescription>{venue.address}, {venue.city}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {venue.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{venue.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {venue.amenities.slice(0, 3).map((amenity) => (
                      <Badge key={amenity} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {venue.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{venue.amenities.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

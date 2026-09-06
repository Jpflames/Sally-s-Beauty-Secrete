import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatPrice, formatDuration } from '../lib/mockData';
import { fetchServices, addAppointment, uploadFile } from '../lib/db';
import { sendPendingEmail } from '../lib/email';
import type { Service } from '../lib/mockData';
import { Card, CardContent } from '../components/ui/Card';
import { addDays, format, startOfToday } from 'date-fns';
import { Calendar, Clock, CheckCircle2, UploadCloud, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';

type BookingStep = 'service' | 'datetime' | 'details' | 'review' | 'confirmation';

export function Book() {
  const [searchParams] = useSearchParams();
  const preSelectedServiceId = searchParams.get('service');
  const isCustomRequest = searchParams.get('custom') === 'true';

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [step, setStep] = useState<BookingStep>(preSelectedServiceId || isCustomRequest ? 'datetime' : 'service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchServices();
        setServices(data);
        if (preSelectedServiceId && !isCustomRequest) {
          const matched = data.find(s => s.id === preSelectedServiceId);
          if (matched) setSelectedService(matched);
        }
      } catch (error) {
        console.error("Error loading services:", error);
      }
      setLoadingServices(false);
    };
    loadData();
  }, [preSelectedServiceId, isCustomRequest]);
  
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    email: '',
    note: ''
  });

  const [referenceStyle, setReferenceStyle] = useState<{file: File | null, description: string}>({
    file: null,
    description: ''
  });

  const availableTimes = ['10:00 AM', '11:00 AM', '1:00 PM', '2:30 PM', '4:00 PM']; // Mock times

  const handleNext = (nextStep: BookingStep) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(nextStep);
  };

  const handleBack = (prevStep: BookingStep) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(prevStep);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  const confirmBooking = async () => {
    setIsSubmitting(true);
    
    try {
      let customImageUrl = '';
      if (referenceStyle.file) {
        // We use our existing Cloudinary upload function
        customImageUrl = await uploadFile(referenceStyle.file, 'custom');
      }

      const ref = `SBS-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      
      await addAppointment({
        serviceId: selectedService?.id || '',
        serviceName: selectedService?.name || 'Custom Style',
        date: date?.toISOString() || '',
        time: time || '',
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
        notes: customerDetails.note + (referenceStyle.description ? `\n\nStyle Note: ${referenceStyle.description}` : ''),
        customImageUrl,
        status: 'pending'
      });

      // Send the automated pending email
      if (customerDetails.email) {
        await sendPendingEmail(customerDetails.name, customerDetails.email);
      }

      setBookingRef(ref);
      handleNext('confirmation');
    } catch (error) {
      console.error("Booking error:", error);
      alert("There was an error processing your booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgress = () => (
    <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4 hide-scrollbar text-sm font-medium">
      {['Service', 'Date & Time', 'Details', 'Review'].map((s, i) => {
        const stepNames: BookingStep[] = ['service', 'datetime', 'details', 'review'];
        const currentStepIndex = stepNames.indexOf(step);
        const isActive = currentStepIndex >= i;
        
        return (
          <div key={s} className="flex items-center min-w-max">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${isActive ? 'border-primary bg-primary text-white' : 'border-muted-foreground/30 text-muted-foreground'} mr-2`}>
              {i + 1}
            </div>
            <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>{s}</span>
            {i < 3 && <ChevronRight className="w-4 h-4 mx-2 sm:mx-4 text-muted-foreground/30" />}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
      {step !== 'confirmation' && renderProgress()}

      {/* STEP 1: SERVICE */}
      {step === 'service' && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-3xl font-bold mb-6">Select a Service</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loadingServices ? (
              <div className="col-span-1 md:col-span-2 flex justify-center py-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
            ) : services.length === 0 ? (
              <div className="col-span-1 md:col-span-2 text-center py-12 text-muted-foreground border border-dashed rounded-xl">No services available. Please select Custom Style.</div>
            ) : (
              services.map(service => (
                <Card 
                  key={service.id} 
                  className={`cursor-pointer hover:border-primary transition-colors ${selectedService?.id === service.id ? 'border-primary ring-1 ring-primary' : ''}`}
                  onClick={() => setSelectedService(service)}
                >
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                      <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-primary font-medium">{formatPrice(service.price)}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock size={14} /> {formatDuration(service.durationMinutes)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            
            {/* Custom Style Option */}
            <Card 
              className={`cursor-pointer hover:border-primary transition-colors ${isCustomRequest && !selectedService ? 'border-primary ring-1 ring-primary' : ''}`}
              onClick={() => { setSelectedService(null); handleNext('datetime'); }}
            >
              <CardContent className="p-4 flex items-center justify-center h-full min-h-[120px] text-center bg-secondary/30">
                <div>
                  <h3 className="font-semibold text-lg">Custom Style</h3>
                  <p className="text-sm text-muted-foreground">Upload a photo for a custom quote</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button 
              onClick={() => handleNext('datetime')} 
              disabled={!selectedService && !isCustomRequest}
              size="lg"
              className="bg-primary/80 hover:bg-primary/90 font-light tracking-wide shadow-sm"
            >
              Continue to Date & Time
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: DATE & TIME */}
      {step === 'datetime' && (
        <div className="animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center gap-2 mb-6">
            <button onClick={() => handleBack('service')} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-3xl font-bold">Select Date & Time</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-primary" /> Choose a Date
              </h3>
              {/* Very basic mock calendar for MVP */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {Array.from({length: 12}).map((_, i) => {
                  const d = addDays(startOfToday(), i + 1); // Mock future dates
                  return (
                    <div 
                      key={i}
                      onClick={() => setDate(d)}
                      className={`p-3 rounded-lg text-center cursor-pointer transition-colors border ${date?.toDateString() === d.toDateString() ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-primary/50'}`}
                    >
                      <div className="text-xs uppercase opacity-80">{format(d, 'EEE')}</div>
                      <div className="text-xl font-bold">{format(d, 'd')}</div>
                      <div className="text-xs opacity-80">{format(d, 'MMM')}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock size={20} className="text-primary" /> Available Times
              </h3>
              {date ? (
                <div className="grid grid-cols-2 gap-3">
                  {availableTimes.map(t => (
                    <Button 
                      key={t}
                      variant={time === t ? 'primary' : 'outline'}
                      onClick={() => setTime(t)}
                      className="w-full"
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-muted-foreground border border-dashed rounded-lg">
                  Please select a date first
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button 
              onClick={() => handleNext('details')} 
              disabled={!date || !time}
              size="lg"
            >
              Continue to Details
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: DETAILS & UPLOAD */}
      {step === 'details' && (
        <div className="animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center gap-2 mb-6">
            <button onClick={() => handleBack('datetime')} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-3xl font-bold">Your Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <Input 
                  placeholder="Jane Doe" 
                  value={customerDetails.name}
                  onChange={e => setCustomerDetails({...customerDetails, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <Input 
                  placeholder="080XXXXXXXX" 
                  type="tel"
                  value={customerDetails.phone}
                  onChange={e => setCustomerDetails({...customerDetails, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address (Optional)</label>
                <Input 
                  placeholder="jane@example.com" 
                  type="email"
                  value={customerDetails.email}
                  onChange={e => setCustomerDetails({...customerDetails, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Booking Note (Optional)</label>
                <textarea 
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  rows={3}
                  placeholder="Any special requests or allergies..."
                  value={customerDetails.note}
                  onChange={e => setCustomerDetails({...customerDetails, note: e.target.value})}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Show Us Your Style</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Can't find exactly what you're looking for? Upload a photo or short video of your desired style.
              </p>
              
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-secondary/20 transition-colors">
                <UploadCloud className="w-12 h-12 text-primary mx-auto mb-2" />
                <p className="font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG, or MP4 (max. 10MB)</p>
                <input 
                  type="file" 
                  className="hidden" 
                  id="style-upload"
                  accept="image/*,video/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setReferenceStyle({...referenceStyle, file: e.target.files[0]});
                    }
                  }}
                />
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => document.getElementById('style-upload')?.click()}
                >
                  {referenceStyle.file ? 'Change File' : 'Browse Files'}
                </Button>
                {referenceStyle.file && (
                  <p className="mt-3 text-sm text-primary font-medium">{referenceStyle.file.name}</p>
                )}
              </div>
              
              {referenceStyle.file && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Tell Sally about this style</label>
                  <textarea 
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    rows={2}
                    placeholder="e.g. I want this exact pattern but in burgundy color..."
                    value={referenceStyle.description}
                    onChange={e => setReferenceStyle({...referenceStyle, description: e.target.value})}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button 
              onClick={() => handleNext('review')} 
              disabled={!customerDetails.name || !customerDetails.phone}
              size="lg"
            >
              Review Booking
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & PAY */}
      {step === 'review' && (
        <div className="animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center gap-2 mb-6">
            <button onClick={() => handleBack('details')} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-3xl font-bold">Review Your Booking</h2>
          </div>
          
          <div className="bg-card border rounded-xl p-6 md:p-8">
            <div className="border-b pb-6 mb-6">
              <h3 className="font-semibold text-xl mb-4">Appointment Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Service</p>
                  <p className="font-medium text-base">{selectedService?.name || 'Custom Style Request'}</p>
                </div>
                {selectedService && (
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium text-base">{formatDuration(selectedService.durationMinutes)}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium text-base">{date?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time</p>
                  <p className="font-medium text-base">{time}</p>
                </div>
              </div>
            </div>
            
            <div className="border-b pb-6 mb-6">
              <h3 className="font-semibold text-xl mb-4">Your Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium text-base">{customerDetails.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium text-base">{customerDetails.phone}</p>
                </div>
                {referenceStyle.file && (
                  <div className="sm:col-span-2">
                    <p className="text-muted-foreground">Reference Style</p>
                    <p className="font-medium text-base flex items-center gap-2 text-primary">
                      <CheckCircle2 size={16} /> Image/Video attached
                    </p>
                    {referenceStyle.description && (
                      <p className="italic mt-1">"{referenceStyle.description}"</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-secondary/30 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Price</span>
                  <span className="font-medium">{selectedService ? formatPrice(selectedService.price) : 'TBD after review'}</span>
                </div>
                {selectedService && (
                  <div className="flex justify-between text-primary">
                    <span>Deposit Required (20%)</span>
                    <span className="font-bold">{formatPrice(selectedService.price * 0.2)}</span>
                  </div>
                )}
                <div className="pt-4 mt-4 border-t border-border flex justify-between font-bold text-lg">
                  <span>Total Due Now</span>
                  <span>{selectedService ? formatPrice(selectedService.price * 0.2) : '₦0'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button 
              onClick={confirmBooking} 
              size="lg"
              isLoading={isSubmitting}
              className="w-full sm:w-auto px-12"
            >
              {selectedService ? 'Pay Deposit & Book' : 'Submit Custom Request'}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: CONFIRMATION */}
      {step === 'confirmation' && (
        <div className="text-center animate-in zoom-in-95 py-12">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-4xl font-bold mb-4">Appointment Confirmed!</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Thank you, {customerDetails.name}. We've received your booking.
          </p>
          
          <div className="bg-card border rounded-xl p-6 max-w-md mx-auto mb-8 shadow-sm">
            <p className="text-sm text-muted-foreground mb-1">Your Booking Reference</p>
            <p className="text-3xl font-mono font-bold text-primary tracking-wider">{bookingRef}</p>
            <p className="text-xs text-muted-foreground mt-4">
              Please save this reference. You can use it to look up your appointment later.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => window.location.href = '/'}>
              Return Home
            </Button>
            <Button size="lg" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
              Chat on WhatsApp
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

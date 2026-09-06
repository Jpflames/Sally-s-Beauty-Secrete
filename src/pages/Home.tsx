
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Star, ArrowRight, Sparkles, Clock, MapPin, Loader2 } from 'lucide-react';
import { fetchServices } from '../lib/db';
import { formatPrice, formatDuration } from '../lib/mockData';
import type { Service } from '../lib/mockData';

function FeaturedServicesList() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchServices();
      setServices(data.slice(0, 3)); // Only show top 3
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="col-span-1 md:col-span-3 flex justify-center py-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  
  if (services.length === 0) return <div className="col-span-1 md:col-span-3 text-center py-12 text-muted-foreground border border-dashed rounded-xl">Services coming soon!</div>;

  return (
    <>
      {services.map((service) => (
        <Card key={service.id} className="overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="aspect-[4/3] overflow-hidden relative">
            <img 
              src={service.imageUrl} 
              alt={service.name} 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="font-semibold text-lg">{service.name}</h3>
              <p className="text-sm opacity-90">{formatDuration(service.durationMinutes)} • {formatPrice(service.price)}</p>
            </div>
          </div>
          <CardContent className="p-4 pt-4">
            <Link to={`/book?service=${service.id}`}>
              <Button variant="secondary" className="w-full bg-secondary/50 hover:bg-primary hover:text-white transition-colors">
                Book This
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full pt-20 pb-24 lg:pt-32 lg:pb-40 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center" />
        
        {/* Color Overlay - Reduced Opacity to let image show through more elegantly */}
        <div className="absolute inset-0 bg-background/70 dark:bg-background/85" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/30 mix-blend-overlay" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-foreground animate-fade-in-up" style={{ animationDuration: '1.2s' }}>
              Beauty <span className="text-primary italic inline-block animate-pulse">designed</span> around you.
            </h1>
            <p className="text-lg md:text-xl text-foreground/70 font-light leading-relaxed max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Experience premium hair and beauty services with Sally. Book your next appointment seamlessly from your phone.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up animation-delay-400">
              <Link to="/book">
                <Button size="lg" className="w-full sm:w-auto text-base h-14 px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-[0_0_35px_10px_hsl(var(--primary))] hover:-translate-y-1 transition-all duration-500">
                  Book Appointment
                </Button>
              </Link>
              <Link to="/services">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-14 px-8 rounded-full bg-background/50 backdrop-blur-sm hover:shadow-[0_0_35px_10px_hsl(var(--primary))] hover:border-primary transition-all duration-500">
                  View Services
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-6 pt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span>5.0 Rated</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>Flexible Times</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Lagos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-3 flex items-center gap-2">
                <Sparkles className="text-primary" /> 
                Featured Services
              </h2>
              <p className="text-muted-foreground">Our most popular styling requests</p>
            </div>
            <Link to="/services" className="text-primary font-medium flex items-center gap-1 hover:underline">
              See all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeaturedServicesList />
          </div>
        </div>
      </section>

      {/* Booking Explanation */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Booking your next style is incredibly simple.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary text-2xl font-bold">1</div>
              <h3 className="text-xl font-semibold">Choose Your Style</h3>
              <p className="text-muted-foreground text-sm">Select from our services or upload a reference photo of the exact style you want.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary text-2xl font-bold">2</div>
              <h3 className="text-xl font-semibold">Pick a Time</h3>
              <p className="text-muted-foreground text-sm">Select a convenient date and time from Sally's live calendar.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary text-2xl font-bold">3</div>
              <h3 className="text-xl font-semibold">Confirm & Relax</h3>
              <p className="text-muted-foreground text-sm">Secure your slot with a simple deposit and get ready to look beautiful.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready for your transformation?</h2>
        <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
          Spaces fill up quickly. Secure your appointment today and let Sally work her magic.
        </p>
        <Link to="/book">
          <Button size="lg" variant="secondary" className="h-14 px-10 text-base rounded-full shadow-xl">
            Book Appointment Now
          </Button>
        </Link>
      </section>
    </div>
  );
}

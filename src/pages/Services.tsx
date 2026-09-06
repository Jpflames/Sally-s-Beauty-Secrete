import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { formatPrice, formatDuration } from '../lib/mockData';
import { fetchServices } from '../lib/db';
import type { Service } from '../lib/mockData';
import { Clock, Loader2 } from 'lucide-react';

export function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchServices();
        setServices(data);
      } catch (error) {
        console.error("Error loading services:", error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-4 animate-fade-in-up">Our Services</h1>
        <p className="text-foreground/70 font-light text-lg animate-fade-in-up animation-delay-200">
          Premium styling, installations, and beauty treatments. Find exactly what you need or upload your own style.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>
      ) : services.length === 0 ? (
        <div className="text-center p-12 text-muted-foreground border border-dashed rounded-xl">No services available yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up animation-delay-400">
          {services.map((service) => (
            <Card key={service.id} className="flex flex-col h-full overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img 
                  src={service.imageUrl} 
                  alt={service.name} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <CardContent className="flex flex-col flex-grow p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-xl">{service.name}</h3>
                  <span className="font-bold text-primary">{formatPrice(service.price)}</span>
                </div>
                <p className="text-muted-foreground text-sm flex-grow mb-4">
                  {service.description}
                </p>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <Clock size={16} />
                  <span>{formatDuration(service.durationMinutes)}</span>
                </div>
                
                <Link to={`/book?service=${service.id}`} className="mt-auto">
                  <Button className="w-full">Book this service</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-20 bg-secondary/30 rounded-2xl p-8 md:p-12 text-center animate-fade-in-up animation-delay-400">
        <h2 className="text-2xl font-bold mb-3">Can't find the style you want?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Upload a photo or short video of your desired style and Sally will review it and get back to you with a custom quote.
        </p>
        <Link to="/book?custom=true">
          <Button size="lg" variant="secondary" className="shadow-sm">
            Book & Upload My Style
          </Button>
        </Link>
      </div>
    </div>
  );
}

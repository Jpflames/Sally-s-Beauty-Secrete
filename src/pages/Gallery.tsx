import { useEffect, useState } from 'react';
import { fetchGallery, type GalleryItem } from '../lib/db';
import { Loader2 } from 'lucide-react';

export function Gallery() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchGallery();
        setGallery(data);
      } catch (error) {
        console.error("Error loading gallery:", error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 animate-fade-in-up">Our Work</h1>
        <p className="text-foreground/70 font-light text-lg animate-fade-in-up animation-delay-200">
          Take a look at some of our recent transformations.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>
      ) : gallery.length === 0 ? (
        <div className="text-center p-12 text-muted-foreground">Check back soon for our latest work!</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 animate-fade-in-up animation-delay-400">
          {gallery.map((item) => (
            <div key={item.id} className="aspect-square overflow-hidden rounded-xl bg-muted group relative">
              {item.url.includes('.mp4') ? (
                <video 
                  src={item.url} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  autoPlay loop muted playsInline
                />
              ) : (
                <img 
                  src={item.url} 
                  alt="Gallery work" 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

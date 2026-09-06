export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  imageUrl: string;
}

export const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    name: 'Knotless Braids',
    description: 'Neat and painless knotless braids.',
    price: 25000,
    durationMinutes: 180,
    imageUrl: 'https://images.unsplash.com/photo-1516975080661-460d3d579ef3?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '2',
    name: 'Wig Installation',
    description: 'Flawless frontal or closure wig install.',
    price: 15000,
    durationMinutes: 90,
    imageUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '3',
    name: 'Silk Press',
    description: 'Silky smooth straightening for natural hair.',
    price: 18000,
    durationMinutes: 120,
    imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '4',
    name: 'Soft Glam Makeup',
    description: 'Natural and glowing makeup look.',
    price: 12000,
    durationMinutes: 60,
    imageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '5',
    name: 'Bridal Styling',
    description: 'Specialized bridal hair styling for your big day. Consultation required.',
    price: 50000,
    durationMinutes: 240,
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=600',
  },
];

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(price);
};

export const formatDuration = (minutes: number) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs} hr ${mins} min`;
  if (hrs > 0) return `${hrs} hr`;
  return `${mins} min`;
};

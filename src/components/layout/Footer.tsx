
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="text-xl font-bold text-primary font-sans">
              Sally's Beauty Secret
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Premium salon services designed around you. Elegance, style, and care in every appointment.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/services" className="hover:text-primary transition-colors">Services</Link></li>
              <li><Link to="/gallery" className="hover:text-primary transition-colors">Gallery</Link></li>
              <li><Link to="/book" className="hover:text-primary transition-colors font-medium text-primary">Book Appointment</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary mt-0.5" />
                <span>123 Beauty Avenue, Lagos, Nigeria</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary" />
                <span>+234 800 000 0000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-primary" />
                <span>hello@sallysbeautysecret.com</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Opening Hours</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Clock size={16} /> Mon - Fri: 9:00 AM - 6:00 PM
              </li>
              <li className="flex items-center gap-2">
                <Clock size={16} /> Saturday: 9:00 AM - 7:00 PM
              </li>
              <li className="flex items-center gap-2 text-primary">
                <Clock size={16} /> Sunday: Closed
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Sally's Beauty Secret. All rights reserved.
          </p>
          <div className="flex space-x-4">
            {/* Add social icons as needed */}
            {/* Add more social icons as needed */}
          </div>
        </div>
      </div>
    </footer>
  );
}

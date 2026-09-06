import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Gallery', path: '/gallery' },
  ];

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-40 w-full bg-white shadow-sm dark:bg-[#1a0f26] dark:border-b dark:border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-xl font-bold text-[#4D2673] dark:text-[#E6CCFF] font-sans">
              Sally's Beauty Secret
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8 items-center">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "relative group text-sm font-medium transition-colors text-[#4D2673] dark:text-[#E6CCFF]",
                  location.pathname === link.path ? "font-semibold" : ""
                )}
              >
                {link.name}
                <span 
                  className={cn(
                    "absolute -bottom-1 h-0.5 bg-[#4D2673] dark:bg-[#E6CCFF] transition-all duration-300",
                    location.pathname === link.path ? "left-0 w-full" : "left-1/2 w-0 group-hover:left-0 group-hover:w-full"
                  )}
                />
              </Link>
            ))}
            <Link to="/book">
              <Button size="sm" className="bg-[#4D2673] hover:bg-[#3a1c57] text-white dark:bg-[#E6CCFF] dark:text-[#4D2673] dark:hover:bg-[#d9b3ff] hover:shadow-[0_0_25px_5px_hsl(var(--primary))] transition-all duration-300">
                Book Appointment
              </Button>
            </Link>
          </div>

          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[#4D2673] dark:text-[#E6CCFF] transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#4D2673]/10 shadow-sm dark:bg-[#1a0f26] dark:border-white/10 animate-in slide-in-from-top-2">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium transition-colors text-[#4D2673] dark:text-[#E6CCFF]",
                  location.pathname === link.path 
                    ? "bg-[#4D2673]/10 dark:bg-[#E6CCFF]/10 font-semibold" 
                    : "hover:bg-[#4D2673]/5 dark:hover:bg-[#E6CCFF]/5"
                )}
              >
                {link.name}
              </Link>
            ))}
            <Link to="/book" onClick={closeMenu} className="block mt-4 px-3">
              <Button className="w-full bg-[#4D2673] hover:bg-[#3a1c57] text-white dark:bg-[#E6CCFF] dark:text-[#4D2673] dark:hover:bg-[#d9b3ff] hover:shadow-[0_0_25px_5px_hsl(var(--primary))] transition-all duration-300">
                Book Appointment
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Users, Settings, Package, LayoutDashboard, LogOut, Image as ImageIcon, Plus, Trash2, UploadCloud, Loader2 } from 'lucide-react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Login } from './Login';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { fetchServices, addService, deleteService, fetchGallery, addGalleryImage, deleteGalleryImage, uploadFile, type GalleryItem, fetchAppointments, updateAppointmentStatus, type Appointment } from '../lib/db';
import { sendConfirmationEmail } from '../lib/email';
import type { Service } from '../lib/mockData';

export function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'bookings', label: 'Bookings', icon: <CalendarIcon size={20} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={20} /> },
    { id: 'services', label: 'Services', icon: <Package size={20} /> },
    { id: 'gallery', label: 'Gallery', icon: <ImageIcon size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  // Services State
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  
  const [newService, setNewService] = useState({ name: '', price: '', duration: '', description: '', category: 'Hair' });
  const [serviceFile, setServiceFile] = useState<File | null>(null);
  const [isUploadingService, setIsUploadingService] = useState(false);

  // Gallery State
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  // Appointments State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  useEffect(() => {
    if (activeTab === 'services') loadServices();
    if (activeTab === 'gallery') loadGallery();
    if (['dashboard', 'bookings', 'customers'].includes(activeTab)) {
      loadAppointments();
      if (services.length === 0) loadServices();
    }
  }, [activeTab]);

  const loadAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const data = await fetchAppointments();
      setAppointments(data);
    } catch (error) {
      console.error("Failed to load appointments", error);
    }
    setLoadingAppointments(false);
  };

  const loadServices = async () => {
    setLoadingServices(true);
    try {
      const data = await fetchServices();
      setServices(data);
    } catch (error) {
      console.error("Failed to load services", error);
    }
    setLoadingServices(false);
  };

  const loadGallery = async () => {
    setLoadingGallery(true);
    try {
      const data = await fetchGallery();
      setGallery(data);
    } catch (error) {
      console.error("Failed to load gallery", error);
    }
    setLoadingGallery(false);
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFile || !newService.name || !newService.price || !newService.duration) return;
    
    setIsUploadingService(true);
    try {
      const imageUrl = await uploadFile(serviceFile, 'services');
      await addService({
        name: newService.name,
        price: Number(newService.price),
        durationMinutes: Number(newService.duration),
        description: newService.description,
        imageUrl
      });
      setNewService({ name: '', price: '', duration: '', description: '', category: 'Hair' });
      setServiceFile(null);
      loadServices();
    } catch (error: any) {
      console.error("Error adding service:", error);
      alert(`Upload failed: ${error.message || 'Make sure Firebase is properly configured.'}`);
    } finally {
      setIsUploadingService(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      await deleteService(id);
      loadServices();
    }
  };

  const handleAddGalleryImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryFile) return;

    setIsUploadingGallery(true);
    try {
      const url = await uploadFile(galleryFile, 'gallery');
      await addGalleryImage(url);
      setGalleryFile(null);
      loadGallery();
    } catch (error: any) {
      console.error("Error adding gallery image:", error);
      alert(`Upload failed: ${error.message || 'Make sure Firebase is properly configured.'}`);
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleDeleteGalleryImage = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      await deleteGalleryImage(id);
      loadGallery();
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border shrink-0 flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-primary">Sally's Admin</h1>
        </div>
        <nav className="p-4 flex-grow space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === item.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (() => {
            const today = new Date().toDateString();
            const todaysAppointments = appointments.filter(a => new Date(a.date).toDateString() === today);
            const pendingRequests = appointments.filter(a => a.status === 'pending');
            const awaitingReview = appointments.filter(a => a.status === 'pending' && a.customImageUrl);
            const expectedRevenue = appointments.filter(a => ['pending', 'confirmed'].includes(a.status)).reduce((total, a) => {
              const service = services.find(s => s.id === a.serviceId);
              return total + (service?.price || 0);
            }, 0);

            return (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-3xl font-bold mb-8">Good morning, Sally!</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Today's Appointments</p>
                    <p className="text-3xl font-bold">{todaysAppointments.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Pending Requests</p>
                    <p className="text-3xl font-bold text-amber-600">{pendingRequests.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Awaiting Review</p>
                    <p className="text-3xl font-bold text-blue-600">{awaitingReview.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Expected Revenue</p>
                    <p className="text-3xl font-bold text-green-600">₦{expectedRevenue.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>

              <h3 className="text-xl font-semibold mb-4">Today's Schedule</h3>
              <div className="space-y-4">
                {loadingAppointments ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary w-6 h-6" /></div>
                ) : todaysAppointments.length === 0 ? (
                  <div className="text-center p-8 border border-dashed rounded-xl text-muted-foreground">No appointments scheduled for today.</div>
                ) : todaysAppointments.map((apt) => (
                  <Card key={apt.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 text-center shrink-0">
                          <p className="font-bold text-primary">{apt.time}</p>
                        </div>
                        <div className="w-px h-10 bg-border hidden sm:block"></div>
                        <div>
                          <p className="font-semibold text-lg">{apt.customerName}</p>
                          <p className="text-sm text-muted-foreground">{apt.serviceName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 justify-between sm:justify-end">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : apt.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'}`}>
                          {apt.status.toUpperCase()}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('bookings')}>View</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              </div>
            );
          })()}
          {/* END DASHBOARD TAB */}

          {/* SERVICES TAB */}
          {activeTab === 'services' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Manage Services</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Current Services</h3>
                  {loadingServices ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
                  ) : services.length === 0 ? (
                    <div className="text-center p-12 border border-dashed rounded-xl text-muted-foreground">No services found. Add one!</div>
                  ) : (
                    services.map(service => (
                      <Card key={service.id}>
                        <CardContent className="p-4 flex gap-4 items-center">
                          <div className="w-20 h-20 rounded-md overflow-hidden shrink-0">
                            <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-semibold">{service.name}</h4>
                            <p className="text-sm text-muted-foreground">₦{service.price} • {service.durationMinutes} mins</p>
                          </div>
                          <Button variant="outline" size="icon" onClick={() => handleDeleteService(service.id!)} className="text-destructive hover:bg-destructive/10 hover:text-destructive border-transparent">
                            <Trash2 size={18} />
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                <div>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4">Add New Service</h3>
                      <form onSubmit={handleAddService} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Name</label>
                          <Input value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Price (₦)</label>
                            <Input type="number" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} required />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Duration (min)</label>
                            <Input type="number" value={newService.duration} onChange={e => setNewService({...newService, duration: e.target.value})} required />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Description</label>
                          <textarea 
                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            rows={3}
                            value={newService.description}
                            onChange={e => setNewService({...newService, description: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Image</label>
                          <div className="border-2 border-dashed rounded-lg p-4 text-center">
                            <input type="file" id="service-img" className="hidden" accept="image/*" onChange={e => e.target.files && setServiceFile(e.target.files[0])} />
                            <Button type="button" variant="outline" onClick={() => document.getElementById('service-img')?.click()} className="w-full">
                              <UploadCloud size={16} className="mr-2" />
                              {serviceFile ? serviceFile.name : 'Choose Image'}
                            </Button>
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isUploadingService || !serviceFile || !newService.name}>
                          {isUploadingService ? <Loader2 className="animate-spin mr-2" size={16} /> : <Plus size={16} className="mr-2" />}
                          Add Service
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* GALLERY TAB */}
          {activeTab === 'gallery' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Manage Gallery</h2>
                <form onSubmit={handleAddGalleryImage} className="flex items-center gap-2">
                  <input type="file" id="gallery-img" className="hidden" accept="image/*,video/mp4" onChange={e => e.target.files && setGalleryFile(e.target.files[0])} />
                  <Button type="button" variant="outline" onClick={() => document.getElementById('gallery-img')?.click()}>
                    <UploadCloud size={16} className="mr-2" />
                    {galleryFile ? galleryFile.name : 'Choose File'}
                  </Button>
                  <Button type="submit" disabled={isUploadingGallery || !galleryFile}>
                    {isUploadingGallery ? <Loader2 className="animate-spin mr-2" size={16} /> : 'Upload'}
                  </Button>
                </form>
              </div>

              {loadingGallery ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
              ) : gallery.length === 0 ? (
                <div className="text-center p-12 border border-dashed rounded-xl text-muted-foreground">No gallery images found. Upload some!</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {gallery.map(item => (
                    <div key={item.id} className="relative group rounded-xl overflow-hidden aspect-[3/4] bg-muted">
                      <img src={item.url} alt="Gallery item" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="danger" size="icon" onClick={() => handleDeleteGalleryImage(item.id)}>
                          <Trash2 size={20} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-3xl font-bold mb-8">Bookings</h2>
              
              <div className="space-y-4">
                {loadingAppointments ? (
                  <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
                ) : appointments.length === 0 ? (
                  <div className="text-center p-12 border border-dashed rounded-xl text-muted-foreground">No appointments found.</div>
                ) : (
                  appointments.map(apt => (
                    <Card key={apt.id} className="overflow-hidden">
                      <div className={`h-1 w-full ${apt.status === 'confirmed' ? 'bg-green-500' : apt.status === 'pending' ? 'bg-amber-500' : apt.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                          <div className="space-y-4 flex-grow">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-xl font-bold">{apt.customerName}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                  <CalendarIcon size={14} /> {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {apt.time}
                                </p>
                              </div>
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : apt.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'}`}>
                                {apt.status.toUpperCase()}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                              <div>
                                <p className="text-muted-foreground">Service</p>
                                <p className="font-medium">{apt.serviceName}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Contact</p>
                                <p className="font-medium">{apt.customerPhone}</p>
                                {apt.customerEmail && <p className="font-medium">{apt.customerEmail}</p>}
                              </div>
                              {apt.notes && (
                                <div className="sm:col-span-2">
                                  <p className="text-muted-foreground">Notes</p>
                                  <p className="font-medium whitespace-pre-wrap">{apt.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {apt.customImageUrl && (
                            <div className="w-full md:w-48 shrink-0">
                              <p className="text-sm text-muted-foreground mb-2">Reference Image</p>
                              <a href={apt.customImageUrl} target="_blank" rel="noopener noreferrer">
                                <img src={apt.customImageUrl} alt="Custom style request" className="w-full h-32 object-cover rounded-lg border hover:opacity-80 transition-opacity" />
                              </a>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-6 pt-4 border-t flex flex-wrap gap-2 justify-end">
                          {apt.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={async () => {
                                await updateAppointmentStatus(apt.id, 'confirmed');
                                if (apt.customerEmail) {
                                  await sendConfirmationEmail(apt.customerName, apt.customerEmail);
                                }
                                loadAppointments();
                              }}
                            >
                              Confirm Appointment
                            </Button>
                          )}
                          {(apt.status === 'pending' || apt.status === 'confirmed') && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={async () => {
                                await updateAppointmentStatus(apt.id, 'completed');
                                loadAppointments();
                              }}
                            >
                              Mark Completed
                            </Button>
                          )}
                          {apt.status !== 'cancelled' && (
                            <Button 
                              size="sm" 
                              variant="danger"
                              onClick={async () => {
                                if (window.confirm('Cancel this appointment?')) {
                                  await updateAppointmentStatus(apt.id, 'cancelled');
                                  loadAppointments();
                                }
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* CUSTOMERS TAB */}
          {activeTab === 'customers' && (() => {
            const uniqueCustomers = Array.from(new Set(appointments.map(a => a.customerPhone)))
              .map(phone => {
                const customerApts = appointments.filter(a => a.customerPhone === phone);
                const latest = customerApts[0]; // Appointments are ordered desc by date
                return {
                  name: latest.customerName,
                  phone: latest.customerPhone,
                  email: latest.customerEmail,
                  totalVisits: customerApts.length,
                  lastVisit: latest.createdAt
                };
              });

            return (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-3xl font-bold mb-8">Customer Directory</h2>
                
                {loadingAppointments ? (
                  <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
                ) : uniqueCustomers.length === 0 ? (
                  <div className="text-center p-12 border border-dashed rounded-xl text-muted-foreground">No customers found.</div>
                ) : (
                  <div className="bg-card border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                          <tr>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Contact</th>
                            <th className="px-6 py-4 font-medium">Total Bookings</th>
                            <th className="px-6 py-4 font-medium">Last Booking</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {uniqueCustomers.map((cust, i) => (
                            <tr key={i} className="hover:bg-muted/30 transition-colors">
                              <td className="px-6 py-4 font-medium">{cust.name}</td>
                              <td className="px-6 py-4 text-muted-foreground">
                                {cust.phone}
                                {cust.email && <div className="text-xs">{cust.email}</div>}
                              </td>
                              <td className="px-6 py-4 text-center sm:text-left">{cust.totalVisits}</td>
                              <td className="px-6 py-4 text-muted-foreground">{new Date(cust.lastVisit).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {activeTab === 'settings' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                  <Settings size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Settings</h2>
                <p className="text-muted-foreground">This section is coming soon.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

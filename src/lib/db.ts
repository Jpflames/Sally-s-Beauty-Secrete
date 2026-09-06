import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Service } from './mockData';

const CLOUDINARY_CLOUD_NAME = 'pvmjfdfu';
const CLOUDINARY_UPLOAD_PRESET = 'sally_beauty';

// --- Services ---

export const fetchServices = async (): Promise<Service[]> => {
  const q = query(collection(db, 'services'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Service[];
};

export const addService = async (serviceData: Omit<Service, 'id'>) => {
  const docRef = await addDoc(collection(db, 'services'), serviceData);
  return docRef.id;
};

export const deleteService = async (id: string) => {
  await deleteDoc(doc(db, 'services', id));
};

// --- Gallery ---

export interface GalleryItem {
  id: string;
  url: string;
  createdAt: number;
}

export const fetchGallery = async (): Promise<GalleryItem[]> => {
  const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as GalleryItem[];
};

export const addGalleryImage = async (url: string) => {
  const docRef = await addDoc(collection(db, 'gallery'), {
    url,
    createdAt: Date.now()
  });
  return docRef.id;
};

export const deleteGalleryImage = async (id: string) => {
  await deleteDoc(doc(db, 'gallery', id));
};

// --- Appointments ---

export interface Appointment {
  id: string;
  serviceId?: string;
  serviceName: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  customImageUrl?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: number;
}

export const fetchAppointments = async (): Promise<Appointment[]> => {
  const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Appointment[];
};

export const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'appointments'), {
    ...appointmentData,
    createdAt: Date.now()
  });
  return docRef.id;
};

export const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
  const docRef = doc(db, 'appointments', id);
  await updateDoc(docRef, { status });
};

// --- Storage (Cloudinary) ---

export const uploadFile = async (
  file: File,
  _folder: string // unused now but kept for API compatibility
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  // Cloudinary auto-detects resource_type (image/video) with 'auto/upload'
  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to upload to Cloudinary');
  }

  const data = await response.json();
  return data.secure_url;
};

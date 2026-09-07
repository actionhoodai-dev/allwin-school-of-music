// ============================================
// Allwin School of Music — TypeScript Types
// ============================================

import { Timestamp } from 'firebase/firestore';

// ---- Firestore Document Base ----
export interface FirestoreDoc {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ---- Enquiry ----
export type EnquiryStatus = 'new' | 'contacted' | 'converted' | 'closed';

export interface Enquiry extends FirestoreDoc {
  name: string;
  phone: string;
  email: string;
  course: string;
  instrument: string;
  contactMethod: string;
  message: string;
  status: EnquiryStatus;
}

// ---- Course ----
export interface Course extends FirestoreDoc {
  title: string;
  slug: string;
  description: string;
  overview: string;
  suitableLearners: string;
  learningFocus: string;
  affiliation: string;
  examInfo: string;
  category: string;
  icon: string;
  order: number;
  published: boolean;
}

// ---- Instrument ----
export interface Instrument extends FirestoreDoc {
  name: string;
  slug: string;
  description: string;
  icon: string;
  imageUrl: string;
  imagePublicId: string;
  order: number;
  published: boolean;
}

// ---- Faculty ----
export interface Faculty extends FirestoreDoc {
  name: string;
  photo: string;
  photoPublicId: string;
  instrument: string;
  qualification: string;
  experience: string;
  specialization: string;
  bio: string;
  order: number;
  published: boolean;
}

// ---- Achievement ----
export type AchievementCategory =
  | 'grade-examination'
  | 'performance'
  | 'competition'
  | 'certification'
  | 'event'
  | 'milestone';

export interface Achievement extends FirestoreDoc {
  studentName: string;
  title: string;
  category: AchievementCategory;
  description: string;
  year: string;
  imageUrl: string;
  imagePublicId: string;
  certificateUrl: string;
  certificatePublicId: string;
  published: boolean;
}

// ---- Gallery ----
export type GalleryCategory =
  | 'classes'
  | 'keyboard'
  | 'guitar'
  | 'violin'
  | 'vocal'
  | 'bharatham'
  | 'performances'
  | 'events'
  | 'students'
  | 'academy';

export interface GalleryImage extends FirestoreDoc {
  title: string;
  category: GalleryCategory;
  description: string;
  imageUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  published: boolean;
}

// ---- Testimonial ----
export interface Testimonial extends FirestoreDoc {
  name: string;
  profileImage: string;
  profileImagePublicId: string;
  rating: number;
  testimonial: string;
  course: string;
  date: string;
  published: boolean;
}

// ---- FAQ ----
export interface FAQ extends FirestoreDoc {
  question: string;
  answer: string;
  order: number;
  published: boolean;
}

// ---- Affiliation ----
export interface Affiliation extends FirestoreDoc {
  name: string;
  description: string;
  details: string;
  ctaText: string;
  ctaLink: string;
  order: number;
}

// ---- Site Settings ----
export interface SiteSettings {
  businessName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  googleMapsUrl: string;
  whatsappNumber: string;
  googleReviewsUrl: string;
  heroHeading: string;
  heroDescription: string;
  heroSubtext: string;
  footerText: string;
  logoUrl: string;
  faviconUrl: string;
}

// ---- Social Links ----
export interface SocialLinks {
  facebook: string;
  instagram: string;
  youtube: string;
  twitter: string;
  linkedin: string;
}

// ---- Admin User ----
export interface AdminUser extends FirestoreDoc {
  email: string;
  name: string;
}

// ---- Navigation ----
export interface NavItem {
  label: string;
  href: string;
}

// ---- Cloudinary Upload Result ----
export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

// ---- Re-export Student Portal Types ----
export * from './student';


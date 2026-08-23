// ============================================
// Allwin School of Music — Constants
// ============================================

import type { NavItem } from '@/types';

// ---- Navigation Items ----
export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Courses', href: '/courses' },
  { label: 'Instruments', href: '/instruments' },
  { label: 'Achievements', href: '/achievements' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'Contact', href: '/contact' },
];

// ---- Business Information ----
export const BUSINESS = {
  name: 'Allwin School of Music',
  fullName: 'Allwin School of Music & Musicals',
  tagline: 'Learn Music With The Right Foundation',
  established: '2007',
  address: 'Chinnathirupathi, Salem - 636008, Tamil Nadu, India',
  phone: '9489203683',
  phoneFormatted: '+91 94892 03683',
  phoneLink: 'tel:+919489203683',
  email: 'mosesin143@gmail.com',
  emailLink: 'mailto:mosesin143@gmail.com',
  whatsapp: '919489203683',
  whatsappLink: (message: string) =>
    `https://wa.me/919489203683?text=${encodeURIComponent(message)}`,
  googleMapsEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3907.2245190799154!2d78.1650894750553!3d11.678494388530458!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3babf12b68808675%3A0x5b4724efce451cfe!2sAllwin%20School%20Of%20Music!5e0!3m2!1sen!2sin!4v1787497174133!5m2!1sen!2sin',
  googleMapsDirectionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=Allwin+School+Of+Music+Salem',
  googleReviewsUrl:
    'https://maps.google.com/?q=Allwin+School+Of+Music+Salem',
  defaultWhatsappMessage:
    'Hello Allwin School of Music, I would like to enquire about music classes.',
} as const;

// ---- Instrument/Course Options ----
export const INSTRUMENT_OPTIONS = [
  'Keyboard',
  'Guitar',
  'Violin',
  'Vocal',
  'Bharatham',
  'Theory of Music',
  'Other',
] as const;

// ---- Contact Methods ----
export const CONTACT_METHODS = [
  'Phone Call',
  'WhatsApp',
  'Email',
] as const;

// ---- Enquiry Status Options ----
export const ENQUIRY_STATUSES = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'converted', label: 'Converted', color: 'bg-green-100 text-green-800' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800' },
] as const;

// ---- Gallery Categories ----
export const GALLERY_CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'classes', label: 'Classes' },
  { value: 'keyboard', label: 'Keyboard' },
  { value: 'guitar', label: 'Guitar' },
  { value: 'violin', label: 'Violin' },
  { value: 'vocal', label: 'Vocal' },
  { value: 'bharatham', label: 'Bharatham' },
  { value: 'performances', label: 'Performances' },
  { value: 'events', label: 'Events' },
  { value: 'students', label: 'Students' },
  { value: 'academy', label: 'Academy' },
] as const;

// ---- Achievement Categories ----
export const ACHIEVEMENT_CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'grade-examination', label: 'Grade Examinations' },
  { value: 'performance', label: 'Performances' },
  { value: 'competition', label: 'Competitions' },
  { value: 'certification', label: 'Certifications' },
  { value: 'event', label: 'Events' },
  { value: 'milestone', label: 'Milestones' },
] as const;

// ---- Default Instruments Data ----
export const DEFAULT_INSTRUMENTS = [
  {
    name: 'Keyboard',
    slug: 'keyboard',
    description: 'Learn keyboard fundamentals, technique, notation, rhythm, and practical playing.',
    icon: 'Piano',
  },
  {
    name: 'Guitar',
    slug: 'guitar',
    description: 'Develop guitar fundamentals, chords, rhythm, technique, and musical expression.',
    icon: 'Guitar',
  },
  {
    name: 'Violin',
    slug: 'violin',
    description: 'Build foundational violin technique, posture, notation, rhythm, and performance skills.',
    icon: 'Violin',
  },
  {
    name: 'Bharatham',
    slug: 'bharatham',
    description: 'Structured training in Bharatham / Bharatanatyam fundamentals and traditional performance practices.',
    icon: 'Sparkles',
  },
  {
    name: 'Vocal',
    slug: 'vocal',
    description: 'Develop vocal fundamentals, pitch, rhythm, voice control, and musical expression.',
    icon: 'Mic',
  },
  {
    name: 'Theory of Music',
    slug: 'theory-of-music',
    description: 'Understand music notation, rhythm, scales, musical terminology, and theoretical foundations.',
    icon: 'BookOpen',
  },
] as const;

// ---- Default Google Reviews & Testimonials ----
export const DEFAULT_TESTIMONIALS = [
  {
    id: 'rev-1',
    name: 'Vanaja Jayakumari',
    course: 'Music Student',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'Allwin school of music is amazing and also helps students to prove their talents. Classes are regular. Practical sessions makes students to prove their ability in music. It is professional and innovative teaching methods. The music school is soo good.',
  },
  {
    id: 'rev-2',
    name: 'Shanthi A',
    course: 'Parent / Music Student',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'Very friendly atmosphere to learn music. My sincere appreciation to the master for his meticulous efforts in training the students.',
  },
  {
    id: 'rev-3',
    name: 'lakshmi dorai',
    course: 'Music Student',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'Very dedicated teacher. Can understand clearly when teaching. Understands student’s perspective while teaching.',
  },
  {
    id: 'rev-4',
    name: 'Rk (Karthi)',
    course: 'Music Student',
    rating: 5,
    date: '5 months ago',
    testimonial:
      'Very good service & excellent response... Learn Music with the Right Foundation.',
  },
  {
    id: 'rev-5',
    name: 'kalpana Raje',
    course: 'Student',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'Very friendly and student centric teaching approach. Thank you, Sir.',
  },
  {
    id: 'rev-6',
    name: 'Siddharth Sudharsan',
    course: 'Music Student',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'Great teaching and wonderful learning experience with Moses Sir.',
  },
  {
    id: 'rev-7',
    name: 'Jagadish .J',
    course: 'Student',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'Congratulations Master... very nice music center in Salem to learn proper music.',
  },
  {
    id: 'rev-8',
    name: 'Lime 1 (Abhinandan)',
    course: 'Student',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'Very helpful to learn music, and very interesting and engaging during class time.',
  },
  {
    id: 'rev-9',
    name: 'Lanthees Kumar',
    course: 'Student',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'Really fantastic music place to learn music. Congratulations master!',
  },
  {
    id: 'rev-10',
    name: 'ananth s',
    course: 'Student',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'Good teaching and excellent classroom ambience with dedicated personal attention.',
  },
  {
    id: 'rev-11',
    name: 'Jayam Kalai Kottam',
    course: 'Music Learner',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'Very good response and clearly explained concepts... very satisfied with the training.',
  },
  {
    id: 'rev-12',
    name: 'B. Niruba Ruban',
    course: 'Student',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'He is a very good master, patient, kind, and supportive towards every student.',
  },
  {
    id: 'rev-13',
    name: 'Surya Narayanan',
    course: 'Student',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'Grateful to be a student of Moses sir. Outstanding musical training and guidance.',
  },
  {
    id: 'rev-14',
    name: 'KARTHI THANGAVEL',
    course: 'Student',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'Good service and disciplined coaching for music classes with great foundation.',
  },
  {
    id: 'rev-15',
    name: 'Geetha Anand',
    course: 'Student / Parent',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'Great place to learn music in Salem. Highly structured and inspiring sessions.',
  },
  {
    id: 'rev-16',
    name: 'நிசி நத்தானியேல் (Nisi Nathaniyel)',
    course: 'Student',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'Excellent music center with deep subject knowledge and warm encouragement.',
  },
  {
    id: 'rev-17',
    name: 'Hari Narayanan',
    course: 'Local Guide',
    rating: 5,
    date: '10 months ago',
    testimonial:
      'Excellent master and music school. Highly recommend Allwin School of Music.',
  },
  {
    id: 'rev-18',
    name: 'Hariharan Sasikumar',
    course: 'Student',
    rating: 5,
    date: '8 months ago',
    testimonial:
      'Wonderful learning environment with patient guidance for beginners and advanced learners alike.',
  },
  {
    id: 'rev-19',
    name: 'Dr. Kumudhini',
    course: 'Parent / Learner',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'Structured curriculum and individual attention. Ideal music academy for grade examination preparation.',
  },
  {
    id: 'rev-20',
    name: 'Fenin Springson',
    course: 'Student',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'The best place in Salem to build genuine musical skills with the right foundation and technique.',
  },
  {
    id: 'rev-21',
    name: 'Stella Azariah',
    course: 'Parent',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'Blessed and disciplined atmosphere to learn music. Moses sir puts in sincere dedication for every student.',
  },
  {
    id: 'rev-22',
    name: 'anu priya',
    course: 'Local Guide',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'Very pleasant learning environment, regular practical sessions, and friendly guidance.',
  },
  {
    id: 'rev-23',
    name: 'babu kanthan',
    course: 'Student',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'Top-notch music teaching in Salem with clear explanations and comprehensive practice.',
  },
  {
    id: 'rev-24',
    name: 'karthick subbarayan',
    course: 'Local Guide',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'Exceptional music academy. Teaches notes, theory, and practical playing thoroughly.',
  },
  {
    id: 'rev-25',
    name: 'Krithika Ravi',
    course: 'Student',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'Very friendly approach and meticulous guidance. Inspires confidence in performing.',
  },
  {
    id: 'rev-26',
    name: 'sudharsan n',
    course: 'Student',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'Friendly training atmosphere and solid foundation in musical instruments.',
  },
  {
    id: 'rev-27',
    name: 'Beula Sam',
    course: 'Student',
    rating: 5,
    date: '1 year ago',
    testimonial:
      'Very dedicated music academy. Helped cultivate strong musical appreciation and confidence.',
  },
  {
    id: 'rev-28',
    name: 'Meenapattu',
    course: 'Parent / Learner',
    rating: 5,
    date: '2 years ago',
    testimonial:
      'Highly professional music education institution in Salem. Very pleased with the learning progress.',
  },
];

// ---- Admin Sidebar Items ----
export const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { label: 'Enquiries', href: '/admin/enquiries', icon: 'MessageSquare' },
  { label: 'Courses', href: '/admin/courses', icon: 'GraduationCap' },
  { label: 'Faculty', href: '/admin/faculty', icon: 'Users' },
  { label: 'Gallery', href: '/admin/gallery', icon: 'Image' },
  { label: 'Achievements', href: '/admin/achievements', icon: 'Trophy' },
  { label: 'Testimonials', href: '/admin/testimonials', icon: 'Star' },
  { label: 'FAQs', href: '/admin/faqs', icon: 'HelpCircle' },
  { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
] as const;

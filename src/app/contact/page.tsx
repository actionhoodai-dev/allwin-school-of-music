'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { submitEnquiry } from '@/lib/firebase/firestore';
import { BUSINESS, INSTRUMENT_OPTIONS, CONTACT_METHODS } from '@/lib/constants';

function ContactForm() {
  const searchParams = useSearchParams();
  const prefilledCourse = searchParams.get('course') || '';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    course: prefilledCourse || 'Keyboard',
    instrument: prefilledCourse || 'Keyboard',
    contactMethod: 'WhatsApp',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (prefilledCourse) {
      setFormData((prev) => ({
        ...prev,
        course: prefilledCourse,
        instrument: prefilledCourse,
      }));
    }
  }, [prefilledCourse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Please provide your name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      setErrorMessage('Please provide a valid contact phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitEnquiry({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        course: formData.course,
        instrument: formData.instrument || formData.course,
        contactMethod: formData.contactMethod,
        message: formData.message.trim(),
      });
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Enquiry error:', err);
      // Even if Firestore network is unavailable, show a friendly fallback with direct WhatsApp/Call
      setErrorMessage(
        'Unable to submit form right now. Please call or WhatsApp us directly at ' +
          BUSINESS.phoneFormatted
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const mapUrl =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ||
    BUSINESS.googleMapsEmbedUrl;

  return (
    <div className="bg-surface">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 gradient-hero text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-orange text-xs sm:text-sm font-semibold uppercase tracking-wider border border-white/15">
            Admissions & Inquiries
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight">
            Start Your <span className="bg-gradient-to-r from-white via-purple-200 to-orange bg-clip-text text-transparent">Musical Journey</span>
          </h1>

          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-sans">
            Get in touch with Allwin School of Music for course admissions, grade examination preparation, or class schedules in Salem.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-20 bg-surface-dim">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Form */}
            <div className="lg:col-span-7">
              <div className="p-8 sm:p-10 rounded-3xl bg-white border border-border shadow-xl space-y-6">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-navy">
                    Enquiry & Admission Form
                  </h2>
                  <p className="text-xs sm:text-sm text-text-secondary mt-1">
                    Fill out your details below and our team will contact you shortly.
                  </p>
                </div>

                {isSuccess ? (
                  <div className="p-8 rounded-2xl bg-green-50 border border-green-200 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="font-heading font-bold text-2xl text-green-900">
                      Thank you! Your enquiry has been received.
                    </h3>
                    <p className="text-sm text-green-800 max-w-md mx-auto">
                      We will get back to you shortly. You can also reach us instantly via WhatsApp or Phone Call.
                    </p>
                    <div className="pt-2 flex flex-wrap justify-center gap-3">
                      <Button
                        href={BUSINESS.whatsappLink(
                          `Hello Allwin School of Music, I just submitted an enquiry for ${formData.course}.`
                        )}
                        external
                        variant="whatsapp"
                        size="sm"
                        icon={<WhatsAppIcon className="w-4 h-4 fill-white" />}
                      >
                        Chat on WhatsApp Now
                      </Button>
                      <Button
                        onClick={() => {
                          setIsSuccess(false);
                          setFormData({
                            name: '',
                            phone: '',
                            email: '',
                            course: 'Keyboard',
                            instrument: 'Keyboard',
                            contactMethod: 'WhatsApp',
                            message: '',
                          });
                        }}
                        variant="secondary"
                        size="sm"
                      >
                        Submit Another Enquiry
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {errorMessage && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Your Full Name *"
                        placeholder="e.g. John Doe"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                      <Input
                        label="Phone Number *"
                        type="tel"
                        placeholder="e.g. 9489203683"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="e.g. student@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                      <Select
                        label="Interested Course / Instrument *"
                        options={INSTRUMENT_OPTIONS}
                        value={formData.course}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            course: e.target.value,
                            instrument: e.target.value,
                          })
                        }
                      />
                    </div>

                    <Select
                      label="Preferred Contact Method"
                      options={CONTACT_METHODS}
                      value={formData.contactMethod}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactMethod: e.target.value,
                        })
                      }
                    />

                    <Textarea
                      label="Message / Learning Goals (Optional)"
                      placeholder="Tell us about previous experience, preferred timings, or specific questions..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                    />

                    <div className="pt-2">
                      <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        disabled={isSubmitting}
                        icon={<Send className="w-5 h-5" />}
                      >
                        {isSubmitting ? 'Submitting Enquiry...' : 'Submit Enquiry'}
                      </Button>
                    </div>

                    {/* Instant Alternatives */}
                    <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        href={BUSINESS.whatsappLink(
                          formData.course
                            ? `Hello Allwin School of Music, I am interested in ${formData.course} classes.`
                            : BUSINESS.defaultWhatsappMessage
                        )}
                        external
                        variant="whatsapp"
                        size="sm"
                        icon={<WhatsAppIcon className="w-4 h-4 fill-white" />}
                      >
                        WhatsApp Us Directly
                      </Button>

                      <Button
                        href={BUSINESS.phoneLink}
                        external
                        variant="secondary"
                        size="sm"
                        icon={<Phone className="w-4 h-4 text-violet" />}
                      >
                        Call {BUSINESS.phoneFormatted}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Right Column: Contact Details & Quick Info */}
            <div className="lg:col-span-5 space-y-6">
              {/* Info Card */}
              <div className="p-8 rounded-3xl bg-navy text-white shadow-xl border border-white/10 space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-widest text-orange font-bold">
                    Direct Contact
                  </span>
                  <h3 className="font-heading font-bold text-2xl text-white mt-1">
                    Allwin School of Music
                  </h3>
                  <p className="text-xs text-white/70 italic mt-0.5">
                    &ldquo;{BUSINESS.tagline}&rdquo;
                  </p>
                </div>

                <div className="space-y-4 text-sm text-white/80 border-t border-white/10 pt-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Academy Address:</p>
                      <p className="text-white/70">{BUSINESS.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-violet shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Phone Support:</p>
                      <a href={BUSINESS.phoneLink} className="hover:text-white text-white/90">
                        {BUSINESS.phoneFormatted}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-magenta shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Email Address:</p>
                      <a href={BUSINESS.emailLink} className="hover:text-white break-all text-white/90">
                        {BUSINESS.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Working Hours:</p>
                      <p className="text-white/70">Monday – Saturday: 9:00 AM – 8:00 PM</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/80 space-y-1">
                  <p className="font-semibold text-orange">🎓 Recognized Affiliations:</p>
                  <p>• Trinity College London (Western Grade Exams)</p>
                  <p>• Annamalai University, Chidambaram (Classical)</p>
                </div>
              </div>
            </div>

          </div>

          {/* Full-width Responsive Map */}
          <div className="mt-16 rounded-3xl overflow-hidden shadow-2xl border border-border h-96 sm:h-[420px] relative">
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Allwin School of Music Full Map"
              className="w-full h-full"
            />
          </div>

        </div>
      </section>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading contact form...</div>}>
      <ContactForm />
    </Suspense>
  );
}

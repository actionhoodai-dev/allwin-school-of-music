'use client';

import { MapPin, Phone, Mail, Navigation } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useSiteSettings } from '@/context/SettingsContext';

export default function MapPreview() {
  const { settings } = useSiteSettings();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet/10 text-violet text-xs font-semibold uppercase tracking-wider">
            Visit Our Campus
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-navy">
            Located in <span className="gradient-text">Chinnathirupathi, Salem</span>
          </h2>
          <p className="text-sm text-text-secondary">
            Conveniently accessible for music learners and parents across Salem.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Map Embed */}
          <div className="lg:col-span-8 rounded-3xl overflow-hidden shadow-xl border border-border h-80 sm:h-96 relative">
            <iframe
              src={settings.googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Allwin School of Music Location Map"
              className="w-full h-full"
            />
          </div>

          {/* Quick Info Card */}
          <div className="lg:col-span-4 p-8 rounded-3xl bg-navy text-white flex flex-col justify-between shadow-xl border border-white/10">
            <div className="space-y-6">
              <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange" />
                Academy Location
              </h3>

              <p className="text-sm text-white/80 leading-relaxed">
                {settings.address}
              </p>

              <div className="space-y-3 pt-2 text-sm text-white/70">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-violet" />
                  <a href={settings.phoneLink} className="hover:text-white font-medium text-white">
                    {settings.phoneFormatted}
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-violet" />
                  <a href={settings.emailLink} className="hover:text-white break-all">
                    {settings.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10">
              <Button
                href={settings.googleMapsDirectionsUrl}
                external
                fullWidth
                size="md"
                iconRight={<Navigation className="w-4 h-4" />}
              >
                Get Driving Directions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

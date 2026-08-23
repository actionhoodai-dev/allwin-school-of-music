'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Spinner from '@/components/ui/Spinner';
import { getSiteSettings, updateSiteSettings } from '@/lib/firebase/firestore';
import { BUSINESS } from '@/lib/constants';

interface SettingsState {
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
  footerText: string;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<SettingsState>({
    businessName: BUSINESS.name,
    tagline: BUSINESS.tagline,
    phone: BUSINESS.phone,
    email: BUSINESS.email,
    address: BUSINESS.address,
    googleMapsUrl:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ||
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15627.8!2d78.145!3d11.664!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3babf038f8f01b1b%3A0x6b2b7!2sChinnathirupathi%2C+Salem%2C+Tamil+Nadu+636008!5e0!3m2!1sen!2sin!4v1',
    whatsappNumber: BUSINESS.whatsapp,
    googleReviewsUrl:
      process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_URL ||
      'https://maps.google.com/?q=Allwin+School+of+Music+Salem',
    heroHeading: 'Discover Your Musical Journey',
    heroDescription:
      'Nurturing musicians since 2007 through structured music education, practical training, and internationally recognized grade examinations with Trinity College London and Annamalai University.',
    footerText: 'Learn Music With The Right Foundation • Established 2007 in Salem, Tamil Nadu.',
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await getSiteSettings();
        if (data) {
          setSettings((prev) => ({
            ...prev,
            ...(data as Partial<SettingsState>),
          }));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateSiteSettings(settings as any);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setError(err.message || 'Failed to save site configuration.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Institution Site Settings" />

      <main className="p-6 sm:p-8 space-y-6 max-w-5xl w-full mx-auto">
        <div className="p-6 rounded-3xl bg-white border border-border shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="font-heading font-bold text-xl text-navy">
              Global Institution Configuration
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Changes saved here update the live contact details, Google URLs, and hero text throughout the website.
            </p>
          </div>

          {success && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center">
              <Spinner size="lg" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Business Identity */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-violet">
                  Business Identity
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Business Name"
                    value={settings.businessName}
                    onChange={(e) =>
                      setSettings({ ...settings, businessName: e.target.value })
                    }
                  />
                  <Input
                    label="Official Tagline"
                    value={settings.tagline}
                    onChange={(e) =>
                      setSettings({ ...settings, tagline: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-violet">
                  Contact Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Phone Number"
                    value={settings.phone}
                    onChange={(e) =>
                      setSettings({ ...settings, phone: e.target.value })
                    }
                  />
                  <Input
                    label="WhatsApp Number (with country code)"
                    value={settings.whatsappNumber}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        whatsappNumber: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="Email Address"
                    value={settings.email}
                    onChange={(e) =>
                      setSettings({ ...settings, email: e.target.value })
                    }
                  />
                </div>

                <Input
                  label="Campus Address"
                  value={settings.address}
                  onChange={(e) =>
                    setSettings({ ...settings, address: e.target.value })
                  }
                />
              </div>

              {/* Google & External Links */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-violet">
                  Google Integrations
                </h3>
                <Input
                  label="Google Maps Embed URL"
                  value={settings.googleMapsUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, googleMapsUrl: e.target.value })
                  }
                />
                <Input
                  label="Google Reviews URL (Business Profile Link)"
                  value={settings.googleReviewsUrl}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      googleReviewsUrl: e.target.value,
                    })
                  }
                />
              </div>

              {/* Hero & Footer Content */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-violet">
                  Homepage Content
                </h3>
                <Input
                  label="Hero Headline"
                  value={settings.heroHeading}
                  onChange={(e) =>
                    setSettings({ ...settings, heroHeading: e.target.value })
                  }
                />
                <Textarea
                  label="Hero Description"
                  value={settings.heroDescription}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      heroDescription: e.target.value,
                    })
                  }
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  size="md"
                  disabled={saving}
                  icon={<Save className="w-4 h-4" />}
                >
                  {saving ? 'Saving Changes...' : 'Save Site Settings'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

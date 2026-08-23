import Link from 'next/link';
import { Music, Home, Phone } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 px-4 bg-surface-dim">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-white border border-border shadow-xl">
        <div className="w-20 h-20 rounded-full bg-purple-deep/5 flex items-center justify-center mx-auto text-violet">
          <Music className="w-10 h-10 animate-bounce" />
        </div>

        <span className="text-4xl font-heading font-extrabold text-navy">404</span>

        <h1 className="text-2xl font-heading font-bold text-navy">
          Out of Tune! Page Not Found
        </h1>

        <p className="text-sm text-text-secondary leading-relaxed">
          The musical note or page you are looking for seems to have drifted away. Return home to continue your musical exploration.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button href="/" size="md" icon={<Home className="w-4 h-4" />}>
            Back to Home
          </Button>
          <Button href="/contact" variant="outline" size="md" icon={<Phone className="w-4 h-4" />}>
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  );
}

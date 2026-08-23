'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { auth } from '@/lib/firebase/config';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { BUSINESS } from '@/lib/constants';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push('/admin');
    } catch (err: any) {
      console.error('Login error:', err);
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        setError('Invalid admin credentials. Please verify your email and password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(err.message || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-navy relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-deep/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="p-8 sm:p-10 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl space-y-6">
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className="relative w-20 h-20 mx-auto">
              <Image
                src="/logo.png"
                alt="Allwin School of Music Logo"
                fill
                sizes="80px"
                className="object-contain rounded-full shadow-md"
                priority
              />
            </div>
            <h1 className="font-heading font-bold text-2xl text-navy">
              Admin Portal
            </h1>
            <p className="text-xs text-text-secondary">
              {BUSINESS.fullName} Management
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@allwinschoolofmusic.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                size="md"
                disabled={loading}
                iconRight={<ArrowRight className="w-4 h-4" />}
              >
                {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              </Button>
            </div>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-text-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              <span>Secure Firebase Authentication</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

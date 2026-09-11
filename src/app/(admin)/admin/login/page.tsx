'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { signInWithEmail } from '@/lib/firebase/auth';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { BUSINESS } from '@/lib/constants';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.replace('/admin');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmail(email.trim(), password);
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f1f3f6] relative overflow-hidden">
      <div className="max-w-md w-full relative z-10">
        <div className="p-8 sm:p-10 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="relative w-20 h-20 mx-auto">
              <Image
                src="/logo.png"
                alt="Allwin School of Music Logo"
                fill
                sizes="80px"
                className="object-contain rounded-full shadow-sm ring-4 ring-blue-100"
                priority
              />
            </div>
            <h1 className="font-bold text-2xl text-slate-900">
              Admin Portal
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {BUSINESS.fullName} Management
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 font-medium">
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
                className="bg-[#2874f0] hover:bg-blue-600 font-bold"
              >
                {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              </Button>
            </div>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Secure Portal Authentication</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

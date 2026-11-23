'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Неверный email или пароль');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-violet-900 to-[#0a0a1a]" />
        <div className="absolute top-20 -left-20 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="relative flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">S</div>
            <span className="text-white font-semibold">SoftSkills Pro</span>
          </Link>
          <div>
            <blockquote className="text-white/80 text-xl font-medium leading-relaxed mb-4">
              «Мягкие навыки — это не дополнение к профессионализму, это его основа»
            </blockquote>
            <p className="text-white/40 text-sm">Платформа оценки и развития soft skills</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-bold">S</div>
              <span className="text-white font-semibold text-lg">SoftSkills Pro</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Вход в платформу</h1>
          <p className="text-white/40 text-sm mb-8">Введите данные вашего аккаунта</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wide">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-primary-600/20 hover:shadow-primary-500/30 hover:-translate-y-0.5 mt-2"
            >
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>

          <p className="mt-6 text-center text-white/30 text-sm">
            Нет аккаунта?{' '}
            <Link href="/auth/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

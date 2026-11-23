import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardSidebar from '@/components/layout/DashboardSidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  console.log('[dashboard] user.id:', user.id, '| profile.role:', profile?.role, '| profile.full_name:', profile?.full_name, '| error:', profileError?.message);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar user={profile} />
      <main className="flex-1 overflow-auto min-w-0">
        <div className="max-w-5xl mx-auto px-6 py-7">
          {children}
        </div>
      </main>
    </div>
  );
}

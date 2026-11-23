import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardSidebar from '@/components/layout/DashboardSidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  console.log('[dashboard] user.id:', user.id, '| profile.role:', profileData?.role, '| error:', profileError?.message);

  // Fallback to user_metadata when profile query fails (e.g. RLS issue)
  const profile = profileData ?? {
    id: user.id,
    full_name: user.user_metadata?.full_name ?? user.email ?? '',
    role: user.user_metadata?.role ?? 'candidate',
    created_at: user.created_at,
  };

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

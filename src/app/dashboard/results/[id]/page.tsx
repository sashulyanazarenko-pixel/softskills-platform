import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ResultsView from '@/components/dashboard/ResultsView';

export default async function ResultDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: result } = await supabase
    .from('assessment_results')
    .select('*, assessments(title, description, skill_categories)')
    .eq('id', id)
    .single();

  if (!result || result.user_id !== user!.id) notFound();

  const { data: plan } = await supabase
    .from('development_plans')
    .select('id')
    .eq('assessment_result_id', id)
    .single();

  return <ResultsView result={result} existingPlanId={plan?.id} />;
}

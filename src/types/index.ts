export type UserRole = 'admin' | 'hr' | 'manager' | 'employee' | 'candidate';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string;
  position?: string;
  avatar_url?: string;
  created_at: string;
}

export type SkillCategory =
  | 'communication'
  | 'teamwork'
  | 'leadership'
  | 'problem_solving'
  | 'adaptability'
  | 'emotional_intelligence'
  | 'time_management'
  | 'creativity'
  | 'conflict_resolution'
  | 'critical_thinking'
  | 'results_orientation'
  | 'business_acumen';

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  communication: 'Коммуникация',
  teamwork: 'Командная работа',
  leadership: 'Лидерство',
  problem_solving: 'Решение проблем',
  adaptability: 'Адаптивность',
  emotional_intelligence: 'Эмоциональный интеллект',
  time_management: 'Управление временем',
  creativity: 'Креативность',
  conflict_resolution: 'Разрешение конфликтов',
  critical_thinking: 'Критическое мышление',
  results_orientation: 'Ориентация на качество и результат',
  business_acumen: 'Понимание бизнеса',
};

export interface Assessment {
  id: string;
  title: string;
  description: string;
  skill_categories: SkillCategory[];
  time_limit_minutes: number;
  question_count: number;
  created_by: string;
  is_active: boolean;
  created_at: string;
}

export type QuestionType = 'single_choice' | 'multiple_choice' | 'scale' | 'open_text';

export interface Question {
  id: string;
  assessment_id: string;
  skill_category: SkillCategory;
  question_type: QuestionType;
  text: string;
  options?: { id: string; text: string; score: number }[];
  min_scale?: number;
  max_scale?: number;
  order_index: number;
}

export interface AssessmentResult {
  id: string;
  user_id: string;
  assessment_id: string;
  scores: Record<SkillCategory, number>;
  total_score: number;
  completed_at: string;
  answers: Record<string, string | string[] | number>;
  time_spent_seconds: number;
}

export interface DevelopmentPlanItem {
  skill: SkillCategory;
  current_level: number;
  target_level: number;
  priority: 'high' | 'medium' | 'low';
  recommendations: string[];
  resources: { title: string; type: 'book' | 'course' | 'article' | 'practice'; url?: string }[];
  timeline_weeks: number;
}

export interface DevelopmentPlan {
  id: string;
  user_id: string;
  assessment_result_id: string;
  items: DevelopmentPlanItem[];
  summary: string;
  overall_goal: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'active' | 'completed';
}

export interface SkillScore {
  category: SkillCategory;
  score: number;
  level: 'low' | 'medium' | 'high';
  percentile?: number;
}

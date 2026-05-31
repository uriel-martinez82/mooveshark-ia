import type { Lead } from '@/types'

interface ScoringRule {
  field: keyof Lead
  values: Record<string, number>
  default?: number
}

const SCORING_RULES: ScoringRule[] = [
  {
    field: 'companySize',
    values: { '1-10': 5, '11-50': 15, '51-200': 25, '200+': 35 },
    default: 5,
  },
  {
    field: 'urgency',
    values: { immediate: 30, '1-3months': 20, exploring: 5 },
    default: 5,
  },
  {
    field: 'budget',
    values: { '1500plus': 25, '500-1500': 15, under500: 5, undefined: 0 },
    default: 0,
  },
  {
    field: 'monthlyVolume',
    values: { '1000+': 15, '100-1000': 10, '10-100': 5, 'less-10': 2 },
    default: 2,
  },
]

export function scoreLead(lead: Partial<Lead>): number {
  let score = 0

  for (const rule of SCORING_RULES) {
    const value = lead[rule.field] as string
    score += rule.values[value] ?? (rule.default || 0)
  }

  // Bonus: múltiples agentes de interés = mayor potencial
  const agentsCount = lead.agentsInterested?.length ?? 0
  if (agentsCount >= 3) score += 10
  if (agentsCount >= 5) score += 5

  // Bonus: tiene CRM = empresa más madura
  if (lead.hasCRM) score += 5

  return Math.min(score, 100)
}

export function getLeadPriority(score: number): 'hot' | 'warm' | 'cold' {
  if (score >= 70) return 'hot'
  if (score >= 40) return 'warm'
  return 'cold'
}

export function getLeadLabel(score: number): string {
  const priority = getLeadPriority(score)
  const labels = {
    hot:  '🔥 Lead caliente — contactar hoy',
    warm: '⚡ Lead tibio — contactar esta semana',
    cold: '❄️ Lead frío — nurturing automático',
  }
  return labels[priority]
}

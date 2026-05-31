export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'

export interface Lead {
  id: string
  fullName: string
  email: string
  company: string
  role: string
  country: string
  industry: string
  companySize: string
  monthlyVolume: string
  hasCRM: boolean
  crmName?: string
  problem: string
  agentsInterested: string[]
  urgency: 'immediate' | '1-3months' | 'exploring'
  budget: 'under500' | '500-1500' | '1500plus' | 'undefined'
  score?: number
  status: LeadStatus
  createdAt: Date
  updatedAt: Date
}

export type AgentType =
  | 'customer-support'
  | 'lead-qualification'
  | 'sales-sdr'
  | 'data-analysis'
  | 'onboarding'
  | 'hr-recruitment'
  | 'collections'

export interface AgentConfig {
  id: string
  clientId: string
  type: AgentType
  name: string
  systemPrompt: string
  tone: 'formal' | 'friendly' | 'neutral'
  language: string
  contextData: Record<string, unknown>
  isActive: boolean
  createdAt: Date
}

export interface AgentDefinition {
  type: AgentType
  label: string
  description: string
  icon: string
  badge: 'ready' | 'hot'
  agentName: string
  agentAvatar: string
  agentColor: string
  specialty: string
  suggestedQuestions: string[]
  capabilities: string[]
  systemPromptTemplate: string
}

export type PlanType = 'starter' | 'business' | 'enterprise'
export type ClientStatus = 'trial' | 'active' | 'paused' | 'cancelled'

export interface Client {
  id: string
  leadId?: string
  company: string
  email: string
  plan: PlanType
  status: ClientStatus
  agentsActive: number
  interactionsThisMonth: number
  createdAt: Date
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  agentType?: AgentType
  metadata?: Record<string, unknown>
}

export interface ChatSession {
  id: string
  clientId: string
  agentId: string
  messages: ChatMessage[]
  startedAt: Date
  lastMessageAt: Date
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

import { z } from 'zod'

// ─── Lead form (multi-step) ───────────────────────────────────────────────────
export const leadStep1Schema = z.object({
  fullName: z.string().min(2, 'Nombre requerido'),
  email:    z.string().email('Email inválido'),
  company:  z.string().min(2, 'Empresa requerida'),
  role:     z.string().min(2, 'Cargo requerido'),
  country:  z.string().min(2, 'País requerido'),
})

export const leadStep2Schema = z.object({
  industry:      z.string().min(1, 'Industria requerida'),
  companySize:   z.enum(['1-10', '11-50', '51-200', '200+']),
  monthlyVolume: z.enum(['less-10', '10-100', '100-1000', '1000+']),
  hasCRM:        z.boolean(),
  crmName:       z.string().optional(),
})

export const leadStep3Schema = z.object({
  problem:          z.string().min(20, 'Describí tu problema (mínimo 20 caracteres)'),
  agentsInterested: z.array(z.string()).min(1, 'Seleccioná al menos un agente'),
  urgency:          z.enum(['immediate', '1-3months', 'exploring']),
  budget:           z.enum(['under500', '500-1500', '1500plus', 'undefined']),
})

export const leadFullSchema = leadStep1Schema
  .merge(leadStep2Schema)
  .merge(leadStep3Schema)

export type LeadStep1Data = z.infer<typeof leadStep1Schema>
export type LeadStep2Data = z.infer<typeof leadStep2Schema>
export type LeadStep3Data = z.infer<typeof leadStep3Schema>
export type LeadFullData  = z.infer<typeof leadFullSchema>

// ─── Chat message ─────────────────────────────────────────────────────────────
export const chatMessageSchema = z.object({
  message:        z.string().min(1).max(2000),
  conversationId: z.string().uuid().optional(),
  agentId:        z.string().uuid(),
})

export type ChatMessageData = z.infer<typeof chatMessageSchema>

// ─── Agent config ─────────────────────────────────────────────────────────────
export const agentConfigSchema = z.object({
  type:         z.enum(['customer-support','lead-qualification','sales-sdr','data-analysis','onboarding','hr-recruitment','collections']),
  name:         z.string().min(2).max(100),
  systemPrompt: z.string().optional(),
  tone:         z.enum(['formal', 'friendly', 'neutral']).default('friendly'),
  language:     z.string().default('es'),
  contextData:  z.record(z.unknown()).default({}),
})

export type AgentConfigData = z.infer<typeof agentConfigSchema>

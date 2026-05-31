import { Inngest } from 'inngest'

export const inngest = new Inngest({ id: 'mooveshark-ia' })

// ─── Event types ──────────────────────────────────────────────────────────────
export type Events = {
  'lead/created': {
    data: {
      leadId:    string
      email:     string
      fullName:  string
      company:   string
      score:     number
      urgency:   string
    }
  }
  'agent/activated': {
    data: {
      clientId:  string
      agentId:   string
      agentType: string
      company:   string
      email:     string
    }
  }
  'client/trial-ending': {
    data: {
      clientId: string
      email:    string
      company:  string
      daysLeft: number
    }
  }
  'usage/limit-reached': {
    data: {
      clientId:    string
      email:       string
      currentPlan: string
    }
  }
}

import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core'

// ─── Enums ────────────────────────────────────────────────────────────────────
export const leadStatusEnum   = pgEnum('lead_status',   ['new','contacted','qualified','converted','lost'])
export const clientStatusEnum = pgEnum('client_status', ['trial','active','paused','cancelled'])
export const planEnum         = pgEnum('plan',          ['starter','business','enterprise'])
export const agentTypeEnum    = pgEnum('agent_type',    ['customer-support','lead-qualification','sales-sdr','data-analysis','onboarding','hr-recruitment','collections'])
export const messageRoleEnum  = pgEnum('message_role',  ['user','assistant'])

// ─── Leads ────────────────────────────────────────────────────────────────────
export const leads = pgTable('leads', {
  id:               uuid('id').primaryKey().defaultRandom(),
  fullName:         text('full_name').notNull(),
  email:            text('email').notNull(),
  company:          text('company').notNull(),
  role:             text('role').notNull(),
  country:          text('country').notNull(),
  industry:         text('industry').notNull(),
  companySize:      text('company_size').notNull(),
  monthlyVolume:    text('monthly_volume').notNull(),
  hasCRM:           boolean('has_crm').default(false),
  crmName:          text('crm_name'),
  problem:          text('problem').notNull(),
  agentsInterested: jsonb('agents_interested').$type<string[]>().default([]),
  urgency:          text('urgency').notNull(),
  budget:           text('budget').notNull(),
  score:            integer('score').default(0),
  status:           leadStatusEnum('status').default('new'),
  notes:            text('notes'),
  createdAt:        timestamp('created_at').defaultNow(),
  updatedAt:        timestamp('updated_at').defaultNow(),
})

// ─── Clients ──────────────────────────────────────────────────────────────────
export const clients = pgTable('clients', {
  id:                    uuid('id').primaryKey().defaultRandom(),
  leadId:                uuid('lead_id').references(() => leads.id),
  company:               text('company').notNull(),
  email:                 text('email').notNull().unique(),
  passwordHash:          text('password_hash'),
  plan:                  planEnum('plan').default('starter'),
  status:                clientStatusEnum('status').default('trial'),
  stripeCustomerId:      text('stripe_customer_id'),
  stripeSubscriptionId:  text('stripe_subscription_id'),
  interactionsThisMonth: integer('interactions_this_month').default(0),
  createdAt:             timestamp('created_at').defaultNow(),
  updatedAt:             timestamp('updated_at').defaultNow(),
})

// ─── Agents ───────────────────────────────────────────────────────────────────
export const agents = pgTable('agents', {
  id:           uuid('id').primaryKey().defaultRandom(),
  clientId:     uuid('client_id').references(() => clients.id).notNull(),
  type:         agentTypeEnum('type').notNull(),
  name:         text('name').notNull(),
  systemPrompt: text('system_prompt').notNull(),
  tone:         text('tone').default('friendly'),
  language:     text('language').default('es'),
  contextData:  jsonb('context_data').$type<Record<string, unknown>>().default({}),
  isActive:     boolean('is_active').default(true),
  createdAt:    timestamp('created_at').defaultNow(),
  updatedAt:    timestamp('updated_at').defaultNow(),
})

// ─── Conversations ────────────────────────────────────────────────────────────
export const conversations = pgTable('conversations', {
  id:              uuid('id').primaryKey().defaultRandom(),
  clientId:        uuid('client_id').references(() => clients.id).notNull(),
  agentId:         uuid('agent_id').references(() => agents.id).notNull(),
  startedAt:       timestamp('started_at').defaultNow(),
  lastMessageAt:   timestamp('last_message_at').defaultNow(),
  messageCount:    integer('message_count').default(0),
  resolved:        boolean('resolved').default(false),
})

// ─── Messages ─────────────────────────────────────────────────────────────────
export const messages = pgTable('messages', {
  id:             uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => conversations.id).notNull(),
  role:           messageRoleEnum('role').notNull(),
  content:        text('content').notNull(),
  metadata:       jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt:      timestamp('created_at').defaultNow(),
})

// ─── Usage logs ───────────────────────────────────────────────────────────────
export const usageLogs = pgTable('usage_logs', {
  id:           uuid('id').primaryKey().defaultRandom(),
  clientId:     uuid('client_id').references(() => clients.id).notNull(),
  agentId:      uuid('agent_id').references(() => agents.id),
  tokensIn:     integer('tokens_in').default(0),
  tokensOut:    integer('tokens_out').default(0),
  cost:         integer('cost_cents').default(0),
  createdAt:    timestamp('created_at').defaultNow(),
})

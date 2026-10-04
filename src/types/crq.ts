export type RiskLevel = 'Low' | 'Medium' | 'High';

export type AppState = 'idle' | 'generating' | 'preview' | 'sent';

export interface UserIdentity {
  userName: string;
  userRole: string;
  userEmail?: string;
}

export interface CRQFormData {
  recipients: string;
  defectNumber: string;
  title: string;
  theFix: string;
  testingDetails: string;
  releaseDate: string;
  riskLevel: RiskLevel;
  internalApprovers: string;
}

export interface ProfessionalizedResult {
  implementationSummary: string;
  validationSteps: string;
  emailSubject: string;
  emailBody: string;
  changeAnalysis?: {
    riskJustification?: string;
    detectedArtifacts?: string;
    fallbackMode?: boolean;
  };
  notice?: string;
}

export interface EmailDispatchResult {
  success: boolean;
  provider: string;
  message: string;
  recipients: string[];
  simulated?: boolean;
  warning?: string;
}

export const SAMPLE_TEMPLATES: {
  id: string;
  name: string;
  desc: string;
  data: CRQFormData;
}[] = [
  {
    id: 'auth-expiry',
    name: 'DEF-702: Auth Token Expiry Fix',
    desc: 'JWT refresh rotation & expired token 401 handling',
    data: {
      recipients: 'cab-approval@enterprise.internal, dev-leads@company.io, release-management@corp.net',
      defectNumber: 'DEF-702',
      title: 'Auth Token Expiry Fix & Graceful Refresh Window',
      theFix: `Issue: When JWT expires at exactly T+15m, the mobile client enters an infinite 401 redirect loop because the refresh token timestamp check was evaluating strictly less than instead of less than or equal to.

Fix details:
- Added 30-second leeway drift allowance in TokenValidator.ts
- Updated Redis refresh token schema to store atomic ttl:
{
  "token_id": "rt_981248012f",
  "user_uuid": "usr_402199",
  "issued_at": 1775304000,
  "expires_at": 1775304900,
  "leeway_seconds": 30,
  "revoked": false
}
- Added exponential backoff retry in client auth interceptor (max 3 retries, base 200ms).`,
      testingDetails: `Automated test coverage:
1. Ran full integration suite 'npm run test:auth' (42 passing tests).
2. Simulated clock skew (+/- 45s) on staging cluster auth nodes.
3. Verified zero infinite redirect loops across 5,000 synthetic mobile client requests.
4. Load tested at 1,500 req/sec token refresh burst with 0% dropped sessions.`,
      releaseDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      riskLevel: 'Medium',
      internalApprovers: 'Sarah Chen (Staff Security Eng), Marcus Vance (Principal Backend)',
    },
  },
  {
    id: 'db-index',
    name: 'DEF-915: Database Deadlock Hotfix',
    desc: 'PostgreSQL row lock order & composite index addition',
    data: {
      recipients: 'cab-board@corp.net, dba-team@corp.net, cto-office@company.io',
      defectNumber: 'DEF-915',
      title: 'PostgreSQL Concurrent Order Deadlock Resolution',
      theFix: `Identified mutual deadlock occurring under peak inventory checkout when orders and invoice line items were locked in inverse order by worker threads.

Remediation executed:
1. Standardized locking sequence alphabetically by table identifier:
   SELECT * FROM customer_accounts WHERE id = $1 FOR UPDATE;
   SELECT * FROM inventory_ledger WHERE sku = $2 FOR UPDATE;
2. Deployed non-blocking concurrent composite index migration:
\`\`\`sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer_status_created 
ON orders (customer_id, status, created_at DESC);
\`\`\`
3. Set lock_timeout to 2500ms to fail-fast rather than holding connection pools hostage.`,
      testingDetails: `1. Replayed 10,000 concurrent checkout transactions on Staging DB snapshot with 64 parallel threads.
2. Verified deadlock frequency dropped from 14.2/min to 0.00/min.
3. p99 database response time improved from 412ms to 38ms.
4. Confirmed zero data inconsistency across ledger reconciliation scripts.`,
      releaseDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      riskLevel: 'Low',
      internalApprovers: 'Elena Rostova (Lead DBA), Liam O’Connor (VP Engineering)',
    },
  },
  {
    id: 'payment-webhook',
    name: 'DEF-1044: Webhook Replay Protection',
    desc: 'Idempotency key enforcement & HMAC signature check',
    data: {
      recipients: 'cab@corp.net, payments-team@corp.net, audit-compliance@corp.net',
      defectNumber: 'DEF-1044',
      title: 'Payment Gateway Webhook Idempotency & Replay Guard',
      theFix: `Mitigated risk of duplicate billing events caused by payment gateway network retries during upstream latency spikes.

Implementation:
1. Enforced strict idempotency key tracking in Redis with a 24-hour TTL:
{
  "event_id": "evt_stripe_992144",
  "idempotency_key": "idem_8f7b2c019a",
  "processed_at": "2026-10-04T02:30:00Z",
  "status": "COMPLETED"
}
2. Added constant-time HMAC-SHA256 signature verification prior to payload parsing.
3. Wrapped ledger mutation inside atomic transaction with isolation level REPEATABLE READ.`,
      testingDetails: `1. Triggered 500 identical webhook duplicate payloads within a 5-second window; verified exactly 1 processing run and 499 idempotent HTTP 200 cached acknowledgements.
2. Negative security test: Injected tampered HMAC header; verified immediate HTTP 401 drop.
3. Executed financial audit reconciliation test: ledger balanced to $0.00 variance.`,
      releaseDate: new Date(Date.now() + 259200000).toISOString().split('T')[0],
      riskLevel: 'High',
      internalApprovers: 'Devon Reed (Principal FinTech Eng), Priya Patel (Security Architect)',
    },
  },
];

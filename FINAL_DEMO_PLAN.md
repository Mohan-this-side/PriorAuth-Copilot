# Final Demo Plan: Denial Pattern Feedback Loop

## 1. Demo Goal

Show that AuthReady does more than create a one-time prior authorization checklist. It learns from a previous denial pattern and uses that history to warn the user before they repeat the same mistake.

The final demo story:

```text
First attempt:
Clinic submits a prior-auth packet but misses one required detail.
The request is denied.
AuthReady captures the denial reason and stores it as a denial pattern.

Second attempt:
Clinic starts a similar prior-auth packet and misses the same detail.
AuthReady pulls the stored denial pattern and surfaces it in a Gen-AI checklist popup.
The user sees the warning before submission and fixes the packet.
```

## 2. Specific Demo Scenario

Service: **Home oxygen therapy**

Patient: **Synthetic COPD patient**

Track: **Reduce Administrative Burden + Trust and Transparency**

Missing criterion for the demo:

```text
Signed equipment order
```

Why this is a good missing criterion:

- It is not the main clinical evidence like COPD diagnosis or oxygen saturation.
- It is still required for the prior-auth packet.
- It is easy for judges to understand.
- It lets us show that small missing paperwork can still cause denial or delay.

## 3. User-Facing Flow

### Step 1: Start Prior Auth

User selects:

```text
Patient: Synthetic Patient A
Service: Home oxygen therapy
Payer/context: Synthetic Medicare Advantage-like plan
```

App shows the base requirements:

```text
- COPD diagnosis
- Recent oxygen saturation result
- Recent encounter note
- Signed equipment order
- Coverage/EOB context
```

### Step 2: First Attempt Has Missing Detail

The demo intentionally leaves this item blank:

```text
Signed equipment order
```

The packet still has:

```text
- COPD diagnosis
- Recent oxygen saturation result
- Recent encounter note
- Coverage/EOB context
```

App shows:

```text
Packet completeness: 4 of 5
Missing: Signed equipment order
Human review required
```

### Step 3: Simulated Denial

User clicks:

```text
Simulate payer response
```

App shows:

```text
Denied / delayed
Reason: Missing signed equipment order
Pattern: Missing required DME order documentation
```

This is a simulated denial for the hackathon demo, not a real payer response.

### Step 4: Store Denial Pattern

The app stores the denial pattern in the demo denial-pattern database.

For the hackathon MVP, this can be:

```text
localStorage
```

or a small local JSON-backed store if a backend exists.

Stored pattern:

```json
{
  "id": "learned-pattern-001",
  "service": "Home oxygen therapy",
  "payerContext": "Synthetic Medicare Advantage-like plan",
  "missingCriterion": "Signed equipment order",
  "denialReason": "Missing required DME order documentation",
  "riskLevel": "medium",
  "lastSeenDate": "2026-05-28",
  "sourceAttemptId": "attempt-001",
  "recommendation": "Add signed equipment order before prior-auth review."
}
```

### Step 5: Second Attempt Repeats Same Missing Detail

User starts a new packet with the same service:

```text
Service: Home oxygen therapy
```

The user again leaves out:

```text
Signed equipment order
```

Before final review, AuthReady checks stored denial patterns.

### Step 6: Gen-AI Checklist Popup

App shows a popup:

```text
AuthReady found a prior denial pattern.

Last time, a similar home oxygen packet was denied or delayed because the signed equipment order was missing.

Recommended action:
Attach or confirm the signed equipment order before submission.
```

The checklist item should be visually promoted:

```text
[!] Signed equipment order
    Previously caused denial/delay
    Add before human review
```

### Step 7: User Fixes Packet

User adds signed equipment order.

App updates:

```text
Packet completeness: 5 of 5
Prior denial pattern resolved
Ready for human review
```

The final state should still say:

```text
Human review required before submission
```

## 4. Data Flow

```text
Prior-auth intake
      ↓
Evidence checklist engine
      ↓
Missing signed equipment order detected
      ↓
Simulated denial response
      ↓
Denial pattern stored
      ↓
Next similar prior-auth packet
      ↓
Stored denial pattern matched
      ↓
Gen-AI checklist popup warns user
      ↓
User fixes missing criterion
      ↓
Packet ready for human review
```

## 5. Demo Data Needed

Use existing DS1 files:

```text
src/data/patients.json
src/data/orders.json
src/data/observations.json
src/data/encounters.json
src/data/coverage_eob.json
```

Use existing DS2 files when available:

```text
src/data/denial_patterns.json
src/data/federated_summary.json
src/data/federated_sites.json
```

Add or derive a small demo denial pattern record:

```text
Missing signed equipment order -> prior denial/delay risk
```

This can be stored in:

```text
localStorage key: authready.denialPatterns
```

Suggested localStorage value:

```json
[
  {
    "id": "learned-pattern-001",
    "service": "Home oxygen therapy",
    "payerContext": "Synthetic Medicare Advantage-like plan",
    "missingCriterion": "Signed equipment order",
    "denialReason": "Missing required DME order documentation",
    "riskLevel": "medium",
    "recommendation": "Add signed equipment order before prior-auth review.",
    "source": "Simulated payer response from first demo attempt"
  }
]
```

## 6. App Screens

### Screen 1: Prior Auth Intake

Show:

- Patient selector.
- Service selector.
- Required criteria checklist.
- Evidence found from DS1 data.
- Missing criteria.

### Screen 2: First Packet Review

Show:

- Found evidence: 4 of 5.
- Missing: signed equipment order.
- Button: `Simulate payer response`.

### Screen 3: Denial Result

Show:

- Status: denied or delayed.
- Reason: missing signed equipment order.
- Button: `Save denial pattern`.
- Confirmation: denial pattern stored.

### Screen 4: Second Packet Attempt

Show:

- Same service and similar patient/order context.
- Signed equipment order missing again.
- Button: `Run AuthReady checklist`.

### Screen 5: Gen-AI Checklist Popup

Show:

- Prior denial pattern warning.
- Checklist item promoted.
- Recommendation to add signed equipment order.
- Source: previous simulated denial.

### Screen 6: Fixed Packet

Show:

- Signed equipment order added.
- Packet completeness: 5 of 5.
- Prior denial pattern resolved.
- Ready for human review.

## 7. Gen-AI Role

The Gen-AI layer should not decide approval or denial.

It should:

- Summarize found evidence.
- Explain missing criteria.
- Compare current missing criteria against stored denial patterns.
- Generate a checklist warning in plain language.
- Cite the reason from the stored denial pattern.

It should not:

- Diagnose.
- Recommend treatment.
- Invent missing evidence.
- Automatically submit prior authorization.
- Tell the user to change codes to get approval.

## 8. Database / Storage Plan

### Hackathon MVP

Use browser localStorage as the denial-pattern database.

Recommended key:

```text
authready.denialPatterns
```

Why:

- Fast to build.
- No backend required.
- Demo works reliably.
- Easy to explain as a prototype store.

### Production Direction

Replace localStorage with a real database table:

```text
denial_patterns
```

Suggested columns:

```text
id
service
payer_context
missing_criterion
denial_reason
risk_level
recommendation
source_attempt_id
created_at
last_seen_at
resolved_count
```

## 9. Matching Logic

When a user starts a new prior-auth packet:

```text
1. Get selected service.
2. Get current missing criteria.
3. Load stored denial patterns.
4. Match where:
   - pattern.service equals selected service
   - pattern.missingCriterion is in current missing criteria
5. If a match exists, show warning in Gen-AI checklist popup.
```

Example:

```text
Current service:
Home oxygen therapy

Current missing criterion:
Signed equipment order

Stored denial pattern:
Home oxygen therapy + Signed equipment order -> prior denial

Result:
Show popup warning.
```

## 10. Final 3-Minute Demo Script

```text
We built AuthReady for clinic staff preparing prior authorization packets.

In this demo, a synthetic COPD patient needs home oxygen therapy. The app finds diagnosis support, recent oxygen saturation, encounter documentation, and coverage context. But we intentionally leave out one required item: the signed equipment order.

The first packet is incomplete, and we simulate a payer denial or delay caused by the missing signed equipment order.

AuthReady stores that denial reason as a denial pattern.

Now we start a second similar prior-auth packet and miss the same item again. This time, AuthReady remembers the prior denial pattern and surfaces it in a Gen-AI checklist popup before submission.

The popup tells the user that a similar packet was previously denied or delayed because the signed equipment order was missing.

Once the user adds the signed equipment order, the packet becomes complete and ready for human review.

The key idea is that AuthReady reduces repeated administrative mistakes. It learns from prior denials, warns staff before the same issue happens again, and keeps every recommendation reviewable.
```

## 11. Success Metric

Primary metric:

```text
Repeat-denial prevention rate
```

Demo version:

```text
Before AuthReady:
Same missing detail causes repeated denial/delay.

After AuthReady:
Stored denial pattern appears in checklist before submission.
```

Secondary metrics:

```text
- First-pass packet completeness
- Missing criteria caught before submission
- Uncited AI claims: 0
- Patient-level rows shared centrally: 0
```

## 12. Acceptance Criteria

The final demo is successful if:

- First attempt can show an incomplete packet.
- Simulated denial reason is visible.
- Denial pattern is stored.
- Second attempt pulls the stored pattern.
- Gen-AI popup highlights the previously denied missing criterion.
- User can resolve the issue.
- Final packet shows complete and ready for human review.
- App clearly states this is synthetic demo data and not real payer adjudication.


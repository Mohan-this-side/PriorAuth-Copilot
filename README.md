# AuthAssist AI

AuthAssist AI is a prior-authorization evidence copilot built for the **Reduce Administrative Burden + Improve Trust and Transparency** track. The prototype helps clinic staff prepare a source-cited prior-auth packet, detect missing documentation, learn from a previous denial or delay, and warn users before the same missing requirement appears again.

The demo focuses on a **COPD home oxygen therapy** prior-authorization workflow. It is designed as a hackathon prototype, not a production clinical or payer decision system.

## Problem

Prior authorization is time-consuming because staff often need to search across encounter notes, observations, coverage records, order details, and prior claim context. A packet can be delayed or denied even when most evidence is present if one required document is missing.

For the demo, the intentionally missing requirement is:

```text
Signed equipment order
```

This is a strong demo case because the missing item is easy to understand, operationally realistic, and important enough to cause a denial or delay.

## Solution

AuthAssist AI turns prior-auth preparation into a reviewable workflow:

1. Load patient, order, observation, encounter, coverage, and EOB-style context.
2. Map the request to required evidence for home oxygen therapy.
3. Show which requirements are found, missing, or need human review.
4. Build a packet draft where every claim is tied to a source ID.
5. Simulate a denial or delay caused by missing documentation.
6. Store that denial pattern locally.
7. Warn the user on the next similar attempt before the same mistake repeats.
8. Keep human review required before any real-world action.

## Final Demo Flow

The app demonstrates a complete denial-pattern feedback loop:

| Step | What Happens |
|---|---|
| First packet review | The app finds 4 of 5 required evidence items. |
| Missing item | Signed equipment order is missing. |
| Simulated payer response | The request is marked denied or delayed due to missing DME order documentation. |
| Pattern saved | The app stores the denial reason in localStorage. |
| Second attempt | The same missing criterion appears again. |
| AI checklist warning | AuthAssist AI warns that this missing item previously caused a denial or delay. |
| Resolution | User adds the signed equipment order and the packet becomes 5 of 5 complete. |

The final state remains **Ready for Human Review**. The app does not imply automatic submission or automatic approval.

## Key Features

- Prior-auth requirement discovery for home oxygen therapy.
- Evidence checklist with found and missing documentation.
- Source-cited packet preview.
- Denial-pattern storage using localStorage as the hackathon database.
- Gen-AI-style checklist warning using deterministic demo text.
- Federated-learning simulation across three demo clinics.
- Trust and transparency view with aggregate-only sharing.
- Safety boundaries that keep missing evidence visible.

## Federated Learning Story

The federated-learning portion is a simulation that shows how multiple clinics could learn from denial and delay patterns without centralizing patient-level records.

Each clinic keeps its local records. The central view receives only:

- aggregate case counts
- aggregate denial or delay counts
- aggregate missing-documentation counts
- normalized feature weights

The central view does not receive patient-level rows, encounter notes, observations, coverage records, or source documents.

This lets the app explain a privacy-preserving learning pattern while staying practical for a hackathon demo.

## Responsible AI Boundaries

AuthAssist AI is designed to support documentation review only.

It does not:

- diagnose patients
- recommend treatment
- approve or deny coverage
- submit prior authorizations automatically
- change diagnosis or procedure codes
- invent missing evidence
- replace human review

Every generated packet statement should remain tied to a source ID, and missing documentation must stay visible until a user adds or confirms the source record.

## Data

The prototype uses small demo-only sample records and contains no PHI, no real patient data, no real payer data, and no credentials.

Core data files:

```text
src/data/patients.json
src/data/orders.json
src/data/observations.json
src/data/encounters.json
src/data/coverage_eob.json
src/data/denial_patterns.json
src/data/federated_summary.json
src/data/federated_sites.json
```

The data model is aligned with the hackathon story:

- Synthea-style patient and encounter structure.
- LOINC-like oxygen saturation observation code `59408-5`.
- EOB-style coverage and claim context.
- Da Vinci-inspired workflow language: requirement discovery, documentation review, and packet readiness.

See [docs/data_dictionary.md](docs/data_dictionary.md) and [docs/model_card.md](docs/model_card.md) for details.

## Tech Stack

- React
- TypeScript
- Vite
- lucide-react icons
- Static JSON data
- Browser localStorage for the demo denial-pattern database

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Open the app:

```text
http://127.0.0.1:5173/
```

## Demo Script

1. Start on **Patient / Order Intake**.
2. Explain that the app is preparing a COPD home oxygen prior-auth packet.
3. Open **Requirement Discovery** and show that 4 of 5 items are present.
4. Point out the missing **Signed equipment order**.
5. Open **Evidence Packet Builder**.
6. Click **Simulate payer response**.
7. Show the denial or delay reason.
8. Click **Save denial pattern**.
9. Click **Start second attempt**.
10. Click **Run AuthAssist AI checklist**.
11. Show the warning that this missing item previously caused a denial or delay.
12. Click **Add signed equipment order**.
13. End with 5 of 5 complete, zero uncited claims, and human review still required.

## Success Metrics

The demo highlights three measurable goals:

| Metric | Target |
|---|---|
| Packet completeness | Move from 4 of 5 to 5 of 5 required items. |
| Uncited AI claims | Keep at 0. |
| Patient-level rows shared centrally | Keep at 0. |

## Repository Structure

```text
src/
  components/          React UI components for the demo workflow
  data/                Demo JSON records and federated summary outputs
  lib/                 Workflow state and denial-pattern helpers
  App.tsx              Main app composition and demo state machine
  styles.css           Product styling and responsive layout

docs/
  data_dictionary.md   Data fields, source IDs, and evidence mapping
  model_card.md        Federated simulation model card and limitations

FINAL_DEMO_PLAN.md     End-to-end denial-pattern demo plan
```

## Limitations

- This is a hackathon prototype.
- The prior-auth requirements are simplified for the demo.
- The denial response is simulated.
- localStorage is used as the demo database.
- The federated-learning view is an aggregate simulation, not a production model.
- Production use would require payer-policy validation, secure integrations, privacy review, audit logging, monitoring, and workflow testing with real operational users.

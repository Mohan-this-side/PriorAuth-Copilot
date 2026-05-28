# AuthReady 2-Hour Execution Plan

Repo: https://github.com/Mohan-this-side/PriorAuth-Copilot.git

Project: **AuthReady: Federated Prior Authorization Evidence Copilot**

Primary track: **Reduce Administrative Burden**

Secondary differentiator: **Improve Data Liquidity, Trust, and Transparency**

## 1. One-Sentence Pitch

AuthReady helps clinic staff prepare prior authorization paperwork faster by finding required evidence in synthetic patient and claims data, flagging missing documentation, and drafting a source-cited packet for human review, while simulating federated learning so clinics can learn denial patterns without sharing patient-level data.

## 2. Simple Problem

When a doctor orders a service like home oxygen therapy, insurance may require prior authorization before paying. Clinic staff must manually gather proof from the patient chart, claims/EOB records, labs, notes, and coverage details. If one required item is missing, the request can be delayed or denied.

Our product reduces this manual search and makes the packet reviewable.

## 3. MVP Demo Scenario

Use one clean demo case:

```text
Synthetic COPD patient -> Provider orders home oxygen therapy -> AuthReady checks required documentation -> finds evidence -> flags missing evidence -> drafts a prior-auth packet -> human reviews.
```

Do not build full electronic prior-auth submission. Show a CRD/DTR/PAS-inspired workflow:

```text
Requirement discovery -> Evidence checklist -> Packet preview -> Human review -> Audit trail
```

## 4. Fast Architecture

Use a mostly static web app so integration is fast.

Recommended stack if the repo is empty:

```text
Vite + React + TypeScript + local JSON data
```

No database. No auth. No live PHI. No required live API.

App flow:

```text
src/data/*.json
        ↓
src/lib/evidenceEngine.ts
        ↓
React screens/components
        ↓
3-minute demo
```

## 5. Team Roles

### Software Engineer 1: Frontend Lead / Demo Flow

Owns the user-facing app and final visual polish.

Branch:

```bash
feat/app-shell-demo-flow
```

Files owned:

```text
src/App.tsx
src/main.tsx
src/styles.css
src/components/*
index.html
package.json only if bootstrapping
```

Deliverables:

- Build the main web app shell.
- Create 4 screens or sections:
  - Patient/order intake
  - Requirement discovery
  - Evidence packet builder
  - Trust/federated learning view
- Make the UI slick and demo-friendly.
- Include a clear "Ready for Human Review" final state.
- Add "Missing Evidence" badges where needed.

Acceptance checklist:

- `npm run dev` starts.
- User can click through the whole story.
- App visually explains before/after workflow.
- Demo can be completed in under 3 minutes.

### Software Engineer 2: Evidence Engine / Integration Lead

Owns the logic that connects data to the UI.

Branch:

```bash
feat/evidence-engine
```

Files owned:

```text
src/lib/types.ts
src/lib/evidenceEngine.ts
src/lib/packetBuilder.ts
src/lib/federatedSummary.ts
```

Deliverables:

- Define shared TypeScript interfaces.
- Load/consume JSON from DS teammates.
- Implement evidence matching:
  - diagnosis evidence
  - observation/lab evidence
  - encounter note evidence
  - coverage/EOB evidence
  - missing-documentation checks
- Build packet draft text from cited evidence only.
- If a data point is missing, return a missing warning instead of fake text.

Acceptance checklist:

- Every packet sentence maps to a source ID.
- Missing evidence is explicitly marked.
- No clinical decision or automatic submission language.

### Data Scientist 1: Synthetic Patient + Claims Data

Owns the realistic synthetic healthcare data used in the demo.

Branch:

```bash
feat/synthetic-case-data
```

Files owned:

```text
src/data/patients.json
src/data/orders.json
src/data/observations.json
src/data/encounters.json
src/data/coverage_eob.json
docs/data_dictionary.md
```

Deliverables:

- Create one strong demo patient:
  - COPD diagnosis
  - home oxygen therapy order
  - recent encounter note
  - oxygen saturation observation
  - coverage/EOB-style context
- Create 1-2 alternate patients for comparison if time allows.
- Add source IDs to every record, for example `obs-001`, `enc-001`, `eob-001`.
- Keep all data synthetic.

Acceptance checklist:

- Data is small, readable, and committed as JSON.
- Every record has:
  - `id`
  - `type`
  - `date`
  - `sourceLabel`
  - enough fields for UI display
- `docs/data_dictionary.md` explains the synthetic data and attribution.

### Data Scientist 2: Federated Learning Simulation + Metrics

Owns the privacy-preserving learning story and model output.

Branch:

```bash
feat/federated-simulation
```

Files owned:

```text
src/data/federated_sites.json
src/data/federated_summary.json
src/data/denial_patterns.json
scripts/federated_simulation.py
docs/model_card.md
```

Deliverables:

- Simulate 3 clinics:
  - Clinic A
  - Clinic B
  - Clinic C
- Each clinic has local synthetic denial/prior-auth examples.
- Produce aggregate patterns only, such as:
  - missing recent oxygen test -> high denial risk
  - missing diagnosis support -> high denial risk
  - missing signed order -> medium denial risk
- Create a simple model summary:
  - local site counts
  - aggregate feature importance
  - privacy note: no patient-level rows shared
- Create success metric:
  - first-pass packet completeness
  - uncited AI claims count

Acceptance checklist:

- Web app can display the federated learning story without running Python.
- `src/data/federated_summary.json` is final output consumed by frontend.
- `docs/model_card.md` explains this is a hackathon simulation, not production ML.

## 6. Git Collaboration Commands

### First-Time Clone

Use SSH if GitHub SSH is set up:

```bash
git clone git@github.com:Mohan-this-side/PriorAuth-Copilot.git
cd PriorAuth-Copilot
```

Use HTTPS if SSH is not set up:

```bash
git clone https://github.com/Mohan-this-side/PriorAuth-Copilot.git
cd PriorAuth-Copilot
```

### Everyone: Sync Before Starting

```bash
git checkout main
git pull --rebase origin main
```

### Bootstrap Only Once

Only Software Engineer 1 should do this if the repo is empty and has no `package.json`:

```bash
npm create vite@latest . -- --template react-ts
npm install
npm install lucide-react
git add .
git commit -m "Bootstrap React app"
git push origin main
```

Everyone else should then run:

```bash
git checkout main
git pull --rebase origin main
npm install
```

### Create Your Branch

Software Engineer 1:

```bash
git checkout -b feat/app-shell-demo-flow
```

Software Engineer 2:

```bash
git checkout -b feat/evidence-engine
```

Data Scientist 1:

```bash
git checkout -b feat/synthetic-case-data
```

Data Scientist 2:

```bash
git checkout -b feat/federated-simulation
```

### Commit And Push Your Work

Run often, at least every 20-30 minutes:

```bash
git status
git add .
git commit -m "Add <short description>"
git push -u origin <your-branch-name>
```

Example:

```bash
git push -u origin feat/synthetic-case-data
```

### Keep Your Branch Fresh

Before pushing or opening a pull request:

```bash
git checkout main
git pull --rebase origin main
git checkout <your-branch-name>
git rebase main
git push --force-with-lease
```

### Pull Request Rule

Open a pull request from your branch into `main`.

PR title format:

```text
[ROLE] Short deliverable
```

Examples:

```text
[DS1] Add synthetic prior auth demo case
[DS2] Add federated denial pattern simulation
[SE2] Add evidence engine and packet builder
[SE1] Add demo app flow and UI shell
```

Integration lead should merge in this order:

1. Bootstrap app
2. DS1 synthetic data
3. DS2 federated summary
4. SE2 evidence engine
5. SE1 final UI polish

## 7. Shared Data Contract

Everyone should keep JSON simple and readable.

### Patient Record Shape

```json
{
  "id": "patient-001",
  "displayName": "Synthetic Patient A",
  "age": 68,
  "conditions": ["COPD"],
  "dataNote": "Synthetic demo record, no PHI"
}
```

### Evidence Record Shape

```json
{
  "id": "obs-001",
  "patientId": "patient-001",
  "type": "observation",
  "label": "Oxygen saturation",
  "codeSystem": "LOINC-like",
  "code": "59408-5",
  "value": "86%",
  "date": "2026-05-10",
  "sourceLabel": "Synthetic observation record"
}
```

### Requirement Shape

```json
{
  "id": "req-oxygen-001",
  "service": "Home oxygen therapy",
  "requiresPriorAuth": true,
  "requiredEvidence": [
    "COPD diagnosis",
    "Recent oxygen saturation result",
    "Recent encounter note",
    "Signed equipment order",
    "Coverage/EOB context"
  ]
}
```

### Packet Output Shape

```json
{
  "patientId": "patient-001",
  "orderId": "order-001",
  "completenessScore": 0.8,
  "foundEvidence": [
    {
      "requirement": "Recent oxygen saturation result",
      "sourceId": "obs-001",
      "summary": "Oxygen saturation documented as 86% on 2026-05-10."
    }
  ],
  "missingEvidence": [
    {
      "requirement": "Signed equipment order",
      "message": "Missing from available synthetic records. Human review needed."
    }
  ],
  "uncitedClaims": 0
}
```

## 8. Two-Hour Timeline

### 0-10 Minutes: Setup

- Everyone clones repo.
- SE1 bootstraps React app if needed.
- Assign branches.
- Confirm app runs.

### 10-35 Minutes: Parallel Build 1

- SE1 builds app shell and main screen layout.
- SE2 defines types and evidence engine function stubs.
- DS1 creates synthetic patient/order/evidence JSON.
- DS2 creates federated clinic summary JSON.

### 35-60 Minutes: Parallel Build 2

- SE1 wires mock data into UI.
- SE2 implements matching and packet builder.
- DS1 adds data dictionary and source IDs.
- DS2 adds model card and metrics.

### 60-80 Minutes: Integration

- Merge DS1 and DS2 data.
- Merge SE2 evidence engine.
- SE1 connects real data to screens.
- Fix compile errors immediately.

### 80-100 Minutes: Polish

- Add final trust/audit trail screen.
- Add visible "Human Review Required" step.
- Add missing evidence warnings.
- Add success metric panel.
- Add README summary.

### 100-120 Minutes: Demo Prep

- Run app locally.
- Take backup screenshots.
- Rehearse 3-minute story.
- Fill submission template.
- Stop adding features.

## 9. 3-Minute Demo Script

```text
We built AuthReady for clinic staff who prepare prior authorization packets.

Today, staff manually search patient records, claims, notes, and coverage details. Missing documentation causes delays and denials.

In our demo, a synthetic COPD patient needs home oxygen therapy. AuthReady checks the requested service, identifies required evidence, and searches synthetic FHIR/claims-style records.

The app finds the COPD diagnosis, recent encounter, oxygen saturation result, and coverage context. It also flags the signed equipment order as missing.

AI drafts a packet, but every statement is source-cited. If evidence is missing, the system says so instead of inventing justification.

We also simulate federated learning across three clinics. Each clinic learns local denial patterns, but only aggregate patterns are shared, not patient-level data.

Our success metric is first-pass packet completeness: how many required items are found and cited before submission. We also track uncited AI claims, which should be zero.

AuthReady reduces administrative burden while keeping the workflow transparent, reviewable, and safe.
```

## 10. README Must Include

- Project name
- Track
- Team members
- Problem statement
- Demo steps
- Setup commands
- Data sources and why data is synthetic
- Where AI is used
- How federated learning is simulated
- Trust/safety mechanism
- Success metric
- Limitations

Setup command template:

```bash
npm install
npm run dev
```

## 11. Safety Rules

- No real PHI.
- No customer data.
- No secrets or API keys.
- No automatic submission.
- No diagnosis or treatment recommendation.
- No upcoding language.
- No fabricated evidence.
- Every generated claim should cite a source or be marked missing.

Important: do not commit local downloader scripts, `.env` files, API keys, screenshots with secrets, or private notes.

## 12. Paste-Into-Codex Prompts By Role

### SE1 Prompt

```text
Read HACKATHON_2_HOUR_EXECUTION_PLAN.md. Implement only the Software Engineer 1 role. Build the React/Vite app shell for AuthReady with four demo sections: patient/order intake, requirement discovery, evidence packet builder, and trust/federated learning view. Use local JSON data if available. Keep the UI polished, healthcare-workflow focused, and demoable in 3 minutes. Do not add backend complexity.
```

### SE2 Prompt

```text
Read HACKATHON_2_HOUR_EXECUTION_PLAN.md. Implement only the Software Engineer 2 role. Create TypeScript types and evidence engine functions that consume local JSON records and return found evidence, missing evidence, source citations, completeness score, and packet draft text. Never fabricate evidence. If required evidence is missing, return a missing warning for human review.
```

### DS1 Prompt

```text
Read HACKATHON_2_HOUR_EXECUTION_PLAN.md. Implement only the Data Scientist 1 role. Create small synthetic JSON datasets for a COPD home oxygen prior-auth demo case: patient, order, observations, encounters, coverage/EOB context, and optional alternate patient. Include source IDs and a docs/data_dictionary.md. Use synthetic data only.
```

### DS2 Prompt

```text
Read HACKATHON_2_HOUR_EXECUTION_PLAN.md. Implement only the Data Scientist 2 role. Create a simulated federated learning story across 3 synthetic clinics. Produce JSON outputs for local clinic counts, aggregate denial/missing-documentation patterns, feature importance, privacy explanation, and success metrics. Add docs/model_card.md explaining this is a hackathon simulation.
```


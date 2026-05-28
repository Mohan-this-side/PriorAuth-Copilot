# AuthReady Federated Simulation Model Card

## Model Name

AuthReady Federated Prior-Authorization Readiness Simulation

## Purpose

This model card explains the hackathon simulation used for the AuthReady demo. The simulation shows how three synthetic clinics could learn prior-authorization delay patterns without sending patient-level data to a central server.

The output is designed for the web app's trust and transparency view. It is not a production model.

## Intended Use

Use the simulation to show clinic staff which missing documentation patterns are most associated with prior-authorization delays for the demo service: **home oxygen therapy**.

The model supports workflow review by surfacing patterns such as:

- Missing recent oxygen saturation result.
- Missing COPD diagnosis support.
- Missing signed equipment order.
- Missing recent encounter note.
- Missing coverage or EOB context.
- Stale or conflicting documentation.

## Not Intended For

- Diagnosing patients.
- Recommending treatment.
- Automatically submitting prior authorizations.
- Changing diagnosis or procedure codes to increase approval likelihood.
- Replacing human review.
- Making payer policy decisions.

## Data

All data is synthetic and aggregate.

The simulation uses three fake sites:

- Clinic A: synthetic pulmonary practice.
- Clinic B: synthetic primary care group.
- Clinic C: synthetic DME coordination team.

Each site has aggregate counts for synthetic home oxygen prior-authorization cases, delayed or denied cases, first-pass complete packets, and missing-documentation features. No patient rows, patient names, notes, PHI, or real claims are included.

## Federated Learning Story

In the demo, each clinic keeps local synthetic records at the site. The central AuthReady view receives only aggregate outputs:

- Site-level case counts.
- Site-level denial or delay counts.
- Aggregate missing-documentation counts.
- Normalized feature weights.

The central app does not receive:

- Patient-level rows.
- Encounter notes.
- Observations.
- Coverage or EOB rows.
- Source documents.

This makes the privacy story easy to explain: clinics learn from shared patterns without sharing patient records.

## Inputs

The simulation inputs are aggregate feature counts for missing documentation patterns:

| Feature | Meaning |
|---|---|
| `missing_recent_oxygen_saturation` | Recent oxygen saturation evidence is absent from the packet. |
| `missing_copd_diagnosis_support` | The packet lacks clear diagnosis support for COPD. |
| `missing_signed_equipment_order` | The packet lacks a signed equipment order. |
| `missing_recent_encounter_note` | The packet lacks a recent relevant visit note. |
| `missing_coverage_eob_context` | The packet lacks coverage or EOB context. |
| `stale_or_conflicting_documentation` | Evidence is too old or conflicts across records. |

## Outputs

The generated artifacts are:

- `src/data/federated_sites.json`: site-level aggregate counts and local model export description.
- `src/data/denial_patterns.json`: ranked missing-documentation patterns.
- `src/data/federated_summary.json`: frontend-ready summary with counts, feature importance, privacy explanation, and success metrics.

## Metrics

The demo reports:

- **First-pass packet completeness**: share of required evidence items found and cited before human review.
- **Uncited AI claims**: generated packet claims without source citations; target is zero.
- **Patient-level rows shared centrally**: target is zero.
- **Estimated manual review time saved**: synthetic demo assumption for staff time saved by showing an evidence checklist.

## Safety Controls

- The app must describe outputs as documentation review support.
- The app must not claim to approve, deny, diagnose, or treat.
- Missing evidence must be shown as missing.
- AI-generated text must cite source records.
- Human review remains required before submission.

## Known Limitations

- This is a hackathon simulation, not a validated clinical or operational model.
- Counts are synthetic and intentionally small.
- Feature importance is illustrative and should not be treated as real payer behavior.
- A production implementation would require payer-specific policy validation, formal privacy review, secure aggregation, drift monitoring, bias testing, and workflow usability testing.

## Demo Interpretation

Use the simulation as a trust-building layer for the prototype:

> "AuthReady learns that missing oxygen saturation evidence, missing diagnosis support, and missing signed orders commonly delay synthetic home oxygen prior-auth packets. The system uses these learned patterns to highlight evidence gaps before human review, while sharing zero patient-level rows centrally."

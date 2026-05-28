# AuthReady Synthetic Data Dictionary

## Overview

These files provide small synthetic datasets for the AuthReady prior-authorization demo. They are designed for a COPD home oxygen therapy workflow and contain no PHI, no real patient names, no customer data, no real payer data, and no credentials.

The primary demo case is `patient-001`, a synthetic COPD patient with enough evidence to build a source-cited prior-auth readiness packet, except for one intentionally missing item: the signed equipment order.

## Files

| File | Purpose |
|---|---|
| `src/data/patients.json` | Synthetic patient profiles used by the patient/order intake screen. |
| `src/data/orders.json` | Home oxygen therapy order drafts and required evidence checklist. |
| `src/data/observations.json` | LOINC-like oxygen saturation observations. |
| `src/data/encounters.json` | Short synthetic encounter notes and diagnosis support. |
| `src/data/coverage_eob.json` | Synthetic coverage and EOB-style context records. |

## Shared Fields

Every record includes:

| Field | Meaning |
|---|---|
| `id` | Stable source ID used for citation in the app. |
| `type` | Record category, such as `patient`, `order`, `observation`, `encounter`, `coverage`, or `explanationOfBenefit`. |
| `date` | Synthetic record date. |
| `sourceLabel` | Human-readable source label for audit trail display. |
| `patientId` | Link back to the synthetic patient, included for patient-linked records. |

## Demo Patients

| Patient | Purpose | Expected Packet Behavior |
|---|---|---|
| `patient-001` | Primary COPD home oxygen demo case. | Finds 4 of 5 evidence items and flags signed equipment order as missing. |
| `patient-002` | Incomplete respiratory documentation case. | Flags at least recent oxygen saturation, recent encounter note, and signed order as missing. |
| `patient-003` | Non-COPD comparison case. | Shows AuthReady should not fabricate COPD or oxygen-need support. |

## Primary Packet Evidence Map

For `patient-001` and `order-001`, the evidence checklist should resolve as follows:

| Required Evidence | Status | Supporting Source IDs |
|---|---|---|
| COPD diagnosis | Found | `enc-001`, `enc-002` |
| Recent oxygen saturation result | Found | `obs-001`, `obs-002` |
| Recent encounter note | Found | `enc-001` |
| Signed equipment order | Missing | None; human review required |
| Coverage/EOB context | Found | `cov-001`, `eob-001` |

## Observation Notes

The oxygen saturation records use `codeSystem: "LOINC-like"` and `code: "59408-5"` so the demo can show terminology-aware evidence without downloading a full LOINC release.

## Coverage And EOB Notes

The coverage and EOB records are intentionally synthetic and simplified. They are meant to show workflow context, not real payer rules, real claims adjudication, or actual CMS policy.

## Safety And Limitations

- This dataset is synthetic and curated for a hackathon demo.
- It is not clinical evidence validation.
- It is not payer policy.
- It is not a production prior-authorization model.
- The app must keep missing evidence visible rather than inventing justification.
- Human review is required before any real-world prior authorization action.

#!/usr/bin/env python3
"""Generate AuthReady federated-learning simulation artifacts.

This script intentionally uses only aggregate synthetic clinic counts. It does
not create or export patient-level rows, which keeps the hackathon privacy story
easy to inspect and easy to demo.
"""

from __future__ import annotations

import json
from pathlib import Path


GENERATED_AT = "2026-05-28"
DATA_DIR = Path(__file__).resolve().parents[1] / "src" / "data"


FEATURE_LABELS = {
    "missing_recent_oxygen_saturation": "Missing recent oxygen saturation result",
    "missing_copd_diagnosis_support": "Missing COPD diagnosis support",
    "missing_signed_equipment_order": "Missing signed equipment order",
    "missing_recent_encounter_note": "Missing recent encounter note",
    "missing_coverage_eob_context": "Missing coverage/EOB context",
    "stale_or_conflicting_documentation": "Stale or conflicting documentation",
}


FEATURE_RECOMMENDATIONS = {
    "missing_recent_oxygen_saturation": (
        "Ask staff to attach a recent oxygen saturation observation before packet review."
    ),
    "missing_copd_diagnosis_support": (
        "Ask staff to verify the diagnosis evidence and source record before submission."
    ),
    "missing_signed_equipment_order": (
        "Route to human review for signed equipment order confirmation."
    ),
    "missing_recent_encounter_note": (
        "Ask staff to attach or cite the most recent relevant encounter note."
    ),
    "missing_coverage_eob_context": (
        "Ask staff to verify coverage and EOB context before final packet approval."
    ),
    "stale_or_conflicting_documentation": (
        "Ask staff to review date windows and resolve conflicting source records."
    ),
}


FEATURE_EVIDENCE_TYPES = {
    "missing_recent_oxygen_saturation": ["Observation", "LOINC-like oxygen saturation code"],
    "missing_copd_diagnosis_support": ["Condition", "Encounter diagnosis"],
    "missing_signed_equipment_order": ["ServiceRequest", "DeviceRequest"],
    "missing_recent_encounter_note": ["Encounter", "Clinical note"],
    "missing_coverage_eob_context": ["Coverage", "ExplanationOfBenefit"],
    "stale_or_conflicting_documentation": ["Observation", "Encounter", "Coverage"],
}


SITES = [
    {
        "id": "clinic-a",
        "name": "Clinic A",
        "setting": "Synthetic pulmonary practice",
        "regionLabel": "Synthetic Northeast market",
        "localCounts": {
            "priorAuthCases": 42,
            "deniedOrDelayedCases": 13,
            "firstPassCompletePackets": 24,
        },
        "features": {
            "missing_recent_oxygen_saturation": {"casesWithIssue": 8, "deniedOrDelayedWithIssue": 6},
            "missing_copd_diagnosis_support": {"casesWithIssue": 4, "deniedOrDelayedWithIssue": 4},
            "missing_signed_equipment_order": {"casesWithIssue": 10, "deniedOrDelayedWithIssue": 6},
            "missing_recent_encounter_note": {"casesWithIssue": 7, "deniedOrDelayedWithIssue": 5},
            "missing_coverage_eob_context": {"casesWithIssue": 6, "deniedOrDelayedWithIssue": 3},
            "stale_or_conflicting_documentation": {"casesWithIssue": 5, "deniedOrDelayedWithIssue": 3},
        },
    },
    {
        "id": "clinic-b",
        "name": "Clinic B",
        "setting": "Synthetic primary care group",
        "regionLabel": "Synthetic Midwest market",
        "localCounts": {
            "priorAuthCases": 38,
            "deniedOrDelayedCases": 11,
            "firstPassCompletePackets": 22,
        },
        "features": {
            "missing_recent_oxygen_saturation": {"casesWithIssue": 7, "deniedOrDelayedWithIssue": 5},
            "missing_copd_diagnosis_support": {"casesWithIssue": 5, "deniedOrDelayedWithIssue": 4},
            "missing_signed_equipment_order": {"casesWithIssue": 9, "deniedOrDelayedWithIssue": 5},
            "missing_recent_encounter_note": {"casesWithIssue": 6, "deniedOrDelayedWithIssue": 4},
            "missing_coverage_eob_context": {"casesWithIssue": 8, "deniedOrDelayedWithIssue": 4},
            "stale_or_conflicting_documentation": {"casesWithIssue": 4, "deniedOrDelayedWithIssue": 2},
        },
    },
    {
        "id": "clinic-c",
        "name": "Clinic C",
        "setting": "Synthetic DME coordination team",
        "regionLabel": "Synthetic Southeast market",
        "localCounts": {
            "priorAuthCases": 35,
            "deniedOrDelayedCases": 12,
            "firstPassCompletePackets": 18,
        },
        "features": {
            "missing_recent_oxygen_saturation": {"casesWithIssue": 9, "deniedOrDelayedWithIssue": 7},
            "missing_copd_diagnosis_support": {"casesWithIssue": 3, "deniedOrDelayedWithIssue": 3},
            "missing_signed_equipment_order": {"casesWithIssue": 8, "deniedOrDelayedWithIssue": 5},
            "missing_recent_encounter_note": {"casesWithIssue": 7, "deniedOrDelayedWithIssue": 5},
            "missing_coverage_eob_context": {"casesWithIssue": 5, "deniedOrDelayedWithIssue": 3},
            "stale_or_conflicting_documentation": {"casesWithIssue": 6, "deniedOrDelayedWithIssue": 4},
        },
    },
]


def ratio(numerator: float, denominator: float) -> float:
    if denominator == 0:
        return 0.0
    return round(numerator / denominator, 4)


def pct(value: float) -> float:
    return round(value * 100, 1)


def risk_level(denial_rate: float, lift: float) -> str:
    if denial_rate >= 0.72 or lift >= 2.25:
        return "high"
    if denial_rate >= 0.58 or lift >= 1.75:
        return "medium"
    return "low"


def build_site_exports() -> dict:
    exported_sites = []
    for site in SITES:
        local = site["localCounts"]
        prior_auth_cases = local["priorAuthCases"]
        site_denial_rate = ratio(local["deniedOrDelayedCases"], prior_auth_cases)
        first_pass_rate = ratio(local["firstPassCompletePackets"], prior_auth_cases)
        feature_counts = []

        for feature_id, counts in site["features"].items():
            issue_cases = counts["casesWithIssue"]
            issue_denials = counts["deniedOrDelayedWithIssue"]
            feature_counts.append(
                {
                    "featureId": feature_id,
                    "label": FEATURE_LABELS[feature_id],
                    "casesWithIssue": issue_cases,
                    "deniedOrDelayedWithIssue": issue_denials,
                    "localIssueRate": ratio(issue_cases, prior_auth_cases),
                    "localDenialRateWhenPresent": ratio(issue_denials, issue_cases),
                }
            )

        exported_sites.append(
            {
                "id": site["id"],
                "name": site["name"],
                "setting": site["setting"],
                "regionLabel": site["regionLabel"],
                "localCounts": {
                    **local,
                    "denialOrDelayRate": site_denial_rate,
                    "firstPassCompletenessRate": first_pass_rate,
                },
                "localFeatureCounts": feature_counts,
                "localModelExport": {
                    "exportType": "aggregate_counts_and_normalized_feature_weights",
                    "patientRowsShared": 0,
                    "sourceNotesShared": 0,
                    "fieldsShared": [
                        "site id",
                        "aggregate case counts",
                        "aggregate denial/delay counts",
                        "aggregate missing-documentation counts",
                        "normalized feature weights",
                    ],
                },
            }
        )

    return {
        "schemaVersion": "1.0",
        "generatedAt": GENERATED_AT,
        "simulationName": "AuthReady federated prior-authorization simulation",
        "serviceFocus": "Home oxygen therapy documentation readiness",
        "dataPolicy": {
            "dataType": "synthetic aggregate data",
            "patientLevelRowsShared": 0,
            "phiIncluded": False,
            "purpose": "Hackathon demo of privacy-preserving denial-pattern learning.",
        },
        "sites": exported_sites,
    }


def build_aggregate_outputs(site_exports: dict) -> tuple[dict, dict]:
    sites = site_exports["sites"]
    total_cases = sum(site["localCounts"]["priorAuthCases"] for site in sites)
    total_denials = sum(site["localCounts"]["deniedOrDelayedCases"] for site in sites)
    total_complete = sum(site["localCounts"]["firstPassCompletePackets"] for site in sites)
    base_denial_rate = ratio(total_denials, total_cases)

    aggregate_features = {}
    for site in sites:
        for feature in site["localFeatureCounts"]:
            feature_id = feature["featureId"]
            bucket = aggregate_features.setdefault(
                feature_id,
                {
                    "featureId": feature_id,
                    "label": feature["label"],
                    "aggregateCasesWithIssue": 0,
                    "aggregateDeniedOrDelayedWithIssue": 0,
                },
            )
            bucket["aggregateCasesWithIssue"] += feature["casesWithIssue"]
            bucket["aggregateDeniedOrDelayedWithIssue"] += feature["deniedOrDelayedWithIssue"]

    scored_features = []
    raw_score_total = 0.0
    for feature in aggregate_features.values():
        issue_cases = feature["aggregateCasesWithIssue"]
        issue_denials = feature["aggregateDeniedOrDelayedWithIssue"]
        denial_rate_when_present = ratio(issue_denials, issue_cases)
        lift = ratio(denial_rate_when_present, base_denial_rate)
        prevalence = ratio(issue_cases, total_cases)
        raw_score = max(denial_rate_when_present - base_denial_rate, 0) * issue_cases
        raw_score_total += raw_score
        scored_features.append(
            {
                **feature,
                "prevalence": prevalence,
                "denialRateWhenPresent": denial_rate_when_present,
                "denialLiftVsBaseline": lift,
                "rawImportanceScore": round(raw_score, 4),
                "riskLevel": risk_level(denial_rate_when_present, lift),
            }
        )

    for feature in scored_features:
        feature["federatedImportance"] = ratio(feature["rawImportanceScore"], raw_score_total)
        feature.pop("rawImportanceScore")

    scored_features.sort(
        key=lambda feature: (
            feature["riskLevel"] != "high",
            -feature["federatedImportance"],
            -feature["denialRateWhenPresent"],
        )
    )

    denial_patterns = []
    for index, feature in enumerate(scored_features, start=1):
        feature_id = feature["featureId"]
        denial_patterns.append(
            {
                "patternId": f"pattern-{index:03d}",
                "featureId": feature_id,
                "requirement": FEATURE_LABELS[feature_id],
                "riskLevel": feature["riskLevel"],
                "aggregateAffectedCases": feature["aggregateCasesWithIssue"],
                "deniedOrDelayedWhenPresent": feature["aggregateDeniedOrDelayedWithIssue"],
                "denialRateWhenPresent": feature["denialRateWhenPresent"],
                "denialLiftVsBaseline": feature["denialLiftVsBaseline"],
                "federatedImportance": feature["federatedImportance"],
                "evidenceTypesToCheck": FEATURE_EVIDENCE_TYPES[feature_id],
                "fixBeforeSubmitRecommendation": FEATURE_RECOMMENDATIONS[feature_id],
                "safeWorkflowLanguage": (
                    "Review documentation before submission; do not alter codes or invent evidence."
                ),
            }
        )

    pattern_output = {
        "schemaVersion": "1.0",
        "generatedAt": GENERATED_AT,
        "serviceFocus": "Home oxygen therapy",
        "baselineDenialOrDelayRate": base_denial_rate,
        "patterns": denial_patterns,
    }

    federated_summary = {
        "schemaVersion": "1.0",
        "generatedAt": GENERATED_AT,
        "title": "Federated prior-authorization readiness simulation",
        "frontendReady": True,
        "demoNarrative": (
            "Three synthetic clinics learn prior-auth delay patterns locally. "
            "AuthReady aggregates only summary weights and counts, then uses those "
            "patterns to warn staff about missing evidence before packet review."
        ),
        "aggregateCounts": {
            "clinicCount": len(sites),
            "priorAuthCases": total_cases,
            "deniedOrDelayedCases": total_denials,
            "firstPassCompletePackets": total_complete,
            "baselineDenialOrDelayRate": base_denial_rate,
            "baselineFirstPassCompletenessRate": ratio(total_complete, total_cases),
        },
        "siteCards": [
            {
                "siteId": site["id"],
                "name": site["name"],
                "setting": site["setting"],
                "priorAuthCases": site["localCounts"]["priorAuthCases"],
                "deniedOrDelayedCases": site["localCounts"]["deniedOrDelayedCases"],
                "firstPassCompletenessRate": site["localCounts"]["firstPassCompletenessRate"],
                "patientRowsShared": site["localModelExport"]["patientRowsShared"],
            }
            for site in sites
        ],
        "featureImportance": [
            {
                "featureId": feature["featureId"],
                "label": feature["label"],
                "importance": feature["federatedImportance"],
                "riskLevel": feature["riskLevel"],
                "denialRateWhenPresent": feature["denialRateWhenPresent"],
                "denialLiftVsBaseline": feature["denialLiftVsBaseline"],
            }
            for feature in scored_features
        ],
        "topDenialPatterns": denial_patterns[:4],
        "privacyExplanation": {
            "plainLanguage": (
                "Each clinic keeps its synthetic patient rows locally. The demo only "
                "shares aggregate counts and normalized feature weights, so the central "
                "view can learn common missing-documentation patterns without receiving "
                "patient records."
            ),
            "whatStaysLocal": [
                "patient-level records",
                "encounter notes",
                "observations",
                "coverage/EOB rows",
                "source documents",
            ],
            "whatIsShared": [
                "aggregate case counts",
                "aggregate denial/delay counts",
                "aggregate missing-documentation counts",
                "normalized feature weights",
            ],
            "patientRowsShared": 0,
            "limitation": (
                "This is a hackathon simulation. A production system would need formal "
                "privacy review, secure aggregation, monitoring, and validation against "
                "real-world operational workflows."
            ),
        },
        "successMetrics": {
            "firstPassPacketCompleteness": {
                "label": "First-pass packet completeness",
                "baselineSyntheticRate": ratio(total_complete, total_cases),
                "demoPacketRate": 0.889,
                "demoPacketDetail": "8 of 9 required evidence items found and cited.",
                "whyItMatters": (
                    "A more complete packet is less likely to be delayed for missing documentation."
                ),
            },
            "uncitedAiClaims": {
                "label": "Uncited AI claims",
                "target": 0,
                "demoValue": 0,
                "whyItMatters": "The packet should not include unsupported clinical justification.",
            },
            "patientRowsShared": {
                "label": "Patient-level rows shared centrally",
                "target": 0,
                "demoValue": 0,
                "whyItMatters": "Keeps the privacy story visible and easy to explain.",
            },
            "estimatedManualReviewTimeSaved": {
                "label": "Estimated staff time saved per packet",
                "demoEstimateMinutes": 18,
                "assumption": (
                    "Synthetic demo assumption comparing manual chart search to a pre-built evidence checklist."
                ),
            },
        },
        "humanReviewReminder": (
            "AuthReady flags evidence gaps and drafts review text; a human must approve before submission."
        ),
        "safetyBoundaries": [
            "No autonomous clinical decision-making.",
            "No automatic prior-authorization submission.",
            "No upcoding or recommendation to change documentation for payment.",
            "Missing evidence must remain missing until a human attaches a source record.",
        ],
    }

    return federated_summary, pattern_output


def write_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    site_exports = build_site_exports()
    federated_summary, denial_patterns = build_aggregate_outputs(site_exports)

    write_json(DATA_DIR / "federated_sites.json", site_exports)
    write_json(DATA_DIR / "federated_summary.json", federated_summary)
    write_json(DATA_DIR / "denial_patterns.json", denial_patterns)

    print(f"Wrote {DATA_DIR / 'federated_sites.json'}")
    print(f"Wrote {DATA_DIR / 'federated_summary.json'}")
    print(f"Wrote {DATA_DIR / 'denial_patterns.json'}")


if __name__ == "__main__":
    main()

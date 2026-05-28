import type {
  DenialPatternRecord,
  FederatedSiteRecord,
  FederatedSummaryOutput,
  FederatedSummaryRecord,
} from "./types";

export function summarizeFederatedSites(
  sites: FederatedSiteRecord[],
  patterns: DenialPatternRecord[] = [],
): FederatedSummaryOutput {
  const totalCases = sites.reduce((sum, site) => sum + site.caseCount, 0);
  const totalDenials = sites.reduce((sum, site) => sum + (site.denialCount ?? 0), 0);
  const aggregateMissingCounts = new Map<string, number>();

  for (const site of sites) {
    for (const [feature, count] of Object.entries(site.missingEvidenceCounts ?? {})) {
      aggregateMissingCounts.set(feature, (aggregateMissingCounts.get(feature) ?? 0) + count);
    }
  }

  const featureImportance = Array.from(aggregateMissingCounts.entries())
    .map(([feature, count]) => ({
      feature,
      importance: totalCases === 0 ? 0 : Number((count / totalCases).toFixed(3)),
    }))
    .sort((left, right) => right.importance - left.importance);

  return {
    siteCount: sites.length,
    totalCases,
    totalDenials,
    denialRate: totalCases === 0 ? 0 : Number((totalDenials / totalCases).toFixed(3)),
    aggregatePatterns: patterns,
    featureImportance,
    privacyNote: "Aggregate simulation only. No patient-level rows are shared.",
  };
}

export function normalizeFederatedSummary(summary: FederatedSummaryRecord): FederatedSummaryOutput {
  return {
    siteCount: summary.siteCount,
    totalCases: summary.totalCases,
    totalDenials: summary.totalDenials ?? 0,
    denialRate:
      summary.totalCases === 0 ? 0 : Number(((summary.totalDenials ?? 0) / summary.totalCases).toFixed(3)),
    aggregatePatterns: summary.aggregatePatterns,
    featureImportance: Object.entries(summary.featureImportance ?? {})
      .map(([feature, importance]) => ({ feature, importance }))
      .sort((left, right) => right.importance - left.importance),
    privacyNote: summary.privacyNote,
  };
}

export type DemoStage =
  | "first_review"
  | "denied"
  | "pattern_saved"
  | "second_review"
  | "warning_shown"
  | "resolved";

export type RequirementStatus = "found" | "missing";

export type LearnedDenialPattern = {
  id: string;
  service: string;
  payerContext: string;
  missingCriterion: string;
  denialReason: string;
  riskLevel: "low" | "medium" | "high";
  lastSeenDate: string;
  sourceAttemptId: string;
  recommendation: string;
  source: string;
};

export type RequirementEvidence = {
  requirement: string;
  status: RequirementStatus;
  evidence: string;
  source: string;
  summary: string;
  selected: boolean;
  learnedPattern?: LearnedDenialPattern;
};

export const DENIAL_PATTERN_STORAGE_KEY = "authassistai.denialPatterns";

export const signedEquipmentOrderPattern: LearnedDenialPattern = {
  id: "learned-pattern-001",
  service: "Home oxygen therapy",
  payerContext: "Demo Medicare Advantage-like plan",
  missingCriterion: "Signed equipment order",
  denialReason: "Missing required DME order documentation",
  riskLevel: "medium",
  lastSeenDate: "2026-05-28",
  sourceAttemptId: "attempt-001",
  recommendation: "Add signed equipment order before prior-auth review.",
  source: "Simulated payer response from first demo attempt",
};

export function readLearnedDenialPatterns(): LearnedDenialPattern[] {
  if (typeof window === "undefined") {
    return [];
  }

  const storedValue = window.localStorage.getItem(DENIAL_PATTERN_STORAGE_KEY);

  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(isLearnedDenialPattern);
  } catch {
    return [];
  }
}

export function saveLearnedDenialPattern(
  pattern: LearnedDenialPattern,
  existingPatterns: LearnedDenialPattern[],
): LearnedDenialPattern[] {
  const nextPatterns = [
    pattern,
    ...existingPatterns.filter(
      (existingPattern) =>
        existingPattern.service !== pattern.service ||
        existingPattern.missingCriterion !== pattern.missingCriterion,
    ),
  ];

  if (typeof window !== "undefined") {
    window.localStorage.setItem(DENIAL_PATTERN_STORAGE_KEY, JSON.stringify(nextPatterns));
  }

  return nextPatterns;
}

export function clearLearnedDenialPatterns() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(DENIAL_PATTERN_STORAGE_KEY);
  }
}

export function findMatchingDenialPattern(
  patterns: LearnedDenialPattern[],
  service: string,
  missingCriteria: string[],
) {
  return patterns.find(
    (pattern) => pattern.service === service && missingCriteria.includes(pattern.missingCriterion),
  );
}

function isLearnedDenialPattern(value: unknown): value is LearnedDenialPattern {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybePattern = value as Partial<LearnedDenialPattern>;

  return Boolean(
    maybePattern.id &&
      maybePattern.service &&
      maybePattern.missingCriterion &&
      maybePattern.denialReason &&
      maybePattern.recommendation,
  );
}

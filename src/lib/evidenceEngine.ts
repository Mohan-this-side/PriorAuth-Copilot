import {
  buildPacketDraftSentences,
  buildSourceCitations,
  countUncitedClaims,
  renderPacketDraftText,
} from "./packetBuilder";
import type {
  CoverageEobRecord,
  EncounterRecord,
  EvidenceInput,
  FoundEvidence,
  MissingEvidence,
  ObservationRecord,
  OrderRecord,
  PacketOutput,
  RequirementRecord,
  SourceBackedRecord,
} from "./types";

type MatchCandidate = FoundEvidence | undefined;

const normalize = (value: unknown) => String(value ?? "").toLowerCase();

const includesAny = (value: unknown, terms: string[]) => {
  const normalized = normalize(value);
  return terms.some((term) => normalized.includes(term));
};

const recordText = (record: Record<string, unknown>) =>
  Object.values(record).flat().map(normalize).join(" ");

const sortNewestFirst = <T extends { date?: string }>(records: T[]) =>
  [...records].sort((left, right) => normalize(right.date).localeCompare(normalize(left.date)));

const sourceLabelFor = (record: { sourceLabel?: string; id: string }) =>
  record.sourceLabel ?? `Synthetic source ${record.id}`;

const createFoundEvidence = (
  requirement: string,
  source: SourceBackedRecord,
  recordType: FoundEvidence["recordType"],
  summary: string,
  citedFacts: string[],
): FoundEvidence => ({
  requirementId: requirementToId(requirement),
  requirement,
  status: "found",
  sourceId: source.id,
  sourceLabel: sourceLabelFor(source),
  recordType,
  summary,
  citedFacts,
});

const requirementToId = (requirement: string) =>
  requirement
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function findDiagnosisEvidence(input: EvidenceInput, requirement: string): MatchCandidate {
  if (input.patient.conditions?.some((condition) => includesAny(condition, ["copd"]))) {
    const encounter = input.encounters?.find((record) =>
      record.diagnoses?.some((diagnosis) => includesAny(diagnosis, ["copd"])),
    );

    if (encounter) {
      return createFoundEvidence(
        requirement,
        encounter,
        "encounter",
        `COPD diagnosis is documented in ${sourceLabelFor(encounter)}.`,
        ["COPD diagnosis"],
      );
    }
  }

  const matchingEncounter = input.encounters?.find((record) =>
    includesAny(recordText(record as Record<string, unknown>), ["copd", "chronic obstructive"]),
  );

  if (!matchingEncounter) {
    return undefined;
  }

  return createFoundEvidence(
    requirement,
    matchingEncounter,
    "encounter",
    `COPD-related diagnosis support is documented in ${sourceLabelFor(matchingEncounter)}.`,
    ["COPD-related diagnosis support"],
  );
}

function findOxygenObservation(input: EvidenceInput, requirement: string): MatchCandidate {
  const observations = sortNewestFirst(input.observations ?? []);
  const observation = observations.find((record) =>
    includesAny(recordText(record as Record<string, unknown>), [
      "oxygen",
      "spo2",
      "saturation",
      "oximetry",
      "59408-5",
    ]),
  );

  if (!observation) {
    return undefined;
  }

  const value = observation.value === undefined ? "a documented result" : `${observation.value}${observation.unit ?? ""}`;

  return createFoundEvidence(
    requirement,
    observation,
    "observation",
    `${observation.label} is documented as ${value}${observation.date ? ` on ${observation.date}` : ""}.`,
    [observation.label, String(value)],
  );
}

function findEncounterNote(input: EvidenceInput, requirement: string): MatchCandidate {
  const encounter = sortNewestFirst(input.encounters ?? []).find((record) =>
    includesAny(recordText(record as Record<string, unknown>), ["note", "visit", "encounter", "pulmonary", "evaluation"]),
  );

  if (!encounter) {
    return undefined;
  }

  return createFoundEvidence(
    requirement,
    encounter,
    "encounter",
    `Recent encounter context is available in ${sourceLabelFor(encounter)}${encounter.date ? ` dated ${encounter.date}` : ""}.`,
    [encounter.label ?? "Recent encounter"],
  );
}

function findSignedOrder(order: OrderRecord, requirement: string): MatchCandidate {
  const signedStatus = includesAny(order.status, ["signed", "complete", "final"]);

  if (!order.signed && !signedStatus && !order.signedDate) {
    return undefined;
  }

  return createFoundEvidence(
    requirement,
    order,
    "order",
    `Signed order evidence is available for ${order.service}${order.signedDate ? ` on ${order.signedDate}` : ""}.`,
    [order.service, order.status ?? "signed order"],
  );
}

function findCoverageEvidence(input: EvidenceInput, requirement: string): MatchCandidate {
  const coverage = sortNewestFirst(input.coverageEob ?? []).find((record) =>
    includesAny(recordText(record as Record<string, unknown>), [
      input.order.service,
      "coverage",
      "eob",
      "payer",
      "plan",
    ]),
  );

  if (!coverage) {
    return undefined;
  }

  return createFoundEvidence(
    requirement,
    coverage,
    "coverage_eob",
    `Coverage or EOB context is available in ${sourceLabelFor(coverage)}.`,
    [coverage.payer ?? coverage.plan ?? "Coverage context"],
  );
}

function findGenericEvidence(input: EvidenceInput, requirement: string): MatchCandidate {
  const records: Array<SourceBackedRecord & { type?: SourceBackedRecord["type"] }> = [
    ...(input.observations ?? []),
    ...(input.encounters ?? []),
    ...(input.coverageEob ?? []),
    input.order,
  ];
  const requirementWords = requirement.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3);
  const record = records.find((candidate) =>
    requirementWords.some((word) => recordText(candidate as Record<string, unknown>).includes(word)),
  );

  if (!record) {
    return undefined;
  }

  return createFoundEvidence(
    requirement,
    record,
    record.type ?? "other",
    `${requirement} is supported by ${sourceLabelFor(record)}.`,
    [requirement],
  );
}

export function matchRequirement(input: EvidenceInput, requirement: string): FoundEvidence | MissingEvidence {
  const normalizedRequirement = normalize(requirement);

  const found =
    includesAny(normalizedRequirement, ["diagnosis", "copd"])
      ? findDiagnosisEvidence(input, requirement)
      : includesAny(normalizedRequirement, ["oxygen", "saturation", "spo2", "oximetry", "lab", "observation"])
        ? findOxygenObservation(input, requirement)
        : includesAny(normalizedRequirement, ["encounter", "visit", "note", "face-to-face"])
          ? findEncounterNote(input, requirement)
          : includesAny(normalizedRequirement, ["signed", "order", "equipment"])
            ? findSignedOrder(input.order, requirement)
            : includesAny(normalizedRequirement, ["coverage", "eob", "payer", "plan"])
              ? findCoverageEvidence(input, requirement)
              : findGenericEvidence(input, requirement);

  if (found) {
    return found;
  }

  return {
    requirementId: requirementToId(requirement),
    requirement,
    status: "missing",
    message: `${requirement} is missing from available synthetic records. Human review needed.`,
  };
}

export function evaluatePriorAuthEvidence(input: EvidenceInput): PacketOutput {
  const matches = input.requirement.requiredEvidence.map((requirement) => matchRequirement(input, requirement));
  const foundEvidence = matches.filter((match): match is FoundEvidence => match.status === "found");
  const missingEvidence = matches.filter((match): match is MissingEvidence => match.status === "missing");
  const totalRequirements = input.requirement.requiredEvidence.length || 1;
  const completenessScore = Number((foundEvidence.length / totalRequirements).toFixed(2));
  const packetDraftSentences = buildPacketDraftSentences(foundEvidence, missingEvidence);

  return {
    patientId: input.patient.id,
    orderId: input.order.id,
    service: input.order.service,
    completenessScore,
    foundEvidence,
    missingEvidence,
    sourceCitations: buildSourceCitations(foundEvidence),
    packetDraftSentences,
    packetDraftText: renderPacketDraftText(packetDraftSentences),
    uncitedClaims: countUncitedClaims(packetDraftSentences),
    auditTrail: [
      `Evaluated ${input.requirement.requiredEvidence.length} requirements for ${input.order.service}.`,
      `Found ${foundEvidence.length} source-backed evidence item(s).`,
      `Flagged ${missingEvidence.length} missing evidence item(s) for human review.`,
      "Packet draft text was generated only from source-backed evidence and missing-evidence warnings.",
    ],
  };
}

export function evaluatePriorAuthJson(input: {
  patient: EvidenceInput["patient"];
  order: EvidenceInput["order"];
  requirement: RequirementRecord;
  observations?: ObservationRecord[];
  encounters?: EncounterRecord[];
  coverageEob?: CoverageEobRecord[];
}) {
  return evaluatePriorAuthEvidence(input);
}

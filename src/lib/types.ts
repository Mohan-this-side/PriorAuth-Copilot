export type EvidenceRecordType =
  | "patient"
  | "order"
  | "observation"
  | "encounter"
  | "coverage_eob"
  | "requirement"
  | "federated_site"
  | "federated_summary"
  | "denial_pattern"
  | "other";

export type EvidenceStatus = "found" | "missing";

export type PatientRecord = {
  id: string;
  type?: "patient";
  displayName: string;
  age?: number;
  conditions?: string[];
  dataNote?: string;
  sourceLabel?: string;
};

export type OrderRecord = {
  id: string;
  patientId: string;
  type?: "order";
  service: string;
  date?: string;
  status?: string;
  signed?: boolean;
  signedDate?: string;
  orderingProvider?: string;
  sourceLabel?: string;
};

export type ObservationRecord = {
  id: string;
  patientId: string;
  type?: "observation";
  label: string;
  codeSystem?: string;
  code?: string;
  value?: string | number;
  unit?: string;
  date?: string;
  interpretation?: string;
  sourceLabel?: string;
};

export type EncounterRecord = {
  id: string;
  patientId: string;
  type?: "encounter";
  label?: string;
  date?: string;
  diagnoses?: string[];
  note?: string;
  summary?: string;
  sourceLabel?: string;
};

export type CoverageEobRecord = {
  id: string;
  patientId: string;
  type?: "coverage_eob";
  payer?: string;
  plan?: string;
  service?: string;
  date?: string;
  coverageStatus?: string;
  summary?: string;
  sourceLabel?: string;
};

export type RequirementRecord = {
  id: string;
  type?: "requirement";
  service: string;
  requiresPriorAuth: boolean;
  requiredEvidence: string[];
  sourceLabel?: string;
};

export type SourceBackedRecord =
  | OrderRecord
  | ObservationRecord
  | EncounterRecord
  | CoverageEobRecord;

export type EvidenceInput = {
  patient: PatientRecord;
  order: OrderRecord;
  requirement: RequirementRecord;
  observations?: ObservationRecord[];
  encounters?: EncounterRecord[];
  coverageEob?: CoverageEobRecord[];
};

export type SourceCitation = {
  sourceId: string;
  sourceLabel: string;
  recordType: EvidenceRecordType;
  date?: string;
};

export type FoundEvidence = {
  requirementId: string;
  requirement: string;
  status: "found";
  sourceId: string;
  sourceLabel: string;
  recordType: EvidenceRecordType;
  summary: string;
  citedFacts: string[];
};

export type MissingEvidence = {
  requirementId: string;
  requirement: string;
  status: "missing";
  message: string;
};

export type PacketDraftSentence = {
  text: string;
  sourceIds: string[];
  requirementId?: string;
};

export type PacketOutput = {
  patientId: string;
  orderId: string;
  service: string;
  completenessScore: number;
  foundEvidence: FoundEvidence[];
  missingEvidence: MissingEvidence[];
  sourceCitations: SourceCitation[];
  packetDraftSentences: PacketDraftSentence[];
  packetDraftText: string;
  uncitedClaims: number;
  auditTrail: string[];
};

export type FederatedSiteRecord = {
  id: string;
  type?: "federated_site";
  name: string;
  caseCount: number;
  denialCount?: number;
  missingEvidenceCounts?: Record<string, number>;
  sourceLabel?: string;
};

export type DenialPatternRecord = {
  id: string;
  type?: "denial_pattern";
  pattern: string;
  riskLevel: "low" | "medium" | "high";
  caseCount?: number;
  sourceLabel?: string;
};

export type FederatedSummaryRecord = {
  id: string;
  type?: "federated_summary";
  siteCount: number;
  totalCases: number;
  totalDenials?: number;
  aggregatePatterns: DenialPatternRecord[];
  featureImportance?: Record<string, number>;
  privacyNote: string;
  sourceLabel?: string;
};

export type FederatedSummaryOutput = {
  siteCount: number;
  totalCases: number;
  totalDenials: number;
  denialRate: number;
  aggregatePatterns: DenialPatternRecord[];
  featureImportance: Array<{ feature: string; importance: number }>;
  privacyNote: string;
};

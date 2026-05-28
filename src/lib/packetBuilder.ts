import type {
  FoundEvidence,
  MissingEvidence,
  PacketDraftSentence,
  SourceCitation,
} from "./types";

export function buildSourceCitations(foundEvidence: FoundEvidence[]): SourceCitation[] {
  const citations = new Map<string, SourceCitation>();

  for (const evidence of foundEvidence) {
    citations.set(evidence.sourceId, {
      sourceId: evidence.sourceId,
      sourceLabel: evidence.sourceLabel,
      recordType: evidence.recordType,
    });
  }

  return Array.from(citations.values());
}

export function buildPacketDraftSentences(
  foundEvidence: FoundEvidence[],
  missingEvidence: MissingEvidence[],
): PacketDraftSentence[] {
  const foundSentences = foundEvidence.map((evidence) => ({
    text: `${evidence.summary} Source: ${evidence.sourceId}.`,
    sourceIds: [evidence.sourceId],
    requirementId: evidence.requirementId,
  }));

  const missingSentences = missingEvidence.map((missing) => ({
    text: `${missing.requirement} is missing from available synthetic records. Human review needed before this packet moves forward.`,
    sourceIds: [],
    requirementId: missing.requirementId,
  }));

  return [...foundSentences, ...missingSentences];
}

export function renderPacketDraftText(sentences: PacketDraftSentence[]): string {
  return sentences.map((sentence) => sentence.text).join("\n");
}

export function countUncitedClaims(sentences: PacketDraftSentence[]): number {
  return sentences.filter(
    (sentence) =>
      sentence.sourceIds.length === 0 &&
      !sentence.text.toLowerCase().includes("missing") &&
      !sentence.text.toLowerCase().includes("human review"),
  ).length;
}

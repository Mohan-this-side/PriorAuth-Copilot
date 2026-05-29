import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Eye,
  FileSearch,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import type { DemoStage, LearnedDenialPattern, RequirementEvidence } from "../lib/demoWorkflow";

type EvidencePacketProps = {
  demoStage: DemoStage;
  evidenceRows: RequirementEvidence[];
  foundCount: number;
  learnedPattern?: LearnedDenialPattern;
  missingCount: number;
  onAddSignedOrder: () => void;
  onRunChecklist: () => void;
  onSavePattern: () => void;
  onSimulateDenial: () => void;
  onStartSecondAttempt: () => void;
  totalCount: number;
};

const stageCopy: Record<DemoStage, string> = {
  first_review: "First packet attempt: one required criterion is still missing.",
  denied: "Simulated payer response: the packet was denied or delayed.",
  pattern_saved: "Denial pattern saved to the demo database.",
  second_review: "Second attempt: the same missing detail is present again.",
  warning_shown: "Gen-AI checklist warning is active for the repeated issue.",
  resolved: "Signed equipment order added; packet is complete for human review.",
};

export function EvidencePacket({
  demoStage,
  evidenceRows,
  foundCount,
  learnedPattern,
  missingCount,
  onAddSignedOrder,
  onRunChecklist,
  onSavePattern,
  onSimulateDenial,
  onStartSecondAttempt,
  totalCount,
}: EvidencePacketProps) {
  const packetDraft = [
    "Demo Patient A has a documented COPD diagnosis in sources enc-001 and enc-002.",
    "Recent oxygen saturation evidence is available in sources obs-001 and obs-002.",
    "Coverage context is available in sources cov-001 and eob-001.",
    missingCount === 0
      ? "Signed equipment order is present in source upload-001 and ready for human review."
      : "Signed equipment order is missing and requires human follow-up before submission.",
  ];

  return (
    <section className="panel panel-wide" id="step-3">
      <div className="panel-header">
        <div>
          <span className="section-step">3</span>
          <h2>Evidence Packet Builder</h2>
        </div>
        <span className={missingCount === 0 ? "review-status complete" : "review-status"}>
          {foundCount} of {totalCount} criteria ready
        </span>
      </div>

      <div className="demo-state-banner">
        <PlayCircle size={18} aria-hidden="true" />
        <span>{stageCopy[demoStage]}</span>
      </div>

      <div className="packet-layout">
        <div className="evidence-list">
          {evidenceRows.map(({ learnedPattern: rowPattern, requirement, source, status, summary, selected }) => (
            <article className="evidence-row" key={requirement}>
              <input
                aria-label={`Include ${requirement} in packet`}
                checked={Boolean(selected)}
                readOnly
                type="checkbox"
              />
              <div className={status === "found" ? "row-state found" : "row-state missing"}>
                {status === "found" ? (
                  <CheckCircle2 size={16} aria-hidden="true" />
                ) : (
                  <AlertTriangle size={16} aria-hidden="true" />
                )}
              </div>
              <div>
                <h3>{requirement}</h3>
                <p>{summary}</p>
                {rowPattern ? (
                  <span className="inline-warning">Prior denial pattern matched</span>
                ) : null}
              </div>
              {status === "found" ? (
                <code>{source}</code>
              ) : (
                <button className="secondary-button compact" onClick={onAddSignedOrder} type="button">
                  <Upload size={14} aria-hidden="true" />
                  Upload
                </button>
              )}
            </article>
          ))}
        </div>

        <div className="packet-preview">
          <div className="preview-header">
            <div>
              <h3>Packet Draft Preview</h3>
              <p>Generated text must stay source-cited.</p>
            </div>
            <button className="icon-button" aria-label="Preview packet" type="button">
              <Eye size={17} aria-hidden="true" />
            </button>
          </div>
          <ol>
            {packetDraft.map((sentence) => (
              <li key={sentence}>{sentence}</li>
            ))}
          </ol>
          <div className="guardrail-note">
            <ShieldCheck size={17} aria-hidden="true" />
            <span>Uncited AI claims: 0</span>
          </div>
          <div className="source-strip">
            <span>
              <FileSearch size={15} aria-hidden="true" />
              {missingCount === 0 ? "5" : "4"} sources cited
            </span>
            <span>
              {missingCount} reviewer action{missingCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      <div className="demo-action-panel">
        {demoStage === "first_review" ? (
          <>
            <div>
              <h3>First attempt</h3>
              <p>Leave the signed equipment order blank and simulate the payer response.</p>
            </div>
            <button className="primary-button" onClick={onSimulateDenial} type="button">
              Simulate payer response
            </button>
          </>
        ) : null}

        {demoStage === "denied" ? (
          <>
            <div>
              <h3>Denied / delayed</h3>
              <p>Reason: Missing required DME order documentation.</p>
            </div>
            <button className="primary-button" onClick={onSavePattern} type="button">
              <Database size={16} aria-hidden="true" />
              Save denial pattern
            </button>
          </>
        ) : null}

        {demoStage === "pattern_saved" ? (
          <>
            <div>
              <h3>Pattern stored</h3>
              <p>AuthAssist AI saved the missing signed equipment order as a repeat-denial risk.</p>
            </div>
            <button className="primary-button" onClick={onStartSecondAttempt} type="button">
              Start second attempt
            </button>
          </>
        ) : null}

        {demoStage === "second_review" ? (
          <>
            <div>
              <h3>Second attempt</h3>
              <p>The same signed equipment order detail is missing again.</p>
            </div>
            <button
              className="primary-button"
              disabled={!learnedPattern}
              onClick={onRunChecklist}
              type="button"
            >
              <Sparkles size={16} aria-hidden="true" />
              Run AuthAssist AI checklist
            </button>
          </>
        ) : null}

        {demoStage === "warning_shown" ? (
          <>
            <div>
              <h3>Checklist warning active</h3>
              <p>AuthAssist AI matched this packet to the prior denial pattern.</p>
            </div>
            <button className="primary-button" onClick={onAddSignedOrder} type="button">
              Add signed equipment order
            </button>
          </>
        ) : null}

        {demoStage === "resolved" ? (
          <>
            <div>
              <h3>Prior denial pattern resolved</h3>
              <p>All required criteria are present. Human review is still required before submission.</p>
            </div>
            <span className="review-status complete">Ready for human review</span>
          </>
        ) : null}
      </div>
    </section>
  );
}

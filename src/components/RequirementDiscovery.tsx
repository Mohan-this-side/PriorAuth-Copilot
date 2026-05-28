import { AlertTriangle, CheckCircle2, RefreshCw, Sparkles } from "lucide-react";
import type { DemoStage, LearnedDenialPattern, RequirementEvidence } from "../lib/demoWorkflow";

type RequirementDiscoveryProps = {
  demoStage: DemoStage;
  evidenceRows: RequirementEvidence[];
  foundCount: number;
  learnedPattern?: LearnedDenialPattern;
  missingCount: number;
  onRunChecklist: () => void;
  totalCount: number;
};

function StatusIcon({ status }: { status: RequirementEvidence["status"] }) {
  if (status === "missing") {
    return <AlertTriangle className="status-warn" size={16} aria-hidden="true" />;
  }

  return <CheckCircle2 className="status-good" size={16} aria-hidden="true" />;
}

export function RequirementDiscovery({
  demoStage,
  evidenceRows,
  foundCount,
  learnedPattern,
  missingCount,
  onRunChecklist,
  totalCount,
}: RequirementDiscoveryProps) {
  const canRunChecklist = demoStage === "second_review" && Boolean(learnedPattern);

  return (
    <section className="panel panel-wide" id="step-2">
      <div className="panel-header">
        <div>
          <span className="section-step">2</span>
          <h2>Requirement Discovery</h2>
        </div>
        {canRunChecklist ? (
          <button className="primary-button compact" onClick={onRunChecklist} type="button">
            <Sparkles size={15} aria-hidden="true" />
            Run AuthAssist AI checklist
          </button>
        ) : (
          <button className="secondary-button compact" type="button">
            <RefreshCw size={15} aria-hidden="true" />
            Evidence current
          </button>
        )}
      </div>

      <div className="status-summary">
        <div>
          <strong>{totalCount}</strong>
          <span>Requirements</span>
        </div>
        <div className="summary-good">
          <strong>{foundCount}</strong>
          <span>Likely met</span>
        </div>
        <div className="summary-warn">
          <strong>{missingCount}</strong>
          <span>Missing</span>
        </div>
        <div>
          <strong>{learnedPattern ? 1 : 0}</strong>
          <span>Prior patterns</span>
        </div>
      </div>

      {learnedPattern && demoStage !== "first_review" && demoStage !== "denied" ? (
        <div className="pattern-banner">
          <AlertTriangle size={18} aria-hidden="true" />
          <div>
            <strong>Prior denial pattern available</strong>
            <span>
              {learnedPattern.missingCriterion} previously caused a denial/delay for this service.
            </span>
          </div>
        </div>
      ) : null}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Requirement</th>
              <th>Status</th>
              <th>Evidence Match</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {evidenceRows.map((requirement) => (
              <tr key={requirement.requirement}>
                <td>
                  <span>{requirement.requirement}</span>
                  {requirement.learnedPattern ? (
                    <span className="inline-warning">Previously denied</span>
                  ) : null}
                </td>
                <td>
                  <span className="status-cell">
                    <StatusIcon status={requirement.status} />
                    {requirement.status === "found" ? "Likely Met" : "Missing"}
                  </span>
                </td>
                <td>{requirement.evidence}</td>
                <td>
                  <code>{requirement.source}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

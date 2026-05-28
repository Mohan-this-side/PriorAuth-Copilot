import { AlertTriangle, CheckCircle2, CircleMinus, RefreshCw } from "lucide-react";

const requirements = [
  {
    name: "COPD diagnosis",
    status: "Likely Met",
    evidence: "Problem list",
    source: "enc-001",
  },
  {
    name: "Recent oxygen saturation result",
    status: "Likely Met",
    evidence: "Oximetry 86%",
    source: "obs-001",
  },
  {
    name: "Recent encounter note",
    status: "Likely Met",
    evidence: "Pulmonary visit",
    source: "enc-002",
  },
  {
    name: "Signed equipment order",
    status: "Missing",
    evidence: "Needs upload",
    source: "-",
  },
  {
    name: "Coverage / EOB context",
    status: "Likely Met",
    evidence: "Demo EOB",
    source: "eob-001",
  },
  {
    name: "No concurrent hospice care",
    status: "Not Applicable",
    evidence: "Not required",
    source: "-",
  },
];

function StatusIcon({ status }: { status: string }) {
  if (status === "Missing") {
    return <AlertTriangle className="status-warn" size={16} aria-hidden="true" />;
  }

  if (status === "Not Applicable") {
    return <CircleMinus className="status-muted" size={16} aria-hidden="true" />;
  }

  return <CheckCircle2 className="status-good" size={16} aria-hidden="true" />;
}

export function RequirementDiscovery() {
  return (
    <section className="panel panel-wide" id="step-2">
      <div className="panel-header">
        <div>
          <span className="section-step">2</span>
          <h2>Requirement Discovery</h2>
        </div>
        <button className="secondary-button compact">
          <RefreshCw size={15} aria-hidden="true" />
          Re-run
        </button>
      </div>

      <div className="status-summary">
        <div>
          <strong>6</strong>
          <span>Requirements</span>
        </div>
        <div className="summary-good">
          <strong>4</strong>
          <span>Likely met</span>
        </div>
        <div className="summary-warn">
          <strong>1</strong>
          <span>Missing</span>
        </div>
        <div>
          <strong>1</strong>
          <span>Not applicable</span>
        </div>
      </div>

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
            {requirements.map((requirement) => (
              <tr key={requirement.name}>
                <td>{requirement.name}</td>
                <td>
                  <span className="status-cell">
                    <StatusIcon status={requirement.status} />
                    {requirement.status}
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

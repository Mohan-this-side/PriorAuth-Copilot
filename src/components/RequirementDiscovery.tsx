import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle.js";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2.js";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw.js";
import type { PacketOutput } from "../lib/types";

type RequirementDiscoveryProps = {
  packet: PacketOutput;
  requirements: string[];
};

function StatusIcon({ status }: { status: string }) {
  if (status === "Missing") {
    return <AlertTriangle className="status-warn" size={16} aria-hidden="true" />;
  }

  return <CheckCircle2 className="status-good" size={16} aria-hidden="true" />;
}

export function RequirementDiscovery({ packet, requirements }: RequirementDiscoveryProps) {
  const rows = requirements.map((requirement) => {
    const found = packet.foundEvidence.find((evidence) => evidence.requirement === requirement);
    const missing = packet.missingEvidence.find((evidence) => evidence.requirement === requirement);

    return {
      name: requirement,
      status: found ? "Likely Met" : "Missing",
      evidence: found?.summary ?? missing?.message ?? "Human review needed",
      source: found?.sourceId ?? "-",
    };
  });

  return (
    <section className="panel panel-wide" id="step-2">
      <div className="panel-header">
        <div>
          <span className="section-step">2</span>
          <h2>Requirement Discovery</h2>
        </div>
        <button className="secondary-button compact" type="button">
          <RefreshCw size={15} aria-hidden="true" />
          Re-run
        </button>
      </div>

      <div className="status-summary">
        <div>
          <strong>{rows.length}</strong>
          <span>Requirements</span>
        </div>
        <div className="summary-good">
          <strong>{packet.foundEvidence.length}</strong>
          <span>Likely met</span>
        </div>
        <div className="summary-warn">
          <strong>{packet.missingEvidence.length}</strong>
          <span>Missing</span>
        </div>
        <div>
          <strong>{Math.round(packet.completenessScore * 100)}%</strong>
          <span>Complete</span>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Requirement</th>
              <th scope="col">Status</th>
              <th scope="col">Evidence Match</th>
              <th scope="col">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((requirement) => (
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

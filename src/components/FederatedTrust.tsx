import LockKeyhole from "lucide-react/dist/esm/icons/lock-keyhole.js";
import TrendingDown from "lucide-react/dist/esm/icons/trending-down.js";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up.js";

const aggregatePatterns = [
  ["Missing recent oxygen test", "High", "96% coverage when present"],
  ["Missing diagnosis support", "High", "91% coverage when present"],
  ["Missing signed order", "Medium", "Needs staff follow-up"],
];

export function FederatedTrust() {
  return (
    <section className="panel panel-tall" id="step-4">
      <div className="panel-header">
        <div>
          <span className="section-step">4</span>
          <h2>Trust & Federated View</h2>
        </div>
        <span className="privacy-pill">
          <LockKeyhole size={14} aria-hidden="true" />
          Aggregate only
        </span>
      </div>

      <div className="trust-metrics">
        <div>
          <span>Sites</span>
          <strong>3</strong>
        </div>
        <div>
          <span>Cases simulated</span>
          <strong>142</strong>
        </div>
        <div>
          <span>Completeness lift</span>
          <strong>+18%</strong>
        </div>
      </div>

      <div className="pattern-list">
        {aggregatePatterns.map(([pattern, risk, note]) => (
          <article key={pattern}>
            <div>
              <h3>{pattern}</h3>
              <p>{note}</p>
            </div>
            <span className={risk === "High" ? "risk-high" : "risk-medium"}>{risk}</span>
          </article>
        ))}
      </div>

      <div className="privacy-callout">
        <LockKeyhole size={18} aria-hidden="true" />
        <div>
          <h3>Privacy-preserving simulation</h3>
          <p>
            Clinics share aggregate denial patterns only. No patient-level rows or real PHI are
            used in this demo.
          </p>
        </div>
      </div>

      <div className="trend-row">
        <span>
          <TrendingUp size={16} aria-hidden="true" />
          First-pass completeness
        </span>
        <span>
          <TrendingDown size={16} aria-hidden="true" />
          Manual review time
        </span>
      </div>
    </section>
  );
}

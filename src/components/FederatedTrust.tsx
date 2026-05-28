import { LockKeyhole, TrendingDown, TrendingUp } from "lucide-react";
import denialPatternsData from "../data/denial_patterns.json";
import federatedSummaryData from "../data/federated_summary.json";

export function FederatedTrust() {
  const topPatterns = denialPatternsData.patterns.slice(0, 4);

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
          <strong>{federatedSummaryData.aggregateCounts.clinicCount}</strong>
        </div>
        <div>
          <span>Cases simulated</span>
          <strong>{federatedSummaryData.aggregateCounts.priorAuthCases}</strong>
        </div>
        <div>
          <span>Rows shared</span>
          <strong>{federatedSummaryData.privacyExplanation.patientRowsShared}</strong>
        </div>
      </div>

      <div className="pattern-list">
        {topPatterns.map((pattern) => (
          <article key={pattern.patternId}>
            <div>
              <h3>{pattern.requirement}</h3>
              <p>{pattern.fixBeforeSubmitRecommendation}</p>
            </div>
            <span className={pattern.riskLevel === "high" ? "risk-high" : "risk-medium"}>
              {pattern.riskLevel}
            </span>
          </article>
        ))}
      </div>

      <div className="privacy-callout">
        <LockKeyhole size={18} aria-hidden="true" />
        <div>
          <h3>Privacy-preserving simulation</h3>
          <p>{federatedSummaryData.privacyExplanation.plainLanguage}</p>
        </div>
      </div>

      <div className="trend-row">
        <span>
          <TrendingUp size={16} aria-hidden="true" />
          First-pass completeness
        </span>
        <span>
          <TrendingDown size={16} aria-hidden="true" />
          Repeat denial risk
        </span>
      </div>
    </section>
  );
}

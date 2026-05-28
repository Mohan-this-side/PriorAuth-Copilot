import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileCheck2,
  FileText,
  LockKeyhole,
  Menu,
  Network,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  UserRoundCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { EvidencePacket } from "./components/EvidencePacket";
import { FederatedTrust } from "./components/FederatedTrust";
import { PatientIntake } from "./components/PatientIntake";
import { RequirementDiscovery } from "./components/RequirementDiscovery";

type WorkflowStep = {
  label: string;
  summary: string;
  icon: LucideIcon;
};

const workflowSteps: WorkflowStep[] = [
  {
    label: "Patient / Order Intake",
    summary: "Synthetic case profile, requested service, attachments, and clinical context.",
    icon: Stethoscope,
  },
  {
    label: "Requirement Discovery",
    summary: "Coverage requirements mapped to matched, missing, and not-applicable evidence.",
    icon: ClipboardCheck,
  },
  {
    label: "Evidence Packet Builder",
    summary: "Source-cited packet draft with reviewer actions for unresolved evidence.",
    icon: FileCheck2,
  },
  {
    label: "Trust & Federated View",
    summary: "Aggregate-only denial patterns, privacy note, and success metrics.",
    icon: Network,
  },
];

const auditTrail = [
  "Coverage requirements loaded for home oxygen therapy",
  "Synthetic chart records searched for required evidence",
  "Two missing evidence items flagged for human review",
  "Packet draft limited to source-cited statements",
];

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [packetReviewed, setPacketReviewed] = useState(false);
  const activeStep = workflowSteps[activeTab];

  const renderActiveWidget = () => {
    if (activeTab === 0) {
      return <PatientIntake />;
    }

    if (activeTab === 1) {
      return <RequirementDiscovery />;
    }

    if (activeTab === 2) {
      return <EvidencePacket />;
    }

    return <FederatedTrust />;
  };

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Workflow navigation">
        <div className="brand-row">
          <div className="brand-mark">
            <ShieldCheck size={24} aria-hidden="true" />
          </div>
          <div>
            <strong>AuthAssistent</strong>
            <span>Evidence Copilot</span>
          </div>
        </div>

        <nav className="workflow-nav" role="tablist" aria-label="Workflow sections">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <button
                type="button"
                aria-selected={activeTab === index}
                className={activeTab === index ? "workflow-link active" : "workflow-link"}
                key={step.label}
                onClick={() => setActiveTab(index)}
                role="tab"
              >
                <span className="step-number">{index + 1}</span>
                <Icon size={18} aria-hidden="true" />
                <span>{step.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <LockKeyhole size={18} aria-hidden="true" />
          <span>Synthetic demo data only</span>
        </div>
      </aside>

      <main className="main-pane">
        <header className="topbar">
          <button className="icon-button" aria-label="Open navigation">
            <Menu size={20} aria-hidden="true" />
          </button>
          <div>
            <h1>COPD Home Oxygen Therapy</h1>
            <p>Prior authorization packet for human review</p>
          </div>
          <div className="topbar-actions">
            <span className={packetReviewed ? "review-status complete" : "review-status"}>
              <UserRoundCheck size={16} aria-hidden="true" />
              {packetReviewed ? "Reviewed in Demo" : "Human Review Required"}
            </span>
          </div>
        </header>

        <section className="case-commandbar" aria-label="Case actions and metadata">
          <div className="case-meta">
            <span>Case ID AR-2026-0528-0017</span>
            <span>Created May 28, 2026</span>
            <span>Owner Clinic Staff</span>
          </div>
          <div className="case-actions">
            <button className="secondary-button compact">
              <Download size={15} aria-hidden="true" />
              Export Packet
            </button>
            <button className="secondary-button compact" onClick={() => setActiveTab(1)}>
              <RefreshCw size={15} aria-hidden="true" />
              Re-run Evidence
            </button>
          </div>
        </section>

        <section className="hero-strip" aria-label="Demo summary">
          <div>
            <h2>Prepare a cited prior-auth packet in one guided pass.</h2>
            <p>
              AuthAssistent checks synthetic patient and claims-style records, maps evidence to
              requirements, and keeps missing documentation visible before staff review.
            </p>
          </div>
          <div className="metric-strip">
            <div>
              <strong>78%</strong>
              <span>Completeness</span>
            </div>
            <div>
              <strong>0</strong>
              <span>Uncited claims</span>
            </div>
            <div>
              <strong>2</strong>
              <span>Missing items</span>
            </div>
          </div>
        </section>

        <section className="tab-workspace" aria-labelledby="active-workflow-title">
          <div className="workspace-header">
            <div>
              <span className="workspace-kicker">Step {activeTab + 1} of 4</span>
              <h2 id="active-workflow-title">{activeStep.label}</h2>
              <p>{activeStep.summary}</p>
            </div>
            <div className="workspace-progress" aria-label={`${activeTab + 1} of 4 workflow steps`}>
              {workflowSteps.map((step, index) => (
                <button
                  aria-label={step.label}
                  className={activeTab === index ? "progress-dot active" : "progress-dot"}
                  key={step.label}
                  onClick={() => setActiveTab(index)}
                  type="button"
                />
              ))}
            </div>
          </div>
          <div className="active-widget" role="tabpanel">
            {renderActiveWidget()}
          </div>
        </section>

        <section
          className={packetReviewed ? "review-band reviewed" : "review-band"}
          aria-label="Ready for human review"
        >
          <div className="review-copy">
            <CheckCircle2 size={24} aria-hidden="true" />
            <div>
              <h2>{packetReviewed ? "Review Step Captured" : "Ready for Human Review"}</h2>
              <p>
                {packetReviewed
                  ? "The demo now shows a completed reviewer checkpoint while preserving missing evidence warnings."
                  : "Staff can review source citations, resolve missing evidence, and decide whether this packet is complete enough to move forward."}
              </p>
            </div>
          </div>
          <div className="audit-list">
            {auditTrail.map((item) => (
              <div className="audit-item" key={item}>
                <FileText size={16} aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <button
            className="primary-button"
            onClick={() => {
              setActiveTab(2);
              setPacketReviewed(true);
            }}
          >
            {packetReviewed ? "Reviewed" : "Review Packet"}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </section>

        <footer className="safety-footer">
          <AlertTriangle size={16} aria-hidden="true" />
          <span>
            Demo guardrail: this prototype drafts review material only. It does not diagnose,
            recommend treatment, approve coverage, or submit authorizations.
          </span>
          <button
            className="ghost-button"
            onClick={() => {
              setActiveTab(0);
              setPacketReviewed(false);
            }}
          >
            <RefreshCw size={16} aria-hidden="true" />
            Reset Demo
          </button>
        </footer>
      </main>
    </div>
  );
}

export default App;

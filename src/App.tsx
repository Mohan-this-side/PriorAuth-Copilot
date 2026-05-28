import { type KeyboardEvent, useMemo, useState } from "react";
import { EvidencePacket } from "./components/EvidencePacket";
import { FederatedTrust } from "./components/FederatedTrust";
import { PatientIntake } from "./components/PatientIntake";
import { RequirementDiscovery } from "./components/RequirementDiscovery";
import demoCase from "./data/demoCase.json";
import { evaluatePriorAuthEvidence } from "./lib/evidenceEngine";
import type { EvidenceInput } from "./lib/types";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle.js";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right.js";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2.js";
import ClipboardCheck from "lucide-react/dist/esm/icons/clipboard-check.js";
import Download from "lucide-react/dist/esm/icons/download.js";
import FileCheck2 from "lucide-react/dist/esm/icons/file-check-2.js";
import FileText from "lucide-react/dist/esm/icons/file-text.js";
import LockKeyhole from "lucide-react/dist/esm/icons/lock-keyhole.js";
import Menu from "lucide-react/dist/esm/icons/menu.js";
import Network from "lucide-react/dist/esm/icons/network.js";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw.js";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check.js";
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope.js";
import UserRoundCheck from "lucide-react/dist/esm/icons/user-round-check.js";
import type { IconComponent } from "./types/icons";

type WorkflowStep = {
  label: string;
  summary: string;
  icon: IconComponent;
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
  const [navOpen, setNavOpen] = useState(false);
  const [packetReviewed, setPacketReviewed] = useState(false);
  const activeStep = workflowSteps[activeTab];
  const packet = useMemo(() => evaluatePriorAuthEvidence(demoCase as EvidenceInput), []);

  const selectTab = (index: number) => {
    setActiveTab(index);
    setNavOpen(false);
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") {
      return;
    }

    event.preventDefault();
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? workflowSteps.length - 1
          : event.key === "ArrowRight"
            ? (index + 1) % workflowSteps.length
            : (index - 1 + workflowSteps.length) % workflowSteps.length;

    selectTab(nextIndex);
    window.setTimeout(() => document.getElementById(`workflow-tab-${nextIndex}`)?.focus(), 0);
  };

  const renderActiveWidget = () => {
    if (activeTab === 0) {
      return <PatientIntake />;
    }

    if (activeTab === 1) {
      return <RequirementDiscovery packet={packet} requirements={demoCase.requirement.requiredEvidence} />;
    }

    if (activeTab === 2) {
      return <EvidencePacket packet={packet} />;
    }

    return <FederatedTrust />;
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <aside className={navOpen ? "sidebar open" : "sidebar"} aria-label="Workflow navigation">
        <div className="brand-row">
          <div className="brand-mark">
            <ShieldCheck size={24} aria-hidden="true" />
          </div>
          <div>
            <strong>AuthAssist AI</strong>
            <span>Evidence Copilot</span>
          </div>
        </div>

        <nav
          className="workflow-nav"
          id="workflow-navigation"
          role="tablist"
          aria-label="Workflow sections"
        >
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <button
                type="button"
                aria-controls="active-workflow-panel"
                aria-selected={activeTab === index}
                className={activeTab === index ? "workflow-link active" : "workflow-link"}
                id={`workflow-tab-${index}`}
                key={step.label}
                onClick={() => selectTab(index)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                role="tab"
                tabIndex={activeTab === index ? 0 : -1}
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

      <main className="main-pane" id="main-content">
        <header className="topbar">
          <button
            className="icon-button mobile-menu-button"
            aria-controls="workflow-navigation"
            aria-expanded={navOpen}
            aria-label={navOpen ? "Close workflow navigation" : "Open workflow navigation"}
            onClick={() => setNavOpen((open) => !open)}
            type="button"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
          <div>
            <h1>COPD Home Oxygen Therapy</h1>
            <p>Prior authorization packet for human review</p>
          </div>
          <div className="topbar-actions">
            <span
              aria-live="polite"
              className={packetReviewed ? "review-status complete" : "review-status"}
            >
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
            <button className="secondary-button compact" type="button">
              <Download size={15} aria-hidden="true" />
              Export Packet
            </button>
            <button className="secondary-button compact" onClick={() => selectTab(1)} type="button">
              <RefreshCw size={15} aria-hidden="true" />
              Re-run Evidence
            </button>
          </div>
        </section>

        <section className="hero-strip" aria-label="Demo summary">
          <div>
            <h2>Prepare a cited prior-auth packet in one guided pass.</h2>
            <p>
              AuthAssist AI checks synthetic patient and claims-style records, maps evidence to
              requirements, and keeps missing documentation visible before staff review.
            </p>
          </div>
          <div className="metric-strip">
            <div>
              <strong>{Math.round(packet.completenessScore * 100)}%</strong>
              <span>Completeness</span>
            </div>
            <div>
              <strong>{packet.uncitedClaims}</strong>
              <span>Uncited claims</span>
            </div>
            <div>
              <strong>{packet.missingEvidence.length}</strong>
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
                  aria-current={activeTab === index ? "step" : undefined}
                  aria-label={`Go to step ${index + 1}: ${step.label}`}
                  className={activeTab === index ? "progress-dot active" : "progress-dot"}
                  key={step.label}
                  onClick={() => selectTab(index)}
                  type="button"
                />
              ))}
            </div>
          </div>
          <div
            aria-labelledby={`workflow-tab-${activeTab}`}
            className="active-widget"
            id="active-workflow-panel"
            role="tabpanel"
            tabIndex={0}
          >
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
              selectTab(2);
              setPacketReviewed(true);
            }}
            type="button"
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
              selectTab(0);
              setPacketReviewed(false);
            }}
            type="button"
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

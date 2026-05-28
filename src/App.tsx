import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  Database,
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
import { useMemo, useState } from "react";
import { EvidencePacket } from "./components/EvidencePacket";
import { FederatedTrust } from "./components/FederatedTrust";
import { PatientIntake } from "./components/PatientIntake";
import { RequirementDiscovery } from "./components/RequirementDiscovery";
import coverageData from "./data/coverage_eob.json";
import encountersData from "./data/encounters.json";
import observationsData from "./data/observations.json";
import ordersData from "./data/orders.json";
import patientsData from "./data/patients.json";
import {
  clearLearnedDenialPatterns,
  findMatchingDenialPattern,
  readLearnedDenialPatterns,
  saveLearnedDenialPattern,
  signedEquipmentOrderPattern,
} from "./lib/demoWorkflow";
import type { DemoStage, LearnedDenialPattern, RequirementEvidence } from "./lib/demoWorkflow";

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
    summary: "Coverage requirements mapped to matched, missing, and learned denial-risk evidence.",
    icon: ClipboardCheck,
  },
  {
    label: "Evidence Packet Builder",
    summary: "Source-cited packet draft with denial-pattern actions for unresolved evidence.",
    icon: FileCheck2,
  },
  {
    label: "Trust & Federated View",
    summary: "Aggregate-only denial patterns, privacy note, and success metrics.",
    icon: Network,
  },
];

const isSecondAttemptStage = (stage: DemoStage) =>
  stage === "second_review" || stage === "warning_shown" || stage === "resolved";

const buildEvidenceRows = (
  signedOrderAdded: boolean,
  learnedPattern?: LearnedDenialPattern,
): RequirementEvidence[] => [
  {
    requirement: "COPD diagnosis",
    status: "found",
    evidence: "COPD documented",
    source: "enc-001, enc-002",
    summary: "COPD diagnosis appears in synthetic encounter and care coordination notes.",
    selected: true,
  },
  {
    requirement: "Recent oxygen saturation result",
    status: "found",
    evidence: "86% at rest",
    source: "obs-001, obs-002",
    summary: "Recent oxygen saturation evidence is available from synthetic observation records.",
    selected: true,
  },
  {
    requirement: "Recent encounter note",
    status: "found",
    evidence: "Pulmonary visit",
    source: "enc-001",
    summary: "Recent synthetic pulmonary follow-up note supports documentation review.",
    selected: true,
  },
  {
    requirement: "Signed equipment order",
    status: signedOrderAdded ? "found" : "missing",
    evidence: signedOrderAdded ? "Added in demo" : "Needs upload",
    source: signedOrderAdded ? "upload-001" : "-",
    summary: signedOrderAdded
      ? "Signed DME order was added during the demo before human review."
      : "Missing from available synthetic records. Human review needed.",
    selected: signedOrderAdded,
    learnedPattern,
  },
  {
    requirement: "Coverage/EOB context",
    status: "found",
    evidence: "Synthetic plan active",
    source: "cov-001, eob-001",
    summary: "Synthetic coverage and EOB-style context are available for review.",
    selected: true,
  },
];

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [packetReviewed, setPacketReviewed] = useState(false);
  const [demoStage, setDemoStage] = useState<DemoStage>("first_review");
  const [storedPatterns, setStoredPatterns] = useState<LearnedDenialPattern[]>(
    readLearnedDenialPatterns,
  );
  const activeStep = workflowSteps[activeTab];
  const activePatient = patientsData.find((patient) => patient.id === "patient-001") ?? patientsData[0];
  const activeOrder = ordersData.find((order) => order.id === "order-001") ?? ordersData[0];
  const activeEncounters = encountersData.filter((encounter) => encounter.patientId === activePatient.id);
  const activeObservations = observationsData.filter(
    (observation) => observation.patientId === activePatient.id,
  );
  const activeCoverageRecords = coverageData.filter((record) => record.patientId === activePatient.id);
  const signedOrderAdded = demoStage === "resolved";
  const missingCriteria = signedOrderAdded ? [] : ["Signed equipment order"];
  const matchingPattern = findMatchingDenialPattern(
    storedPatterns,
    activeOrder.service,
    missingCriteria,
  );
  const learnedPatternForChecklist = isSecondAttemptStage(demoStage) ? matchingPattern : undefined;
  const evidenceRows = useMemo(
    () => buildEvidenceRows(signedOrderAdded, learnedPatternForChecklist),
    [signedOrderAdded, learnedPatternForChecklist],
  );
  const foundCount = evidenceRows.filter((row) => row.status === "found").length;
  const missingCount = evidenceRows.length - foundCount;
  const auditTrail = [
    "Coverage requirements loaded for home oxygen therapy",
    "Synthetic chart records searched for required evidence",
    demoStage === "first_review"
      ? "Signed equipment order flagged for human review"
      : "Denial-pattern memory checked before repeat submission",
    demoStage === "resolved"
      ? "Prior denial pattern resolved before human review"
      : "Packet draft limited to source-cited statements",
  ];

  const simulatePayerResponse = () => {
    setDemoStage("denied");
    setActiveTab(2);
    setPacketReviewed(false);
  };

  const savePattern = () => {
    const nextPatterns = saveLearnedDenialPattern(signedEquipmentOrderPattern, storedPatterns);
    setStoredPatterns(nextPatterns);
    setDemoStage("pattern_saved");
    setActiveTab(2);
  };

  const startSecondAttempt = () => {
    setDemoStage("second_review");
    setActiveTab(1);
    setPacketReviewed(false);
  };

  const runAiChecklist = () => {
    setDemoStage("warning_shown");
    setActiveTab(1);
  };

  const addSignedOrder = () => {
    setDemoStage("resolved");
    setActiveTab(2);
    setPacketReviewed(false);
  };

  const resetDemo = () => {
    clearLearnedDenialPatterns();
    setStoredPatterns([]);
    setDemoStage("first_review");
    setActiveTab(0);
    setPacketReviewed(false);
  };

  const renderActiveWidget = () => {
    if (activeTab === 0) {
      return (
        <PatientIntake
          coverageRecords={activeCoverageRecords}
          encounters={activeEncounters}
          observations={activeObservations}
          order={activeOrder}
          patient={activePatient}
        />
      );
    }

    if (activeTab === 1) {
      return (
        <RequirementDiscovery
          demoStage={demoStage}
          evidenceRows={evidenceRows}
          foundCount={foundCount}
          learnedPattern={learnedPatternForChecklist}
          missingCount={missingCount}
          onRunChecklist={runAiChecklist}
          totalCount={evidenceRows.length}
        />
      );
    }

    if (activeTab === 2) {
      return (
        <EvidencePacket
          demoStage={demoStage}
          evidenceRows={evidenceRows}
          foundCount={foundCount}
          learnedPattern={matchingPattern}
          missingCount={missingCount}
          onAddSignedOrder={addSignedOrder}
          onRunChecklist={runAiChecklist}
          onSavePattern={savePattern}
          onSimulateDenial={simulatePayerResponse}
          onStartSecondAttempt={startSecondAttempt}
          totalCount={evidenceRows.length}
        />
      );
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
            <strong>AuthAssist AI</strong>
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
            <button className="secondary-button compact" type="button">
              <Download size={15} aria-hidden="true" />
              Export Packet
            </button>
            <button className="secondary-button compact" onClick={() => setActiveTab(1)} type="button">
              <RefreshCw size={15} aria-hidden="true" />
              Re-run Evidence
            </button>
          </div>
        </section>

        <section className="hero-strip" aria-label="Demo summary">
          <div>
            <h2>Prevent repeated prior-auth denials before staff submit.</h2>
            <p>
              AuthAssist AI checks synthetic patient and claims-style records, stores a simulated denial
              pattern, and warns staff when the same missing documentation appears again.
            </p>
          </div>
          <div className="metric-strip">
            <div>
              <strong>{foundCount}/{evidenceRows.length}</strong>
              <span>Completeness</span>
            </div>
            <div>
              <strong>0</strong>
              <span>Uncited claims</span>
            </div>
            <div>
              <strong>{missingCount}</strong>
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
                  ? "The demo now shows a completed reviewer checkpoint while preserving human accountability."
                  : demoStage === "resolved"
                    ? "The repeated denial pattern is resolved, all five criteria are present, and the packet is ready for staff review."
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
              setPacketReviewed(demoStage === "resolved");
            }}
            type="button"
          >
            {packetReviewed ? "Reviewed" : demoStage === "resolved" ? "Review Packet" : "Resolve Evidence First"}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </section>

        <footer className="safety-footer">
          <AlertTriangle size={16} aria-hidden="true" />
          <span>
            Demo guardrail: this prototype drafts review material only. It does not diagnose,
            recommend treatment, approve coverage, or submit authorizations.
          </span>
          <button className="ghost-button" onClick={resetDemo} type="button">
            <RefreshCw size={16} aria-hidden="true" />
            Reset Demo
          </button>
        </footer>
      </main>

      {demoStage === "warning_shown" && matchingPattern ? (
        <div className="modal-backdrop" role="presentation">
          <section
            aria-labelledby="ai-checklist-title"
            aria-modal="true"
            className="ai-modal"
            role="dialog"
          >
            <div className="modal-icon">
              <Brain size={24} aria-hidden="true" />
            </div>
            <div>
              <span className="workspace-kicker">Gen-AI checklist</span>
              <h2 id="ai-checklist-title">AuthAssist AI found a prior denial pattern</h2>
              <p>
                Last time, a similar home oxygen packet was denied or delayed because the{" "}
                <strong>{matchingPattern.missingCriterion}</strong> was missing.
              </p>
            </div>
            <div className="modal-evidence">
              <Database size={17} aria-hidden="true" />
              <div>
                <strong>{matchingPattern.denialReason}</strong>
                <span>{matchingPattern.source}</span>
              </div>
            </div>
            <div className="modal-action-copy">
              <AlertTriangle size={18} aria-hidden="true" />
              <span>{matchingPattern.recommendation}</span>
            </div>
            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setActiveTab(2)} type="button">
                Review packet
              </button>
              <button className="primary-button" onClick={addSignedOrder} type="button">
                Add signed equipment order
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export default App;

import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileSearch,
  Plus,
  ShieldCheck,
  Upload,
} from "lucide-react";

type EvidenceRow = {
  requirement: string;
  source: string;
  summary: string;
  state: "found" | "missing";
  selected: boolean;
};

const evidenceRows: EvidenceRow[] = [
  {
    requirement: "COPD diagnosis",
    source: "enc-001",
    summary: "COPD documented in synthetic encounter note.",
    state: "found",
    selected: true,
  },
  {
    requirement: "Recent oxygen saturation",
    source: "obs-001",
    summary: "Oxygen saturation recorded as 86%.",
    state: "found",
    selected: true,
  },
  {
    requirement: "Recent encounter note",
    source: "enc-002",
    summary: "Pulmonary visit supports equipment review.",
    state: "found",
    selected: true,
  },
  {
    requirement: "Signed equipment order",
    source: "-",
    summary: "Missing from available synthetic records.",
    state: "missing",
    selected: false,
  },
  {
    requirement: "Coverage / EOB context",
    source: "eob-001",
    summary: "Demo payer context available for review.",
    state: "found",
    selected: true,
  },
];

const packetDraft = [
  "Synthetic Patient A has a documented COPD diagnosis in source enc-001.",
  "Recent oxygen saturation evidence is available in source obs-001.",
  "Coverage context is available in source eob-001.",
  "Signed equipment order is missing and requires human follow-up before submission.",
];

export function EvidencePacket() {
  return (
    <section className="panel panel-wide" id="step-3">
      <div className="panel-header">
        <div>
          <span className="section-step">3</span>
          <h2>Evidence Packet Builder</h2>
        </div>
        <button className="secondary-button compact">
          <Plus size={15} aria-hidden="true" />
          Add Evidence
        </button>
      </div>

      <div className="packet-layout">
        <div className="evidence-list">
          {evidenceRows.map(({ requirement, source, summary, state, selected }) => (
            <article className="evidence-row" key={requirement}>
              <input
                aria-label={`Include ${requirement} in packet`}
                checked={Boolean(selected)}
                readOnly
                type="checkbox"
              />
              <div className={state === "found" ? "row-state found" : "row-state missing"}>
                {state === "found" ? (
                  <CheckCircle2 size={16} aria-hidden="true" />
                ) : (
                  <AlertTriangle size={16} aria-hidden="true" />
                )}
              </div>
              <div>
                <h3>{requirement}</h3>
                <p>{summary}</p>
              </div>
              {state === "found" ? (
                <code>{source}</code>
              ) : (
                <button className="secondary-button compact">
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
            <button className="icon-button" aria-label="Preview packet">
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
              4 sources cited
            </span>
            <span>1 reviewer action</span>
          </div>
        </div>
      </div>
    </section>
  );
}

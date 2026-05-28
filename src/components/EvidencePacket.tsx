import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle.js";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2.js";
import FileSearch from "lucide-react/dist/esm/icons/file-search.js";
import Plus from "lucide-react/dist/esm/icons/plus.js";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check.js";
import Upload from "lucide-react/dist/esm/icons/upload.js";
import { useEffect, useState } from "react";
import type { PacketOutput } from "../lib/types";

type EvidencePacketProps = {
  packet: PacketOutput;
};

export function EvidencePacket({ packet }: EvidencePacketProps) {
  const [llmDraft, setLlmDraft] = useState(packet.packetDraftText);
  const [llmMode, setLlmMode] = useState("deterministic-engine");
  const [llmStatus, setLlmStatus] = useState<"loading" | "ready" | "error">("loading");

  const evidenceRows = [
    ...packet.foundEvidence.map((evidence) => ({
      requirement: evidence.requirement,
      source: evidence.sourceId,
      summary: evidence.summary,
      state: "found" as const,
      selected: true,
    })),
    ...packet.missingEvidence.map((evidence) => ({
      requirement: evidence.requirement,
      source: "-",
      summary: evidence.message,
      state: "missing" as const,
      selected: false,
    })),
  ];

  useEffect(() => {
    let isMounted = true;

    const generateLlmDraft = async () => {
      setLlmStatus("loading");

      try {
        const response = await fetch("http://127.0.0.1:8000/api/packet-draft", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ packet }),
        });
        const data = await response.json();

        if (!response.ok && !data.draft) {
          throw new Error(data.error ?? "Unable to generate packet draft.");
        }

        if (!isMounted) {
          return;
        }

        setLlmDraft(data.draft);
        setLlmMode(data.mode ?? "llm");
        setLlmStatus(response.ok ? "ready" : "error");
      } catch {
        if (!isMounted) {
          return;
        }

        setLlmDraft(packet.packetDraftText);
        setLlmMode("deterministic-engine");
        setLlmStatus("error");
      }
    };

    generateLlmDraft();

    return () => {
      isMounted = false;
    };
  }, [packet]);

  return (
    <section className="panel panel-wide" id="step-3">
      <div className="panel-header">
        <div>
          <span className="section-step">3</span>
          <h2>Evidence Packet Builder</h2>
        </div>
        <button className="secondary-button compact" type="button">
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
                <button className="secondary-button compact" type="button">
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
              <h3>LLM Packet Draft Preview</h3>
              <p>Draft uses source-cited evidence and missing-evidence warnings.</p>
            </div>
            <span className="llm-status" aria-live="polite">
              {llmStatus === "loading" ? "Generating draft" : `Mode: ${llmMode}`}
            </span>
          </div>
          <pre className="llm-draft">{llmDraft}</pre>
          <div className="guardrail-note">
            <ShieldCheck size={17} aria-hidden="true" />
            <span>
              Mode: {llmMode}. Uncited AI claims allowed: {packet.uncitedClaims}
            </span>
          </div>
          <div className="source-strip">
            <span>
              <FileSearch size={15} aria-hidden="true" />
              {packet.sourceCitations.length} sources cited
            </span>
            <span>{packet.missingEvidence.length} reviewer action</span>
          </div>
        </div>
      </div>
    </section>
  );
}

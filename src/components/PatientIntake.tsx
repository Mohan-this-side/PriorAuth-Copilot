import { CalendarDays, FileText, Pencil, UserRound } from "lucide-react";

const clinicalSummary = [
  "Diagnosis: COPD",
  "Symptoms: dyspnea on exertion, chronic cough",
  "Current management: inhaled bronchodilator and rescue inhaler",
  "Former smoker; quit in 2018",
  "Evaluation requested for home oxygen therapy due to hypoxemia",
];

export function PatientIntake() {
  return (
    <section className="panel panel-tall" id="step-1">
      <div className="panel-header">
        <div>
          <span className="section-step">1</span>
          <h2>Patient / Order Intake</h2>
        </div>
        <button className="text-button">
          <Pencil size={15} aria-hidden="true" />
          Edit
        </button>
      </div>

      <div className="patient-card">
        <div className="avatar">
          <UserRound size={28} aria-hidden="true" />
        </div>
        <div>
          <h3>Synthetic Patient A</h3>
          <p>68 years old · Demo record · No PHI</p>
        </div>
      </div>

      <dl className="detail-grid">
        <div>
          <dt>Order / Service</dt>
          <dd>Home Oxygen Therapy</dd>
        </div>
        <div>
          <dt>Place of Service</dt>
          <dd>Home</dd>
        </div>
        <div>
          <dt>Ordering Provider</dt>
          <dd>Demo Provider</dd>
        </div>
        <div>
          <dt>Payer</dt>
          <dd>Demo Health Plan</dd>
        </div>
        <div>
          <dt>Date of Order</dt>
          <dd>May 12, 2026</dd>
        </div>
        <div>
          <dt>Requested Start</dt>
          <dd>May 15, 2026</dd>
        </div>
      </dl>

      <div className="clinical-summary">
        <h3>Clinical Summary</h3>
        <ul>
          {clinicalSummary.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="attachment-row" aria-label="Synthetic attachments">
        <span>
          <FileText size={16} aria-hidden="true" />
          Progress_Note.pdf
        </span>
        <span>
          <CalendarDays size={16} aria-hidden="true" />
          Oximetry_Report.pdf
        </span>
      </div>
    </section>
  );
}

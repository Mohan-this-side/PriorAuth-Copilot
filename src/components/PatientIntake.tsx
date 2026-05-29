import { CalendarDays, FileText, Pencil, UserRound } from "lucide-react";

type Patient = {
  displayName: string;
  age: number;
  dataNote: string;
  conditions: string[];
  careContext: string;
};

type Order = {
  service: string;
  serviceCategory: string;
  date: string;
  orderingRole: string;
  requestReason: string;
};

type Observation = {
  id: string;
  label: string;
  value: string;
  context: string;
};

type Encounter = {
  id: string;
  noteSummary: string;
};

type CoverageRecord = {
  id: string;
  type: string;
  planLabel?: string;
  coverageStatus?: string;
};

type PatientIntakeProps = {
  patient: Patient;
  order: Order;
  observations: Observation[];
  encounters: Encounter[];
  coverageRecords: CoverageRecord[];
};

export function PatientIntake({
  coverageRecords,
  encounters,
  observations,
  order,
  patient,
}: PatientIntakeProps) {
  const primaryObservation = observations[0];
  const primaryEncounter = encounters[0];
  const primaryCoverage = coverageRecords.find((record) => record.type === "coverage");
  const clinicalSummary = [
    `Diagnosis context: ${patient.conditions.join(", ")}`,
    patient.careContext,
    primaryObservation
      ? `${primaryObservation.label}: ${primaryObservation.value} (${primaryObservation.id})`
      : "Oxygen saturation evidence missing",
    primaryEncounter ? primaryEncounter.noteSummary : "Recent encounter note missing",
    order.requestReason,
  ];

  return (
    <section className="panel panel-tall" id="step-1">
      <div className="panel-header">
        <div>
          <span className="section-step">1</span>
          <h2>Patient / Order Intake</h2>
        </div>
        <button className="text-button" type="button">
          <Pencil size={15} aria-hidden="true" />
          Edit
        </button>
      </div>

      <div className="patient-card">
        <div className="avatar">
          <UserRound size={28} aria-hidden="true" />
        </div>
        <div>
          <h3>{patient.displayName}</h3>
          <p>
            {patient.age} years old · {patient.dataNote}
          </p>
        </div>
      </div>

      <dl className="detail-grid">
        <div>
          <dt>Order / Service</dt>
          <dd>{order.service}</dd>
        </div>
        <div>
          <dt>Category</dt>
          <dd>{order.serviceCategory}</dd>
        </div>
        <div>
          <dt>Ordering Role</dt>
          <dd>{order.orderingRole}</dd>
        </div>
        <div>
          <dt>Payer Context</dt>
          <dd>{primaryCoverage?.planLabel ?? "Demo plan context"}</dd>
        </div>
        <div>
          <dt>Date of Order</dt>
          <dd>{order.date}</dd>
        </div>
        <div>
          <dt>Coverage Status</dt>
          <dd>{primaryCoverage?.coverageStatus ?? "Demo coverage available"}</dd>
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

      <div className="attachment-row" aria-label="Demo attachments">
        <span>
          <FileText size={16} aria-hidden="true" />
          Encounter_{primaryEncounter?.id ?? "missing"}.json
        </span>
        <span>
          <CalendarDays size={16} aria-hidden="true" />
          Oximetry_{primaryObservation?.id ?? "missing"}.json
        </span>
      </div>
    </section>
  );
}

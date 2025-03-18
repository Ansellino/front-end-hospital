/* 
Create EMR components:

PatientChart - Complete patient medical overview
VisitNotes - Record clinical observations
VitalSigns - Record and track vital signs
DiagnosisForm - Add diagnoses with ICD codes
TreatmentPlan - Document treatment plans
PrescriptionWriter - Generate prescriptions
*/

export interface MedicalRecord {
  id: string;
  patientId: string;
  visitId: string;
  doctorId: string;
  visitDate: string;
  chiefComplaint: string;
  vitalSigns: VitalSigns;
  diagnosis: Diagnosis[];
  treatment: Treatment;
  notes: string;
  followUpRecommended: boolean;
  followUpDate?: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface VitalSigns {
  temperature: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  height: number;
  weight: number;
}

export interface Diagnosis {
  code: string;
  description: string;
  type: "primary" | "secondary";
  notes: string;
}

export interface Treatment {
  medications: PrescribedMedication[];
  procedures: Procedure[];
  instructions: string;
}

export interface PrescribedMedication {
  medicationId: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  refills: number;
  instructions: string;
}

export interface Procedure {
  code: string;
  name: string;
  notes: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedOn: string;
  description: string;
  url: string;
}

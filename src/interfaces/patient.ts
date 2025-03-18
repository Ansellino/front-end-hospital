/* 
Create patient components:

PatientList - Table view of all patients
PatientDetails - Detailed view of a patient
PatientForm - Form for adding/editing patients
MedicalHistoryPanel - Display/edit medical history
PatientSearch - Search functionality with filters
 */

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  contactNumber: string;
  email: string;
  address: Address;
  emergencyContact: EmergencyContact;
  medicalHistory: MedicalHistory;
  insuranceInfo: InsuranceInfo;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  contactNumber: string;
}

export interface MedicalHistory {
  allergies: string[];
  chronicConditions: string[];
  surgeries: Surgery[];
  medications: Medication[];
}

export interface Surgery {
  procedure: string;
  date: string;
  notes: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber: string;
  validUntil: string;
}

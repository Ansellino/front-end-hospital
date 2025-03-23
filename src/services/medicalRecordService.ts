import api from "./api";
import { v4 as uuidv4 } from "uuid";
import {
  MedicalRecord,
  VitalSigns,
  Diagnosis,
  Treatment,
  PrescribedMedication,
  Procedure,
  Attachment,
} from "../interfaces/emr";

/**
 * Service for handling medical record-related API operations
 */
const MedicalRecordService = {
  /**
   * Get all medical records
   */
  getAllMedicalRecords: async (): Promise<MedicalRecord[]> => {
    try {
      const response = await api.get("/medical-records");
      return response.data;
    } catch (error) {
      console.error("Error fetching medical records:", error);
      // Return mock data for demo purposes
      return generateMockMedicalRecords(10);
    }
  },

  /**
   * Get a single medical record by ID
   */
  getMedicalRecord: async (id: string): Promise<MedicalRecord> => {
    try {
      const response = await api.get(`/medical-records/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching medical record ${id}:`, error);
      // Return mock data for demo purposes
      return generateMockMedicalRecords(1)[0];
    }
  },

  /**
   * Get medical records for a specific patient
   */
  getPatientMedicalRecords: async (
    patientId: string
  ): Promise<MedicalRecord[]> => {
    try {
      const response = await api.get(`/medical-records?patientId=${patientId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching medical records for patient ${patientId}:`,
        error
      );
      // Return mock data for demo purposes
      return generateMockMedicalRecords(5, patientId);
    }
  },

  /**
   * Get medical records created by a specific doctor
   */
  getDoctorMedicalRecords: async (
    doctorId: string
  ): Promise<MedicalRecord[]> => {
    try {
      const response = await api.get(`/medical-records?doctorId=${doctorId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching medical records by doctor ${doctorId}:`,
        error
      );
      // Return mock data for demo purposes
      return generateMockMedicalRecords(5, undefined, doctorId);
    }
  },

  /**
   * Create a new medical record
   */
  createMedicalRecord: async (
    data: Omit<MedicalRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<MedicalRecord> => {
    try {
      const response = await api.post("/medical-records", data);
      return response.data;
    } catch (error) {
      console.error("Error creating medical record:", error);
      // Return mock data for demo purposes
      const now = new Date().toISOString();
      return {
        id: `mr-${uuidv4().substring(0, 8)}`,
        ...data,
        createdAt: now,
        updatedAt: now,
      };
    }
  },

  /**
   * Update an existing medical record
   */
  updateMedicalRecord: async (
    id: string,
    data: Partial<Omit<MedicalRecord, "id" | "createdAt" | "updatedAt">>
  ): Promise<MedicalRecord> => {
    try {
      const response = await api.put(`/medical-records/${id}`, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating medical record ${id}:`, error);
      // Return mock data for demo purposes
      const existingRecord = await MedicalRecordService.getMedicalRecord(id);
      return {
        ...existingRecord,
        ...data,
        updatedAt: new Date().toISOString(),
      };
    }
  },

  /**
   * Delete a medical record
   */
  deleteMedicalRecord: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/medical-records/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting medical record ${id}:`, error);
      return false;
    }
  },

  /**
   * Add an attachment to a medical record
   */
  addAttachment: async (
    medicalRecordId: string,
    attachment: Omit<Attachment, "id" | "uploadedOn">
  ): Promise<Attachment> => {
    try {
      const response = await api.post(
        `/medical-records/${medicalRecordId}/attachments`,
        attachment
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error adding attachment to medical record ${medicalRecordId}:`,
        error
      );
      // Return mock data for demo purposes
      return {
        id: `att-${uuidv4().substring(0, 8)}`,
        ...attachment,
        uploadedOn: new Date().toISOString(),
      };
    }
  },
};

/**
 * Generate mock medical records for development/testing
 */
const generateMockMedicalRecords = (
  count: number = 10,
  patientId?: string,
  doctorId?: string
): MedicalRecord[] => {
  const records: MedicalRecord[] = [];

  const diagnosisList = [
    {
      code: "J03.9",
      description: "Acute tonsillitis",
      type: "primary" as const,
      notes: "Bacterial infection suspected",
    },
    {
      code: "J40",
      description: "Bronchitis",
      type: "primary" as const,
      notes: "Acute, viral origin",
    },
    {
      code: "I10",
      description: "Essential hypertension",
      type: "secondary" as const,
      notes: "Well controlled",
    },
    {
      code: "E11.9",
      description: "Type 2 diabetes mellitus",
      type: "secondary" as const,
      notes: "Without complications",
    },
    {
      code: "M54.5",
      description: "Low back pain",
      type: "primary" as const,
      notes: "Mechanical in nature",
    },
  ];

  const medications = [
    {
      medicationId: "med-001",
      name: "Amoxicillin",
      dosage: "500mg",
      frequency: "3 times daily",
      duration: "7 days",
      quantity: 21,
      refills: 0,
      instructions: "Take with food",
    },
    {
      medicationId: "med-002",
      name: "Ibuprofen",
      dosage: "400mg",
      frequency: "every 6 hours as needed",
      duration: "5 days",
      quantity: 20,
      refills: 0,
      instructions: "Take with food for pain relief",
    },
    {
      medicationId: "med-003",
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "once daily",
      duration: "30 days",
      quantity: 30,
      refills: 2,
      instructions: "Take in the morning",
    },
  ];

  const procedures = [
    {
      code: "99213",
      name: "Office visit, established patient",
      notes: "Routine follow-up",
    },
    { code: "81002", name: "Urinalysis", notes: "Dipstick test performed" },
    {
      code: "36415",
      name: "Blood draw",
      notes: "Venipuncture for lab testing",
    },
  ];

  for (let i = 0; i < count; i++) {
    const now = new Date();
    const visitDate = new Date(now);
    visitDate.setDate(visitDate.getDate() - Math.floor(Math.random() * 30));

    const followUpRecommended = Math.random() > 0.5;
    const followUpDate = followUpRecommended
      ? new Date(
          visitDate.getTime() +
            (14 + Math.floor(Math.random() * 30)) * 24 * 60 * 60 * 1000
        ).toISOString()
      : undefined;

    const randomDiagnoses = [];
    const diagnosisCount = 1 + Math.floor(Math.random() * 2);
    for (let j = 0; j < diagnosisCount; j++) {
      randomDiagnoses.push(
        diagnosisList[Math.floor(Math.random() * diagnosisList.length)]
      );
    }

    const randomMedications = [];
    const medicationCount = Math.floor(Math.random() * 3);
    for (let j = 0; j < medicationCount; j++) {
      randomMedications.push(
        medications[Math.floor(Math.random() * medications.length)]
      );
    }

    const randomProcedures = [];
    const procedureCount = Math.floor(Math.random() * 2);
    for (let j = 0; j < procedureCount; j++) {
      randomProcedures.push(
        procedures[Math.floor(Math.random() * procedures.length)]
      );
    }

    const vitalSigns: VitalSigns = {
      temperature: 36.5 + Math.random() * 1.5,
      bloodPressureSystolic: 110 + Math.floor(Math.random() * 40),
      bloodPressureDiastolic: 70 + Math.floor(Math.random() * 20),
      heartRate: 60 + Math.floor(Math.random() * 40),
      respiratoryRate: 12 + Math.floor(Math.random() * 8),
      oxygenSaturation: 95 + Math.floor(Math.random() * 5),
      height: 150 + Math.floor(Math.random() * 50),
      weight: 50 + Math.floor(Math.random() * 50),
    };

    const treatment: Treatment = {
      medications: randomMedications,
      procedures: randomProcedures,
      instructions:
        "Rest, hydrate, and follow medication schedule as prescribed.",
    };

    const record: MedicalRecord = {
      id: `mr-${uuidv4().substring(0, 8)}`,
      patientId: patientId || `pat-${uuidv4().substring(0, 8)}`,
      visitId: `vis-${uuidv4().substring(0, 8)}`,
      doctorId: doctorId || `doc-${uuidv4().substring(0, 8)}`,
      visitDate: visitDate.toISOString(),
      chiefComplaint:
        "Patient reports fever, sore throat, and fatigue for 3 days",
      vitalSigns,
      diagnosis: randomDiagnoses,
      treatment,
      notes: "Patient appears to be responding well to treatment plan.",
      followUpRecommended,
      followUpDate,
      attachments: [],
      createdAt: visitDate.toISOString(),
      updatedAt: now.toISOString(),
    };

    records.push(record);
  }

  return records;
};

export default MedicalRecordService;

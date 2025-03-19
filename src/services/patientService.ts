import api from "./api";
import {
  Patient,
  Address,
  EmergencyContact,
  MedicalHistory,
  InsuranceInfo,
  Surgery,
  Medication,
} from "../interfaces/patient";
import { v4 as uuidv4 } from "uuid";
import { subYears, subMonths, addMonths, format } from "date-fns";

/**
 * Get all patients with optional filtering parameters
 */
export const getPatients = async (params?: any) => {
  try {
    const response = await api.get("/patients", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching patients:", error);
    // Return mock data if API fails
    return generateMockPatients();
  }
};

/**
 * Get a patient by ID
 */
export const getPatientById = async (id: string) => {
  try {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching patient with id ${id}:`, error);
    // Return first mock data item or generate one with this id
    const mockPatients = generateMockPatients();
    return mockPatients.find((patient) => patient.id === id) || mockPatients[0];
  }
};

/**
 * Create a new patient
 */
export const createPatient = async (
  data: Omit<Patient, "id" | "createdAt" | "updatedAt">
) => {
  try {
    const response = await api.post("/patients", data);
    return response.data;
  } catch (error) {
    console.error("Error creating patient:", error);
    // Return the data with a mock ID for demo purposes
    return {
      id: `mock-${uuidv4()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
};

/**
 * Update an existing patient
 */
export const updatePatient = async (id: string, data: Partial<Patient>) => {
  try {
    const response = await api.put(`/patients/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating patient with id ${id}:`, error);
    // Return modified data for demo purposes
    return {
      id,
      ...data,
      updatedAt: new Date().toISOString(),
    };
  }
};

/**
 * Delete a patient
 */
export const deletePatient = async (id: string) => {
  try {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting patient with id ${id}:`, error);
    // Return success response for demo purposes
    return { success: true, id };
  }
};

/**
 * For development/demo environments - create mock patient data when API is not available
 */
export const generateMockPatients = (count: number = 50): Patient[] => {
  // Common data arrays for generating realistic values
  const firstNames = [
    "James",
    "John",
    "Robert",
    "Michael",
    "William",
    "David",
    "Richard",
    "Joseph",
    "Thomas",
    "Charles",
    "Mary",
    "Patricia",
    "Jennifer",
    "Linda",
    "Elizabeth",
    "Barbara",
    "Susan",
    "Jessica",
    "Sarah",
    "Karen",
    "Emma",
    "Olivia",
    "Sophia",
    "Isabella",
    "Charlotte",
    "Amelia",
    "Mia",
    "Harper",
    "Evelyn",
    "Abigail",
  ];

  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Jones",
    "Brown",
    "Davis",
    "Miller",
    "Wilson",
    "Moore",
    "Taylor",
    "Anderson",
    "Thomas",
    "Jackson",
    "White",
    "Harris",
    "Martin",
    "Thompson",
    "Garcia",
    "Martinez",
    "Robinson",
    "Clark",
    "Rodriguez",
    "Lewis",
    "Lee",
    "Walker",
    "Hall",
    "Allen",
    "Young",
    "Hernandez",
    "King",
  ];

  const streets = [
    "123 Main St",
    "456 Oak Ave",
    "789 Pine Rd",
    "321 Maple Dr",
    "654 Elm Blvd",
    "987 Cedar Ln",
    "135 Walnut Way",
    "246 Birch St",
    "579 Willow Ave",
    "864 Cherry Rd",
  ];

  const cities = [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
    "Philadelphia",
    "San Antonio",
    "San Diego",
    "Dallas",
    "San Jose",
    "Boston",
    "Seattle",
    "Miami",
    "Denver",
    "Atlanta",
    "Portland",
    "Detroit",
    "Minneapolis",
    "San Francisco",
  ];

  const states = [
    "NY",
    "CA",
    "IL",
    "TX",
    "AZ",
    "PA",
    "FL",
    "GA",
    "OH",
    "NC",
    "MI",
    "WA",
    "MA",
    "CO",
    "TN",
    "OR",
    "WI",
    "MN",
    "SC",
    "AL",
    "LA",
    "KY",
  ];

  const allergies = [
    "Penicillin",
    "Peanuts",
    "Tree nuts",
    "Shellfish",
    "Eggs",
    "Milk",
    "Soy",
    "Wheat",
    "Fish",
    "Sulfa drugs",
    "NSAIDs",
    "Latex",
    "Bee stings",
    "Pollen",
    "Dust mites",
    "Mold",
    "Pet dander",
    "Sesame",
  ];

  const chronicConditions = [
    "Hypertension",
    "Diabetes Type 2",
    "Diabetes Type 1",
    "Asthma",
    "COPD",
    "Arthritis",
    "Heart disease",
    "Depression",
    "Anxiety",
    "Obesity",
    "Hypothyroidism",
    "Hyperthyroidism",
    "Migraine",
    "Epilepsy",
    "GERD",
    "Crohn's disease",
    "Ulcerative colitis",
    "Multiple sclerosis",
  ];

  const surgeries = [
    "Appendectomy",
    "Tonsillectomy",
    "Cholecystectomy",
    "Hernia repair",
    "Joint replacement",
    "LASIK",
    "Coronary bypass",
    "Cesarean section",
    "Spinal fusion",
    "Cataract removal",
    "Knee arthroscopy",
    "Mastectomy",
  ];

  const medications = [
    "Lisinopril",
    "Metformin",
    "Amlodipine",
    "Atorvastatin",
    "Levothyroxine",
    "Albuterol",
    "Omeprazole",
    "Gabapentin",
    "Hydrochlorothiazide",
    "Metoprolol",
    "Losartan",
    "Simvastatin",
    "Sertraline",
    "Fluoxetine",
    "Escitalopram",
  ];

  const dosages = [
    "5mg",
    "10mg",
    "20mg",
    "25mg",
    "40mg",
    "50mg",
    "75mg",
    "100mg",
    "150mg",
    "200mg",
    "250mg",
    "500mg",
    "1g",
  ];

  const frequencies = [
    "Once daily",
    "Twice daily",
    "Three times daily",
    "Four times daily",
    "Every 4 hours",
    "Every 6 hours",
    "Every 8 hours",
    "Every 12 hours",
    "As needed",
    "Weekly",
    "Twice weekly",
    "Monthly",
    "With meals",
  ];

  const insuranceProviders = [
    "Blue Cross Blue Shield",
    "Aetna",
    "UnitedHealthcare",
    "Cigna",
    "Humana",
    "Kaiser Permanente",
    "Medicare",
    "Medicaid",
    "Anthem",
    "Centene",
    "Molina Healthcare",
    "WellCare",
  ];

  const relationships = [
    "Spouse",
    "Parent",
    "Child",
    "Sibling",
    "Friend",
    "Guardian",
    "Partner",
    "Grandparent",
    "Aunt",
    "Uncle",
    "Cousin",
    "In-law",
  ];

  // Generate mock patients
  return Array.from({ length: count }, (_, i): Patient => {
    const id = `P${String(i + 1).padStart(5, "0")}`;
    const gender =
      Math.random() > 0.5 ? "male" : Math.random() > 0.9 ? "other" : "female";
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    // Generate dates
    const birthYear = Math.floor(Math.random() * 80) + 1940;
    const birthDate = new Date(
      birthYear,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    );
    const dateOfBirth = format(birthDate, "yyyy-MM-dd");

    const createdAtDate = subMonths(new Date(), Math.floor(Math.random() * 36));
    const createdAt = createdAtDate.toISOString();
    const updatedAt = subMonths(
      new Date(),
      Math.floor(Math.random() * 6)
    ).toISOString();

    // Generate address
    const address: Address = {
      street: streets[Math.floor(Math.random() * streets.length)],
      city: cities[Math.floor(Math.random() * cities.length)],
      state: states[Math.floor(Math.random() * states.length)],
      zipCode: String(10000 + Math.floor(Math.random() * 90000)),
      country: "United States",
    };

    // Generate emergency contact
    const emergencyContact: EmergencyContact = {
      name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
        lastNames[Math.floor(Math.random() * lastNames.length)]
      }`,
      relationship:
        relationships[Math.floor(Math.random() * relationships.length)],
      contactNumber: `+1-${Math.floor(Math.random() * 900) + 100}-${
        Math.floor(Math.random() * 900) + 100
      }-${Math.floor(Math.random() * 9000) + 1000}`,
    };

    // Generate Medical History
    const numAllergies = Math.floor(Math.random() * 3);
    const patientAllergies: string[] = [];
    for (let j = 0; j < numAllergies; j++) {
      const allergy = allergies[Math.floor(Math.random() * allergies.length)];
      if (!patientAllergies.includes(allergy)) {
        patientAllergies.push(allergy);
      }
    }

    const numConditions = Math.floor(Math.random() * 2);
    const patientConditions: string[] = [];
    for (let j = 0; j < numConditions; j++) {
      const condition =
        chronicConditions[Math.floor(Math.random() * chronicConditions.length)];
      if (!patientConditions.includes(condition)) {
        patientConditions.push(condition);
      }
    }

    const numSurgeries = Math.floor(Math.random() * 2);
    const patientSurgeries: Surgery[] = [];
    for (let j = 0; j < numSurgeries; j++) {
      const surgeryDate = subYears(
        new Date(),
        Math.floor(Math.random() * 10) + 1
      );
      patientSurgeries.push({
        procedure: surgeries[Math.floor(Math.random() * surgeries.length)],
        date: format(surgeryDate, "yyyy-MM-dd"),
        notes:
          Math.random() > 0.5
            ? "Procedure completed successfully without complications."
            : "Patient recovered well after the procedure.",
      });
    }

    const numMedications = Math.floor(Math.random() * 3);
    const patientMedications: Medication[] = [];
    for (let j = 0; j < numMedications; j++) {
      const startDate = subMonths(new Date(), Math.floor(Math.random() * 24));
      const endDate =
        Math.random() > 0.7
          ? format(
              addMonths(startDate, Math.floor(Math.random() * 12)),
              "yyyy-MM-dd"
            )
          : undefined;

      patientMedications.push({
        name: medications[Math.floor(Math.random() * medications.length)],
        dosage: dosages[Math.floor(Math.random() * dosages.length)],
        frequency: frequencies[Math.floor(Math.random() * frequencies.length)],
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate,
      });
    }

    const medicalHistory: MedicalHistory = {
      allergies: patientAllergies,
      chronicConditions: patientConditions,
      surgeries: patientSurgeries,
      medications: patientMedications,
    };

    // Generate insurance info
    const expiryDate = addMonths(
      new Date(),
      Math.floor(Math.random() * 24) + 6
    );
    const insuranceInfo: InsuranceInfo = {
      provider:
        insuranceProviders[
          Math.floor(Math.random() * insuranceProviders.length)
        ],
      policyNumber: `POL-${Math.floor(Math.random() * 900000) + 100000}`,
      groupNumber: `GRP-${Math.floor(Math.random() * 9000) + 1000}`,
      validUntil: format(expiryDate, "yyyy-MM-dd"),
    };

    return {
      id,
      firstName,
      lastName,
      dateOfBirth,
      gender: gender as "male" | "female" | "other",
      contactNumber: `+1-${Math.floor(Math.random() * 900) + 100}-${
        Math.floor(Math.random() * 900) + 100
      }-${Math.floor(Math.random() * 9000) + 1000}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(
        Math.random() * 100
      )}@email.com`,
      address,
      emergencyContact,
      medicalHistory,
      insuranceInfo,
      createdAt,
      updatedAt,
    };
  });
};

// Helper function to search patients by query string
export const searchPatients = async (query: string) => {
  try {
    const response = await api.get(`/patients/search?q=${query}`);
    return response.data;
  } catch (error) {
    console.error(`Error searching patients with query ${query}:`, error);
    // Return filtered mock data for demo purposes
    const mockPatients = generateMockPatients();
    const lowerQuery = query.toLowerCase();

    return mockPatients.filter(
      (patient) =>
        patient.firstName.toLowerCase().includes(lowerQuery) ||
        patient.lastName.toLowerCase().includes(lowerQuery) ||
        patient.email.toLowerCase().includes(lowerQuery) ||
        patient.contactNumber.includes(query)
    );
  }
};

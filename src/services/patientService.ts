// services/patientService.ts
import api from "./api";
import { Patient } from "../interfaces/patient";

export const getPatients = async (params?: any) => {
  const response = await api.get("/patients", { params });
  return response.data;
};

export const getPatientById = async (id: string) => {
  const response = await api.get(`/patients/${id}`);
  return response.data;
};

export const createPatient = async (
  data: Omit<Patient, "id" | "createdAt" | "updatedAt">
) => {
  const response = await api.post("/patients", data);
  return response.data;
};

export const updatePatient = async (id: string, data: Partial<Patient>) => {
  const response = await api.put(`/patients/${id}`, data);
  return response.data;
};

export const deletePatient = async (id: string) => {
  const response = await api.delete(`/patients/${id}`);
  return response.data;
};

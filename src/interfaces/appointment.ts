/*
Create appointment components:
AppointmentCalendar - Monthly/weekly calendar view
DailySchedule - Day view of appointments
AppointmentForm - Create/edit appointments
CheckInProcess - Patient check-in workflow
*/

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  title: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "completed" | "canceled" | "no-show";
  type: "follow-up" | "new-patient" | "emergency" | "routine";
  notes: string;
  createdAt: string;
  updatedAt: string;
}

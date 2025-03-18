import { Appointment } from '../../interfaces/appointment';

export enum ViewMode {
  Day = 'day',
  Week = 'week',
  Month = 'month'
}

export interface DayWithAppointments {
  date: Date;
  appointments: Appointment[];
  isCurrentMonth?: boolean;
}
# Healthcare Management System

A comprehensive hospital and healthcare management application built with React and TypeScript. This system provides a unified platform for managing patients, doctors, appointments, medical records, prescriptions, and more. The application streamlines healthcare operations and improves patient care through integrated digital solutions.

![Healthcare Management System](https://via.placeholder.com/1200x600?text=Healthcare+Management+System)

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [System Requirements](#system-requirements)
- [Installation and Setup](#installation-and-setup)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [API Integration](#api-integration)
- [Key Components](#key-components)
- [State Management](#state-management)
- [Authentication and Authorization](#authentication-and-authorization)
- [Available Scripts](#available-scripts)
- [Development Guidelines](#development-guidelines)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

The system provides comprehensive functionality covering all aspects of healthcare management:

### Patient Management

- **Patient Registration**: Complete patient onboarding with personal and insurance information
- **Patient Records**: Comprehensive profiles with demographic data, contact details, and medical history
- **Patient Portal**: Access to personal medical records, appointments, and billing information

### Doctor & Staff Management

- **Staff Profiles**: Comprehensive doctor and staff profiles with credentials and specializations
- **Scheduling**: Easy management of doctor availability and working hours
- **Performance Tracking**: Monitor doctor productivity and patient satisfaction

### Appointment System

- **Scheduling**: Create, reschedule, and cancel appointments with real-time availability
- **Calendar Views**: Daily, weekly, and monthly calendar views for staff
- **Reminders**: Automated appointment notifications for patients and staff

### Electronic Medical Records (EMR)

- **Patient Charts**: Complete patient medical history in a unified view
- **Visit Documentation**: SOAP notes and comprehensive visit documentation
- **Vital Signs Tracking**: Record and monitor patient vital signs over time
- **Diagnosis Coding**: ICD-10 coding support for accurate diagnosis recording

### Prescription Management

- **E-Prescribing**: Digital prescription creation and management
- **Medication History**: Track patient medication history
- **Drug Interaction Checking**: Alerts for potential drug interactions

### Laboratory Management

- **Test Ordering**: Request lab tests and track results
- **Results Viewing**: Visualize test results with trend analysis
- **Critical Value Alerts**: Notifications for abnormal results

### Billing & Payments

- **Invoice Generation**: Create and manage patient invoices
- **Payment Processing**: Record and track payments
- **Insurance Management**: Handle insurance claims and verification

### Reporting & Analytics

- **Operational Reports**: Generate reports on appointments, patient visits, etc.
- **Clinical Dashboards**: Visual representation of key health metrics
- **Financial Analytics**: Track revenue, outstanding payments, and financial trends

### System Management

- **User Administration**: User role management with proper access controls
- **Audit Logs**: Track system access and changes for security and compliance
- **Settings Configuration**: Customize system parameters to match facility needs

## Screenshots

### Dashboard

![Dashboard](https://via.placeholder.com/800x400?text=Dashboard)

### Patient Records

![Patient Records](https://via.placeholder.com/800x400?text=Patient+Records)

### Appointment Calendar

![Appointment Calendar](https://via.placeholder.com/800x400?text=Appointment+Calendar)

### Medical Records

![Medical Records](https://via.placeholder.com/800x400?text=Medical+Records)

## Tech Stack

### Frontend Core

- **Framework**: React 19.0.0 with TypeScript
- **State Management**: React Context API for application state
- **Routing**: React Router DOM 7.3.0
- **UI Library**: Material UI (MUI) v6.4.8 with Icons
- **Form Management**: Formik 2.4.6 with Yup 1.6.1 for validation
- **Date Handling**: date-fns 4.1.0
- **HTTP Client**: Axios 1.8.3

### Data Visualization

- **Charts**: Recharts 2.15.1
- **Data Grids**: MUI Data Grid

### Styling & Design

- **CSS Framework**: Tailwind CSS 3.4.17
- **Theme System**: Custom theming with MUI ThemeProvider
- **Responsive Design**: Mobile-first approach with responsive components

### Build Tools

- **Package Manager**: npm
- **Bundler**: Create React App (Webpack underneath)
- **Transpiler**: Babel (via Create React App)
- **Testing**: Jest and React Testing Library

### Backend Integration

- **API Communication**: RESTful API integration
- **Authentication**: JWT-based authentication
- **Real-time Features**: WebSocket for notifications (if applicable)

## System Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Memory**: Minimum 4GB RAM recommended
- **Storage**: 1GB of free disk space for development
- **Browsers**: Chrome, Firefox, Safari, Edge (latest versions)

## Installation and Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/healthcare-management.git
   cd healthcare-management
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     REACT_APP_API_URL=http://localhost:8000/api
     REACT_APP_VERSION=1.0.0
     ```

4. **Start the development server**

   ```bash
   npm start
   ```

   The application will be available at http://localhost:3000

5. **For production build**
   ```bash
   npm run build
   ```
   The build output will be in the `build` folder

## Project Structure

```bash
/src
├── assets/              # Static assets (images, icons, fonts)
│   ├── images/          # Image files
│   └── icons/           # Icon files
│
├── components/          # Reusable UI components
│   ├── common/          # General-purpose components
│   ├── dashboard/       # Dashboard-specific components
│   ├── emr/             # Electronic Medical Record components
│   ├── layout/          # Layout components
│   ├── patients/        # Patient-related components
│   ├── appointments/    # Appointment-related components
│   └── staff/           # Staff-related components
│
├── contexts/            # React contexts for state management
│   ├── AuthContext.tsx  # Authentication context
│   └── ...
│
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication hook
│   └── ...
│
├── interfaces/          # TypeScript interfaces/types
│   ├── patient.ts       # Patient-related types
│   ├── emr.ts           # EMR-related types
│   └── ...
│
├── layouts/             # Layout components
│   ├── MainLayout.tsx   # Main application layout
│   └── ...
│
├── pages/               # Page components
│   ├── Dashboard.tsx    # Dashboard page
│   ├── Login.tsx        # Login page
│   ├── patients/        # Patient-related pages
│   ├── appointments/    # Appointment-related pages
│   ├── emr/             # EMR-related pages
│   ├── staff/           # Staff-related pages
│   └── ...
│
├── services/            # API service functions
│   ├── api.ts           # Base API configuration
│   ├── patientService.ts # Patient-related API calls
│   ├── medicalRecordService.ts # Medical records API calls
│   └── ...
│
├── utils/               # Utility functions
│   ├── dateUtils.ts     # Date manipulation utilities
│   ├── formatters.ts    # Data formatting utilities
│   └── ...
│
├── theme/               # Theme configuration
│   └── index.ts         # MUI theme setup
│
├── App.tsx              # Root component
├── index.tsx            # Application entry point
├── index.css            # Global styles
└── react-app-env.d.ts   # Type declarations
```

## Data Model

The system is built around the following entities and their relationships:

### Patient-Centered Relationships

- **Patient to Appointments**: One patient can make multiple appointments
- **Patient to Medical Records**: One patient can have multiple medical records
- **Patient to Inpatient Care**: One patient can have multiple hospital stays
- **Patient to Payments**: One patient can make multiple payments
- **Patient to Laboratory Tests**: One patient can undergo multiple lab tests
- **Patient to Notifications**: One patient can receive multiple notifications

### Doctor-Centered Relationships

- **Doctor to Appointments**: One doctor can have multiple appointments
- **Doctor to Medical Records**: One doctor can create multiple medical records
- **Doctor to Inpatient Care**: One doctor can manage multiple inpatient cases
- **Doctor to Laboratory Tests**: One doctor can request multiple lab tests
- **Doctor to Notifications**: One doctor can receive multiple notifications

### Medical Record Relationships

- **Medical Record to Prescriptions**: One medical record can include multiple prescriptions
- **Medical Record to Payments**: One medical record can link to multiple payments
- **Medical Record to Notifications**: Updates to records can trigger multiple notifications

### Other Key Relationships

- **Medicine to Prescriptions**: One medicine can be prescribed multiple times
- **Inpatient Care to Payments**: One hospital stay can generate multiple payments
- **Appointments to Notifications**: One appointment can trigger multiple notifications
- **Payments to Notifications**: One payment can trigger multiple notifications

## API Integration

The frontend connects to a backend API for data operations. API services are organized in the `services` directory.

### API Configuration

```typescript
// Base API configuration with Axios
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Redirect to login or refresh token
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Example Service

```typescript
// Patient service example
import api from "./api";
import { Patient } from "../interfaces/patient";

export const getPatients = async (): Promise<Patient[]> => {
  try {
    const response = await api.get("/patients");
    return response.data;
  } catch (error) {
    console.error("Error fetching patients:", error);
    throw error;
  }
};

export const getPatientById = async (id: string): Promise<Patient> => {
  try {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching patient ${id}:`, error);
    throw error;
  }
};

// More patient-related API calls...
```

## Key Components

### Electronic Medical Records (EMR)

The EMR module includes several sophisticated components:

1. **PatientChart**: Comprehensive view of patient's medical history
2. **MedicalRecordForm**: Form for creating and editing medical records
3. **VitalSigns**: Component for recording and displaying vital signs
4. **DiagnosisForm**: Interface for adding diagnoses with ICD-10 codes
5. **PrescriptionWriter**: Component for writing and managing prescriptions
6. **VisitNotes**: SOAP notes documentation system

Example Component:

```tsx
// VitalSigns component usage
<VitalSigns
  initialValues={patient.vitalSigns}
  onChange={handleVitalSignsChange}
  onSave={saveVitalSigns}
  readOnly={!hasPermission("edit:vital-signs")}
/>
```

## State Management

The application uses React's Context API for state management. Key contexts include:

1. **AuthContext**: Manages user authentication and permissions
2. **UIContext**: Manages UI state like theme and layout
3. **NotificationContext**: Manages application notifications and alerts

Example Context Usage:

```tsx
// Using authentication context
import { useAuth } from "../contexts/AuthContext";

const MyComponent = () => {
  const { currentUser, hasPermission, logout } = useAuth();

  if (!hasPermission("view:patients")) {
    return <AccessDenied />;
  }

  return (
    <div>
      <p>Welcome, {currentUser.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

## Authentication and Authorization

The system implements a role-based access control system with the following roles:

1. **Administrator**: Full system access
2. **Doctor**: Access to patients, appointments, medical records
3. **Nurse**: Limited access to patients and medical records
4. **Receptionist**: Access to appointments and patient registration
5. **Billing Staff**: Access to invoices and payments

Permissions are checked using the `hasPermission` utility:

```tsx
// Permission check example
if (hasPermission("edit:medical-records")) {
  // Show edit button
}
```

## Available Scripts

- `npm start` - Run the development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App (one-way operation)
- `npm run lint` - Run ESLint to check code quality
- `npm run format` - Run Prettier to format code

## Development Guidelines

### Coding Standards

- Follow TypeScript best practices
- Use functional components with hooks
- Maintain proper component organization
- Document code with JSDoc comments

### Git Workflow

1. Create a feature branch from `develop`
2. Make changes and commit with meaningful messages
3. Push to origin and create a pull request
4. Wait for code review and approval
5. Merge to develop branch

### Performance Considerations

- Use React.memo for expensive components
- Implement virtualization for long lists
- Optimize bundle size with code splitting
- Use lazy loading for routes

## Testing

The project uses Jest and React Testing Library for testing.

### Unit Tests

Unit tests focus on testing individual components and functions in isolation.

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/components/patients/PatientList.test.tsx

# Run tests with coverage report
npm test -- --coverage
```

### End-to-End Tests

End-to-end testing is performed using Cypress.

```bash
# Open Cypress test runner
npm run cypress:open

# Run Cypress tests headlessly
npm run cypress:run
```

## Deployment

### Development Environment

```bash
# Build for development
npm run build:dev
```

### Staging Environment

```bash
# Build for staging
npm run build:staging
```

### Production Environment

```bash
# Build for production
npm run build
```

### Deployment Platforms

The application can be deployed to:

- AWS S3 + CloudFront
- Netlify
- Vercel
- Firebase Hosting

## Contributing

We welcome contributions to improve the Healthcare Management System!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows our coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please contact:

- Email: support@healthcare-management.com
- Website: https://healthcare-management.com

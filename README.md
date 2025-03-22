# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

```bash
/src
├── assets/ # Static assets (images, icons)
├── components/ # Reusable UI components
├── contexts/ # React contexts for state management
├── hooks/ # Custom React hooks
├── interfaces/ # TypeScript interfaces/types
├── layouts/ # Layout components
├── pages/ # Page components
├── services/ # API service functions
├── utils/ # Utility functions
└── App.tsx # Root component
```

Entity Relationship Diagram

1. Patient Relationships

PATIENT ||--o{ APPOINTMENT : "makes"

One patient can make many appointments (one-to-many)
This allows patients to schedule multiple visits with doctors
Each appointment record contains a reference to the patient who scheduled it

PATIENT ||--o{ MEDICAL_RECORD : "has"

One patient can have many medical records (one-to-many)
Each visit or treatment results in a new medical record entry
The patient's entire medical history is captured through these multiple records

PATIENT ||--o{ INPATIENT_CARE : "undergoes"

One patient can have multiple inpatient care stays (one-to-many)
Each hospitalization creates a new inpatient care record
This tracks different hospital admissions over time

PATIENT ||--o{ PAYMENT : "makes"

One patient can make many payments (one-to-many)
Payments can be for different services (appointments, treatments, etc.)
This relationship tracks all financial transactions by a patient

PATIENT ||--o{ LABORATORY : "undergoes"

One patient can undergo many laboratory tests (one-to-many)
Each test is recorded as a separate laboratory record
This allows tracking of all diagnostic tests for a patient

PATIENT ||--o{ NOTIFICATION : "receives"

One patient can receive many notifications (one-to-many)
Patients receive notifications about appointments, test results, payments, etc.
This enables personalized communication with patients

2. Doctor Relationships

DOCTOR ||--o{ APPOINTMENT : "receives"

One doctor can receive many appointments (one-to-many)
This tracks all patient visits scheduled with a specific doctor
Helps manage doctor scheduling and availability

DOCTOR ||--o{ MEDICAL_RECORD : "creates"

One doctor can create many medical records (one-to-many)
Doctors document patient visits and treatments in medical records
This attributes medical records to the doctor who provided care

DOCTOR ||--o{ INPATIENT_CARE : "manages"

One doctor can manage many inpatient care cases (one-to-many)
Doctors are assigned as the primary physician for hospitalized patients
This tracks doctor responsibility for inpatient treatment

DOCTOR ||--o{ LABORATORY : "requests"

One doctor can request many laboratory tests (one-to-many)
Doctors order diagnostic tests for their patients
This associates lab tests with the ordering physician

DOCTOR ||--o{ NOTIFICATION : "receives"

One doctor can receive many notifications (one-to-many)
Doctors get alerts about appointments, test results, patient status, etc.
This improves care coordination and doctor responsiveness

3. Medical Record Relationships

MEDICAL_RECORD ||--o{ PRESCRIPTION : "includes"

One medical record can include many prescriptions (one-to-many)
A doctor may prescribe multiple medications during a single visit
This links prescribed medicines to the specific visit/treatment

MEDICAL_RECORD ||--o{ PAYMENT : "related to"

One medical record can be related to many payments (one-to-many)
A single visit might require multiple payments or installments
This links financial transactions to specific medical services

MEDICAL_RECORD ||--o{ NOTIFICATION : "triggers"

One medical record can trigger many notifications (one-to-many)
Updates to medical records can generate alerts to patients and doctors
This ensures timely communication about medical findings

4. Other Entity Relationships

MEDICINE ||--o{ PRESCRIPTION : "included in"

One medicine can be included in many prescriptions (one-to-many)
The same medication may be prescribed to different patients
This tracks usage of specific medications across prescriptions

INPATIENT_CARE ||--o{ PAYMENT : "related to"

One inpatient care stay can be related to many payments (one-to-many)
Hospital stays often involve multiple charges and payments
This links financial transactions to specific hospitalization periods

APPOINTMENT ||--o{ NOTIFICATION : "triggers"

One appointment can trigger many notifications (one-to-many)
Notifications may include confirmations, reminders, and follow-ups
This enables automated communication about scheduled visits

PAYMENT ||--o{ NOTIFICATION : "triggers"

One payment can trigger many notifications (one-to-many)
Notifications may include receipts, payment confirmations, and reminders
This keeps patients informed about their financial obligations

5. Relationship Types

All relationships in this ERD are one-to-many relationships (||--o{)
This means that one entity instance can be associated with multiple instances of the related entity
For example, one patient can have many appointments, but each appointment belongs to only one patient

firebase SDK 

<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyD_g3Xjq2A9jFReDQ7L4AJyrW3-KH8RsFk",
    authDomain: "interview-portal-e5ce1.firebaseapp.com",
    projectId: "interview-portal-e5ce1",
    storageBucket: "interview-portal-e5ce1.firebasestorage.app",
    messagingSenderId: "1087378373159",
    appId: "1:1087378373159:web:3954aeda7191e72cbbec02",
    measurementId: "G-BP1P105W4H"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>



project doc 



👥 User Journey
1. User Registration (Sign Up)
New users can create an account by providing a valid email address and a secure password.


Upon successful registration, users are redirected to the Sign In page.


2. User Login (Sign In)
Registered users can log in using their email and password.


After successful login, users are redirected to their Profile Dashboard.


3. Profile Dashboard
Users are greeted with a welcome message and a call-to-action button: “Apply Now”.


This dashboard also stores the status of any previous applications (if applicable).
🔐 Admin Dashboard
1. Admin-Only Access
The dashboard is secured and accessible only by administrators via a separate admin login.


2. View Submissions
Admins can view all applicant submissions.


Each submission includes:


User's contact information


Responses to all interview questions


Downloadable document files


Submission timestamp


3. Manage Candidates
Admins can mark statuses such as "Reviewed", "Shortlisted", "Rejected"


Option to export data for offline evaluation or compliance
Applicants will be required to respond to the following 10 questions, which assess their experience, teaching mindset, regulatory knowledge, and instructional approach:
Experience Overview:
 Can you briefly describe your experience as a truck driver, including the types of vehicles you’ve operated?


Motivation for Teaching:
 What motivates you to become a driving instructor, and what excites you about teaching new drivers?


Training & Mentoring Background:
 Have you ever trained or mentored others? If so, how did you support their learning and growth?


Simplifying Complex Concepts:
 How would you explain a complex topic—like the air brake system—to someone with no prior truck experience?


Handling Maneuver Challenges:
 What’s your approach when a student is struggling with maneuvers like alley docking or parallel parking?


Managing Student Anxiety:
 How do you help students who become frustrated or anxious during on-the-road training?
	

Regulatory Knowledge:
 How familiar are you with DOT regulations, and how do you ensure your students understand and follow them?


Physical Readiness:
 Are you comfortable working outdoors in all weather conditions and climbing in and out of trucks throughout the day?


Exam Willingness:
 Are you willing to take and pass the MVC Instructor Exam if you haven’t already?


Monitoring Student Progress:
 How do you track student progress and provide constructive feedback?


📎 Required Document Uploads
Applicants must upload clear and valid copies of the following documents to be considered for the next step:
Driver’s License or CDL
 (Valid copy required)


Medical Card
 (Current and valid medical certification)


Driver’s Abstract
 (Recent motor vehicle report/abstract)


Instructor Certifications or Licenses
 (If currently held – optional if not yet obtained)



use samity for data uploading and data fetching? what do you say ?





```
interview-portal
├─ .eslintrc.json
├─ app
│  ├─ admin
│  │  └─ page.tsx
│  ├─ apply
│  │  └─ page.tsx
│  ├─ components
│  │  └─ Header.tsx
│  ├─ context
│  │  └─ AuthContext.tsx
│  ├─ favicon.ico
│  ├─ firebase
│  │  └─ config.ts
│  ├─ fonts
│  │  ├─ GeistMonoVF.woff
│  │  └─ GeistVF.woff
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ lib
│  │  ├─ auth.ts
│  │  └─ sanity.ts
│  ├─ page.tsx
│  ├─ signin
│  │  └─ page.tsx
│  ├─ signup
│  │  └─ page.tsx
│  └─ studio
│     └─ [[...tool]]
│        └─ page.tsx
├─ next.config.mjs
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ README.md
├─ sanity
│  ├─ env.ts
│  ├─ lib
│  │  ├─ client.ts
│  │  ├─ image.ts
│  │  └─ live.ts
│  ├─ schemaTypes
│  │  ├─ application.ts
│  │  └─ index.ts
│  └─ structure.ts
├─ sanity.cli.ts
├─ sanity.config.ts
├─ tailwind.config.ts
└─ tsconfig.json

```
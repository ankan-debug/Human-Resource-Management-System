# OOD HRMS

A monolithic Human Resource Management System (HRMS) built for the Odoo x Adamas University Hackathon '26. 
Designed with a "Zero-API Stack" philosophy using Node.js, Express, and a local SQLite database, resulting in a fast, lightweight, and easily deployable monolithic architecture.

## Features

- **Employee Portal**: Dashboard for employees to check-in/out, view attendance history, request leave, and see salary slips.
- **HR Admin Console**: Comprehensive dashboard with analytics, employee directory management, and leave approval workflows.
- **Robust Authentication**: JWT-based authentication with role-based access control (RBAC).
- **Automated Salary Engine**: Formula-based payroll calculation including Base, HRA, LTA, Allowances, PF, and dynamic unpaid leave deductions.
- **Local SQLite DB**: Uses pure JavaScript SQLite (`sql.js`) to run locally with zero native compilation requirements, persisting to a local `hrms.db` file.
- **Premium UI**: Modern dark theme with glassmorphism effects, built with Vanilla CSS and DaisyUI/Tailwind.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite (`sql.js` for pure JS execution)
- **Frontend**: HTML5, Vanilla CSS, Alpine.js (for reactivity), Chart.js (for analytics), TailwindCSS/DaisyUI.

## Getting Started

### Prerequisites

- Node.js (v18+)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd HRMS
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **(Optional) Seed the database:**
   If you want to reset the database with mock data (9 users, 30 days of attendance, and leave requests):
   ```bash
   npm run seed
   ```
   *Note: A pre-seeded `hrms.db` file is already included in the repository for convenience.*

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`.

### Demo Credentials

- **HR Admin**:
  - Email: `admin@oodhrms.com`
  - Password: `admin123`

- **Employee**:
  - Email: `priya.singh@oodhrms.com` (or any other employee email)
  - Password: `emp123`

## Project Structure

```
├── db/                 # Database initialization and seed scripts
├── middleware/         # Express middleware (Auth, RBAC)
├── models/             # Business logic and database operations (User, Attendance, Leave, Salary)
├── public/             # Static assets (HTML, CSS, JS frontend logic)
├── routes/             # Express API route handlers
├── server.js           # Main application entry point
├── package.json        # Dependencies and scripts
└── hrms.db             # SQLite database file (pre-seeded)
```

## License

MIT License

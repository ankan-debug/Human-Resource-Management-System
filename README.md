
<div align="center">
  
# 🚀 Human Resource Management System (HRMS)

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](#)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)](#)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](#)
[![Security: Bcrypt](https://img.shields.io/badge/Security-Bcrypt-red?style=for-the-badge&logo=springsecurity&logoColor=white)](#)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](#)

*A high-performance, self-contained ecosystem engineered for rapid deployment, ultra-low latency, and secure data handling.*

</div>

<br />

## 📖 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Directory Structure](#-directory-structure)
- [Core Advantages](#-core-advantages)
- [Security & Compliance](#-security--compliance)
- [Technical Specifications](#-technical-specifications)
- [Getting Started](#-getting-started)
  - [Local Installation](#local-installation)
  - [Docker Deployment](#docker-deployment)
- [CI/CD Pipeline](#-cicd-pipeline)
- [API Reference](#-api-reference)
- [Support & Contact](#-support--contact)
---

## 📌 Overview
Developed as a flagship submission for the **Odoo x Adamas University Hackathon '26**, this application redefines lightweight backend architecture for Human Resource management. 
In modern distributed systems, network I/O is often the primary bottleneck. Engineered with a highly optimized monolithic structure, this platform deliberately bypasses traditional external networking overhead. By seamlessly integrating a robust **Node.js/Express** core with an embedded **SQLite** database, the system offers a self-reliant environment guaranteeing rapid processing speeds, minimal latency, and a frictionless deployment pipeline.
---

## 🏗 System Architecture
The application adopts a strictly localized execution philosophy for internal data resolution. Instead of relying on containerized microservices communicating over TCP/IP layers, the entire processing pipeline and data persistence layer exist within the same memory space. 

```text

[ Client Application ] 
        │
        ▼ (REST API via HTTP/HTTPS)
┌──────────────────────────────────────────┐
│              HOST ENVIRONMENT            │
│  ┌────────────────────────────────────┐  │
│  │          Node.js Runtime (V8)      │  │
│  │  ┌──────────────┐  ┌────────────┐  │  │
│  │  │  Express.js  ├──► Application│  │  │
│  │  │  Middleware  │  │   Logic    │  │  │
│  │  └──────────────┘  └──────┬─────┘  │  │
│  │                           │        │  │
│  │  ┌────────────────────────▼─────┐  │  │
│  │  │   SQLite3 Engine (Local I/O) │  │  │
│  │  └──────────────────────────────┘  │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

## 📂 Directory Structure
```text
HR-Management-System/
├── .github/
│   └── workflows/        # CI/CD pipeline configurations
├── src/
│   ├── controllers/      # Route handler logic
│   ├── middleware/       # Custom security & validation checks
│   ├── models/           # SQLite database schemas and queries
│   ├── routes/           # Express API route definitions
│   └── utils/            # Helper functions & cryptographic tools
├── data/                 # Local SQLite database storage
├── Dockerfile            # Containerization instructions
├── .env.example          # Environment variable template
├── server.js             # Application entry point
└── package.json          # Dependency management
```

## ✨ Core Advantages
 * ⚡ **Ultra-Low Latency:** Streamlined internal data routing eliminates the traditional overhead associated with external API layers.
 * 📦 **Frictionless Deployment:** A drop-in ready, self-contained architecture requiring zero complex environment configurations.
 * 🪶 **Resource Efficient:** A remarkably lightweight footprint designed to maintain high throughput even in constrained host environments.
 * 🗄️ **Integrated Data Management:** Embedded SQLite ensures absolute data integrity and ACID compliance without needing a standalone database server.
 * 🛡️ **Predictable Execution:** Eliminates network partitions between the application and database tiers, providing complete immunity to database connection timeouts.
## 🔐 Security & Compliance
Taking a proactive approach to application security, this HRMS implements strict data protection protocols:
 * **Cryptographic Hashing:** User passwords and sensitive authentication tokens are strictly protected using computationally intensive **Bcrypt** hashing algorithms to prevent brute-force and rainbow table attacks.
 * **Environment Isolation:** Sensitive configurations (ports, DB paths, secrets) are isolated using .env injections.
 * **Input Sanitization:** Middleware actively intercepts and sanitizes payloads to prevent SQL injection (SQLi) against the SQLite engine.
## 🛠 Technical Specifications
### Tech Stack Breakdown
 * **Runtime Engine:** Node.js (V8) — Leveraging event-driven, asynchronous, non-blocking I/O for concurrent request handling and maximum thread efficiency.
 * **Web Framework:** Express.js — A minimalist web framework utilized for highly customizable route handling, payload parsing, and middleware integration.
 * **Data Persistence Layer:** SQLite3 — A C-language library that implements a small, fast, self-contained, high-reliability, full-featured SQL database engine operating directly from local disk storage.
 * **Containerization:** Docker — Ensuring absolute consistency across development, testing, and production environments.
## ⚙️ Getting Started
### Prerequisites
 * **Node.js** (v18.x LTS or higher)
 * **npm** (v9.x or higher) or **yarn**
 * **Docker** (Optional, for containerized deployment)
 * **Git**
 * 
### Local Installations 

 1. **Clone the repository:**
   ```bash
   git clone [https://github.com/ankan-debug/Human-Resource-Management-System.git](https://github.com/ankan-debug/Human-Resource-Management-System.git)
   cd Human-Resource-Management-System
   
   ```
 2. **Install core dependencies:**
   ```bash
   npm install
   
   ```
 3. **Environment Setup:**
   Create a .env file in the root directory:
   ```env
   PORT=3000
   NODE_ENV=development
   DB_PATH=./data/database.sqlite
   
   ```
 4. **Launch the application:**
   ```bash
   npm run dev
   
   ```
### Docker Deployment
For enterprise environments requiring strict isolation and orchestration, the system is fully containerized.
 1. **Build the Docker image:**
   ```bash
   docker build -t hrms-backend:latest .
   
   ```
 2. **Run the container (with persistent storage):**
   ```bash
   docker run -d \
     -p 3000:3000 \
     -v $(pwd)/data:/app/data \
     --env-file .env \
     --name hrms-instance \
     hrms-backend:latest
   
   ```
## 🔄 CI/CD Pipeline
This repository leverages **GitHub Actions** to enforce code quality and automate the deployment lifecycle. Upon every pull request to the main branch, the pipeline executes:
 1. **Dependency Auditing:** Scans package.json for known CVE vulnerabilities.
 2. **Linting & Formatting:** Ensures ES6 syntax compliance and unified code styling.
 3. **Automated Testing:** Spins up a headless Node.js environment to run unit and integration tests against a mock SQLite instance.
 4. **Container Build Verification:** Performs a dry-run Docker build to guarantee the image compiles without fatal errors.
## 🔌 API Reference
While the internal architecture relies on zero external networking for database queries, it exposes standard RESTful endpoints for efficient client-side consumption.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | /api/v1/health | Verifies system and database health status. | ❌ |
| POST | /api/v1/auth/login | Authenticates user and returns session/token. | ❌ |
| GET | /api/v1/employees | Retrieves a paginated list of HR records. | ✅ |

**Example Response:** GET /api/v1/health
```json
{
  "status": "operational",
  "uptime": "12h 34m 12s",
  "database": "connected",
  "latency": "2ms"
}
```
<div align="center">

### Made with ♥️ by Saha & Bera :)

*If any dispute feel free to contact-*

[sahaankan628@gmail.com](mailto:sahaankan628@gmail.com)

[amdevriju@gmail.com](mailto:amdevrizu@gmail.com)

</div>

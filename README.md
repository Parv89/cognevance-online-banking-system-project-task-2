# ApexVault — Online Banking Management System

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-blue.svg)](https://www.mysql.com/)
[![Security](https://img.shields.io/badge/Security-Spring%20Security%20%2B%20JWT-red.svg)](https://spring.io/projects/spring-security)

> **Notice:** This application is an educational capstone project developed for a **Java Full Stack Internship**. All accounts, balances, numbers, and transactions are strictly simulated for demonstration purposes.

---

## 📌 Project Overview

**ApexVault** is a full-stack, enterprise-grade Online Banking Management System designed to simulate corporate and retail banking workflows. The system features secure stateless authentication, multi-account management, atomic money transfers with server-side validation and pessimistic locking, demo deposits and cash withdrawals, and an interactive audit ledger with printable receipts and CSV exports.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, responsive modern CSS design system.
- **Backend**: Java 17, Spring Boot 3.3.x, Spring Security 6, Spring Data JPA, Maven Wrapper (`mvnw.cmd`).
- **Database**: MySQL 8 (InnoDB engine) with transactional ACID guarantees.
- **Security**: BCrypt password hashing, stateless JSON Web Tokens (JWT), role-based endpoint authorization.
- **Testing**: JUnit 5, Spring Boot Test, H2 in-memory test suite.

---

## 🛠️ Prerequisites (Windows)

1. **Java 17 Development Kit (JDK 17)**:
   - Verify with: `java -version`
2. **Node.js 18+ and npm**:
   - Verify with: `node -v` and `npm -v`
3. **MySQL 8 Server**:
   - Running locally on port `3306` (e.g., MySQL84 service).
   - Verify with: `Get-Service -Name *mysql*`

> *Note:* You do **not** need Maven installed globally. The included `mvnw.cmd` wrapper handles all dependencies and builds automatically.

---

## 🗄️ Database Setup (MySQL 8)

1. Open MySQL Command Line Client or MySQL Workbench:
   ```powershell
   mysql -u root -p
   ```
2. Run the database schema script:
   ```sql
   source <path-to-project>/database/schema.sql;
   ```
3. Run the demo sample data script:
   ```sql
   source <path-to-project>/database/sample-data.sql;
   ```

*Or execute both via PowerShell in one command:*
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -p bank_db < database\schema.sql
& "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -p bank_db < database\sample-data.sql
```

*(Note: Spring Boot will also automatically initialize tables and demo seed data on first run if database exists!)*

---

## ⚙️ Configuration (`.env`)

Copy `.env.example` to `.env` in the project root:
```powershell
copy .env.example .env
```

Adjust your MySQL credentials if they differ from the default:
```properties
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bank_db
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
```

---

## 🏃 Running the Application

### Option A: Using Windows Startup Scripts (Recommended)

- **Launch Both (Backend + Frontend)**: Double-click `start-all.bat`
- **Launch Backend Only**: Double-click `start-backend.bat`
- **Launch Frontend Only**: Double-click `start-frontend.bat`

---

### Option B: Using Terminal Commands

#### 1. Start Backend (Spring Boot):
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
*Backend runs on:* `http://localhost:8080/api`

#### 2. Start Frontend (React + Vite):
```powershell
cd frontend
npm install
npm run dev
```
*Frontend runs on:* `http://localhost:5173`

---

## 🔑 Demo Login Credentials

The demo database is pre-populated with fictional customer accounts for instant testing:

| Username | Password | Account Number | Account Type | Initial Balance |
| :--- | :--- | :--- | :--- | :--- |
| **`john_doe`** | `Password@123` | `ACC-10082719` | Savings | \$5,450.00 |
| **`john_doe`** | `Password@123` | `ACC-20093847` | Checking | \$1,250.00 |
| **`jane_smith`** | `Password@123` | `ACC-30048123` | Savings | \$3,800.00 |

*(You can also click the quick-login demo buttons on the login screen for 1-click authentication.)*

---

## 🧪 Testing the Application

### Run Backend Unit & Integration Tests:
```powershell
cd backend
.\mvnw.cmd test
```
*Runs automated unit & integration tests (`TransactionServiceTest` and `OnlineBankingApplicationTests`) verifying atomic transfers, balance overdraft protection, and account validation.*

### Build Frontend Production Assets:
```powershell
cd frontend
npm run build
```

---

## 📂 Project Structure

```
online-banking-system/
├── backend/                             # Java 17 Spring Boot Backend
│   ├── .mvn/wrapper/                    # Maven Wrapper files
│   ├── mvnw & mvnw.cmd                  # Maven Wrapper scripts
│   ├── pom.xml                          # Dependencies & build configuration
│   └── src/
│       ├── main/java/com/bank/onlinebanking/
│       │   ├── config/                  # DataInitializer & App Configurations
│       │   ├── controller/              # REST Controllers (Auth, Account, Txn, Dashboard)
│       │   ├── dto/                     # Request & Response Transfer Objects
│       │   ├── entity/                  # JPA Entities (User, Account, Transaction)
│       │   ├── enums/                   # RoleType, AccountType, TransactionType
│       │   ├── exception/               # GlobalExceptionHandler & Custom Exceptions
│       │   ├── repository/              # Spring Data JPA Repositories (Pessimistic Locks)
│       │   ├── security/                # Spring Security, JWT Utils & Auth Filter
│       │   └── service/                 # Business Services (Auth, Account, Txn, Dashboard)
│       └── test/                        # Integration & Unit Tests (JUnit 5 + H2)
│
├── frontend/                            # React 18 + Vite Frontend
│   ├── src/
│   │   ├── api/                         # Fetch client with JWT authorization
│   │   ├── components/                  # Navbar, Bank Card, Modals, Receipts, Alerts
│   │   ├── context/                     # AuthContext for session management
│   │   ├── pages/                       # Login, Register, Dashboard, Transactions, Accounts
│   │   ├── App.jsx                      # App root router & layout
│   │   └── index.css                    # Responsive banking design system
│   ├── package.json
│   └── vite.config.js
│
├── database/                            # MySQL 8 SQL Scripts
│   ├── schema.sql                       # DDL Schema script (users, accounts, transactions)
│   └── sample-data.sql                  # Fictional demo sample data
│
├── docs/                                # Technical Documentation
│   ├── API_DOCUMENTATION.md             # Complete REST API specifications
│   └── PROJECT_REPORT.md                # Comprehensive internship project report
│
├── scripts/                             # Windows Batch Startup Scripts
│   ├── start-backend.bat
│   ├── start-frontend.bat
│   └── start-all.bat
│
├── start-all.bat                        # Root Windows launcher
├── start-backend.bat                    # Root Backend launcher
├── start-frontend.bat                   # Root Frontend launcher
├── .env.example                         # Environment template
├── .gitignore                           # Git ignore rules
└── README.md                            # Setup guide & documentation
```

---

## 📑 Detailed Documentation

- **REST API Documentation**: See [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) for endpoint request/response payloads, headers, and error codes.
- **Internship Project Report**: See [`docs/PROJECT_REPORT.md`](docs/PROJECT_REPORT.md) for full architectural analysis, Mermaid diagrams, ERD, and security review.

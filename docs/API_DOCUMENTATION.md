# ApexVault Online Banking System — API Documentation

This document provides complete technical specifications for all REST API endpoints available in the **ApexVault Online Banking Management System**.

---

## 1. Base URL & Authentication

- **Base URL**: `http://localhost:8080/api`
- **Authentication**: Stateless JSON Web Token (**JWT**). Include the following HTTP header for all protected endpoints:

```http
Authorization: Bearer <jwt-token>
```

All responses conform to the standard structure:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... },
  "timestamp": "2026-10-14T19:00:00"
}
```

Standard error response format:
```json
{
  "timestamp": "2026-10-14T19:00:00",
  "status": 400,
  "error": "Insufficient Funds",
  "message": "Insufficient funds in account ACC-10082719. Available: 100.00, Requested: 500.00",
  "path": "/api/transactions/transfer",
  "validationErrors": null
}
```

---

## 2. Authentication Endpoints (`/api/auth`)

### 2.1 User Registration
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Description**: Registers a new customer, encodes their password with BCrypt, and provisions a default primary savings account with an optional welcome deposit.

**Request Body**:
```json
{
  "username": "charlie_brown",
  "email": "charlie@example.com",
  "password": "Password@123",
  "fullName": "Charlie Brown",
  "phoneNumber": "+1-555-0987",
  "initialDeposit": 1000.00
}
```

**Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "userId": 4,
    "username": "charlie_brown",
    "email": "charlie@example.com",
    "fullName": "Charlie Brown",
    "role": "ROLE_USER",
    "primaryAccountId": 5,
    "primaryAccountNumber": "ACC-48291048"
  }
}
```

---

### 2.2 User Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Description**: Verifies customer credentials and issues a signed JWT token valid for 24 hours.

**Request Body**:
```json
{
  "username": "john_doe",
  "password": "Password@123"
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "userId": 1,
    "username": "john_doe",
    "email": "john.doe@demobank.com",
    "fullName": "Johnathan Doe",
    "role": "ROLE_USER",
    "primaryAccountId": 1,
    "primaryAccountNumber": "ACC-10082719"
  }
}
```

---

### 2.3 Verify Current Session
- **Endpoint**: `GET /api/auth/me`
- **Access**: Authenticated

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "User session active",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john.doe@demobank.com",
    "fullName": "Johnathan Doe",
    "roles": [{ "authority": "ROLE_USER" }]
  }
}
```

---

## 3. Account Endpoints (`/api/accounts`)

### 3.1 Get All Customer Accounts
- **Endpoint**: `GET /api/accounts`
- **Access**: Authenticated
- **Description**: Returns all accounts owned exclusively by the authenticated user.

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Accounts fetched successfully",
  "data": [
    {
      "id": 1,
      "accountNumber": "ACC-10082719",
      "accountType": "SAVINGS",
      "balance": 5450.00,
      "currency": "USD",
      "status": "ACTIVE",
      "userId": 1,
      "ownerName": "Johnathan Doe",
      "createdAt": "2026-09-14T19:00:00"
    },
    {
      "id": 2,
      "accountNumber": "ACC-20093847",
      "accountType": "CHECKING",
      "balance": 1250.00,
      "currency": "USD",
      "status": "ACTIVE",
      "userId": 1,
      "ownerName": "Johnathan Doe",
      "createdAt": "2026-09-24T19:00:00"
    }
  ]
}
```

---

### 3.2 Open a Secondary Account
- **Endpoint**: `POST /api/accounts`
- **Access**: Authenticated

**Request Body**:
```json
{
  "accountType": "CHECKING",
  "initialDeposit": 250.00
}
```

**Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "New account created successfully",
  "data": {
    "id": 3,
    "accountNumber": "ACC-83920194",
    "accountType": "CHECKING",
    "balance": 250.00,
    "currency": "USD",
    "status": "ACTIVE",
    "userId": 1,
    "ownerName": "Johnathan Doe",
    "createdAt": "2026-10-14T19:10:00"
  }
}
```

---

### 3.3 Lookup Recipient Account
- **Endpoint**: `GET /api/accounts/lookup?accountNumber=ACC-30048123`
- **Access**: Authenticated
- **Description**: Looks up destination account and returns verified owner name for preview before initiating a transfer. Balance remains hidden for privacy.

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Recipient account found",
  "data": {
    "id": 3,
    "accountNumber": "ACC-30048123",
    "accountType": "SAVINGS",
    "balance": null,
    "currency": "USD",
    "status": "ACTIVE",
    "ownerName": "Jane Smith"
  }
}
```

---

## 4. Transaction Endpoints (`/api/transactions`)

### 4.1 Transfer Money Between Accounts
- **Endpoint**: `POST /api/transactions/transfer`
- **Access**: Authenticated
- **Security Validations**:
  - Validates transfer amount > 0.
  - Validates source account is owned by the authenticated caller.
  - Validates recipient account exists and is ACTIVE.
  - Enforces server-side balance checking (`source.balance >= amount`).
  - Implements database pessimistic write locks on both accounts to prevent race conditions.

**Request Body**:
```json
{
  "sourceAccountNumber": "ACC-10082719",
  "targetAccountNumber": "ACC-30048123",
  "amount": 200.00,
  "description": "Shared trip expenses"
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Transfer completed successfully",
  "data": {
    "id": 15,
    "transactionReference": "TXN-A8B9C1D2",
    "sourceAccountNumber": "ACC-10082719",
    "sourceOwnerName": "Johnathan Doe",
    "targetAccountNumber": "ACC-30048123",
    "targetOwnerName": "Jane Smith",
    "type": "TRANSFER",
    "amount": 200.00,
    "balanceAfter": 5250.00,
    "description": "Shared trip expenses",
    "status": "SUCCESS",
    "createdAt": "2026-10-14T19:15:00"
  }
}
```

---

### 4.2 Deposit Demo Funds
- **Endpoint**: `POST /api/transactions/deposit`
- **Access**: Authenticated

**Request Body**:
```json
{
  "accountNumber": "ACC-10082719",
  "amount": 500.00,
  "description": "Monthly savings contribution"
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Deposit successful",
  "data": {
    "id": 16,
    "transactionReference": "TXN-E3F4G5H6",
    "sourceAccountNumber": "CASH / SYSTEM",
    "targetAccountNumber": "ACC-10082719",
    "type": "DEPOSIT",
    "amount": 500.00,
    "balanceAfter": 5750.00,
    "description": "Monthly savings contribution",
    "status": "SUCCESS",
    "createdAt": "2026-10-14T19:16:00"
  }
}
```

---

### 4.3 Withdraw Demo Funds
- **Endpoint**: `POST /api/transactions/withdraw`
- **Access**: Authenticated

**Request Body**:
```json
{
  "accountNumber": "ACC-10082719",
  "amount": 150.00,
  "description": "ATM Cash Withdrawal"
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Withdrawal successful",
  "data": {
    "id": 17,
    "transactionReference": "TXN-J7K8L9M0",
    "sourceAccountNumber": "ACC-10082719",
    "targetAccountNumber": "CASH / ATM",
    "type": "WITHDRAWAL",
    "amount": 150.00,
    "balanceAfter": 5600.00,
    "description": "ATM Cash Withdrawal",
    "status": "SUCCESS",
    "createdAt": "2026-10-14T19:17:00"
  }
}
```

---

### 4.4 Get Paginated Transaction History
- **Endpoint**: `GET /api/transactions?type=ALL&page=0&size=15&sortBy=createdAt&direction=DESC`
- **Access**: Authenticated
- **Query Parameters**:
  - `type` (optional): `ALL`, `TRANSFER`, `DEPOSIT`, `WITHDRAWAL`
  - `page` (optional, default `0`): zero-indexed page number
  - `size` (optional, default `15`): items per page

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Transactions retrieved",
  "data": {
    "content": [
      {
        "id": 15,
        "transactionReference": "TXN-A8B9C1D2",
        "sourceAccountNumber": "ACC-10082719",
        "targetAccountNumber": "ACC-30048123",
        "type": "TRANSFER",
        "amount": 200.00,
        "balanceAfter": 5250.00,
        "description": "Shared trip expenses",
        "status": "SUCCESS",
        "createdAt": "2026-10-14T19:15:00"
      }
    ],
    "totalElements": 6,
    "totalPages": 1,
    "size": 15,
    "number": 0
  }
}
```

---

## 5. Dashboard Endpoints (`/api/dashboard`)

### 5.1 Get Dashboard Summary & Analytics
- **Endpoint**: `GET /api/dashboard/summary`
- **Access**: Authenticated
- **Description**: Returns consolidated financial statistics, list of customer accounts, recent 10 transactions, and monthly debits/credits.

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Dashboard summary fetched",
  "data": {
    "userId": 1,
    "username": "john_doe",
    "fullName": "Johnathan Doe",
    "email": "john.doe@demobank.com",
    "totalBalance": 6700.00,
    "totalAccounts": 2,
    "accounts": [ ... ],
    "recentTransactions": [ ... ],
    "monthlyDeposits": 6950.00,
    "monthlyWithdrawals": 250.00,
    "monthlyTransfers": 0.00
  }
}
```

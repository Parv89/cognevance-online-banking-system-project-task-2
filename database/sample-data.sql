-- =====================================================================
-- Online Banking Management System - Demo Sample Data (MySQL 8)
-- All data is completely fictional and for demo/testing purposes.
-- Default test password for all seeded users: Password@123
-- =====================================================================

USE bank_db;

-- Clear previous sample data if needed
DELETE FROM transactions;
DELETE FROM accounts;
DELETE FROM users;

-- ---------------------------------------------------------------------
-- 1. Insert Demo Users
-- Note: BCrypt hash below corresponds to plaintext password: Password@123
-- ---------------------------------------------------------------------
INSERT INTO users (id, username, email, password, full_name, phone_number, role, created_at)
VALUES 
(1, 'john_doe', 'john.doe@demobank.com', '$2a$10$w8k2sFkGq1LgD28G5aFfUuv49H3kE00j0n8C8n0F/c7y1p5c3b1q2', 'Johnathan Doe', '+1-555-0192', 'ROLE_USER', NOW()),
(2, 'jane_smith', 'jane.smith@demobank.com', '$2a$10$w8k2sFkGq1LgD28G5aFfUuv49H3kE00j0n8C8n0F/c7y1p5c3b1q2', 'Jane Smith', '+1-555-0143', 'ROLE_USER', NOW()),
(3, 'alex_wilson', 'alex.wilson@demobank.com', '$2a$10$w8k2sFkGq1LgD28G5aFfUuv49H3kE00j0n8C8n0F/c7y1p5c3b1q2', 'Alex Wilson', '+1-555-0177', 'ROLE_USER', NOW());

-- ---------------------------------------------------------------------
-- 2. Insert Bank Accounts
-- ---------------------------------------------------------------------
INSERT INTO accounts (id, account_number, account_type, balance, currency, status, user_id, version, created_at)
VALUES 
(1, 'ACC-10082719', 'SAVINGS', 5450.00, 'USD', 'ACTIVE', 1, 0, DATE_SUB(NOW(), INTERVAL 30 DAY)),
(2, 'ACC-20093847', 'CHECKING', 1250.00, 'USD', 'ACTIVE', 1, 0, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(3, 'ACC-30048123', 'SAVINGS', 3800.00, 'USD', 'ACTIVE', 2, 0, DATE_SUB(NOW(), INTERVAL 25 DAY)),
(4, 'ACC-40019284', 'CHECKING', 920.00, 'USD', 'ACTIVE', 3, 0, DATE_SUB(NOW(), INTERVAL 15 DAY));

-- ---------------------------------------------------------------------
-- 3. Insert Historical Transactions
-- ---------------------------------------------------------------------
INSERT INTO transactions (id, transaction_reference, source_account_id, target_account_id, type, amount, balance_after, description, status, created_at)
VALUES
(1, 'TXN-INIT-001', NULL, 1, 'DEPOSIT', 5000.00, 5000.00, 'Opening Deposit - Savings Account', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 29 DAY)),
(2, 'TXN-INIT-002', NULL, 2, 'DEPOSIT', 1500.00, 1500.00, 'Payroll Direct Deposit', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 19 DAY)),
(3, 'TXN-INIT-003', 2, NULL, 'WITHDRAWAL', 250.00, 1250.00, 'ATM Cash Withdrawal - Main St Branch', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(4, 'TXN-INIT-004', NULL, 1, 'DEPOSIT', 450.00, 5450.00, 'Freelance Project Reimbursement', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(5, 'TXN-INIT-005', NULL, 3, 'DEPOSIT', 3800.00, 3800.00, 'Opening Deposit - Savings Account', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 24 DAY)),
(6, 'TXN-INIT-006', NULL, 4, 'DEPOSIT', 920.00, 920.00, 'Demo Starter Credit', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 14 DAY));

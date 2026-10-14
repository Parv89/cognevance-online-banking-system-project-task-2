package com.bank.onlinebanking.config;

import com.bank.onlinebanking.entity.Account;
import com.bank.onlinebanking.entity.Transaction;
import com.bank.onlinebanking.entity.User;
import com.bank.onlinebanking.enums.AccountStatus;
import com.bank.onlinebanking.enums.AccountType;
import com.bank.onlinebanking.enums.RoleType;
import com.bank.onlinebanking.enums.TransactionStatus;
import com.bank.onlinebanking.enums.TransactionType;
import com.bank.onlinebanking.repository.AccountRepository;
import com.bank.onlinebanking.repository.TransactionRepository;
import com.bank.onlinebanking.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.demo.seed-data:true}")
    private boolean seedDataEnabled;

    public DataInitializer(UserRepository userRepository,
                           AccountRepository accountRepository,
                           TransactionRepository transactionRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedDataEnabled) {
            return;
        }

        if (userRepository.count() == 0) {
            logger.info("Initializing demo banking sample data...");

            // Create Demo User 1: John Doe
            User user1 = new User(
                    "john_doe",
                    "john.doe@demobank.com",
                    passwordEncoder.encode("Password@123"),
                    "Johnathan Doe",
                    "+1-555-0192",
                    RoleType.ROLE_USER
            );
            user1 = userRepository.save(user1);

            Account johnSavings = new Account(
                    "ACC-10082719",
                    AccountType.SAVINGS,
                    new BigDecimal("5450.00"),
                    "USD",
                    user1
            );
            johnSavings.setStatus(AccountStatus.ACTIVE);
            johnSavings = accountRepository.save(johnSavings);

            Account johnChecking = new Account(
                    "ACC-20093847",
                    AccountType.CHECKING,
                    new BigDecimal("1250.00"),
                    "USD",
                    user1
            );
            johnChecking.setStatus(AccountStatus.ACTIVE);
            johnChecking = accountRepository.save(johnChecking);

            // Create Demo User 2: Jane Smith
            User user2 = new User(
                    "jane_smith",
                    "jane.smith@demobank.com",
                    passwordEncoder.encode("Password@123"),
                    "Jane Smith",
                    "+1-555-0143",
                    RoleType.ROLE_USER
            );
            user2 = userRepository.save(user2);

            Account janeSavings = new Account(
                    "ACC-30048123",
                    AccountType.SAVINGS,
                    new BigDecimal("3800.00"),
                    "USD",
                    user2
            );
            janeSavings.setStatus(AccountStatus.ACTIVE);
            janeSavings = accountRepository.save(janeSavings);

            // Seed Initial Transactions
            Transaction t1 = new Transaction(
                    "TXN-INIT-001",
                    null,
                    johnSavings,
                    TransactionType.DEPOSIT,
                    new BigDecimal("5000.00"),
                    new BigDecimal("5000.00"),
                    "Demo Account Opening Deposit",
                    TransactionStatus.SUCCESS
            );
            transactionRepository.save(t1);

            Transaction t2 = new Transaction(
                    "TXN-INIT-002",
                    null,
                    johnChecking,
                    TransactionType.DEPOSIT,
                    new BigDecimal("1500.00"),
                    new BigDecimal("1500.00"),
                    "Payroll Direct Deposit",
                    TransactionStatus.SUCCESS
            );
            transactionRepository.save(t2);

            Transaction t3 = new Transaction(
                    "TXN-INIT-003",
                    johnChecking,
                    null,
                    TransactionType.WITHDRAWAL,
                    new BigDecimal("250.00"),
                    new BigDecimal("1250.00"),
                    "ATM Cash Withdrawal - Main St Branch",
                    TransactionStatus.SUCCESS
            );
            transactionRepository.save(t3);

            Transaction t4 = new Transaction(
                    "TXN-INIT-004",
                    null,
                    johnSavings,
                    TransactionType.DEPOSIT,
                    new BigDecimal("450.00"),
                    new BigDecimal("5450.00"),
                    "Freelance Project Payment",
                    TransactionStatus.SUCCESS
            );
            transactionRepository.save(t4);

            Transaction t5 = new Transaction(
                    "TXN-INIT-005",
                    null,
                    janeSavings,
                    TransactionType.DEPOSIT,
                    new BigDecimal("3800.00"),
                    new BigDecimal("3800.00"),
                    "Demo Account Opening Deposit",
                    TransactionStatus.SUCCESS
            );
            transactionRepository.save(t5);

            logger.info("Demo banking accounts initialized successfully!");
            logger.info("Demo User 1: john_doe / Password@123 (Account: ACC-10082719)");
            logger.info("Demo User 2: jane_smith / Password@123 (Account: ACC-30048123)");
        }
    }
}

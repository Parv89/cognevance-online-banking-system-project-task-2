package com.bank.onlinebanking;

import com.bank.onlinebanking.dto.DepositRequestDto;
import com.bank.onlinebanking.dto.TransactionDto;
import com.bank.onlinebanking.dto.TransferRequestDto;
import com.bank.onlinebanking.dto.WithdrawRequestDto;
import com.bank.onlinebanking.entity.Account;
import com.bank.onlinebanking.entity.User;
import com.bank.onlinebanking.enums.AccountStatus;
import com.bank.onlinebanking.enums.AccountType;
import com.bank.onlinebanking.enums.RoleType;
import com.bank.onlinebanking.enums.TransactionType;
import com.bank.onlinebanking.exception.InsufficientFundsException;
import com.bank.onlinebanking.exception.InvalidTransactionException;
import com.bank.onlinebanking.repository.AccountRepository;
import com.bank.onlinebanking.repository.UserRepository;
import com.bank.onlinebanking.service.TransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TransactionServiceTest {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    private User sender;
    private User recipient;
    private Account senderAccount;
    private Account recipientAccount;

    @BeforeEach
    void setup() {
        sender = new User("alice", "alice@example.com", "hash123", "Alice Walker", "12345", RoleType.ROLE_USER);
        sender = userRepository.save(sender);

        recipient = new User("bob", "bob@example.com", "hash456", "Bob Vance", "67890", RoleType.ROLE_USER);
        recipient = userRepository.save(recipient);

        senderAccount = new Account("ACC-11112222", AccountType.SAVINGS, new BigDecimal("1000.00"), "USD", sender);
        senderAccount.setStatus(AccountStatus.ACTIVE);
        senderAccount = accountRepository.save(senderAccount);

        recipientAccount = new Account("ACC-33334444", AccountType.SAVINGS, new BigDecimal("200.00"), "USD", recipient);
        recipientAccount.setStatus(AccountStatus.ACTIVE);
        recipientAccount = accountRepository.save(recipientAccount);
    }

    @Test
    void testSuccessfulTransfer() {
        TransferRequestDto request = new TransferRequestDto(
                "ACC-11112222",
                "ACC-33334444",
                new BigDecimal("350.00"),
                "Rent payment"
        );

        TransactionDto txn = transactionService.transferFunds(request, sender.getId());

        assertNotNull(txn);
        assertEquals(TransactionType.TRANSFER, txn.getType());
        assertEquals(new BigDecimal("350.00"), txn.getAmount());

        Account updatedSender = accountRepository.findById(senderAccount.getId()).orElseThrow();
        Account updatedRecipient = accountRepository.findById(recipientAccount.getId()).orElseThrow();

        assertEquals(new BigDecimal("650.00"), updatedSender.getBalance());
        assertEquals(new BigDecimal("550.00"), updatedRecipient.getBalance());
    }

    @Test
    void testTransferInsufficientFundsThrowsException() {
        TransferRequestDto request = new TransferRequestDto(
                "ACC-11112222",
                "ACC-33334444",
                new BigDecimal("5000.00"), // Exceeds 1000 balance
                "Too much money"
        );

        assertThrows(InsufficientFundsException.class, () -> {
            transactionService.transferFunds(request, sender.getId());
        });

        // Verify balance did not change
        Account updatedSender = accountRepository.findById(senderAccount.getId()).orElseThrow();
        assertEquals(new BigDecimal("1000.00"), updatedSender.getBalance());
    }

    @Test
    void testTransferToSameAccountThrowsException() {
        TransferRequestDto request = new TransferRequestDto(
                "ACC-11112222",
                "ACC-11112222",
                new BigDecimal("100.00"),
                "Self transfer"
        );

        assertThrows(InvalidTransactionException.class, () -> {
            transactionService.transferFunds(request, sender.getId());
        });
    }

    @Test
    void testDepositFunds() {
        DepositRequestDto request = new DepositRequestDto(
                "ACC-11112222",
                new BigDecimal("500.00"),
                "Bonus deposit"
        );

        TransactionDto txn = transactionService.depositFunds(request, sender.getId());

        assertNotNull(txn);
        assertEquals(TransactionType.DEPOSIT, txn.getType());
        assertEquals(new BigDecimal("500.00"), txn.getAmount());

        Account updatedSender = accountRepository.findById(senderAccount.getId()).orElseThrow();
        assertEquals(new BigDecimal("1500.00"), updatedSender.getBalance());
    }

    @Test
    void testWithdrawFunds() {
        WithdrawRequestDto request = new WithdrawRequestDto(
                "ACC-11112222",
                new BigDecimal("400.00"),
                "ATM cash"
        );

        TransactionDto txn = transactionService.withdrawFunds(request, sender.getId());

        assertNotNull(txn);
        assertEquals(TransactionType.WITHDRAWAL, txn.getType());
        assertEquals(new BigDecimal("400.00"), txn.getAmount());

        Account updatedSender = accountRepository.findById(senderAccount.getId()).orElseThrow();
        assertEquals(new BigDecimal("600.00"), updatedSender.getBalance());
    }
}

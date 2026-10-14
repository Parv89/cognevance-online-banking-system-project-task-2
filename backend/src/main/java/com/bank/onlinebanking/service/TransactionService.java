package com.bank.onlinebanking.service;

import com.bank.onlinebanking.dto.DepositRequestDto;
import com.bank.onlinebanking.dto.TransactionDto;
import com.bank.onlinebanking.dto.TransferRequestDto;
import com.bank.onlinebanking.dto.WithdrawRequestDto;
import com.bank.onlinebanking.entity.Account;
import com.bank.onlinebanking.entity.Transaction;
import com.bank.onlinebanking.enums.AccountStatus;
import com.bank.onlinebanking.enums.TransactionStatus;
import com.bank.onlinebanking.enums.TransactionType;
import com.bank.onlinebanking.exception.InsufficientFundsException;
import com.bank.onlinebanking.exception.InvalidTransactionException;
import com.bank.onlinebanking.exception.ResourceNotFoundException;
import com.bank.onlinebanking.exception.UnauthorizedAccessException;
import com.bank.onlinebanking.repository.AccountRepository;
import com.bank.onlinebanking.repository.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
public class TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public TransactionService(AccountRepository accountRepository,
                              TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public TransactionDto transferFunds(TransferRequestDto request, Long userId) {
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidTransactionException("Transfer amount must be strictly greater than 0");
        }

        BigDecimal transferAmount = request.getAmount().setScale(2, RoundingMode.HALF_UP);
        String srcAccNum = request.getSourceAccountNumber().trim();
        String tgtAccNum = request.getTargetAccountNumber().trim();

        if (srcAccNum.equalsIgnoreCase(tgtAccNum)) {
            throw new InvalidTransactionException("Source and destination accounts cannot be identical");
        }

        Account sourceAccount = accountRepository.findByAccountNumber(srcAccNum)
                .orElseThrow(() -> new ResourceNotFoundException("Source account not found: " + srcAccNum));

        // Security check: Must belong to authenticated user
        if (!sourceAccount.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You are not authorized to transfer funds from this account");
        }

        Account targetAccount = accountRepository.findByAccountNumber(tgtAccNum)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient account not found: " + tgtAccNum));

        if (sourceAccount.getStatus() != AccountStatus.ACTIVE) {
            throw new InvalidTransactionException("Source account is " + sourceAccount.getStatus());
        }

        if (targetAccount.getStatus() != AccountStatus.ACTIVE) {
            throw new InvalidTransactionException("Recipient account is not active");
        }

        // Lock accounts in consistent ID order to prevent deadlocks
        Account firstLock;
        Account secondLock;
        if (sourceAccount.getId() < targetAccount.getId()) {
            firstLock = accountRepository.findByIdWithLock(sourceAccount.getId()).orElse(sourceAccount);
            secondLock = accountRepository.findByIdWithLock(targetAccount.getId()).orElse(targetAccount);
        } else {
            firstLock = accountRepository.findByIdWithLock(targetAccount.getId()).orElse(targetAccount);
            secondLock = accountRepository.findByIdWithLock(sourceAccount.getId()).orElse(sourceAccount);
        }

        Account lockedSource = firstLock.getId().equals(sourceAccount.getId()) ? firstLock : secondLock;
        Account lockedTarget = firstLock.getId().equals(targetAccount.getId()) ? firstLock : secondLock;

        // Balance validation on server
        if (lockedSource.getBalance().compareTo(transferAmount) < 0) {
            throw new InsufficientFundsException(String.format(
                    "Insufficient funds in account %s. Available: %s, Requested: %s",
                    srcAccNum, lockedSource.getBalance(), transferAmount));
        }

        // Apply changes
        lockedSource.setBalance(lockedSource.getBalance().subtract(transferAmount));
        lockedTarget.setBalance(lockedTarget.getBalance().add(transferAmount));

        accountRepository.save(lockedSource);
        accountRepository.save(lockedTarget);

        String description = request.getDescription() != null && !request.getDescription().trim().isEmpty()
                ? request.getDescription().trim()
                : "Transfer to " + tgtAccNum;

        String txnRef = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Transaction transaction = new Transaction(
                txnRef,
                lockedSource,
                lockedTarget,
                TransactionType.TRANSFER,
                transferAmount,
                lockedSource.getBalance(),
                description,
                TransactionStatus.SUCCESS
        );

        Transaction savedTxn = transactionRepository.save(transaction);
        return mapToDto(savedTxn);
    }

    @Transactional
    public TransactionDto depositFunds(DepositRequestDto request, Long userId) {
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidTransactionException("Deposit amount must be strictly greater than 0");
        }

        BigDecimal depositAmount = request.getAmount().setScale(2, RoundingMode.HALF_UP);
        String accNum = request.getAccountNumber().trim();

        Account account = accountRepository.findByAccountNumber(accNum)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accNum));

        if (!account.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You are not authorized to deposit into this account");
        }

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new InvalidTransactionException("Account is not active");
        }

        Account lockedAccount = accountRepository.findByIdWithLock(account.getId()).orElse(account);
        lockedAccount.setBalance(lockedAccount.getBalance().add(depositAmount));
        accountRepository.save(lockedAccount);

        String description = request.getDescription() != null && !request.getDescription().trim().isEmpty()
                ? request.getDescription().trim()
                : "Demo Cash Deposit";

        String txnRef = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Transaction transaction = new Transaction(
                txnRef,
                null,
                lockedAccount,
                TransactionType.DEPOSIT,
                depositAmount,
                lockedAccount.getBalance(),
                description,
                TransactionStatus.SUCCESS
        );

        Transaction savedTxn = transactionRepository.save(transaction);
        return mapToDto(savedTxn);
    }

    @Transactional
    public TransactionDto withdrawFunds(WithdrawRequestDto request, Long userId) {
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidTransactionException("Withdrawal amount must be strictly greater than 0");
        }

        BigDecimal withdrawAmount = request.getAmount().setScale(2, RoundingMode.HALF_UP);
        String accNum = request.getAccountNumber().trim();

        Account account = accountRepository.findByAccountNumber(accNum)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accNum));

        if (!account.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You are not authorized to withdraw from this account");
        }

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new InvalidTransactionException("Account is not active");
        }

        Account lockedAccount = accountRepository.findByIdWithLock(account.getId()).orElse(account);

        if (lockedAccount.getBalance().compareTo(withdrawAmount) < 0) {
            throw new InsufficientFundsException(String.format(
                    "Insufficient funds in account %s. Available: %s, Requested: %s",
                    accNum, lockedAccount.getBalance(), withdrawAmount));
        }

        lockedAccount.setBalance(lockedAccount.getBalance().subtract(withdrawAmount));
        accountRepository.save(lockedAccount);

        String description = request.getDescription() != null && !request.getDescription().trim().isEmpty()
                ? request.getDescription().trim()
                : "Demo ATM Withdrawal";

        String txnRef = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Transaction transaction = new Transaction(
                txnRef,
                lockedAccount,
                null,
                TransactionType.WITHDRAWAL,
                withdrawAmount,
                lockedAccount.getBalance(),
                description,
                TransactionStatus.SUCCESS
        );

        Transaction savedTxn = transactionRepository.save(transaction);
        return mapToDto(savedTxn);
    }

    @Transactional(readOnly = true)
    public Page<TransactionDto> getUserTransactions(Long userId, String typeStr, Pageable pageable) {
        TransactionType filterType = null;
        if (typeStr != null && !typeStr.trim().isEmpty() && !typeStr.equalsIgnoreCase("ALL")) {
            try {
                filterType = TransactionType.valueOf(typeStr.toUpperCase().trim());
            } catch (IllegalArgumentException ignored) {
            }
        }

        Page<Transaction> page = transactionRepository.findUserTransactionsWithFilter(userId, filterType, pageable);
        return page.map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public Page<TransactionDto> getAccountTransactions(Long accountId, Long userId, String typeStr, Pageable pageable) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + accountId));

        if (!account.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You are not authorized to view transactions for this account");
        }

        TransactionType filterType = null;
        if (typeStr != null && !typeStr.trim().isEmpty() && !typeStr.equalsIgnoreCase("ALL")) {
            try {
                filterType = TransactionType.valueOf(typeStr.toUpperCase().trim());
            } catch (IllegalArgumentException ignored) {
            }
        }

        Page<Transaction> page = transactionRepository.findAccountTransactionsWithFilter(accountId, filterType, pageable);
        return page.map(this::mapToDto);
    }

    public TransactionDto mapToDto(Transaction txn) {
        String srcAcc = txn.getSourceAccount() != null ? txn.getSourceAccount().getAccountNumber() : "CASH / SYSTEM";
        String srcOwner = txn.getSourceAccount() != null ? txn.getSourceAccount().getUser().getFullName() : "Self / ATM";
        String tgtAcc = txn.getTargetAccount() != null ? txn.getTargetAccount().getAccountNumber() : "CASH / ATM";
        String tgtOwner = txn.getTargetAccount() != null ? txn.getTargetAccount().getUser().getFullName() : "Cashier / Self";

        return new TransactionDto(
                txn.getId(),
                txn.getTransactionReference(),
                srcAcc,
                srcOwner,
                tgtAcc,
                tgtOwner,
                txn.getType(),
                txn.getAmount(),
                txn.getBalanceAfter(),
                txn.getDescription(),
                txn.getStatus(),
                txn.getCreatedAt()
        );
    }
}

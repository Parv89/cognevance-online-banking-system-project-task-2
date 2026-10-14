package com.bank.onlinebanking.service;

import com.bank.onlinebanking.dto.AccountDto;
import com.bank.onlinebanking.dto.CreateAccountRequestDto;
import com.bank.onlinebanking.entity.Account;
import com.bank.onlinebanking.entity.Transaction;
import com.bank.onlinebanking.entity.User;
import com.bank.onlinebanking.enums.AccountStatus;
import com.bank.onlinebanking.enums.AccountType;
import com.bank.onlinebanking.enums.TransactionStatus;
import com.bank.onlinebanking.enums.TransactionType;
import com.bank.onlinebanking.exception.ResourceNotFoundException;
import com.bank.onlinebanking.exception.UnauthorizedAccessException;
import com.bank.onlinebanking.repository.AccountRepository;
import com.bank.onlinebanking.repository.TransactionRepository;
import com.bank.onlinebanking.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public AccountService(AccountRepository accountRepository,
                          UserRepository userRepository,
                          TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public List<AccountDto> getUserAccounts(Long userId) {
        return accountRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AccountDto getAccountById(Long accountId, Long userId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + accountId));

        if (!account.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You are not authorized to view this account");
        }

        return mapToDto(account);
    }

    @Transactional(readOnly = true)
    public AccountDto lookupRecipient(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalArgumentException("Target account is not active");
        }

        // Return recipient details (safe subset)
        return new AccountDto(
                account.getId(),
                account.getAccountNumber(),
                account.getAccountType(),
                null, // Hide balance for privacy!
                account.getCurrency(),
                account.getStatus(),
                null,
                account.getUser().getFullName(),
                account.getCreatedAt()
        );
    }

    @Transactional
    public AccountDto createAccount(CreateAccountRequestDto request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        AccountType type = request.getAccountType() != null ? request.getAccountType() : AccountType.CHECKING;
        BigDecimal initialDeposit = (request.getInitialDeposit() != null && request.getInitialDeposit().compareTo(BigDecimal.ZERO) >= 0)
                ? request.getInitialDeposit().setScale(2)
                : BigDecimal.ZERO.setScale(2);

        String accNum;
        do {
            int randomPart = 10000000 + secureRandom.nextInt(90000000);
            accNum = "ACC-" + randomPart;
        } while (accountRepository.existsByAccountNumber(accNum));

        Account account = new Account(
                accNum,
                type,
                initialDeposit,
                "USD",
                user
        );

        Account saved = accountRepository.save(account);

        if (initialDeposit.compareTo(BigDecimal.ZERO) > 0) {
            Transaction initialTxn = new Transaction(
                    "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                    null,
                    saved,
                    TransactionType.DEPOSIT,
                    initialDeposit,
                    initialDeposit,
                    "Initial Account Opening Deposit",
                    TransactionStatus.SUCCESS
            );
            transactionRepository.save(initialTxn);
        }

        return mapToDto(saved);
    }

    public AccountDto mapToDto(Account account) {
        return new AccountDto(
                account.getId(),
                account.getAccountNumber(),
                account.getAccountType(),
                account.getBalance(),
                account.getCurrency(),
                account.getStatus(),
                account.getUser().getId(),
                account.getUser().getFullName(),
                account.getCreatedAt()
        );
    }
}

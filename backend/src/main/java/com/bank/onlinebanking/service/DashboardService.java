package com.bank.onlinebanking.service;

import com.bank.onlinebanking.dto.AccountDto;
import com.bank.onlinebanking.dto.DashboardSummaryDto;
import com.bank.onlinebanking.dto.TransactionDto;
import com.bank.onlinebanking.entity.Account;
import com.bank.onlinebanking.entity.Transaction;
import com.bank.onlinebanking.entity.User;
import com.bank.onlinebanking.enums.TransactionType;
import com.bank.onlinebanking.exception.ResourceNotFoundException;
import com.bank.onlinebanking.repository.AccountRepository;
import com.bank.onlinebanking.repository.TransactionRepository;
import com.bank.onlinebanking.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final AccountService accountService;
    private final TransactionService transactionService;

    public DashboardService(UserRepository userRepository,
                            AccountRepository accountRepository,
                            TransactionRepository transactionRepository,
                            AccountService accountService,
                            TransactionService transactionService) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.accountService = accountService;
        this.transactionService = transactionService;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        List<Account> accounts = accountRepository.findByUserId(userId);
        List<AccountDto> accountDtos = accounts.stream()
                .map(accountService::mapToDto)
                .collect(Collectors.toList());

        BigDecimal totalBalance = accounts.stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Fetch recent 10 transactions
        List<TransactionDto> recentTransactions = transactionRepository
                .findUserTransactionsWithFilter(userId, null, PageRequest.of(0, 10))
                .getContent()
                .stream()
                .map(transactionService::mapToDto)
                .collect(Collectors.toList());

        // Calculate totals
        List<Transaction> allUserTransactions = transactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        BigDecimal totalDeposits = BigDecimal.ZERO;
        BigDecimal totalWithdrawals = BigDecimal.ZERO;
        BigDecimal totalTransfers = BigDecimal.ZERO;

        for (Transaction txn : allUserTransactions) {
            if (txn.getType() == TransactionType.DEPOSIT) {
                totalDeposits = totalDeposits.add(txn.getAmount());
            } else if (txn.getType() == TransactionType.WITHDRAWAL) {
                totalWithdrawals = totalWithdrawals.add(txn.getAmount());
            } else if (txn.getType() == TransactionType.TRANSFER) {
                totalTransfers = totalTransfers.add(txn.getAmount());
            }
        }

        return new DashboardSummaryDto(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                totalBalance,
                accounts.size(),
                accountDtos,
                recentTransactions,
                totalDeposits,
                totalWithdrawals,
                totalTransfers
        );
    }
}

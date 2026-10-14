package com.bank.onlinebanking.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardSummaryDto {
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private BigDecimal totalBalance;
    private int totalAccounts;
    private List<AccountDto> accounts;
    private List<TransactionDto> recentTransactions;
    private BigDecimal monthlyDeposits;
    private BigDecimal monthlyWithdrawals;
    private BigDecimal monthlyTransfers;

    public DashboardSummaryDto() {
    }

    public DashboardSummaryDto(Long userId, String username, String fullName, String email,
                               BigDecimal totalBalance, int totalAccounts, List<AccountDto> accounts,
                               List<TransactionDto> recentTransactions, BigDecimal monthlyDeposits,
                               BigDecimal monthlyWithdrawals, BigDecimal monthlyTransfers) {
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.totalBalance = totalBalance;
        this.totalAccounts = totalAccounts;
        this.accounts = accounts;
        this.recentTransactions = recentTransactions;
        this.monthlyDeposits = monthlyDeposits;
        this.monthlyWithdrawals = monthlyWithdrawals;
        this.monthlyTransfers = monthlyTransfers;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public BigDecimal getTotalBalance() {
        return totalBalance;
    }

    public void setTotalBalance(BigDecimal totalBalance) {
        this.totalBalance = totalBalance;
    }

    public int getTotalAccounts() {
        return totalAccounts;
    }

    public void setTotalAccounts(int totalAccounts) {
        this.totalAccounts = totalAccounts;
    }

    public List<AccountDto> getAccounts() {
        return accounts;
    }

    public void setAccounts(List<AccountDto> accounts) {
        this.accounts = accounts;
    }

    public List<TransactionDto> getRecentTransactions() {
        return recentTransactions;
    }

    public void setRecentTransactions(List<TransactionDto> recentTransactions) {
        this.recentTransactions = recentTransactions;
    }

    public BigDecimal getMonthlyDeposits() {
        return monthlyDeposits;
    }

    public void setMonthlyDeposits(BigDecimal monthlyDeposits) {
        this.monthlyDeposits = monthlyDeposits;
    }

    public BigDecimal getMonthlyWithdrawals() {
        return monthlyWithdrawals;
    }

    public void setMonthlyWithdrawals(BigDecimal monthlyWithdrawals) {
        this.monthlyWithdrawals = monthlyWithdrawals;
    }

    public BigDecimal getMonthlyTransfers() {
        return monthlyTransfers;
    }

    public void setMonthlyTransfers(BigDecimal monthlyTransfers) {
        this.monthlyTransfers = monthlyTransfers;
    }
}

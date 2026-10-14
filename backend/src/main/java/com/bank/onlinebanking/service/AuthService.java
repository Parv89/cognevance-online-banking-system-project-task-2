package com.bank.onlinebanking.service;

import com.bank.onlinebanking.dto.AuthRequestDto;
import com.bank.onlinebanking.dto.AuthResponseDto;
import com.bank.onlinebanking.dto.RegisterRequestDto;
import com.bank.onlinebanking.entity.Account;
import com.bank.onlinebanking.entity.Transaction;
import com.bank.onlinebanking.entity.User;
import com.bank.onlinebanking.enums.AccountStatus;
import com.bank.onlinebanking.enums.AccountType;
import com.bank.onlinebanking.enums.RoleType;
import com.bank.onlinebanking.enums.TransactionStatus;
import com.bank.onlinebanking.enums.TransactionType;
import com.bank.onlinebanking.exception.ResourceNotFoundException;
import com.bank.onlinebanking.exception.UserAlreadyExistsException;
import com.bank.onlinebanking.repository.AccountRepository;
import com.bank.onlinebanking.repository.TransactionRepository;
import com.bank.onlinebanking.repository.UserRepository;
import com.bank.onlinebanking.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository userRepository,
                       AccountRepository accountRepository,
                       TransactionRepository transactionRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    @Transactional
    public AuthResponseDto registerUser(RegisterRequestDto request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username '" + request.getUsername() + "' is already taken.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email '" + request.getEmail() + "' is already registered.");
        }

        User user = new User(
                request.getUsername().trim(),
                request.getEmail().trim().toLowerCase(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName().trim(),
                request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null,
                RoleType.ROLE_USER
        );

        User savedUser = userRepository.save(user);

        // Provision Primary Savings Account
        BigDecimal initialBalance = (request.getInitialDeposit() != null && request.getInitialDeposit().compareTo(BigDecimal.ZERO) >= 0)
                ? request.getInitialDeposit().setScale(2)
                : new BigDecimal("1000.00").setScale(2); // Demo welcome bonus balance

        Account primaryAccount = new Account(
                generateAccountNumber(),
                AccountType.SAVINGS,
                initialBalance,
                "USD",
                savedUser
        );
        Account savedAccount = accountRepository.save(primaryAccount);

        // Record Initial Deposit Transaction if balance > 0
        if (initialBalance.compareTo(BigDecimal.ZERO) > 0) {
            Transaction initialTxn = new Transaction(
                    "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                    null,
                    savedAccount,
                    TransactionType.DEPOSIT,
                    initialBalance,
                    initialBalance,
                    "Demo Opening Welcome Deposit",
                    TransactionStatus.SUCCESS
            );
            transactionRepository.save(initialTxn);
        }

        // Generate JWT token
        String jwtToken = jwtUtils.generateTokenFromUsername(savedUser.getUsername());

        return new AuthResponseDto(
                jwtToken,
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole().name(),
                savedAccount.getId(),
                savedAccount.getAccountNumber()
        );
    }

    @Transactional(readOnly = true)
    public AuthResponseDto authenticateUser(AuthRequestDto request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername().trim(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwtToken = jwtUtils.generateJwtToken(authentication);

        User user = userRepository.findByUsername(request.getUsername().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Account> accounts = accountRepository.findByUserIdAndStatus(user.getId(), AccountStatus.ACTIVE);
        Account primaryAccount = accounts.isEmpty() ? null : accounts.get(0);

        return new AuthResponseDto(
                jwtToken,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                primaryAccount != null ? primaryAccount.getId() : null,
                primaryAccount != null ? primaryAccount.getAccountNumber() : null
        );
    }

    public String generateAccountNumber() {
        String accNum;
        do {
            int randomPart = 10000000 + secureRandom.nextInt(90000000);
            accNum = "ACC-" + randomPart;
        } while (accountRepository.existsByAccountNumber(accNum));
        return accNum;
    }
}

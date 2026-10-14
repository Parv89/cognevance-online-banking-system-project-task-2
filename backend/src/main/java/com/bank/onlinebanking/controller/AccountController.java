package com.bank.onlinebanking.controller;

import com.bank.onlinebanking.dto.AccountDto;
import com.bank.onlinebanking.dto.ApiResponseDto;
import com.bank.onlinebanking.dto.CreateAccountRequestDto;
import com.bank.onlinebanking.security.UserDetailsImpl;
import com.bank.onlinebanking.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public ResponseEntity<ApiResponseDto<List<AccountDto>>> getUserAccounts(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<AccountDto> accounts = accountService.getUserAccounts(userDetails.getId());
        return ResponseEntity.ok(ApiResponseDto.ok("Accounts fetched successfully", accounts));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDto<AccountDto>> getAccountById(@PathVariable Long id,
                                                                     @AuthenticationPrincipal UserDetailsImpl userDetails) {
        AccountDto account = accountService.getAccountById(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponseDto.ok("Account details fetched", account));
    }

    @PostMapping
    public ResponseEntity<ApiResponseDto<AccountDto>> createAccount(@Valid @RequestBody CreateAccountRequestDto request,
                                                                    @AuthenticationPrincipal UserDetailsImpl userDetails) {
        AccountDto account = accountService.createAccount(request, userDetails.getId());
        return new ResponseEntity<>(ApiResponseDto.ok("New account created successfully", account), HttpStatus.CREATED);
    }

    @GetMapping("/lookup")
    public ResponseEntity<ApiResponseDto<AccountDto>> lookupRecipient(@RequestParam String accountNumber) {
        AccountDto recipient = accountService.lookupRecipient(accountNumber);
        return ResponseEntity.ok(ApiResponseDto.ok("Recipient account found", recipient));
    }
}

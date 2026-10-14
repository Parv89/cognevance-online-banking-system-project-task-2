package com.bank.onlinebanking.controller;

import com.bank.onlinebanking.dto.*;
import com.bank.onlinebanking.security.UserDetailsImpl;
import com.bank.onlinebanking.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponseDto<TransactionDto>> transferFunds(
            @Valid @RequestBody TransferRequestDto request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        TransactionDto txn = transactionService.transferFunds(request, userDetails.getId());
        return new ResponseEntity<>(ApiResponseDto.ok("Transfer completed successfully", txn), HttpStatus.OK);
    }

    @PostMapping("/deposit")
    public ResponseEntity<ApiResponseDto<TransactionDto>> depositFunds(
            @Valid @RequestBody DepositRequestDto request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        TransactionDto txn = transactionService.depositFunds(request, userDetails.getId());
        return new ResponseEntity<>(ApiResponseDto.ok("Deposit successful", txn), HttpStatus.OK);
    }

    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponseDto<TransactionDto>> withdrawFunds(
            @Valid @RequestBody WithdrawRequestDto request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        TransactionDto txn = transactionService.withdrawFunds(request, userDetails.getId());
        return new ResponseEntity<>(ApiResponseDto.ok("Withdrawal successful", txn), HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<ApiResponseDto<Page<TransactionDto>>> getUserTransactions(
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Sort sort = direction.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<TransactionDto> result = transactionService.getUserTransactions(userDetails.getId(), type, pageable);
        return ResponseEntity.ok(ApiResponseDto.ok("Transactions retrieved", result));
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<ApiResponseDto<Page<TransactionDto>>> getAccountTransactions(
            @PathVariable Long accountId,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<TransactionDto> result = transactionService.getAccountTransactions(accountId, userDetails.getId(), type, pageable);
        return ResponseEntity.ok(ApiResponseDto.ok("Account transactions retrieved", result));
    }
}

package com.bank.onlinebanking.controller;

import com.bank.onlinebanking.dto.ApiResponseDto;
import com.bank.onlinebanking.dto.AuthRequestDto;
import com.bank.onlinebanking.dto.AuthResponseDto;
import com.bank.onlinebanking.dto.RegisterRequestDto;
import com.bank.onlinebanking.security.UserDetailsImpl;
import com.bank.onlinebanking.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponseDto<AuthResponseDto>> register(@Valid @RequestBody RegisterRequestDto request) {
        AuthResponseDto response = authService.registerUser(request);
        return new ResponseEntity<>(ApiResponseDto.ok("User registered successfully", response), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponseDto<AuthResponseDto>> login(@Valid @RequestBody AuthRequestDto request) {
        AuthResponseDto response = authService.authenticateUser(request);
        return ResponseEntity.ok(ApiResponseDto.ok("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponseDto<Map<String, Object>>> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", userDetails.getId());
        userData.put("username", userDetails.getUsername());
        userData.put("email", userDetails.getEmail());
        userData.put("fullName", userDetails.getFullName());
        userData.put("roles", userDetails.getAuthorities());

        return ResponseEntity.ok(ApiResponseDto.ok("User session active", userData));
    }
}

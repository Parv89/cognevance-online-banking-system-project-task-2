package com.bank.onlinebanking.controller;

import com.bank.onlinebanking.dto.ApiResponseDto;
import com.bank.onlinebanking.dto.DashboardSummaryDto;
import com.bank.onlinebanking.security.UserDetailsImpl;
import com.bank.onlinebanking.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponseDto<DashboardSummaryDto>> getDashboardSummary(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        DashboardSummaryDto summary = dashboardService.getDashboardSummary(userDetails.getId());
        return ResponseEntity.ok(ApiResponseDto.ok("Dashboard summary fetched", summary));
    }
}

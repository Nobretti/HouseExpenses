package com.houseexpenses.controller;

import com.houseexpenses.dto.ApiResponse;
import com.houseexpenses.model.User;
import com.houseexpenses.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication and user management endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/session")
    @Operation(summary = "Create user session", description = "Creates a session for a Supabase authenticated user")
    public ResponseEntity<ApiResponse<Map<String, String>>> createSession(
            @RequestBody Map<String, String> request) {
        UUID userId = UUID.fromString(request.get("userId"));
        String displayName = request.get("displayName");

        Map<String, String> tokens = authService.createUserSession(userId, displayName);
        return ResponseEntity.ok(ApiResponse.success(tokens, "Session created successfully"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh tokens", description = "Refreshes access and refresh tokens")
    public ResponseEntity<ApiResponse<Map<String, String>>> refreshTokens(
            @RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");

        Map<String, String> tokens = authService.refreshTokens(refreshToken);
        return ResponseEntity.ok(ApiResponse.success(tokens, "Tokens refreshed successfully"));
    }

    @GetMapping("/profile")
    @Operation(summary = "Get user profile", description = "Returns the current user's profile")
    public ResponseEntity<ApiResponse<User>> getProfile(@AuthenticationPrincipal UUID userId) {
        User user = authService.getUserProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile", description = "Updates the current user's profile")
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @AuthenticationPrincipal UUID userId,
            @RequestBody Map<String, Object> request) {
        String displayName = (String) request.get("displayName");
        String currency = (String) request.get("currency");
        String locale = (String) request.get("locale");

        Double monthlyBudgetLimit = null;
        Double annualBudgetLimit = null;

        if (request.containsKey("monthlyBudgetLimit")) {
            Object value = request.get("monthlyBudgetLimit");
            if (value != null) {
                monthlyBudgetLimit = ((Number) value).doubleValue();
            }
        }

        if (request.containsKey("annualBudgetLimit")) {
            Object value = request.get("annualBudgetLimit");
            if (value != null) {
                annualBudgetLimit = ((Number) value).doubleValue();
            }
        }

        User user = authService.updateUserProfile(userId, displayName, currency, locale,
                monthlyBudgetLimit, annualBudgetLimit);
        return ResponseEntity.ok(ApiResponse.success(user, "Profile updated successfully"));
    }
}

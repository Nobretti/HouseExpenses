package com.houseexpenses.controller;

import com.houseexpenses.dto.*;
import com.houseexpenses.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/alerts")
@RequiredArgsConstructor
@Tag(name = "Alerts", description = "Alert management endpoints")
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    @Operation(summary = "List alerts", description = "Returns a paginated list of alerts")
    public ResponseEntity<ApiResponse<List<AlertDTO>>> getAlerts(
            @AuthenticationPrincipal UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<AlertDTO> alerts = alertService.getAlerts(userId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        ApiResponse.PaginationInfo pagination = ApiResponse.PaginationInfo.builder()
                .page(alerts.getNumber())
                .size(alerts.getSize())
                .totalElements(alerts.getTotalElements())
                .totalPages(alerts.getTotalPages())
                .hasNext(alerts.hasNext())
                .hasPrevious(alerts.hasPrevious())
                .build();

        return ResponseEntity.ok(ApiResponse.success(alerts.getContent(), pagination));
    }

    @GetMapping("/unread")
    @Operation(summary = "Get unread alerts", description = "Returns all unread alerts")
    public ResponseEntity<ApiResponse<List<AlertDTO>>> getUnreadAlerts(
            @AuthenticationPrincipal UUID userId) {
        List<AlertDTO> alerts = alertService.getUnreadAlerts(userId);
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping("/count")
    @Operation(summary = "Get unread count", description = "Returns the count of unread alerts")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal UUID userId) {
        long count = alertService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark as read", description = "Marks a single alert as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {
        alertService.markAsRead(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null, "Alert marked as read"));
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all as read", description = "Marks all alerts as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UUID userId) {
        alertService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success(null, "All alerts marked as read"));
    }
}

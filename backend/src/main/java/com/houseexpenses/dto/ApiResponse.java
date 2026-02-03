package com.houseexpenses.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String message;
    private ErrorDetails error;
    private PaginationInfo pagination;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .build();
    }

    public static <T> ApiResponse<T> success(T data, PaginationInfo pagination) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .pagination(pagination)
                .build();
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(ErrorDetails.builder().code(code).message(message).build())
                .build();
    }

    public static <T> ApiResponse<T> error(String code, String message, Object details) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(ErrorDetails.builder().code(code).message(message).details(details).build())
                .build();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ErrorDetails {
        private String code;
        private String message;
        private Object details;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaginationInfo {
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }
}

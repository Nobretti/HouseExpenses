package com.houseexpenses.service;

import com.houseexpenses.config.JwtTokenProvider;
import com.houseexpenses.model.User;
import com.houseexpenses.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public Map<String, String> createUserSession(UUID userId, String displayName) {
        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            user = User.builder()
                    .id(userId)
                    .displayName(displayName)
                    .build();
            userRepository.save(user);
            log.info("Created new user profile for {}", userId);
        }

        String accessToken = jwtTokenProvider.generateToken(userId);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userId);

        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);

        return tokens;
    }

    @Transactional
    public Map<String, String> refreshTokens(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        UUID userId = jwtTokenProvider.getUserIdFromToken(refreshToken);

        String newAccessToken = jwtTokenProvider.generateToken(userId);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(userId);

        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", newAccessToken);
        tokens.put("refreshToken", newRefreshToken);

        return tokens;
    }

    @Transactional(readOnly = true)
    public User getUserProfile(UUID userId) {
        return userRepository.findById(userId).orElse(null);
    }

    @Transactional
    public User updateUserProfile(UUID userId, String displayName, String currency, String locale,
                                   Double monthlyBudgetLimit, Double annualBudgetLimit) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (displayName != null) {
            user.setDisplayName(displayName);
        }
        if (currency != null) {
            user.setCurrency(currency);
        }
        if (locale != null) {
            user.setLocale(locale);
        }
        // Budget limits can be set to null to remove them
        user.setMonthlyBudgetLimit(monthlyBudgetLimit);
        user.setAnnualBudgetLimit(annualBudgetLimit);

        return userRepository.save(user);
    }
}

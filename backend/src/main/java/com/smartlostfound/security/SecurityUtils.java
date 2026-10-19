package com.smartlostfound.security;

import com.smartlostfound.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static Optional<UserPrincipal> getCurrentUserPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            return Optional.of((UserPrincipal) authentication.getPrincipal());
        }
        return Optional.empty();
    }

    public static UserPrincipal getRequiredCurrentUserPrincipal() {
        return getCurrentUserPrincipal()
                .orElseThrow(() -> new UnauthorizedException("User is not authenticated"));
    }

    public static Long getCurrentUserId() {
        return getCurrentUserPrincipal().map(UserPrincipal::getId).orElse(null);
    }

    public static boolean isAdmin() {
        return getCurrentUserPrincipal()
                .map(p -> p.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")))
                .orElse(false);
    }

    public static boolean isCurrentUserOrAdmin(Long userId) {
        if (isAdmin()) {
            return true;
        }
        Long currentId = getCurrentUserId();
        return currentId != null && currentId.equals(userId);
    }
}

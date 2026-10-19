package com.smartlostfound.controller;

import com.smartlostfound.dto.admin.AdminDashboardStatsDto;
import com.smartlostfound.service.AdminService;
import com.smartlostfound.service.ClaimService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminService adminService;

    @MockBean
    private ClaimService claimService;

    @Test
    @DisplayName("GET /api/v1/admin/stats - Unauthorized when no token provided")
    void testUnauthenticatedUserCannotAccessAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/admin/stats"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "user@example.com", authorities = {"ROLE_USER"})
    @DisplayName("GET /api/v1/admin/stats - 403 Forbidden when normal user tries to access admin API")
    void testNormalUserForbiddenFromAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/admin/stats"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@smartlostfound.com", authorities = {"ROLE_ADMIN"})
    @DisplayName("GET /api/v1/admin/stats - 200 OK when administrator accesses admin API")
    void testAdminUserAllowedAccess() throws Exception {
        AdminDashboardStatsDto stats = new AdminDashboardStatsDto(
                50L, 20L, 15L, 10L, 5L, 3L, 2L
        );
        when(adminService.getDashboardStats()).thenReturn(stats);

        mockMvc.perform(get("/api/v1/admin/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalUsers").value(50))
                .andExpect(jsonPath("$.data.totalOpenReports").value(10));
    }
}

package com.example.taskmanager;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

// użycie bazy H2 w pamięci (izolacja środowiska testowego)
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
public class SecurityTests {

    @Autowired
    private MockMvc mockMvc;

    // Test 1: Niezabezpieczony endpoint musi zwrócić 200 OK dla każdego (Wymóg 3.0)
    @Test
    public void healthEndpoint_ShouldBeAccessibleWithoutToken() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk());
    }

    // Test 2: Zabezpieczony endpoint musi odrzucić zapytanie bez tokena (401)
    @Test
    public void tasksAllEndpoint_ShouldReturn401_WhenNoToken() throws Exception {
        mockMvc.perform(get("/api/tasks/all"))
                .andExpect(status().isUnauthorized());
    }

    // Test 3: Endpoint dla admina musi odrzucić zwykłego użytkownika (403)
    @Test
    public void tasksAllEndpoint_ShouldReturn403_WhenUserLacksAdminRole() throws Exception {
        mockMvc.perform(get("/api/tasks/all")
                        .with(jwt().jwt(builder -> builder.claim("scope", "user"))))
                .andExpect(status().isForbidden());
    }

    // Test 4: Endpoint dla admina musi przepuścić admina (200)
    @Test
    public void tasksAllEndpoint_ShouldReturn200_WhenUserIsAdmin() throws Exception {
        mockMvc.perform(get("/api/tasks/all")
                        .with(jwt().jwt(builder -> builder.claim("scope", "admin"))))
                .andExpect(status().isOk());
    }
}
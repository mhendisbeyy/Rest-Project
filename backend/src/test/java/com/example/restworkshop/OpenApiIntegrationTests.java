package com.example.restworkshop;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OpenApiIntegrationTests {
    @Autowired private MockMvc mockMvc;

    @Test
    void publishesActualTaskContractAndBeanSchemas() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/tasks'].get").exists())
                .andExpect(jsonPath("$.paths['/api/tasks'].post.responses['201'].headers.Location").exists())
                .andExpect(jsonPath("$.paths['/api/tasks/{id}'].put").exists())
                .andExpect(jsonPath("$.paths['/api/tasks/{id}'].patch").exists())
                .andExpect(jsonPath("$.paths['/api/tasks/{id}'].delete.responses['204']").exists())
                .andExpect(jsonPath("$.components.schemas.TaskResponse.properties.id.type").value("integer"))
                .andExpect(jsonPath("$.components.schemas.TaskResponse.properties.title.type").value("string"));
    }
}

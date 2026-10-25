package com.example.restworkshop;

import com.example.restworkshop.models.Task;
import com.example.restworkshop.enums.TaskStatus;
import com.example.restworkshop.repositories.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TaskApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TaskRepository taskRepository;

    @BeforeEach
    void setUp() {
        taskRepository.deleteAll();
        taskRepository.save(new Task("Birinci açık görev", "Açıklama", TaskStatus.OPEN));
        taskRepository.save(new Task("Tamamlanan görev", null, TaskStatus.DONE));
        taskRepository.save(new Task("İkinci açık görev", null, TaskStatus.OPEN));
    }

    @Test
    void filtersAndPaginatesBeforeComputingTotals() throws Exception {
        mockMvc.perform(get("/api/tasks").param("status", "OPEN").param("page", "1").param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].title").value("İkinci açık görev"))
                .andExpect(jsonPath("$.items[0].status").value("OPEN"))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.page").value(1));
    }

    @Test
    void returnsEmptyPageWithExistingTotalWhenPageIsBeyondEnd() throws Exception {
        mockMvc.perform(get("/api/tasks").param("page", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(0))
                .andExpect(jsonPath("$.totalElements").value(3));
    }

    @Test
    void returnsDetailForIdReceivedFromList() throws Exception {
        Long id = taskRepository.findAll(org.springframework.data.domain.Sort.by("id")).getFirst().getId();
        mockMvc.perform(get("/api/tasks/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.title").value("Birinci açık görev"));
    }

    @Test
    void returnsNotFoundAsProblemDetail() throws Exception {
        mockMvc.perform(get("/api/tasks/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.code").value("TASK_NOT_FOUND"))
                .andExpect(jsonPath("$.instance").value("/api/tasks/" + Long.MAX_VALUE));
    }

    @Test
    void rejectsInvalidPaginationStatusAndId() throws Exception {
        for (String invalidQuery : new String[]{"page=-1", "size=0", "size=51", "status=UNKNOWN"}) {
            mockMvc.perform(get("/api/tasks?" + invalidQuery)).andExpect(status().isBadRequest());
        }
        mockMvc.perform(get("/api/tasks/0")).andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/tasks/not-a-number")).andExpect(status().isBadRequest());
    }
}

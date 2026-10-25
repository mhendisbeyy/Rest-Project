package com.example.restworkshop;

import com.example.restworkshop.models.Task;
import com.example.restworkshop.enums.TaskStatus;
import com.example.restworkshop.repositories.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TaskWriteApiIntegrationTests {

    @Autowired private MockMvc mockMvc;
    @Autowired private TaskRepository taskRepository;
    private Long openId;
    private Long doneId;

    @BeforeEach
    void setUp() {
        taskRepository.deleteAll();
        openId = taskRepository.save(new Task("İlk başlık", "İlk açıklama", TaskStatus.OPEN)).getId();
        doneId = taskRepository.save(new Task("Biten görev", "Korunacak açıklama", TaskStatus.DONE)).getId();
    }

    @Test
    void createsOpenTaskAndLocationPointsToPersistedResource() throws Exception {
        var response = mockMvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Yeni görev\",\"description\":\"Açıklama\"}"))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString("/api/tasks/")))
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andReturn().getResponse();
        mockMvc.perform(get(response.getHeader("Location")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Yeni görev"));
        assertThat(taskRepository.count()).isEqualTo(3);
    }

    @Test
    void putReplacesWritableRepresentationAndMissingDescriptionBecomesNull() throws Exception {
        mockMvc.perform(put("/api/tasks/{id}", openId).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Yeni başlık\",\"status\":\"IN_PROGRESS\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("IN_PROGRESS"));
        Task stored = taskRepository.findById(openId).orElseThrow();
        assertThat(stored.getTitle()).isEqualTo("Yeni başlık");
        assertThat(stored.getDescription()).isNull();
        assertThat(stored.getStatus()).isEqualTo(TaskStatus.IN_PROGRESS);
    }

    @Test
    void patchChangesOnlyStatus() throws Exception {
        mockMvc.perform(patch("/api/tasks/{id}", openId).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"DONE\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("DONE"));
        Task stored = taskRepository.findById(openId).orElseThrow();
        assertThat(stored.getTitle()).isEqualTo("İlk başlık");
        assertThat(stored.getDescription()).isEqualTo("İlk açıklama");
    }

    @Test
    void bothPutAndPatchRejectReopeningWithoutChangingAnyField() throws Exception {
        for (String newStatus : new String[]{"OPEN", "IN_PROGRESS"}) {
            mockMvc.perform(put("/api/tasks/{id}", doneId).contentType(MediaType.APPLICATION_JSON)
                            .content("{\"title\":\"Değişmemeli\",\"description\":null,\"status\":\"" + newStatus + "\"}"))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.code").value("TASK_STATE_CONFLICT"));
            mockMvc.perform(patch("/api/tasks/{id}", doneId).contentType(MediaType.APPLICATION_JSON)
                            .content("{\"status\":\"" + newStatus + "\"}"))
                    .andExpect(status().isConflict());
        }
        Task stored = taskRepository.findById(doneId).orElseThrow();
        assertThat(stored.getTitle()).isEqualTo("Biten görev");
        assertThat(stored.getDescription()).isEqualTo("Korunacak açıklama");
        assertThat(stored.getStatus()).isEqualTo(TaskStatus.DONE);
    }

    @Test
    void repeatedDoneUpdatesAreAllowedThroughBothMethods() throws Exception {
        for (int i = 0; i < 2; i++) {
            mockMvc.perform(put("/api/tasks/{id}", doneId).contentType(MediaType.APPLICATION_JSON)
                            .content("{\"title\":\"Biten görev\",\"description\":\"Korunacak açıklama\",\"status\":\"DONE\"}"))
                    .andExpect(status().isOk());
            mockMvc.perform(patch("/api/tasks/{id}", doneId).contentType(MediaType.APPLICATION_JSON)
                            .content("{\"status\":\"DONE\"}"))
                    .andExpect(status().isOk());
        }
        assertThat(taskRepository.count()).isEqualTo(2);
    }

    @Test
    void deleteReturnsEmpty204Then404() throws Exception {
        mockMvc.perform(delete("/api/tasks/{id}", openId))
                .andExpect(status().isNoContent()).andExpect(content().string(""));
        assertThat(taskRepository.existsById(openId)).isFalse();
        mockMvc.perform(delete("/api/tasks/{id}", openId))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("TASK_NOT_FOUND"));
    }

    @Test
    void writesToMissingIdReturn404AndDoNotUpsert() throws Exception {
        mockMvc.perform(put("/api/tasks/9223372036854775807").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Olmayan görev\",\"status\":\"OPEN\"}"))
                .andExpect(status().isNotFound());
        mockMvc.perform(patch("/api/tasks/9223372036854775807").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"DONE\"}"))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/api/tasks/9223372036854775807")).andExpect(status().isNotFound());
        assertThat(taskRepository.count()).isEqualTo(2);
    }

    @Test
    void blankTitleReturnsFieldErrorAndDoesNotInsert() throws Exception {
        mockMvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"   \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors[0].field").value("title"))
                .andExpect(jsonPath("$.trace").doesNotExist());
        assertThat(taskRepository.count()).isEqualTo(2);
    }

    @Test
    void validatesBodiesOnMethodsWithPathConstraintsToo() throws Exception {
        mockMvc.perform(put("/api/tasks/{id}", openId).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"\",\"status\":\"OPEN\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors[0].field").value("title"));
        mockMvc.perform(patch("/api/tasks/{id}", openId).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors[0].field").value("status"));
    }

    @Test
    void enforcesTextLengthsAndRequiredFields() throws Exception {
        for (String body : new String[]{"{}", "{\"title\":null}",
                "{\"title\":\"" + "x".repeat(101) + "\"}",
                "{\"title\":\"Başlık\",\"description\":\"" + "x".repeat(501) + "\"}"}) {
            mockMvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        }
        mockMvc.perform(put("/api/tasks/{id}", openId).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Başlık\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.fieldErrors[0].field").value("status"));
    }

    @Test
    void rejectsMalformedJsonUnknownFieldsAndNonEnumStatus() throws Exception {
        for (String body : new String[]{"{", "{\"title\":\"Başlık\",\"id\":123}",
                "{\"title\":\"Başlık\",\"status\":\"DONE\"}"}) {
            mockMvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
        }
        for (String body : new String[]{"{\"status\":\"UNKNOWN\"}", "{\"status\":1}",
                "{\"status\":\"DONE\",\"title\":\"Değişmemeli\"}"}) {
            mockMvc.perform(patch("/api/tasks/{id}", openId).contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
        }
        assertThat(taskRepository.count()).isEqualTo(2);
    }

    @Test
    void preservesFrameworkStatusAndAllowHeader() throws Exception {
        mockMvc.perform(post("/api/tasks/{id}", openId).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(header().string("Allow", containsString("GET")))
                .andExpect(jsonPath("$.code").value("METHOD_NOT_ALLOWED"));
        mockMvc.perform(post("/api/tasks").contentType(MediaType.TEXT_PLAIN).content("{}"))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.code").value("UNSUPPORTED_MEDIA_TYPE"));
    }
}

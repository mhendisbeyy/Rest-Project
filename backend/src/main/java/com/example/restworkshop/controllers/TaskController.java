package com.example.restworkshop.controllers;

import com.example.restworkshop.dto.TaskPageResponse;
import com.example.restworkshop.dto.TaskResponse;
import com.example.restworkshop.dto.CreateTaskRequest;
import com.example.restworkshop.dto.UpdateTaskRequest;
import com.example.restworkshop.dto.UpdateTaskStatusRequest;
import com.example.restworkshop.enums.TaskStatus;
import com.example.restworkshop.services.TaskService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import java.net.URI;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.headers.Header;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/tasks")
@Tag(name = "Görevler", description = "Görev yönetimi ve HTTP metodları")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public TaskPageResponse findAll(
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "5") @Min(1) @Max(50) int size
    ) {
        return taskService.findAll(status, page, size);
    }

    @GetMapping("/{id}")
    public TaskResponse findById(@PathVariable @Positive Long id) {
        return taskService.findById(id);
    }

    @PostMapping
    @Operation(summary = "Yeni görev oluştur")
    @ApiResponse(responseCode = "201", description = "Görev oluşturuldu",
            headers = @Header(name = "Location", description = "Oluşturulan görevin yolu", schema = @Schema(type = "string")),
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = TaskResponse.class)))
    public ResponseEntity<TaskResponse> create(@Valid @RequestBody CreateTaskRequest request) {
        TaskResponse task = taskService.create(request);
        return ResponseEntity.created(URI.create("/api/tasks/" + task.getId())).body(task);
    }

    @PutMapping("/{id}")
    public TaskResponse update(@PathVariable @Positive Long id,
                               @Valid @RequestBody UpdateTaskRequest request) {
        return taskService.update(id, request);
    }

    @PatchMapping("/{id}")
    public TaskResponse updateStatus(@PathVariable @Positive Long id,
                                     @Valid @RequestBody UpdateTaskStatusRequest request) {
        return taskService.updateStatus(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Görevi sil")
    @ApiResponse(responseCode = "204", description = "Görev silindi; yanıt gövdesi yok", content = @Content)
    public ResponseEntity<Void> delete(@PathVariable @Positive Long id) {
        taskService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

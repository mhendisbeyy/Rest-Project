package com.example.restworkshop.services;

import com.example.restworkshop.dto.TaskPageResponse;
import com.example.restworkshop.dto.TaskResponse;
import com.example.restworkshop.dto.CreateTaskRequest;
import com.example.restworkshop.dto.UpdateTaskRequest;
import com.example.restworkshop.dto.UpdateTaskStatusRequest;
import com.example.restworkshop.models.Task;
import com.example.restworkshop.enums.TaskStatus;
import com.example.restworkshop.dto.mapper.TaskMapper;
import com.example.restworkshop.exception.TaskNotFoundException;
import com.example.restworkshop.exception.TaskStateConflictException;
import com.example.restworkshop.repositories.TaskRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    public TaskService(TaskRepository taskRepository, TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
    }

    public TaskPageResponse findAll(TaskStatus status, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        Page<Task> tasks = status == null
                ? taskRepository.findAll(pageable)
                : taskRepository.findByStatus(status, pageable);

        return new TaskPageResponse(
                taskMapper.toDto(tasks.getContent()),
                tasks.getNumber(),
                tasks.getSize(),
                tasks.getTotalElements(),
                tasks.getTotalPages()
        );
    }

    public TaskResponse findById(Long id) {
        return taskMapper.toDto(requireTask(id));
    }

    @Transactional
    public TaskResponse create(CreateTaskRequest request) {
        Task task = new Task(request.getTitle(), request.getDescription(), TaskStatus.OPEN);
        return taskMapper.toDto(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse update(Long id, UpdateTaskRequest request) {
        Task task = requireTask(id);
        validateStatusTransition(task, request.getStatus());
        task.update(request.getTitle(), request.getDescription(), request.getStatus());
        // The managed entity is flushed at transaction commit (JPA dirty checking).
        return taskMapper.toDto(task);
    }

    @Transactional
    public TaskResponse updateStatus(Long id, UpdateTaskStatusRequest request) {
        Task task = requireTask(id);
        validateStatusTransition(task, request.getStatus());
        task.changeStatus(request.getStatus());
        return taskMapper.toDto(task);
    }

    @Transactional
    public void delete(Long id) {
        taskRepository.delete(requireTask(id));
    }

    private Task requireTask(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
    }

    private void validateStatusTransition(Task task, TaskStatus newStatus) {
        if (task.getStatus() == TaskStatus.DONE && newStatus != TaskStatus.DONE) {
            throw new TaskStateConflictException();
        }
    }

}

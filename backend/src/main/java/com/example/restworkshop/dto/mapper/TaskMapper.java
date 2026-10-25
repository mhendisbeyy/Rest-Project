package com.example.restworkshop.dto.mapper;

import com.example.restworkshop.dto.TaskResponse;
import com.example.restworkshop.models.Task;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface TaskMapper {
    TaskResponse toDto(Task task);
    List<TaskResponse> toDto(List<Task> tasks);
}

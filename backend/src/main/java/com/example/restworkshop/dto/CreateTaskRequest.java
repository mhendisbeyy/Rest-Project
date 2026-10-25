package com.example.restworkshop.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateTaskRequest {
    @NotBlank(message = "Başlık boş olamaz.")
    @Size(max = 100, message = "Başlık en fazla 100 karakter olabilir.")
    private String title;

    @Size(max = 500, message = "Açıklama en fazla 500 karakter olabilir.")
    private String description;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}

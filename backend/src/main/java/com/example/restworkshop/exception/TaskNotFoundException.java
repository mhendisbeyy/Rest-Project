package com.example.restworkshop.exception;

public class TaskNotFoundException extends RuntimeException {

    public TaskNotFoundException(Long id) {
        super("Görev bulunamadı: " + id);
    }
}

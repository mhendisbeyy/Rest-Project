package com.example.restworkshop.exception;

public class TaskStateConflictException extends RuntimeException {

    public TaskStateConflictException() {
        super("Tamamlanmış görev yeniden açılamaz.");
    }
}

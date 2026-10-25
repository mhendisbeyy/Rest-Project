package com.example.restworkshop.controllers.advice;

import com.example.restworkshop.exception.TaskNotFoundException;
import com.example.restworkshop.exception.TaskStateConflictException;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.method.ParameterErrors;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    public record FieldErrorResponse(String field, String message) {
    }

    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<Object> handleTaskNotFound(TaskNotFoundException exception, WebRequest request) {
        return domainProblem(exception, HttpStatus.NOT_FOUND, "TASK_NOT_FOUND", request);
    }

    @ExceptionHandler(TaskStateConflictException.class)
    public ResponseEntity<Object> handleTaskStateConflict(TaskStateConflictException exception, WebRequest request) {
        return domainProblem(exception, HttpStatus.CONFLICT, "TASK_STATE_CONFLICT", request);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException exception, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        List<FieldErrorResponse> errors = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> new FieldErrorResponse(error.getField(), error.getDefaultMessage()))
                .toList();
        return validationProblem(exception, headers, status, request, errors);
    }

    @Override
    protected ResponseEntity<Object> handleHandlerMethodValidationException(
            HandlerMethodValidationException exception, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        List<FieldErrorResponse> errors = new ArrayList<>();
        for (var result : exception.getParameterValidationResults()) {
            if (result instanceof ParameterErrors parameterErrors) {
                parameterErrors.getFieldErrors().forEach(error ->
                        errors.add(new FieldErrorResponse(error.getField(), error.getDefaultMessage())));
            }
        }
        // Body field validation can arrive here when the method also validates a path ID.
        if (!errors.isEmpty() && !status.is5xxServerError()) {
            return validationProblem(exception, headers, status, request, errors);
        }
        return handleExceptionInternal(exception, null, headers, status, request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleUnexpectedException(Exception exception, WebRequest request) {
        logger.error("Beklenmeyen sunucu hatası", exception);
        return domainProblem(new RuntimeException("Beklenmeyen bir sunucu hatası oluştu."),
                HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", request);
    }

    private ResponseEntity<Object> validationProblem(Exception exception, HttpHeaders headers,
            HttpStatusCode status, WebRequest request, List<FieldErrorResponse> errors) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, "İstek alanlarını kontrol edin.");
        problem.setProperty("code", "VALIDATION_ERROR");
        problem.setProperty("fieldErrors", errors.stream().distinct().toList());
        return handleExceptionInternal(exception, problem, headers, status, request);
    }

    private ResponseEntity<Object> domainProblem(RuntimeException exception, HttpStatus status,
            String code, WebRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, exception.getMessage());
        problem.setProperty("code", code);
        return handleExceptionInternal(exception, problem, HttpHeaders.EMPTY, status, request);
    }

    @Override
    protected ResponseEntity<Object> createResponseEntity(Object body, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        ProblemDetail problem = body instanceof ProblemDetail existing
                ? existing : ProblemDetail.forStatus(status);
        problem.setType(URI.create("about:blank"));
        problem.setInstance(URI.create(((ServletWebRequest) request).getRequest().getRequestURI()));
        boolean hasCode = problem.getProperties() != null && problem.getProperties().containsKey("code");
        if (!hasCode) {
            problem.setProperty("code", switch (status.value()) {
                case 400 -> "INVALID_REQUEST";
                case 405 -> "METHOD_NOT_ALLOWED";
                case 406 -> "NOT_ACCEPTABLE";
                case 415 -> "UNSUPPORTED_MEDIA_TYPE";
                default -> status.is5xxServerError() ? "INTERNAL_ERROR" : "HTTP_ERROR";
            });
            if (status.value() == 400) {
                problem.setDetail("İstek biçimini, alan türlerini ve URL parametrelerini kontrol edin.");
            }
        }
        if (status.is5xxServerError()) {
            problem.setDetail("Beklenmeyen bir sunucu hatası oluştu.");
        }
        // Keep framework-provided status and headers (e.g. Allow for 405).
        return super.createResponseEntity(problem, headers, status, request);
    }
}

package com.example.customer_feedback.controller;

import com.example.customer_feedback.dto.FeedbackRequest;
import com.example.customer_feedback.entity.Feedback;
import com.example.customer_feedback.service.FeedbackService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(
            FeedbackService feedbackService
    ) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    public ResponseEntity<Feedback> createFeedback(
            @Valid @RequestBody FeedbackRequest request,
            Authentication authentication
    ) {

        Feedback feedback =
                feedbackService.createFeedback(
                        request,
                        authentication.getName()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(feedback);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Feedback>> getMyFeedback(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                feedbackService.getMyFeedback(
                        authentication.getName()
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Feedback> updateFeedback(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackRequest request,
            Authentication authentication
    ) {

        Feedback feedback =
                feedbackService.updateMyFeedback(
                        id,
                        request,
                        authentication.getName()
                );

        return ResponseEntity.ok(feedback);
    }
}
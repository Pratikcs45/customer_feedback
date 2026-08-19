package com.example.customer_feedback.controller;

import com.example.customer_feedback.dto.FeedbackRequest;
import com.example.customer_feedback.entity.Feedback;
import com.example.customer_feedback.entity.User;
import com.example.customer_feedback.repository.FeedbackRepository;
import com.example.customer_feedback.repository.UserRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/feedback")
public class AdminFeedbackController {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    public AdminFeedbackController(
            FeedbackRepository feedbackRepository,
            UserRepository userRepository
    ) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
    }

    // READ ALL
    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedback() {

        return ResponseEntity.ok(
                feedbackRepository.findAll()
        );
    }

    // READ ONE
    @GetMapping("/{id}")
    public ResponseEntity<Feedback> getFeedback(
            @PathVariable Long id
    ) {

        Feedback feedback = feedbackRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Feedback not found")
                );

        return ResponseEntity.ok(feedback);
    }

    // CREATE
    @PostMapping
    public ResponseEntity<Feedback> createFeedback(
            @RequestParam Long userId,
            @Valid @RequestBody FeedbackRequest request
    ) {

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Feedback feedback = new Feedback();

        feedback.setFeedback(request.getFeedback());
        feedback.setUser(user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(feedbackRepository.save(feedback));
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Feedback> updateFeedback(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackRequest request
    ) {

        Feedback feedback = feedbackRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Feedback not found")
                );

        feedback.setFeedback(request.getFeedback());
        feedback.setUpdatedAt(LocalDateTime.now());

        return ResponseEntity.ok(
                feedbackRepository.save(feedback)
        );
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFeedback(
            @PathVariable Long id
    ) {

        Feedback feedback = feedbackRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Feedback not found")
                );

        feedbackRepository.delete(feedback);

        return ResponseEntity.ok(
                "Feedback deleted successfully"
        );
    }
}
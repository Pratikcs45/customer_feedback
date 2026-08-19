package com.example.customer_feedback.dto;

import jakarta.validation.constraints.NotBlank;

public class FeedbackRequest {

    @NotBlank(message = "Feedback is required")
    private String feedback;

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}
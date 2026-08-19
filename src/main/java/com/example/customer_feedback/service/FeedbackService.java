package com.example.customer_feedback.service;

import com.example.customer_feedback.dto.FeedbackRequest;
import com.example.customer_feedback.entity.Feedback;
import com.example.customer_feedback.entity.User;
import com.example.customer_feedback.repository.FeedbackRepository;
import com.example.customer_feedback.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.time.LocalDateTime;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    public FeedbackService(
            FeedbackRepository feedbackRepository,
            UserRepository userRepository
    ) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
    }

    public Feedback createFeedback(
            FeedbackRequest request,
            String username
    ) {

        User user = getUser(username);

        Feedback feedback = new Feedback();

        feedback.setFeedback(request.getFeedback());
        feedback.setUser(user);

        return feedbackRepository.save(feedback);
    }

    public List<Feedback> getMyFeedback(String username) {

        User user = getUser(username);

        return feedbackRepository.findByUserId(user.getId());
    }

    public Feedback updateMyFeedback(
            Long id,
            FeedbackRequest request,
            String username
    ) {

        User user = getUser(username);

        Feedback feedback = feedbackRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Feedback not found")
                );

        if (!feedback.getUser().getId().equals(user.getId())) {

            throw new RuntimeException(
                    "You cannot edit this feedback"
            );
        }

        feedback.setFeedback(request.getFeedback());
        feedback.setUpdatedAt(LocalDateTime.now());

        return feedbackRepository.save(feedback);
    }

    private User getUser(String username) {

        return userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );
    }
}
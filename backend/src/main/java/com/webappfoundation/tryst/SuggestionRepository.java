package com.webappfoundation.tryst;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SuggestionRepository extends JpaRepository<Suggestion, Long> {
    List<Suggestion> findByUserIdOrderByCreatedAtDesc(Integer userId);

    List<Suggestion> findByShowPublicTrueAndStatusInOrderByUpdatedAtDesc(List<String> statuses);

    List<Suggestion> findAllByOrderByCreatedAtDesc();
}

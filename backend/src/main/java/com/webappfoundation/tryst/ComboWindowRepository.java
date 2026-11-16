package com.webappfoundation.tryst;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ComboWindowRepository extends JpaRepository<ComboWindow, Long> {
    Optional<ComboWindow> findByProductId(Long productId);
}

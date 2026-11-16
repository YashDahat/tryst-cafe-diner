package com.webappfoundation.tryst;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TableBookingRepository extends JpaRepository<TableBooking, Long> {
    Optional<TableBooking> findByShareCode(String shareCode);

    List<TableBooking> findByUserIdOrderByCreatedAtDesc(Integer userId);

    boolean existsByShareCode(String shareCode);
}

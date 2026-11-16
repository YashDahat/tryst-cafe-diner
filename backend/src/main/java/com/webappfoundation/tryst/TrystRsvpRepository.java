package com.webappfoundation.tryst;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrystRsvpRepository extends JpaRepository<TrystRsvp, Long> {
    List<TrystRsvp> findByBookingIdOrderByCreatedAt(Long bookingId);

    long countByBookingId(Long bookingId);
}

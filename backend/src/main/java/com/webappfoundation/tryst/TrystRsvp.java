package com.webappfoundation.tryst;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/** A friend's no-login "I'm coming" on a Tryst card. First name only; no other personal data. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tryst_rsvp")
public class TrystRsvp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long bookingId;

    @Column(nullable = false, length = 30)
    private String firstName;

    @Column(nullable = false)
    private Instant createdAt;
}

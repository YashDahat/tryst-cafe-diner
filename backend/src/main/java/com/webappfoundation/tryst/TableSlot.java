package com.webappfoundation.tryst;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

/** One 30-minute seating window on one day. {@code reserved} counts covers (guests) held or seated. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tryst_table_slot", uniqueConstraints = @UniqueConstraint(columnNames = {"slot_date", "starts_at"}))
public class TableSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "slot_date", nullable = false)
    private LocalDate slotDate;

    @Column(name = "starts_at", nullable = false)
    private Instant startsAt;

    @Column(nullable = false)
    private int capacity;

    @Column(nullable = false)
    @Builder.Default
    private int reserved = 0;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}

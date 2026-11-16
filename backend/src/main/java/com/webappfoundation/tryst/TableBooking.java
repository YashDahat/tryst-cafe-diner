package com.webappfoundation.tryst;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/** Detail attached to a table-booking order (the order itself lives on the foundation order spine). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tryst_table_booking")
public class TableBooking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long orderId;

    @Column(nullable = false)
    private Integer userId;

    @Column(nullable = false)
    private Long slotId;

    @Column(nullable = false)
    private int partySize;

    /** INDOOR, OUTDOOR or ANY. */
    @Column(nullable = false)
    private String seating;

    private String occasion;

    @Column(length = 200)
    private String note;

    @Column(nullable = false, unique = true, length = 12)
    private String shareCode;

    @Column(nullable = false)
    private Instant createdAt;
}

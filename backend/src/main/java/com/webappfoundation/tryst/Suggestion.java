package com.webappfoundation.tryst;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tryst_suggestion")
public class Suggestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Null for a guest idea (guests may submit; only signed-in ideas earn coins). */
    private Integer userId;

    @Column(nullable = false, length = 80)
    private String title;

    @Column(nullable = false, length = 600)
    private String body;

    /** Menu, Music, Space or Other. */
    @Column(nullable = false)
    private String category;

    /** NEW, PLANNED or DONE. */
    @Column(nullable = false)
    @Builder.Default
    private String status = "NEW";

    @Column(length = 300)
    private String publicNote;

    @Column(nullable = false)
    @Builder.Default
    private boolean showPublic = false;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;
}

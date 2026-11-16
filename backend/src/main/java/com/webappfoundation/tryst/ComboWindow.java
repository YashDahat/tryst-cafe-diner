package com.webappfoundation.tryst;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

/** When a combo product is on offer: days (e.g. MON-FRI or MON,TUE) and a daily time window (IST). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tryst_combo_window")
public class ComboWindow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long productId;

    @Column(nullable = false)
    private String label;

    /** MON-FRI style range, or a comma list such as SAT,SUN. */
    @Column(nullable = false)
    private String days;

    @Column(nullable = false)
    private LocalTime availableFrom;

    @Column(nullable = false)
    private LocalTime availableTo;

    @Column(columnDefinition = "text")
    private String audience;
}

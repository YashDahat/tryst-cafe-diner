package com.webappfoundation.tryst;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Materialises the day's seating windows lazily (so the calendar rolls forward without a job) from the
 * published opening hours, and answers live availability. Capacity is a placeholder the owner confirms.
 */
@Service
public class TableSlotService {
    public static final ZoneId IST = ZoneId.of("Asia/Kolkata");
    public static final int MAX_DAYS_AHEAD = 14;
    public static final int MAX_PARTY = 10;
    private static final int SLOT_MINUTES = 30;

    private final TableSlotRepository slots;
    private final int coversPerSlot;

    public TableSlotService(TableSlotRepository slots, @Value("${tryst.covers-per-slot:24}") int coversPerSlot) {
        this.slots = slots;
        this.coversPerSlot = coversPerSlot;
    }

    /** Published hours: Mon-Thu 10:30-22:30, Fri-Sun 10:30-23:00; last seating 60 minutes before close. */
    static LocalTime lastSeating(DayOfWeek d) {
        boolean late = d == DayOfWeek.FRIDAY || d == DayOfWeek.SATURDAY || d == DayOfWeek.SUNDAY;
        return late ? LocalTime.of(22, 0) : LocalTime.of(21, 30);
    }

    @Transactional
    public List<TableSlot> ensureSlots(LocalDate date) {
        LocalDate today = LocalDate.now(IST);
        if (date.isBefore(today) || date.isAfter(today.plusDays(MAX_DAYS_AHEAD))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pick a date in the next " + MAX_DAYS_AHEAD + " days");
        }
        List<TableSlot> existing = slots.findBySlotDateOrderByStartsAt(date);
        if (!existing.isEmpty()) {
            return existing;
        }
        List<TableSlot> created = new ArrayList<>();
        LocalTime t = LocalTime.of(10, 30);
        LocalTime last = lastSeating(date.getDayOfWeek());
        while (!t.isAfter(last)) {
            created.add(TableSlot.builder().slotDate(date)
                    .startsAt(date.atTime(t).atZone(IST).toInstant()).capacity(coversPerSlot).build());
            t = t.plusMinutes(SLOT_MINUTES);
        }
        try {
            return slots.saveAll(created);
        } catch (RuntimeException race) {
            return slots.findBySlotDateOrderByStartsAt(date);
        }
    }

    @Transactional
    public List<SlotView> availability(LocalDate date, int party) {
        Instant now = Instant.now().plus(Duration.ofMinutes(30));
        return ensureSlots(date).stream()
                .filter(TableSlot::isActive)
                .filter(s -> s.getStartsAt().isAfter(now))
                .map(s -> new SlotView(s.getId(), s.getStartsAt(), Math.max(0, s.getCapacity() - s.getReserved()),
                        s.getCapacity() - s.getReserved() >= Math.max(1, party)))
                .toList();
    }

    public record SlotView(Long slotId, Instant startsAt, int left, boolean fits) {
    }
}

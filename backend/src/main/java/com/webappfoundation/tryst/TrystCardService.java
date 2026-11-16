package com.webappfoundation.tryst;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/** Public, no-login meet-up card: exposes only the host's first name, time, party size, occasion and RSVP first names. */
@Service
public class TrystCardService {
    private static final int MAX_RSVPS = 15;
    private static final int PER_IP_PER_HOUR = 20;

    private final TableBookingRepository bookings;
    private final TableSlotRepository slots;
    private final TrystRsvpRepository rsvps;
    private final TableBookingService bookingService;
    private final ConcurrentHashMap<String, long[]> hits = new ConcurrentHashMap<>();

    public TrystCardService(TableBookingRepository bookings, TableSlotRepository slots, TrystRsvpRepository rsvps,
                            TableBookingService bookingService) {
        this.bookings = bookings;
        this.slots = slots;
        this.rsvps = rsvps;
        this.bookingService = bookingService;
    }

    public record CardView(String hostFirstName, Instant startsAt, int partySize, String occasion, boolean past,
                           List<String> coming) {
    }

    @Transactional(readOnly = true)
    public CardView card(String code) {
        TableBooking b = find(code);
        Instant startsAt = slots.findById(b.getSlotId()).map(TableSlot::getStartsAt).orElse(b.getCreatedAt());
        List<String> coming = rsvps.findByBookingIdOrderByCreatedAt(b.getId()).stream().map(TrystRsvp::getFirstName).toList();
        return new CardView(bookingService.hostFirstName(b.getUserId()), startsAt, b.getPartySize(), b.getOccasion(),
                startsAt.isBefore(Instant.now()), coming);
    }

    @Transactional
    public CardView rsvp(String code, String firstName, String ip) {
        if (tooMany(ip)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many replies from this device. Try again later.");
        }
        String name = firstName == null ? "" : firstName.trim().replaceAll("[^\\p{L}\\p{M} .'-]", "");
        if (name.isEmpty() || name.length() > 30) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter your first name (up to 30 letters)");
        }
        TableBooking b = find(code);
        if (rsvps.countByBookingId(b.getId()) >= MAX_RSVPS) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The guest list is full");
        }
        rsvps.save(TrystRsvp.builder().bookingId(b.getId()).firstName(name).createdAt(Instant.now()).build());
        return card(code);
    }

    private TableBooking find(String code) {
        if (code == null || code.length() > 12) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "We couldn't find that card");
        }
        return bookings.findByShareCode(code.toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "We couldn't find that card"));
    }

    private boolean tooMany(String ip) {
        long hour = System.currentTimeMillis() / 3_600_000L;
        long[] slot = hits.compute(ip == null ? "?" : ip, (k, v) -> v == null || v[0] != hour ? new long[]{hour, 1} : new long[]{hour, v[1] + 1});
        if (hits.size() > 5000) {
            hits.clear();
        }
        return slot[1] > PER_IP_PER_HOUR;
    }
}

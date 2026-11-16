package com.webappfoundation.tryst;

import com.webappfoundation.security.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class TableController {
    private final TableSlotService slotService;
    private final TableBookingService bookingService;
    private final TrystCardService cardService;

    public TableController(TableSlotService slotService, TableBookingService bookingService, TrystCardService cardService) {
        this.slotService = slotService;
        this.bookingService = bookingService;
        this.cardService = cardService;
    }

    /** Public: live seats left per slot for a date and party size. */
    @GetMapping("/tables/availability")
    public List<TableSlotService.SlotView> availability(@RequestParam String date, @RequestParam(defaultValue = "2") int party) {
        LocalDate d;
        try {
            d = LocalDate.parse(date);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use a date like 2026-11-20");
        }
        return slotService.availability(d, party);
    }

    @PostMapping("/tables/book")
    @ResponseStatus(HttpStatus.CREATED)
    public TableBookingService.BookingView book(@CurrentUser Integer userId, @RequestBody TableBookingService.BookRequest req) {
        return bookingService.book(requireUser(userId), req);
    }

    @GetMapping("/tables/bookings/mine")
    public List<TableBookingService.BookingView> mine(@CurrentUser Integer userId) {
        return bookingService.mine(requireUser(userId));
    }

    @GetMapping("/t/{code}")
    public TrystCardService.CardView card(@PathVariable String code) {
        return cardService.card(code);
    }

    @PostMapping("/t/{code}/rsvp")
    public TrystCardService.CardView rsvp(@PathVariable String code, @RequestBody Map<String, String> body, HttpServletRequest http) {
        return cardService.rsvp(code, body == null ? null : body.get("firstName"), http.getRemoteAddr());
    }

    private Integer requireUser(Integer userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in to save a table");
        }
        return userId;
    }
}

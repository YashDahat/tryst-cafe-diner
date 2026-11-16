package com.webappfoundation.tryst;

import com.webappfoundation.dto.CartLineInput;
import com.webappfoundation.dto.OrderDto;
import com.webappfoundation.dto.PlaceOrderRequest;
import com.webappfoundation.model.FulfillmentType;
import com.webappfoundation.model.PaymentMode;
import com.webappfoundation.model.User;
import com.webappfoundation.repository.BranchRepository;
import com.webappfoundation.repository.UserRepository;
import com.webappfoundation.service.AuditActions;
import com.webappfoundation.service.AuditService;
import com.webappfoundation.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;
import java.util.Set;

@Service
public class TableBookingService {
    private static final String ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
    private static final Set<String> SEATING = Set.of("INDOOR", "OUTDOOR", "ANY");
    private static final Set<String> OCCASIONS = Set.of("Catch-up", "Birthday", "Date", "Team lunch", "Other");
    private final SecureRandom random = new SecureRandom();

    private final OrderService orderService;
    private final TableSlotRepository slots;
    private final TableBookingRepository bookings;
    private final BranchRepository branches;
    private final UserRepository users;
    private final AuditService audit;

    public TableBookingService(OrderService orderService, TableSlotRepository slots, TableBookingRepository bookings,
                               BranchRepository branches, UserRepository users, AuditService audit) {
        this.orderService = orderService;
        this.slots = slots;
        this.bookings = bookings;
        this.branches = branches;
        this.users = users;
        this.audit = audit;
    }

    public record BookRequest(Long slotId, Integer partySize, String seating, String occasion, String note) {
    }

    public record BookingView(Long bookingId, Long orderId, String shareCode, Instant startsAt, int partySize,
                              String seating, String occasion) {
    }

    @Transactional
    public BookingView book(Integer userId, BookRequest req) {
        if (req == null || req.slotId() == null || req.partySize() == null
                || req.partySize() < 1 || req.partySize() > TableSlotService.MAX_PARTY) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Choose a time and a party of 1 to " + TableSlotService.MAX_PARTY + ". For bigger groups please call us.");
        }
        TableSlot slot = slots.findById(req.slotId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "That time is no longer offered"));
        if (!slot.isActive() || !slot.getStartsAt().isAfter(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "That time has passed. Pick another.");
        }
        String seating = req.seating() == null || !SEATING.contains(req.seating()) ? "ANY" : req.seating();
        String occasion = req.occasion() != null && OCCASIONS.contains(req.occasion()) ? req.occasion() : null;
        String note = req.note() == null ? null : req.note().trim();
        if (note != null && note.length() > 200) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Keep the note under 200 characters");
        }

        Long branchId = branches.findBySlug(TrystSeeder.BRANCH_SLUG).map(b -> b.getId()).orElse(null);
        // The order spine reserves the covers through TableSlotInventoryProvider (qty = party size).
        OrderDto order = orderService.placeOrder(userId, PlaceOrderRequest.builder()
                .items(List.of(CartLineInput.builder().itemType(TableSlotInventoryProvider.TYPE)
                        .itemId(slot.getId()).quantity(req.partySize()).build()))
                .branchId(branchId).fulfillmentType(FulfillmentType.SELF_PICKUP)
                .paymentMode(PaymentMode.PAY_AT_COUNTER).build());

        TableBooking saved = bookings.save(TableBooking.builder()
                .orderId(order.getId()).userId(userId).slotId(slot.getId()).partySize(req.partySize())
                .seating(seating).occasion(occasion).note(note == null || note.isBlank() ? null : note)
                .shareCode(newCode()).createdAt(Instant.now()).build());
        audit.record("TABLE_BOOKED", AuditActions.SUCCESS, "TABLE_BOOKING", String.valueOf(saved.getId()),
                "party=" + saved.getPartySize() + " slot=" + slot.getId());
        return view(saved, slot.getStartsAt());
    }

    @Transactional(readOnly = true)
    public List<BookingView> mine(Integer userId) {
        return bookings.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(b -> view(b, slots.findById(b.getSlotId()).map(TableSlot::getStartsAt).orElse(b.getCreatedAt())))
                .toList();
    }

    public String hostFirstName(Integer userId) {
        return users.findById(userId).map(User::getFirstName).filter(s -> s != null && !s.isBlank()).orElse("A friend");
    }

    private BookingView view(TableBooking b, Instant startsAt) {
        return new BookingView(b.getId(), b.getOrderId(), b.getShareCode(), startsAt, b.getPartySize(), b.getSeating(), b.getOccasion());
    }

    private String newCode() {
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder sb = new StringBuilder(8);
            for (int i = 0; i < 8; i++) {
                sb.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
            }
            if (!bookings.existsByShareCode(sb.toString())) {
                return sb.toString();
            }
        }
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Please try again");
    }
}

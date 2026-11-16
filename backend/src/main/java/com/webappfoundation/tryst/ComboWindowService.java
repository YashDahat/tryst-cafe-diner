package com.webappfoundation.tryst;

import com.webappfoundation.dto.BulkUploadResult;
import com.webappfoundation.model.Product;
import com.webappfoundation.repository.ProductRepository;
import com.webappfoundation.service.AuditActions;
import com.webappfoundation.service.AuditService;
import com.webappfoundation.service.SpreadsheetParser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.*;

@Service
public class ComboWindowService {
    private static final List<String> DAYS = List.of("MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN");

    private final ComboWindowRepository windows;
    private final ProductRepository products;
    private final SpreadsheetParser parser;
    private final AuditService audit;

    public ComboWindowService(ComboWindowRepository windows, ProductRepository products, SpreadsheetParser parser, AuditService audit) {
        this.windows = windows;
        this.products = products;
        this.parser = parser;
        this.audit = audit;
    }

    public record ComboView(Long id, Long productId, String slug, String name, BigDecimal price, String label,
                            String days, String availableFrom, String availableTo, String audience, boolean availableNow) {
    }

    public record UpsertRequest(Long productId, String label, String days, String availableFrom, String availableTo, String audience) {
    }

    static boolean dayMatches(String spec, DayOfWeek day) {
        String d = DAYS.get(day.getValue() - 1);
        String s = spec.trim().toUpperCase(Locale.ROOT);
        if (s.contains("-")) {
            String[] p = s.split("-");
            int a = DAYS.indexOf(p[0].trim()), b = DAYS.indexOf(p[1].trim()), x = DAYS.indexOf(d);
            return a >= 0 && b >= 0 && (a <= b ? x >= a && x <= b : x >= a || x <= b);
        }
        return Arrays.stream(s.split(",")).map(String::trim).anyMatch(d::equals);
    }

    public boolean isAvailableNow(ComboWindow w) {
        ZonedDateTime now = ZonedDateTime.now(TableSlotService.IST);
        LocalTime t = now.toLocalTime();
        return dayMatches(w.getDays(), now.getDayOfWeek()) && !t.isBefore(w.getAvailableFrom()) && t.isBefore(w.getAvailableTo());
    }

    @Transactional(readOnly = true)
    public List<ComboView> all() {
        return windows.findAll().stream().map(this::view).filter(Objects::nonNull).toList();
    }

    private ComboView view(ComboWindow w) {
        Product p = products.findById(w.getProductId()).filter(Product::isActive).orElse(null);
        if (p == null) return null;
        return new ComboView(w.getId(), p.getId(), p.getSlug(), p.getName(), p.getPrice(), w.getLabel(), w.getDays(),
                w.getAvailableFrom().toString(), w.getAvailableTo().toString(), w.getAudience(), isAvailableNow(w));
    }

    @Transactional
    public ComboView update(Long id, UpsertRequest req) {
        ComboWindow w = windows.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Combo window not found"));
        apply(w, req);
        ComboWindow saved = windows.save(w);
        audit.record("COMBO_WINDOW_UPDATED", AuditActions.SUCCESS, "COMBO_WINDOW", String.valueOf(id), "days=" + saved.getDays());
        return view(saved);
    }

    private void apply(ComboWindow w, UpsertRequest r) {
        if (r.label() == null || r.label().isBlank() || r.days() == null || r.days().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Label and days are required");
        }
        LocalTime from, to;
        try {
            from = LocalTime.parse(r.availableFrom());
            to = LocalTime.parse(r.availableTo());
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use times like 15:00");
        }
        if (!to.isAfter(from)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }
        w.setLabel(r.label().trim());
        w.setDays(r.days().trim().toUpperCase(Locale.ROOT));
        w.setAvailableFrom(from);
        w.setAvailableTo(to);
        w.setAudience(r.audience());
    }

    /** Columns: productSlug, label, days, availableFrom, availableTo, audience. Upserts by product. */
    @Transactional
    public BulkUploadResult bulkImport(MultipartFile file) {
        BulkUploadResult result = BulkUploadResult.builder().build();
        int row = 1;
        for (Map<String, String> r : parser.parse(file)) {
            row++;
            try {
                Product p = products.findBySlug(r.getOrDefault("productslug", "").trim()).orElse(null);
                if (p == null) {
                    result.addError(row, "Unknown productSlug");
                    continue;
                }
                boolean exists = windows.findByProductId(p.getId()).isPresent();
                ComboWindow w = windows.findByProductId(p.getId()).orElse(ComboWindow.builder().productId(p.getId()).build());
                apply(w, new UpsertRequest(p.getId(), r.get("label"), r.get("days"), r.get("availablefrom"), r.get("availableto"), r.get("audience")));
                windows.save(w);
                if (exists) result.setSkipped(result.getSkipped() + 1); else result.setCreated(result.getCreated() + 1);
            } catch (RuntimeException e) {
                result.addError(row, e.getMessage());
            }
        }
        audit.record("COMBO_WINDOW_BULK_UPLOAD", AuditActions.SUCCESS, "COMBO_WINDOW", "bulk", "created=" + result.getCreated());
        return result;
    }
}

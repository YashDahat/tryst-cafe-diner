package com.webappfoundation.tryst;

import com.webappfoundation.dto.BulkUploadResult;
import com.webappfoundation.model.LoyaltyEventType;
import com.webappfoundation.service.AuditActions;
import com.webappfoundation.service.AuditService;
import com.webappfoundation.service.LoyaltyEventService;
import com.webappfoundation.service.SpreadsheetParser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class SuggestionService {
    static final Set<String> CATEGORIES = Set.of("Menu", "Music", "Space", "Other");
    static final Set<String> STATUSES = Set.of("NEW", "PLANNED", "DONE");

    private final SuggestionRepository repo;
    private final LoyaltyEventService loyalty;
    private final AuditService audit;
    private final SpreadsheetParser parser;

    public SuggestionService(SuggestionRepository repo, LoyaltyEventService loyalty, AuditService audit, SpreadsheetParser parser) {
        this.repo = repo;
        this.loyalty = loyalty;
        this.audit = audit;
        this.parser = parser;
    }

    public record CreateRequest(String title, String body, String category) {
    }

    public record AdminUpdate(String status, String publicNote, Boolean showPublic) {
    }

    public record PublicView(Long id, String title, String category, String status, String publicNote) {
    }

    private static void check(String title, String body, String category) {
        if (title == null || title.isBlank() || title.length() > 80 || body == null || body.isBlank() || body.length() > 600
                || category == null || !CATEGORIES.contains(category)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Add a title (up to 80 characters), details (up to 600) and a category");
        }
    }

    @Transactional
    public Suggestion create(Integer userId, CreateRequest req) {
        check(req.title(), req.body(), req.category());
        Instant now = Instant.now();
        Suggestion saved = repo.save(Suggestion.builder().userId(userId).title(req.title().trim()).body(req.body().trim())
                .category(req.category()).createdAt(now).updatedAt(now).build());
        // Coins for submitting an idea (never for what it says). Guests are a no-op inside record().
        loyalty.record(userId, LoyaltyEventType.SUGGESTION, null, Map.of("suggestionId", saved.getId()));
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Suggestion> mine(Integer userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<PublicView> publicList() {
        return repo.findByShowPublicTrueAndStatusInOrderByUpdatedAtDesc(List.of("PLANNED", "DONE")).stream()
                .map(s -> new PublicView(s.getId(), s.getTitle(), s.getCategory(), s.getStatus(), s.getPublicNote())).toList();
    }

    @Transactional(readOnly = true)
    public List<Suggestion> adminList() {
        return repo.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Suggestion adminUpdate(Long id, AdminUpdate req) {
        Suggestion s = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Idea not found"));
        String before = s.getStatus();
        if (req.status() != null) {
            if (!STATUSES.contains(req.status())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status must be NEW, PLANNED or DONE");
            }
            s.setStatus(req.status());
        }
        if (req.publicNote() != null) {
            if (req.publicNote().length() > 300) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Public note is limited to 300 characters");
            }
            s.setPublicNote(req.publicNote().isBlank() ? null : req.publicNote().trim());
        }
        if (req.showPublic() != null) s.setShowPublic(req.showPublic());
        s.setUpdatedAt(Instant.now());
        Suggestion saved = repo.save(s);
        audit.record("SUGGESTION_UPDATED", AuditActions.SUCCESS, "SUGGESTION", String.valueOf(id),
                "status " + before + " -> " + saved.getStatus() + " public=" + saved.isShowPublic());
        return saved;
    }

    /** Columns: title, body, category, status (optional). Imports past ideas (e.g. from a notebook or WhatsApp). */
    @Transactional
    public BulkUploadResult bulkImport(MultipartFile file) {
        BulkUploadResult result = BulkUploadResult.builder().build();
        int row = 1;
        for (Map<String, String> r : parser.parse(file)) {
            row++;
            try {
                String category = r.getOrDefault("category", "Other").trim();
                check(r.get("title"), r.get("body"), category);
                String status = r.getOrDefault("status", "NEW").trim().toUpperCase();
                if (!STATUSES.contains(status)) status = "NEW";
                Instant now = Instant.now();
                repo.save(Suggestion.builder().title(r.get("title").trim()).body(r.get("body").trim()).category(category)
                        .status(status).createdAt(now).updatedAt(now).build());
                result.setCreated(result.getCreated() + 1);
            } catch (RuntimeException e) {
                result.addError(row, e instanceof ResponseStatusException rse ? rse.getReason() : e.getMessage());
            }
        }
        audit.record("SUGGESTION_BULK_UPLOAD", AuditActions.SUCCESS, "SUGGESTION", "bulk", "created=" + result.getCreated());
        return result;
    }
}

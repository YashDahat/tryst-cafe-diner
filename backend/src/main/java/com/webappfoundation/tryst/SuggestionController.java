package com.webappfoundation.tryst;

import com.webappfoundation.dto.BulkUploadResult;
import com.webappfoundation.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class SuggestionController {
    private final SuggestionService service;

    public SuggestionController(SuggestionService service) {
        this.service = service;
    }

    /** Guests may submit; coins are only paid to signed-in users. */
    @PostMapping("/suggestions")
    @ResponseStatus(HttpStatus.CREATED)
    public Suggestion create(@CurrentUser Integer userId, @RequestBody SuggestionService.CreateRequest req) {
        return service.create(userId, req);
    }

    @GetMapping("/suggestions/mine")
    public List<Suggestion> mine(@CurrentUser Integer userId) {
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in to see your ideas");
        return service.mine(userId);
    }

    @GetMapping("/suggestions/public")
    public List<SuggestionService.PublicView> publicList() {
        return service.publicList();
    }

    @GetMapping("/admin/suggestions")
    public List<Suggestion> adminList() {
        return service.adminList();
    }

    @PutMapping("/admin/suggestions/{id}")
    public Suggestion adminUpdate(@PathVariable Long id, @RequestBody SuggestionService.AdminUpdate req) {
        return service.adminUpdate(id, req);
    }

    @PostMapping(value = "/admin/suggestions/bulk-upload", consumes = "multipart/form-data")
    public BulkUploadResult bulkUpload(@RequestParam("file") MultipartFile file) {
        return service.bulkImport(file);
    }
}

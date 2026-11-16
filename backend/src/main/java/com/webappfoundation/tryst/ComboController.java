package com.webappfoundation.tryst;

import com.webappfoundation.dto.BulkUploadResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class ComboController {
    private final ComboWindowService service;

    public ComboController(ComboWindowService service) {
        this.service = service;
    }

    /** Public: every combo with its window and whether it is on right now (IST). */
    @GetMapping("/combos/now")
    public List<ComboWindowService.ComboView> now() {
        return service.all();
    }

    @GetMapping("/admin/combo-windows")
    public List<ComboWindowService.ComboView> adminList() {
        return service.all();
    }

    @PutMapping("/admin/combo-windows/{id}")
    public ComboWindowService.ComboView update(@PathVariable Long id, @RequestBody ComboWindowService.UpsertRequest req) {
        return service.update(id, req);
    }

    @PostMapping(value = "/admin/combo-windows/bulk-upload", consumes = "multipart/form-data")
    public BulkUploadResult bulkUpload(@RequestParam("file") MultipartFile file) {
        return service.bulkImport(file);
    }
}
